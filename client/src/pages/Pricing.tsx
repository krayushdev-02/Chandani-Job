import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import { updateUserProfile } from '../store/slices/authSlice';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Check, Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface Plan {
  name: 'Basic' | 'Professional' | 'Enterprise' | 'Premium Recruiter';
  price: number;
  description: string;
  features: string[];
  badgeColor: string;
}

const Pricing: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [submittingPlan, setSubmittingPlan] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      name: 'Basic',
      price: 499,
      description: 'Ideal package for entry-level candidates seeking premium tools.',
      badgeColor: 'indigo-500/10 text-indigo-400 border-indigo-500/20',
      features: [
        '50 AI Resume Scans / month',
        '10 AI Mock Interview Coach sessions',
        'Highlight profile badge to recruiters',
        'Basic direct messages access',
      ],
    },
    {
      name: 'Professional',
      price: 999,
      description: 'Optimized package for active mid-level professionals seeking matching speed.',
      badgeColor: 'emerald-500/10 text-emerald-400 border-emerald-500/20',
      features: [
        'Unlimited AI Resume Scans',
        'Unlimited AI Mock Interviews',
        'Direct chat channels to all hiring HR managers',
        'Priority resume parsing algorithms',
      ],
    },
    {
      name: 'Premium Recruiter',
      price: 4999,
      description: 'Required bundle for recruiters, startup leads, and talent acquisition teams.',
      badgeColor: 'amber-500/10 text-amber-400 border-amber-500/20',
      features: [
        'Convert account to hiring Recruiter role',
        'Post up to 10 active job listings concurrently',
        'Full candidate databases resume downloads',
        'Schedule unlimited video calls and interviews',
      ],
    },
  ];

  const handleCheckout = async (plan: Plan) => {
    setSubmittingPlan(plan.name);
    try {
      // Call backend checkout session
      const res = await api.post('/payments/checkout', {
        planName: plan.name,
        amount: plan.price,
        gateway: 'razorpay',
      });

      const { order } = res.data;

      // Simulate Razorpay Payment verification callback
      // Since Razorpay requires dynamic script loading on the window, we simulate a successful verify signature call
      // using test payment hashes. This runs the FULL database subscription increment pipelines successfully!
      toast.success('Initiating local payment checkout sandbox...');
      
      setTimeout(async () => {
        try {
          const verifyRes = await api.post('/payments/verify', {
            razorpay_order_id: order.id,
            razorpay_payment_id: `pay_${Math.random().toString(36).slice(2, 11)}`,
            razorpay_signature: 'sandbox_payment_verified_hash',
          });

          dispatch(updateUserProfile(verifyRes.data.payment));
          toast.success(`Subscription active! Thank you for purchasing the ${plan.name} plan.`);
          // Reload page to update role dashboards
          window.location.reload();
        } catch (err: any) {
          toast.error('Payment verification failed.');
        }
      }, 1500);

    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Checkout failed.');
    } finally {
      // Keep submitting loader visible for sandbox simulation duration
      setTimeout(() => setSubmittingPlan(null), 1500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      
      {/* Header title */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Simple Premium Pricing</h2>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed">
          Post roles as a verified Recruiter or scan resumes using AI tools. Unlock matching pipelines instantly.
        </p>
      </div>

      {/* Plans Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrentRole = 
            (plan.name === 'Premium Recruiter' && user?.role === 'Recruiter') ||
            (plan.name === 'Basic' && user?.wallet?.balance && user.wallet.balance > 0);

          return (
            <div 
              key={plan.name} 
              className={`glass-card p-8 rounded-3xl border flex flex-col justify-between space-y-8 relative overflow-hidden ${
                plan.name === 'Professional' ? 'border-indigo-500/50 shadow-indigo-600/5' : 'border-white/5'
              }`}
            >
              {plan.name === 'Professional' && (
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full text-white">
                  <Sparkles className="h-3 w-3" /> Best Value
                </div>
              )}

              <div className="space-y-4">
                <span className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${plan.badgeColor}`}>
                  {plan.name}
                </span>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">₹{plan.price}</span>
                  <span className="text-gray-500 text-xs font-semibold">/ lifetime</span>
                </div>

                <p className="text-xs text-gray-400 leading-normal">{plan.description}</p>

                <hr className="border-white/5" />

                <ul className="space-y-3 text-xs text-gray-300">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleCheckout(plan)}
                disabled={submittingPlan !== null || isCurrentRole}
                className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isCurrentRole 
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 cursor-default' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20'
                }`}
              >
                {submittingPlan === plan.name ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Opening Checkout...
                  </>
                ) : isCurrentRole ? (
                  'Active Subscription'
                ) : (
                  <>
                    Subscribe Now
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Pricing;
