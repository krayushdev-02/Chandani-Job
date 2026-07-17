import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../services/api';
import { setCredentials } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { Briefcase, Loader2, KeyRound, Mail } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type LoginFields = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);

  // OTP State for 2FA / Unverified
  const [otpRequired, setOtpRequired] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFields) => {
    setSubmitting(true);
    try {
      const response = await api.post('/auth/login', data);

      if (response.data.twoFactorRequired) {
        setOtpRequired(true);
        setUnverifiedEmail(data.email);
        toast.success('Two-Factor OTP sent to your email.');
      } else {
        dispatch(setCredentials({ token: response.data.token, user: response.data.user }));
        toast.success(`Welcome back, ${response.data.user.name}!`);
        
        // Redirect based on role
        if (response.data.user.role === 'Super Admin') {
          navigate('/admin');
        } else if (['Recruiter', 'Employer', 'HR Manager', 'Company Admin'].includes(response.data.user.role)) {
          navigate('/recruiter-dashboard');
        } else {
          navigate('/seeker-dashboard');
        }
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Login failed. Please check credentials.';
      if (error.response?.status === 403 && error.response?.data?.unverified) {
        setOtpRequired(true);
        setUnverifiedEmail(data.email);
        toast.warn('Account not verified. Verification OTP sent to email.');
      } else {
        toast.error(errMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      return toast.error('Please enter a valid 6-digit OTP code.');
    }

    setVerifyingOtp(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        email: unverifiedEmail,
        otp: otpCode,
      });

      dispatch(setCredentials({ token: response.data.token, user: response.data.user }));
      toast.success(`Verification complete! Welcome, ${response.data.user.name}.`);
      
      if (response.data.user.role === 'Super Admin') {
        navigate('/admin');
      } else if (['Recruiter', 'Employer', 'HR Manager', 'Company Admin'].includes(response.data.user.role)) {
        navigate('/recruiter-dashboard');
      } else {
        navigate('/seeker-dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'OTP verification failed.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl relative overflow-hidden">
        
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <Briefcase className="h-10 w-10 text-indigo-500 mx-auto mb-2" />
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-sm text-gray-400 mt-1">
            {otpRequired ? 'Enter the security code sent to your email' : 'Sign in to access your portal'}
          </p>
        </div>

        {!otpRequired ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  {...register('email')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="name@domain.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="password"
                  {...register('password')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-sm font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Verification Code</label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 text-center text-2xl font-bold tracking-widest focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={verifyingOtp}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-sm font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              {verifyingOtp ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying Code...
                </>
              ) : (
                'Verify & Login'
              )}
            </button>

            <button
              type="button"
              onClick={() => setOtpRequired(false)}
              className="w-full text-center text-xs text-indigo-400 hover:underline"
            >
              Go back to credentials
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-gray-400 border-t border-white/5 pt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
