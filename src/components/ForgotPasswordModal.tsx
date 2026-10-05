'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  Mail,
  Phone,
  Shield,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import {
  apiGetRegisteredGuides,
  apiResetPasswordForEmail,
  apiResetPasswordWithGuide,
} from '@/lib/supabaseService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (phoneOrEmail: string) => void;
  initialIdentifier?: string;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onSuccess,
  initialIdentifier = '',
}: ForgotPasswordModalProps) {
  const [activeTab, setActiveTab] = useState<'mobile' | 'email'>('mobile');

  // Mobile reset fields
  const [phone, setPhone] = useState('');
  const [selectedGuideId, setSelectedGuideId] = useState('');
  const [guidePasscode, setGuidePasscode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Email reset fields
  const [email, setEmail] = useState('');

  // Status & guides
  const [guides, setGuides] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialIdentifier) {
      if (initialIdentifier.includes('@')) {
        setEmail(initialIdentifier);
        setActiveTab('email');
      } else {
        setPhone(initialIdentifier.replace(/\D/g, ''));
        setActiveTab('mobile');
      }
    }
  }, [initialIdentifier]);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      apiGetRegisteredGuides()
        .then(({ data }) => {
          if (data && data.length > 0) {
            setGuides(data);
            if (!selectedGuideId) {
              setSelectedGuideId(data[0].id);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMobileReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!selectedGuideId) {
      setErrorMsg('Please select your registered FOLK Guide.');
      return;
    }
    if (!guidePasscode.trim()) {
      setErrorMsg('Please enter your Guide verification passcode.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    const { data, error } = await apiResetPasswordWithGuide({
      phone: cleanPhone,
      guideId: selectedGuideId,
      guidePasscode: guidePasscode.trim(),
      newPassword,
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Password reset failed. Please contact your Guide.');
    } else {
      setSuccessMsg(
        'Password updated successfully! You can now log in with your new password.'
      );
      setTimeout(() => {
        onSuccess(cleanPhone);
      }, 2000);
    }
  };

  const handleEmailReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const { error } = await apiResetPasswordForEmail(cleanEmail);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Could not send reset email. Please try again.');
    } else {
      setSuccessMsg(
        'Password reset link sent! Please check your email inbox (and spam folder) to set a new password.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FAF8F5] border border-white/80 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E2D8] flex items-center justify-between bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#E07A2B]/15 flex items-center justify-center text-[#E07A2B]">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1B1917]">Password Recovery</h2>
              <p className="text-[10px] text-[#786E65]">Reset your FOLK account access</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[#786E65] hover:text-[#1B1917] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Recovery Method Tabs */}
          <div className="p-1 rounded-2xl bg-stone-200/50 flex gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('mobile');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'mobile'
                  ? 'bg-white text-[#1B1917] shadow-xs'
                  : 'text-[#6E665E] hover:text-[#1B1917]'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-[#E07A2B]" />
              <span>Mobile & Guide</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('email');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-white text-[#1B1917] shadow-xs'
                  : 'text-[#6E665E] hover:text-[#1B1917]'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-[#E07A2B]" />
              <span>Email Reset</span>
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: Mobile & Guide Reset */}
          {activeTab === 'mobile' && !successMsg && (
            <form onSubmit={handleMobileReset} className="space-y-3.5">
              <div className="text-[11px] text-[#786E65] bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
                <p className="font-semibold text-[#8C460D] flex items-center gap-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5 text-[#E07A2B]" />
                  <span>Devotee Self-Service Reset</span>
                </p>
                Enter your mobile number and your Guide&apos;s authorization passcode to set a new password.
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#59534E]">Registered Mobile</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E867F]">
                    <Phone className="w-4 h-4" />
                    <span className="text-xs font-bold text-[#786E65] ml-1.5 border-r border-stone-200 pr-2">
                      +91
                    </span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit number"
                    className="w-full h-11 pl-18 pr-4 rounded-xl bg-white border border-stone-200 text-sm font-mono tracking-wider text-[#1B1917] outline-none focus:border-[#E07A2B]"
                  />
                </div>
              </div>

              {/* Guide Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#59534E]">Your Registered Guide</label>
                <select
                  value={selectedGuideId}
                  onChange={(e) => setSelectedGuideId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#1B1917] outline-none focus:border-[#E07A2B]"
                >
                  {guides.length === 0 && (
                    <option value="">No registered guides found</option>
                  )}
                  {guides.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Guide Passcode */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#59534E]">Guide Authorization Code</label>
                  <span className="text-[10px] text-[#E07A2B] font-semibold">From your Guide</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E867F]">
                    <Shield className="w-4 h-4 text-[#E07A2B]" />
                  </div>
                  <input
                    type="password"
                    value={guidePasscode}
                    onChange={(e) => setGuidePasscode(e.target.value)}
                    placeholder="Enter Guide code (e.g. FOLK@GUIDE108)"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-stone-200 text-xs font-mono text-[#1B1917] outline-none focus:border-[#E07A2B]"
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#59534E]">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E867F]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-stone-200 text-sm text-[#1B1917] outline-none focus:border-[#E07A2B]"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#59534E]">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E867F]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-stone-200 text-sm text-[#1B1917] outline-none focus:border-[#E07A2B]"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-2 rounded-2xl saffron-gradient-btn text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 active:scale-[0.99] transition-all"
              >
                {loading ? 'Verifying & Updating...' : 'Set New Password'}
              </button>
            </form>
          )}

          {/* TAB 2: Email Reset Link */}
          {activeTab === 'email' && !successMsg && (
            <form onSubmit={handleEmailReset} className="space-y-3.5">
              <div className="text-[11px] text-[#786E65] bg-stone-100 p-3 rounded-2xl border border-stone-200">
                Enter the email address associated with your FOLK account. We will send a secure link to reset your password.
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#59534E]">Registered Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E867F]">
                    <Mail className="w-4 h-4 text-[#E07A2B]" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. devotee@gmail.com"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-stone-200 text-sm text-[#1B1917] outline-none focus:border-[#E07A2B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-2 rounded-2xl saffron-gradient-btn text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 active:scale-[0.99] transition-all"
              >
                {loading ? 'Sending Link...' : 'Send Password Reset Link'}
              </button>
            </form>
          )}

          {/* Help Note */}
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/60 text-[11px] text-[#7A4B1A] flex items-start gap-2">
            <HelpCircle className="w-4 h-4 shrink-0 text-[#E07A2B] mt-0.5" />
            <div>
              <span className="font-bold block">Need Help from your Guide?</span>
              If you don&apos;t know the Guide passcode, contact your FOLK Guide directly. Guides can also reset passwords directly from their temple dashboard.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
