'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import { apiSimpleResetPassword } from '@/lib/supabaseService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (identifier: string) => void;
  initialIdentifier?: string;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onSuccess,
  initialIdentifier = '',
}: ForgotPasswordModalProps) {
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialIdentifier) {
      setIdentifier(initialIdentifier);
    }
  }, [initialIdentifier]);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setErrorMsg('Please enter your registered Mobile Number or Email.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    const { data, error } = await apiSimpleResetPassword(trimmed, newPassword);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Could not reset password. Please check your details.');
    } else {
      setSuccessMsg(data?.message || 'Password reset successfully!');
      setTimeout(() => {
        onSuccess(trimmed);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#FAF8F5] border border-white/80 rounded-[28px] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E8E2D8] flex items-center justify-between bg-white/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#E07A2B]/15 flex items-center justify-center text-[#E07A2B]">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1B1917]">Reset Password</h2>
              <p className="text-[10px] text-[#786E65]">Mobile or Email</p>
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

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 mx-auto flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold">{successMsg}</p>
              <p className="text-[11px] text-emerald-700">Redirecting to Sign In...</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-3">
              {/* Mobile or Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#59534E]">
                  Registered Mobile or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E867F]">
                    <Smartphone className="w-4 h-4 text-[#E07A2B]" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter 10-digit mobile or email"
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-white border border-stone-200 text-sm text-[#1B1917] outline-none focus:border-[#E07A2B]"
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
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-white border border-stone-200 text-sm text-[#1B1917] outline-none focus:border-[#E07A2B]"
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
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-white border border-stone-200 text-sm text-[#1B1917] outline-none focus:border-[#E07A2B]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-2 rounded-2xl saffron-gradient-btn text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 active:scale-[0.99] transition-all"
              >
                {loading ? (
                  <span>Updating Password...</span>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
