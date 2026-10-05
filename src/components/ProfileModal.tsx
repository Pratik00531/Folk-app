'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  User,
  Phone,
  Mail,
  Moon,
  Sun,
  Shield,
  Award,
  Flame,
  CheckCircle2,
  Sparkles,
  Briefcase,
  Heart,
  Save,
  LogOut,
  DownloadCloud,
  RefreshCw,
} from 'lucide-react';
import { CURRENT_APP_VERSION, checkForAppUpdates } from '@/lib/appVersionService';

export default function ProfileModal() {
  const {
    currentUser,
    updateUserProfile,
    isProfileModalOpen,
    setIsProfileModalOpen,
    theme,
    setTheme,
    toggleTheme,
    streak,
    signOut,
  } = useApp();

  const [fullName, setFullName] = useState(currentUser.full_name || '');
  const [spiritualName, setSpiritualName] = useState(currentUser.spiritual_name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [chantingCommitment, setChantingCommitment] = useState(currentUser.chanting_commitment || 16);
  const [profession, setProfession] = useState(currentUser.college_or_profession || 'Engineering Student / Tech Professional');
  const [phoneError, setPhoneError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  // Sync state whenever modal opens or user changes
  useEffect(() => {
    if (isProfileModalOpen) {
      setFullName(currentUser.full_name || '');
      setSpiritualName(currentUser.spiritual_name || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setChantingCommitment(currentUser.chanting_commitment || 16);
      setProfession(currentUser.college_or_profession || 'Engineering Student / Tech Professional');
      setPhoneError('');
      setSaveSuccess(false);
      setUpdateStatus(null);
    }
  }, [isProfileModalOpen, currentUser]);

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateStatus(null);
    try {
      const res = await checkForAppUpdates();
      if (res.updateAvailable) {
        window.dispatchEvent(new CustomEvent('trigger-app-update-modal', { detail: res.latest }));
        setUpdateStatus('New update available!');
      } else {
        setUpdateStatus(`App is up to date (v${CURRENT_APP_VERSION})`);
        setTimeout(() => setUpdateStatus(null), 3500);
      }
    } catch {
      setUpdateStatus('Could not check updates');
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleSignOut = async () => {
    setIsProfileModalOpen(false);
    await signOut();
  };

  if (!isProfileModalOpen) return null;

  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
    if (cleaned.length > 0 && cleaned.length < 10) {
      setPhoneError(`Must be exactly 10 digits (${cleaned.length}/10 entered)`);
    } else {
      setPhoneError('');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }

    updateUserProfile({
      full_name: fullName.trim() || currentUser.full_name,
      spiritual_name: spiritualName.trim() || null,
      phone: phone.trim(),
      email: email.trim(),
      chanting_commitment: Number(chantingCommitment) || 16,
      college_or_profession: profession.trim(),
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsProfileModalOpen(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-black/70 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-md max-h-[92vh] flex flex-col rounded-[30px] bg-white text-[#1B1917] shadow-2xl border border-stone-200/80 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-200/60 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E07A2B] text-white flex items-center justify-center shadow-xs">
              <User className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1B1917] leading-tight">
                Devotee Profile
              </h2>
              <span className="text-[11px] text-[#786E65]">
                Manage personal details & view mode
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsProfileModalOpen(false)}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-[#786E65] hover:text-[#1B1917] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Success Banner */}
          {saveSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile updated successfully! Hare Krishna 🙏</span>
            </div>
          )}

          {/* User Hero Badge */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-50/70 border border-amber-200/70 flex items-center gap-3.5">
            <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#E07A2B] to-[#E5A93C] shadow-xs shrink-0">
              <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                <img
                  src={currentUser.avatar_url || '/assets/images/Chanting.png'}
                  alt={currentUser.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-sm text-[#1B1917]">
                  {fullName || currentUser.full_name}
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    currentUser.role === 'folk_lead'
                      ? 'bg-amber-100 text-[#9C4507] border border-amber-300'
                      : currentUser.role === 'folk_guide'
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-[#786E65] border border-stone-200'
                  }`}
                >
                  {currentUser.role === 'folk_lead'
                    ? 'Folk Lead'
                    : currentUser.role === 'folk_guide'
                    ? 'Folk Guide'
                    : 'Folk Boy'}
                </span>
              </div>

              {spiritualName && (
                <div className="text-[11px] font-semibold text-[#E07A2B]">
                  Spiritual: {spiritualName}
                </div>
              )}

              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#786E65]">
                <span className="font-mono font-semibold bg-white/80 px-1.5 py-0.5 rounded border border-stone-200">
                  {currentUser.folk_id}
                </span>
                <span className="flex items-center gap-1 text-[#E07A2B] font-bold">
                  <Flame className="w-3 h-3 text-[#E07A2B]" />
                  {streak.current_reporting_streak}d Streak
                </span>
              </div>
            </div>
          </div>

          {/* VIEW MODE TOGGLE (Dark / Light Theme) */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-amber-400" />
                ) : (
                  <Sun className="w-4 h-4 text-[#E07A2B]" />
                )}
                <span className="text-xs font-extrabold text-[#1B1917]">
                  View Mode (Theme)
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#786E65]">
                {theme === 'dark' ? 'Dark Theme' : 'Light Theme'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-[#E07A2B] border-[#E07A2B] shadow-2xs'
                    : 'bg-white/60 text-[#786E65] border-stone-200 hover:bg-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#1C1917] text-amber-300 border-amber-400/80 shadow-2xs'
                    : 'bg-white/60 text-[#786E65] border-stone-200 hover:bg-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>

          {/* EDITABLE PERSONAL DETAILS */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#786E65]">
              Personal Information
            </h3>

            {/* Full Name */}
            <div>
              <label className="text-[11px] font-bold text-[#2C2825] block mb-1">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Radheshyam Patel"
                  required
                  className="w-full h-10 px-3 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-[#1B1917] focus:border-[#E07A2B] outline-none"
                />
              </div>
            </div>

            {/* Spiritual Name */}
            <div>
              <label className="text-[11px] font-bold text-[#2C2825] block mb-1">
                Spiritual Name / Devotional Aspirant Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={spiritualName}
                  onChange={(e) => setSpiritualName(e.target.value)}
                  placeholder="e.g. Radheshyam Dasa (Optional)"
                  className="w-full h-10 px-3 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-[#1B1917] focus:border-[#E07A2B] outline-none"
                />
              </div>
            </div>

            {/* 10-Digit Mobile Number (Strict Validation) */}
            <div>
              <label className="text-[11px] font-bold text-[#2C2825] flex items-center justify-between mb-1">
                <span>10-Digit Mobile Number <span className="text-red-500">*</span></span>
                <span className="text-[10px] text-[#786E65]">{phone.length}/10 digits</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                  className={`w-full h-10 px-3 rounded-xl bg-white border text-xs font-semibold outline-none transition-all ${
                    phoneError
                      ? 'border-red-500 text-red-700 bg-red-50/20'
                      : phone.length === 10
                      ? 'border-emerald-500 text-[#1B1917]'
                      : 'border-stone-200 text-[#1B1917] focus:border-[#E07A2B]'
                  }`}
                />
              </div>
              {phoneError && (
                <span className="text-[10px] text-red-600 font-semibold block mt-1">
                  {phoneError}
                </span>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="text-[11px] font-bold text-[#2C2825] block mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. radheshyam@folk.org"
                  required
                  className="w-full h-10 px-3 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-[#1B1917] focus:border-[#E07A2B] outline-none"
                />
              </div>
            </div>

            {/* College or Profession */}
            <div>
              <label className="text-[11px] font-bold text-[#2C2825] block mb-1">
                College / Organization / Profession
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science, IIT Bombay"
                  className="w-full h-10 px-3 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-[#1B1917] focus:border-[#E07A2B] outline-none"
                />
              </div>
            </div>

            {/* Daily Chanting Commitment */}
            <div>
              <label className="text-[11px] font-bold text-[#2C2825] block mb-1">
                Daily Japa Chanting Commitment (Rounds)
              </label>
              <select
                value={chantingCommitment}
                onChange={(e) => setChantingCommitment(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-[#1B1917] focus:border-[#E07A2B] outline-none cursor-pointer"
              >
                <option value={16}>16 Rounds Daily (Full Vow)</option>
                <option value={8}>8 Rounds Daily</option>
                <option value={4}>4 Rounds Daily</option>
                <option value={1}>1-2 Rounds Daily</option>
                <option value={20}>20+ Rounds Daily</option>
              </select>
            </div>

            {/* Assigned Guide Information */}
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-[11px] flex items-center justify-between">
              <div>
                <span className="text-[#786E65] block">Assigned FOLK Guide:</span>
                <span className="font-extrabold text-[#1B1917]">
                  {currentUser.guide_name || 'Assigned Temple Guide'}
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#216E39] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Active Guide
              </span>
            </div>

            {/* App Version & In-App Auto Update Checker */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-200/60 text-[11px] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-[#1B1917]">
                  <DownloadCloud className="w-3.5 h-3.5 text-[#E07A2B]" />
                  <span>FOLK Sādhana v{CURRENT_APP_VERSION}</span>
                </div>
                <span className="text-[10px] text-[#786E65] block mt-0.5">
                  {updateStatus || 'Production PWA • Up to date'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCheckUpdate}
                disabled={checkingUpdate}
                className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-[#8C460D] text-[10px] font-bold hover:bg-stone-50 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${checkingUpdate ? 'animate-spin text-[#E07A2B]' : ''}`} />
                <span>{checkingUpdate ? 'Checking...' : 'Check Update'}</span>
              </button>
            </div>

            {/* Sign Out Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full h-10 rounded-xl bg-red-50 hover:bg-red-100/80 border border-red-200/60 text-red-600 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="flex-1 h-11 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={phone.length !== 10}
              className="flex-2 h-11 rounded-xl saffron-gradient-btn font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
