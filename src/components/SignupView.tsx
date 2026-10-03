'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { User, Phone, Mail, Lock, Shield, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function SignupView() {
  const { setScreen, signUp, isLiveBackend } = useApp();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedGuide, setSelectedGuide] = useState('HG Amogh Virya Dasa');

  // Phone 10-digit validation check
  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
    if (cleaned.length > 0 && cleaned.length < 10) {
      setPhoneError('Phone number must be exactly 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (phone.length !== 10) {
        setPhoneError('Please enter a valid 10-digit mobile number');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (password.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }
      setPasswordError('');
      setStep(3);
      return;
    }

    if (step === 3) {
      if (isLiveBackend) {
        setLoading(true);
        setAuthError(null);
        const userEmail = email.trim() || `${phone}@folk.org`;
        const { error } = await signUp({
          email: userEmail,
          password,
          fullName,
          phone,
          role: 'folk_boy',
        });
        setLoading(false);
        if (error) {
          setAuthError(error.message || 'Registration failed. Please check your credentials.');
          return;
        }
      }
      // User created — FOLK ID is generated in background and available in profile
      setScreen('home');
    }
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-between p-6 select-none max-w-md mx-auto">
      {/* Background Ambient Glow */}
      <div className="absolute top-10 right-6 w-64 h-64 bg-[#E07A2B]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Step Progress */}
      <div className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep((step - 1) as 1 | 2 | 3) : setScreen('welcome'))}
            className="text-xs font-semibold text-[#786E65] hover:text-[#1B1917] flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <span className="text-xs font-bold text-[#8C460D] bg-amber-100/70 px-2.5 py-1 rounded-full border border-amber-200/50">
            Step {step} of 3
          </span>
        </div>

        {/* Step Progress Bar */}
        <div className="flex gap-1.5 mb-5">
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-[#E07A2B]' : 'bg-[#E7DFD5]'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-[#E07A2B]' : 'bg-[#E7DFD5]'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 3 ? 'bg-[#E07A2B]' : 'bg-[#E7DFD5]'}`} />
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-[#1B1917]">
          {step === 1 && 'Account Details'}
          {step === 2 && 'Security Credentials'}
          {step === 3 && 'Select FOLK Guide'}
        </h1>
        <p className="text-xs text-[#6E665E] mt-0.5">
          {step === 1 && 'Enter your contact information'}
          {step === 2 && 'Create a secure password'}
          {step === 3 && 'Connect with your Guide'}
        </p>

        {authError && (
          <div className="mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {authError}
          </div>
        )}
      </div>

      {/* Multi-step Form */}
      <form onSubmit={handleNext} className="space-y-4 my-auto py-4">
        {step === 1 && (
          <>
            {/* 1. Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#59534E] ml-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E867F]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Pratik Sharma"
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/90 border border-white focus:border-[#E07A2B] focus:ring-2 focus:ring-[#E07A2B]/15 text-sm text-[#1B1917] placeholder:text-[#A89E95] outline-none shadow-xs"
                />
              </div>
            </div>

            {/* 2. Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#59534E] ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E867F]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@folkindia.org"
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/90 border border-white focus:border-[#E07A2B] focus:ring-2 focus:ring-[#E07A2B]/15 text-sm text-[#1B1917] placeholder:text-[#A89E95] outline-none shadow-xs"
                />
              </div>
            </div>

            {/* 3. Phone Number with 10-digit check */}
            <div className="space-y-1">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-[#59534E]">
                  Mobile Number
                </label>
                <span className="text-[10px] text-[#8E867F]">
                  {phone.length}/10 digits
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E867F]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="10-digit mobile number"
                  required
                  className={`w-full h-12 pl-10 pr-4 rounded-2xl bg-white/90 border focus:ring-2 text-sm text-[#1B1917] placeholder:text-[#A89E95] outline-none shadow-xs ${
                    phoneError
                      ? 'border-red-400 focus:ring-red-400/20'
                      : 'border-white focus:border-[#E07A2B] focus:ring-[#E07A2B]/15'
                  }`}
                />
              </div>
              {phoneError && (
                <div className="text-[11px] font-semibold text-red-500 ml-1">
                  {phoneError}
                </div>
              )}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#59534E] ml-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E867F]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/90 border border-white focus:border-[#E07A2B] focus:ring-2 focus:ring-[#E07A2B]/15 text-sm text-[#1B1917] placeholder:text-[#A89E95] outline-none shadow-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#59534E] ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E867F]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/90 border border-white focus:border-[#E07A2B] focus:ring-2 focus:ring-[#E07A2B]/15 text-sm text-[#1B1917] placeholder:text-[#A89E95] outline-none shadow-xs"
                />
              </div>
              {passwordError && (
                <div className="text-[11px] font-semibold text-red-500 ml-1">
                  {passwordError}
                </div>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-[#7A4B1A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E07A2B] shrink-0" />
              <span>Email verification is used to protect your account.</span>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            {/* ONLY Guide option provided */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#59534E] ml-1">
                Who is your FOLK Guide?
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E867F]">
                  <Shield className="w-4 h-4 text-[#E07A2B]" />
                </div>
                <select
                  value={selectedGuide}
                  onChange={(e) => setSelectedGuide(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/90 border border-white text-sm font-semibold text-[#1B1917] outline-none shadow-xs cursor-pointer"
                >
                  <option value="HG Amogh Virya Dasa">HG Amogh Virya Dasa</option>
                  <option value="HG Sundar Gopal Dasa">HG Sundar Gopal Dasa</option>
                  <option value="HG Achyuta Gauranga Dasa">HG Achyuta Gauranga Dasa</option>
                </select>
              </div>
              <p className="text-[10px] text-[#786E65] ml-1">
                Select your designated temple counselor / guide.
              </p>
            </div>
          </>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 rounded-2xl saffron-gradient-btn font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Registering Devotee...</span>
            ) : step < 3 ? (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Switch to Login */}
      <div className="text-center pb-6">
        <p className="text-xs text-[#6E665E]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => setScreen('login')}
            className="font-bold text-[#C86315] hover:underline cursor-pointer"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
