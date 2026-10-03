'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Phone, Lock, ArrowRight, Shield, User, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginView() {
  const { setScreen, switchRole, signIn, isLiveBackend } = useApp();
  const [selectedRoleType, setSelectedRoleType] = useState<'boy' | 'guide'>('boy');
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('harekrishna108');
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleRoleSelect = (roleType: 'boy' | 'guide') => {
    setSelectedRoleType(roleType);
    if (roleType === 'boy') {
      switchRole('folk_boy');
      setPhone('9876543210');
      setPassword('harekrishna108');
    } else {
      switchRole('folk_guide');
      setPhone('9900088776');
      setPassword('amoghguide108');
    }
    setErrors({});
  };

  const validate = () => {
    const newErrors: { phone?: string; password?: string } = {};

    // 10-digit validation rule
    const cleanedPhone = phone.replace(/\D/g, '');
    if (!cleanedPhone) {
      newErrors.phone = 'Mobile number is required';
    } else if (cleanedPhone.length !== 10) {
      newErrors.phone = `Phone number must be exactly 10 digits (currently ${cleanedPhone.length} digits)`;
    }

    // Password validation rule
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    if (isLiveBackend) {
      setLoading(true);
      setAuthError(null);
      const loginIdentifier = phone.includes('@') ? phone : `${phone}@folk.org`;
      const { error } = await signIn(loginIdentifier, password);
      setLoading(false);
      if (error) {
        setAuthError(error.message || 'Invalid credentials. Please verify your phone and password.');
        return;
      }
    }

    setScreen('home');
  };

  const handlePhoneChange = (val: string) => {
    // Only allow digits and cap at 10
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
    if (errors.phone && digitsOnly.length === 10) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (errors.password && val.length >= 6) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-between p-6 select-none max-w-md mx-auto">
      {/* Background Ambient Glow */}
      <div className="absolute top-12 left-6 w-64 h-64 bg-[#E07A2B]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="pt-6">
        <button
          type="button"
          onClick={() => setScreen('welcome')}
          className="text-xs font-semibold text-[#786E65] hover:text-[#1B1917] mb-6 flex items-center gap-1.5 cursor-pointer"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-extrabold tracking-tight text-[#1B1917] mb-1">
          Welcome back
        </h1>
        <p className="text-xs font-medium text-[#6E665E]">
          Sign in to your FOLK Sādhana account
        </p>

        {authError && (
          <div className="mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}
      </div>

      {/* Login Form Container */}
      <form onSubmit={handleLogin} className="space-y-4 my-auto py-4">
        {/* Exactly 2 Role Options: 1. Folk Boy (includes Leads), 2. Guide */}
        <div className="p-1 rounded-2xl bg-white/70 border border-white/80 shadow-xs flex gap-1">
          <button
            type="button"
            onClick={() => handleRoleSelect('boy')}
            className={`flex-1 py-3 rounded-xl text-center text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedRoleType === 'boy'
                ? 'bg-[#E07A2B] text-white shadow-sm'
                : 'text-[#6E665E] hover:text-[#1B1917]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Folk Boy</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('guide')}
            className={`flex-1 py-3 rounded-xl text-center text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedRoleType === 'guide'
                ? 'bg-[#1B1917] text-white shadow-sm'
                : 'text-[#6E665E] hover:text-[#1B1917]'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Guide</span>
          </button>
        </div>

        {selectedRoleType === 'boy' && (
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-[#7A4B1A] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E07A2B]" />
            <span>Folk Leads also sign in as Folk Boy with elevated oversight privileges.</span>
          </div>
        )}

        {/* Input: 10-Digit Mobile Number */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-bold text-[#59534E]">
              10-Digit Mobile Number
            </label>
            <span
              className={`text-[10px] font-bold ${
                phone.length === 10 ? 'text-emerald-700' : 'text-[#8E867F]'
              }`}
            >
              {phone.length}/10 digits
            </span>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E867F]">
              <Phone className="w-4 h-4" />
              <span className="text-xs font-bold text-[#786E65] ml-1.5 border-r border-stone-200 pr-2">
                +91
              </span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="Enter 10 digit mobile"
              className={`w-full h-12 pl-18 pr-10 rounded-2xl bg-white/90 border text-sm text-[#1B1917] placeholder:text-[#A89E95] outline-none shadow-xs transition-all font-mono tracking-wider ${
                errors.phone
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-white focus:border-[#E07A2B] focus:ring-2 focus:ring-[#E07A2B]/15'
              }`}
            />
            {phone.length === 10 && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
          </div>
          {errors.phone && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-red-600 ml-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.phone}</span>
            </div>
          )}
        </div>

        {/* Input: Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-bold text-[#59534E]">
              Password
            </label>
            <span className="text-[10px] text-[#8E867F]">Min 6 characters</span>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E867F]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="Enter your password"
              className={`w-full h-12 pl-10 pr-4 rounded-2xl bg-white/90 border text-sm text-[#1B1917] placeholder:text-[#A89E95] outline-none shadow-xs transition-all ${
                errors.password
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-white focus:border-[#E07A2B] focus:ring-2 focus:ring-[#E07A2B]/15'
              }`}
            />
          </div>
          {errors.password && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-red-600 ml-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.password}</span>
            </div>
          )}
        </div>

        {/* Primary Login Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 rounded-2xl saffron-gradient-btn font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Login as {selectedRoleType === 'guide' ? 'Guide' : 'Folk Boy'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Bottom Switch to Signup */}
      <div className="text-center pb-6">
        <p className="text-xs text-[#6E665E]">
          New to FOLK?{' '}
          <button
            type="button"
            onClick={() => setScreen('signup')}
            className="font-bold text-[#C86315] hover:underline cursor-pointer"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}
