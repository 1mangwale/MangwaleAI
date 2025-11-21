'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, setAuth, _hasHydrated } = useAuthStore();

  const [step, setStep] = useState<'phone' | 'otp' | 'register'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Registration fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      router.push('/chat');
    }
  }, [isAuthenticated, _hasHydrated, router]);

  // Don't render until hydrated to avoid flash
  if (!_hasHydrated) {
    return null;
  }

  // Already authenticated, redirecting
  if (isAuthenticated) {
    return null;
  }

  type ApiError = {
    response?: {
      data?: {
        message?: string;
      };
    };
  };

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (typeof err === 'object' && err !== null) {
      const apiError = err as ApiError;
      return apiError.response?.data?.message ?? fallback;
    }
    return fallback;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate phone number
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        setError('Please enter a valid 10-digit Indian mobile number');
        setLoading(false);
        return;
      }

      await api.auth.sendOtp(phone);
      setStep('otp');
      setLoading(false);
    } catch (err: unknown) {
      console.error('Failed to send OTP:', err);
      setError(
        getErrorMessage(
          err,
          'Failed to send OTP. Please try again.'
        )
      );
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate OTP
      if (otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        setLoading(false);
        return;
      }

      const response = await api.auth.verifyOtp(phone, otp);
      const data = response.data;

      if (!data.success) {
        setError(data.message || 'Invalid OTP');
        setLoading(false);
        return;
      }

      // Check if user needs to complete registration
      if (data.is_personal_info === 0) {
        console.log('⚠️ New user - needs to complete registration');
        setStep('register');
        setLoading(false);
        return;
      }

      // Existing user - login successful
      if (data.token && data.user) {
        console.log('✅ Existing user - login successful');
        setAuth(data.user, data.token);
        router.push('/chat');
      } else {
        setError('Login failed. Please try again.');
        setLoading(false);
      }
    } catch (err: unknown) {
      console.error('Failed to verify OTP:', err);
      setError(
        getErrorMessage(
          err,
          'Invalid OTP. Please try again.'
        )
      );
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate fields
      if (!firstName.trim()) {
        setError('Please enter your first name');
        setLoading(false);
        return;
      }

      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Call update-info endpoint
      const response = await api.auth.updateUserInfo({
        phone,
        f_name: firstName,
        l_name: lastName || '',
        email
      });

      const data = response.data;

      if (!data.success) {
        setError(data.message || 'Registration failed');
        setLoading(false);
        return;
      }

      // Registration successful
      if (data.token && data.user) {
        console.log('✅ Registration complete - user created');
        setAuth(data.user, data.token);
        router.push('/chat');
      } else {
        setError('Registration failed. Please try again.');
        setLoading(false);
      }
    } catch (err: unknown) {
      console.error('Failed to register:', err);
      setError(
        getErrorMessage(
          err,
          'Registration failed. Please try again.'
        )
      );
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('phone');
    setOtp('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Mangwale
          </h1>
          <p className="text-gray-600">
            {step === 'phone' 
              ? 'Enter your phone number to get started with delivery services' 
              : step === 'otp'
              ? 'Enter the OTP sent to your phone'
              : 'Complete your profile to continue'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'phone' ? (
            // Step 1: Phone Number
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    +91
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                    disabled={loading}
                    autoFocus
                    maxLength={10}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : step === 'otp' ? (
            // Step 2: OTP Verification
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="tel"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg text-center tracking-widest"
                  disabled={loading}
                  autoFocus
                  maxLength={6}
                />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  OTP sent to +91 {phone}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Change Phone Number
                </button>
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          ) : (
            // Step 3: Registration (New Users)
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm mb-4">
                Welcome! Please complete your registration to continue.
              </div>

              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                  autoFocus
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name (Optional)
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !firstName.trim() || !email.trim()}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
