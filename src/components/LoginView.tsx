'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Phone,
  Lock,
  ArrowRight,
  Shield,
  User,
  AlertCircle,
  CheckCircle2,
  Mail,
  KeyRound,
  UserPlus,
} from 'lucide-react';
import { apiGetRegisteredGuides, apiCheckAccountExists } from '@/lib/supabaseService';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';

export default function LoginView() {
  const { setScreen, switchRole, signIn, isLiveBackend } = useApp();
  const [selectedRoleType, setSelectedRoleType] = useState<'boy' | 'guide'>('boy');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [guidePasscode, setGuidePasscode] = useState('');
  const [errors, setErrors] = useState<{ phone?: string; password?: string; guidePasscode?: string }>({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [noAccountFound, setNoAccountFound] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Active guides from Supabase
  const [activeGuides, setActiveGuides] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (typeof apiGetRegisteredGuides === 'function') {
      apiGetRegisteredGuides()
        .then(({ data }) => {
          if (data && data.length > 0) {
            setActiveGuides(data);
          }
        })
        .catch((err) => {
          console.warn('Could not load guides:', err);
        });
    }
  }, []);

  const handleRoleSelect = (roleType: 'boy' | 'guide') => {
    setSelectedRoleType(roleType);
    if (roleType === 'boy') {
      switchRole('folk_boy');
    } else {
      switchRole('folk_guide');
    }
    setErrors({});
    setAuthError(null);
  };

  const expectedGuidePasscode = process.env.NEXT_PUBLIC_GUIDE_SECRET_PASSCODE || 'FOLK@GUIDE108';

  const validate = () => {
    const newErrors: { phone?: string; password?: string; guidePasscode?: string } = {};

    const trimmed = phone.trim();
    if (!trimmed) {
      newErrors.phone = 'Mobile number or Email is required';
    } else if (trimmed.includes('@') || /[a-zA-Z]/.test(trimmed)) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        newErrors.phone = 'Please enter a valid email address';
      }
    } else {
      const digits = trimmed.replace(/\D/g, '');
      const normalized = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
      if (normalized.length !== 10) {
        newErrors.phone = `Phone number must be a 10-digit mobile number (currently ${normalized.length} digits)`;
      }
    }

    // Password validation rule
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Guide Passcode validation rule
    if (selectedRoleType === 'guide') {
      if (!guidePasscode.trim()) {
        newErrors.guidePasscode = 'Guide security passcode is required';
      } else if (guidePasscode.trim() !== expectedGuidePasscode) {
        newErrors.guidePasscode = 'Invalid Guide passcode. Access restricted to authorized guides.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!validate()) {
      return;
    }

    if (isLiveBackend) {
      setLoading(true);
      setAuthError(null);
      setNoAccountFound(false);
      const trimmed = phone.trim();
      const digits = trimmed.replace(/\D/g, '');
      const sanitizedIdentifier = trimmed.includes('@')
        ? trimmed.toLowerCase()
        : (digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits);

      const { error } = await signIn(sanitizedIdentifier, password);
      if (error) {
        setLoading(false);
        setNoAccountFound(true);

        const isUnconfirmed = error.message?.toLowerCase().includes('not confirmed');
        if (isUnconfirmed) {
          setAuthError('Email not confirmed. Please check your inbox for the confirmation email or disable "Confirm email" in Supabase settings.');
        } else {
          setAuthError(`No account found or incorrect password for "${sanitizedIdentifier}". First time logging in? Create your account below.`);
        }
        return;
      }
      setLoading(false);
    }

    setScreen('home');
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    setNoAccountFound(false);
    if (errors.phone) {
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
          className="text-xs font-semibold text-[#786E65] dark:text-stone-400 hover:text-[#1B1917] dark:hover:text-stone-100 mb-6 flex items-center gap-1.5 cursor-pointer"
        >
          <span>← Back</span>
        </button>

        <span className="text-xs font-extrabold tracking-widest text-[#E07A2B] uppercase">
          Portal Sign In
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1B1917] dark:text-stone-100 mt-1">
          Welcome Back
        </h1>
        <p className="text-xs text-[#6E665E] dark:text-stone-400 mt-1">
          Sign in to report your Sādhana, track your streak, and view readings.
        </p>

        {authError && (
          <div className="mt-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs font-semibold space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#E07A2B] mt-0.5" />
              <span className="leading-snug">{authError}</span>
            </div>
            {noAccountFound && (() => {
              const cleanVal = phone.includes('@') ? phone.trim() : phone.replace(/\D/g, '').slice(0, 10);
              return (
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem(
                        'folk_prefill_signup',
                        JSON.stringify({
                          identifier: cleanVal,
                          role: selectedRoleType === 'guide' ? 'folk_guide' : 'folk_boy',
                        })
                      );
                    }
                    setScreen('signup');
                  }}
                  className="w-full h-11 rounded-xl saffron-gradient-btn text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>
                    Create {selectedRoleType === 'guide' ? 'FOLK Guide' : 'Devotee'} Account with {cleanVal || phone.trim()} →
                  </span>
                </button>
              );
            })()}
          </div>
        )}
      </div>

      {/* Login Form Container */}
      <form onSubmit={handleLogin} className="space-y-4 my-auto py-4">
        {/* Exactly 2 Role Options: 1. Folk Boy (includes Leads), 2. Guide */}
        <div className="p-1 rounded-2xl bg-white/70 dark:bg-stone-800/80 border border-white/80 dark:border-stone-700 shadow-xs flex gap-1">
          <button
            type="button"
            onClick={() => handleRoleSelect('boy')}
            className={`flex-1 py-3 rounded-xl text-center text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedRoleType === 'boy'
                ? 'bg-[#E07A2B] text-white shadow-sm'
                : 'text-[#6E665E] dark:text-stone-400 hover:text-[#1B1917] dark:hover:text-stone-100'
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
                ? 'bg-[#1B1917] dark:bg-stone-900 text-white shadow-sm border border-stone-700'
                : 'text-[#6E665E] dark:text-stone-400 hover:text-[#1B1917] dark:hover:text-stone-100'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>FOLK Guide</span>
          </button>
        </div>

        {/* Dynamic Display of Active Registered Guides for Folk Boys */}
        {selectedRoleType === 'boy' && activeGuides.length > 0 && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-[#7A4B1A] dark:text-amber-300">
            <div className="flex items-center gap-1.5 font-bold text-[#8C460D] dark:text-amber-400 mb-1">
              <Shield className="w-3.5 h-3.5 text-[#E07A2B]" />
              <span>Active Temple Guides</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {activeGuides.map((g) => (
                <span
                  key={g.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-stone-800 text-[#1B1917] dark:text-stone-100 font-bold text-[11px] shadow-2xs border border-amber-200/60 dark:border-stone-700"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {g.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Input: Mobile Number or Email */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-bold text-[#59534E] dark:text-stone-300">
              Email or Mobile Number
            </label>
            <span
              className={`text-[10px] font-bold ${
                phone.includes('@')
                  ? phone.length > 5 ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#8E867F] dark:text-stone-400'
                  : phone.replace(/\D/g, '').length === 10 ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#8E867F] dark:text-stone-400'
              }`}
            >
              {phone.includes('@')
                ? 'Email'
                : phone.replace(/\D/g, '').length > 0
                ? `${phone.replace(/\D/g, '').length}/10 digits`
                : 'Email / Phone'}
            </span>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E867F] dark:text-stone-400">
              {phone.includes('@') || /[a-zA-Z]/.test(phone) ? (
                <Mail className="w-4 h-4 text-[#E07A2B]" />
              ) : (
                <Phone className="w-4 h-4 text-[#E07A2B]" />
              )}
            </div>
            <input
              type={phone.includes('@') ? 'email' : 'text'}
              maxLength={120}
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="Enter email or 10-digit mobile number"
              className={`w-full h-12 pl-10 pr-10 rounded-2xl bg-white/90 dark:bg-stone-800/90 border text-sm text-[#1B1917] dark:text-stone-100 placeholder:text-[#A89E95] dark:placeholder:text-stone-500 outline-none shadow-xs transition-all font-sans ${
                errors.phone
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-white dark:border-stone-700 focus:border-[#E07A2B] focus:ring-2 focus:ring-[#E07A2B]/15'
              }`}
            />
            {((phone.includes('@') && phone.length > 5) || (!phone.includes('@') && phone.replace(/\D/g, '').length === 10)) && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
          </div>
          {errors.phone && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 ml-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.phone}</span>
            </div>
          )}
        </div>

        {/* Input: Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-bold text-[#59534E] dark:text-stone-300">Password</label>
            <button
              type="button"
              onClick={() => setIsForgotPasswordOpen(true)}
              className="text-[11px] font-bold text-[#C86315] dark:text-amber-400 hover:text-[#9C4507] hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E867F] dark:text-stone-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="Enter your password"
              className={`w-full h-12 pl-10 pr-10 rounded-2xl bg-white/90 dark:bg-stone-800/90 border text-sm text-[#1B1917] dark:text-stone-100 placeholder:text-[#A89E95] dark:placeholder:text-stone-500 outline-none shadow-xs transition-all ${
                errors.password
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-white dark:border-stone-700 focus:border-[#E07A2B] focus:ring-2 focus:ring-[#E07A2B]/15'
              }`}
            />
            {password.length >= 6 && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
          </div>
          {errors.password && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 ml-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.password}</span>
            </div>
          )}
        </div>

        {/* Input: Guide Security Passcode (Only when Guide role is selected) */}
        {selectedRoleType === 'guide' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold text-[#59534E] dark:text-stone-300">
                Guide Authorization Passcode
              </label>
              <span className="text-[10px] text-[#E07A2B] font-bold">Temple Counselor Code</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E867F] dark:text-stone-400">
                <KeyRound className="w-4 h-4 text-[#E07A2B]" />
              </div>
              <input
                type="password"
                value={guidePasscode}
                onChange={(e) => {
                  setGuidePasscode(e.target.value);
                  if (errors.guidePasscode) {
                    setErrors((prev) => ({ ...prev, guidePasscode: undefined }));
                  }
                }}
                placeholder="Enter secret Guide passcode"
                className={`w-full h-12 pl-10 pr-10 rounded-2xl bg-white/90 dark:bg-stone-800/90 border text-sm text-[#1B1917] dark:text-stone-100 placeholder:text-[#A89E95] dark:placeholder:text-stone-500 outline-none shadow-xs font-mono transition-all ${
                  errors.guidePasscode
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-white dark:border-stone-700 focus:border-[#E07A2B] focus:ring-2 focus:ring-[#E07A2B]/15'
                }`}
              />
            </div>
            {errors.guidePasscode && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 ml-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.guidePasscode}</span>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 rounded-2xl saffron-gradient-btn font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.99] transition-all disabled:opacity-50 text-white"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In as {selectedRoleType === 'boy' ? 'Folk Boy' : 'Guide'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Switch to Signup */}
      <div className="text-center pb-6">
        <p className="text-xs text-[#6E665E] dark:text-stone-400">
          Don&apos;t have an account yet?{' '}
          <button
            type="button"
            onClick={() => setScreen('signup')}
            className="font-bold text-[#C86315] dark:text-amber-400 hover:underline cursor-pointer"
          >
            Create Account
          </button>
        </p>
      </div>

      {/* Forgot Password Recovery Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onSuccess={(ident) => {
          setIsForgotPasswordOpen(false);
          setPhone(ident);
        }}
        initialIdentifier={phone}
      />
    </div>
  );
}
