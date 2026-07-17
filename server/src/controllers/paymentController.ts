import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Payment from '../models/Payment';
import User from '../models/User';
import { PaymentService } from '../services/paymentService';
import { EmailService } from '../services/emailService';

export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
  const { planName, amount, gateway = 'razorpay' } = req.body;

  try {
    if (gateway === 'stripe') {
      const successUrl = `${req.protocol}://${req.get('host')}/payments/success`;
      const cancelUrl = `${req.protocol}://${req.get('host')}/payments/cancel`;
      const session = await PaymentService.createStripeSession(
        req.user?.id || '',
        planName,
        amount,
        successUrl,
        cancelUrl
      );

      // Create pending payment log
      await Payment.create({
        user: req.user?.id,
        planName,
        amount,
        transactionId: session.id,
        status: 'Pending',
      });

      return res.status(200).json({ success: true, url: session.url, sessionId: session.id });
    } else {
      // Default: Razorpay
      const receipt = `rcpt_${Date.now()}`;
      const order = await PaymentService.createRazorpayOrder(amount, 'INR', receipt);

      await Payment.create({
        user: req.user?.id,
        planName,
        amount,
        transactionId: order.id,
        status: 'Pending',
      });

      return res.status(200).json({ success: true, order });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    const verified = PaymentService.verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update payment record
    const payment = await Payment.findOne({ transactionId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    payment.status = 'Success';
    payment.transactionId = razorpay_payment_id; // replace order id with payment id
    await payment.save();

    // Grant premium privileges / balance based on plan
    const user = await User.findById(req.user?.id);
    if (user) {
      if (payment.planName === 'Basic') {
        user.wallet.balance += 500; // e.g. add test budget or credits
      } else if (payment.planName === 'Professional') {
        user.wallet.balance += 2000;
        user.wallet.rewardPoints += 100;
      } else if (payment.planName === 'Enterprise') {
        user.wallet.balance += 10000;
        user.wallet.rewardPoints += 500;
      } else if (payment.planName === 'Premium Recruiter') {
        user.role = 'Recruiter'; // upgrade guest or job seeker to recruiter
        user.wallet.balance += 5000;
      }
      await user.save();

      // Send invoice email
      await EmailService.sendOrderInvoice(
        user.email,
        user.name,
        payment.planName,
        payment.amount,
        razorpay_payment_id
      );
    }

    res.status(200).json({ success: true, message: 'Payment verified and credited successfully', payment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
  // Simple webhook mock or implementation
  const { event, sessionId } = req.body;

  try {
    if (event === 'checkout.session.completed') {
      const payment = await Payment.findOne({ transactionId: sessionId });
      if (payment) {
        payment.status = 'Success';
        await payment.save();

        const user = await User.findById(payment.user);
        if (user) {
          user.wallet.balance += payment.amount; // credit full amount
          await user.save();
          await EmailService.sendOrderInvoice(user.email, user.name, payment.planName, payment.amount, sessionId);
        }
      }
    }
    res.status(200).json({ received: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
