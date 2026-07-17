import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export class EmailService {
  private static getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }

    // Fallback transporter (logs to console/files)
    return null;
  }

  public static async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    logger.info(`Attempting to send email to: ${to} with subject: "${subject}"`);
    
    const transporter = this.getTransporter();

    if (transporter) {
      try {
        const from = process.env.SMTP_FROM || '"ChandandiJobs" <noreply@chandandijobs.com>';
        await transporter.sendMail({ from, to, subject, html });
        logger.info(`Email sent successfully to ${to}`);
        return true;
      } catch (error: any) {
        logger.error(`Failed to send email via SMTP: ${error.message}`);
        return false;
      }
    } else {
      logger.warn(`No SMTP configuration found. Emailed content logged locally:`);
      logger.info(`[MOCK EMAIL SENT] To: ${to} | Subject: "${subject}" | Content Preview: ${html.slice(0, 100)}...`);
      return true;
    }
  }

  public static async sendOTPEmail(to: string, name: string, otp: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Verify Your Account</h2>
        <p>Hello ${name},</p>
        <p>Thank you for choosing <strong>ChandandiJobs</strong>. Your One-Time Password (OTP) for registration/login verification is:</p>
        <div style="font-size: 32px; font-weight: bold; text-align: center; color: #4f46e5; margin: 20px 0; letter-spacing: 5px;">${otp}</div>
        <p>This code will expire in 15 minutes. If you did not make this request, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">Connecting Talent with Opportunity.<br>© ChandandiJobs, Bettiah, Bihar, India</p>
      </div>
    `;
    return this.sendEmail(to, 'Verify Your Account - OTP Code', html);
  }

  public static async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Welcome to ChandandiJobs!</h2>
        <p>Hi ${name},</p>
        <p>Welcome to the ultimate platform to connect talent with opportunity! Your profile has been successfully created.</p>
        <p>Get started today by:
          <ul>
            <li>Completing your detailed profile.</li>
            <li>Uploading or creating your ATS-friendly resume using our built-in AI tools.</li>
            <li>Searching and applying for active roles in top tech companies.</li>
          </ul>
        </p>
        <p>If you have any questions, reach out to our team at <a href="mailto:ayushk2375@gmail.com">ayushk2375@gmail.com</a>.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">Connecting Talent with Opportunity.<br>© ChandandiJobs, Bettiah, Bihar, India</p>
      </div>
    `;
    return this.sendEmail(to, 'Welcome to ChandandiJobs', html);
  }

  public static async sendOrderInvoice(to: string, name: string, planName: string, amount: number, transactionId: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Payment Receipt / Invoice</h2>
        <p>Dear ${name},</p>
        <p>Thank you for subscribing to our <strong>${planName}</strong> plan. We have processed your payment successfully.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <td style="padding: 10px; font-weight: bold;">Plan Name</td>
            <td style="padding: 10px; text-align: right;">${planName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <td style="padding: 10px; font-weight: bold;">Transaction ID</td>
            <td style="padding: 10px; text-align: right;">${transactionId}</td>
          </tr>
          <tr style="border-bottom: 2px solid #4f46e5; padding: 10px 0;">
            <td style="padding: 10px; font-weight: bold; color: #4f46e5;">Total Paid</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: #4f46e5;">₹${amount}</td>
          </tr>
        </table>
        <p>Your subscription is active immediately. Go ahead and start utilizing all premium tools.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">Connecting Talent with Opportunity.<br>© ChandandiJobs, Bettiah, Bihar, India</p>
      </div>
    `;
    return this.sendEmail(to, 'Your ChandandiJobs Subscription Invoice', html);
  }
}
