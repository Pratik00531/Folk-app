'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
} from 'lucide-react';
import { CURRENT_APP_VERSION, checkForAppUpdates } from '@/lib/appVersionService';
import { apiGetRegisteredGuides } from '@/lib/supabaseService';

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
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [chantingCommitment, setChantingCommitment] = useState(currentUser.chanting_commitment || 16);
  const [profession, setProfession] = useState(currentUser.college_or_profession || 'Engineering Student / Tech Professional');
  const [phoneError, setPhoneError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  const [registeredGuides, setRegisteredGuides] = useState<{ id: string; name: string }[]>([]);
  const [selectedGuideName, setSelectedGuideName] = useState(currentUser.guide_name || '');
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(currentUser.guide_id || null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Sync state whenever modal opens or user changes
  useEffect(() => {
    if (isProfileModalOpen) {
      setFullName(currentUser.full_name || '');
      setPhone((currentUser.phone || '').replace(/\D/g, '').slice(-10));
      setEmail(currentUser.email || '');
      setChantingCommitment(currentUser.chanting_commitment || 16);
      setProfession(currentUser.college_or_profession || 'Engineering Student / Tech Professional');
      setSelectedGuideName(currentUser.guide_name || '');
      setSelectedGuideId(currentUser.guide_id || null);
      setPhoneError('');
      setSaveSuccess(false);
      setSaveError(null);
      setUpdateStatus(null);
      setAvatarPreview(currentUser.avatar_url || null);

      if (typeof apiGetRegisteredGuides === 'function') {
        apiGetRegisteredGuides()
          .then(({ data }) => {
            if (data && data.length > 0) {
              setRegisteredGuides(data);
              if (currentUser.guide_name) {
                const match = data.find((g) => g.name.toLowerCase() === currentUser.guide_name?.toLowerCase());
                if (match) setSelectedGuideId(match.id);
              }
            } else {
              setRegisteredGuides([]);
            }
          })
          .catch(() => {});
      }
    }
  }, [isProfileModalOpen, currentUser]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        // Compress to max 400x400 for optimal performance & instant database sync
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setAvatarPreview(compressed);
          setIsSaving(true);
          setSaveError(null);
          try {
            // Instantly sync to user profile and database
            const res = await updateUserProfile({ avatar_url: compressed });
            if (res && res.error) {
              setSaveError('Failed to save avatar to server');
            } else {
              setSaveSuccess(true);
              setTimeout(() => setSaveSuccess(false), 2500);
            }
          } catch {
            setSaveError('Failed to save avatar');
          } finally {
            setIsSaving(false);
          }
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await updateUserProfile({
        full_name: fullName.trim() || currentUser.full_name,
        phone: cleanPhone,
        email: email.trim(),
        chanting_commitment: Number(chantingCommitment) || 16,
        college_or_profession: profession.trim(),
        guide_name: selectedGuideName,
        guide_id: selectedGuideId,
        avatar_url: avatarPreview || currentUser.avatar_url,
      });

      if (res && res.error) {
        setSaveError(res.error.message || 'Failed to save changes to server. Please try again.');
        setIsSaving(false);
        return;
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsProfileModalOpen(false);
      }, 1300);
    } catch (err: any) {
      setSaveError(err?.message || 'Error occurred while saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-black/70 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-md max-h-[92vh] flex flex-col rounded-[30px] bg-white dark:bg-[#1C1816] text-[#1B1917] dark:text-[#F5F5F4] shadow-2xl border border-stone-200/80 dark:border-stone-800 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-200/60 dark:border-stone-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E07A2B] text-white flex items-center justify-center shadow-xs">
              <User className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1B1917] dark:text-stone-100 leading-tight">
                Devotee Profile
              </h2>
              <span className="text-[11px] text-[#786E65] dark:text-stone-400">
                Manage personal details & view mode
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsProfileModalOpen(false)}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 flex items-center justify-center text-[#786E65] hover:text-[#1B1917] dark:text-stone-300 dark:hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Error Banner */}
          {saveError && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold flex items-center justify-between gap-2 animate-fadeIn">
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-600 shrink-0" />
                <span>{saveError}</span>
              </div>
              <button
                type="button"
                onClick={() => setSaveError(null)}
                className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Success Banner */}
          {saveSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile updated and saved successfully! Hare Krishna 🙏</span>
            </div>
          )}

          {/* User Hero Badge & Photo Update */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-50/70 dark:from-[#26211D] dark:to-[#1C1815] border border-amber-200/70 dark:border-stone-700 flex items-center gap-3.5">
            {/* Clickable Profile Avatar with Camera Icon */}
            <div className="relative group shrink-0">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#E07A2B] to-[#E5A93C] shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all"
                title="Tap to update your profile photo"
              >
                <div className="w-full h-full rounded-full bg-white dark:bg-stone-800 overflow-hidden flex items-center justify-center">
                  <img
                    src={avatarPreview || currentUser.avatar_url || '/assets/images/Chanting.png'}
                    alt={currentUser.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Camera Badge Overlay */}
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#E07A2B] text-white flex items-center justify-center shadow-md border-2 border-white dark:border-stone-800">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-sm text-[#1B1917] dark:text-stone-100">
                  {fullName || currentUser.full_name}
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    currentUser.role === 'folk_lead'
                      ? 'bg-amber-100 text-[#9C4507] dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50'
                      : currentUser.role === 'folk_guide'
                      ? 'bg-stone-900 dark:bg-stone-800 text-white'
                      : 'bg-white dark:bg-stone-800 text-[#786E65] dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                  }`}
                >
                  {currentUser.role === 'folk_lead'
                    ? 'Folk Lead'
                    : currentUser.role === 'folk_guide'
                    ? 'Folk Guide'
                    : 'Folk Boy'}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#786E65] dark:text-stone-400">
                <span className="font-mono font-semibold bg-white/80 dark:bg-stone-800 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700 text-[#786E65] dark:text-stone-300">
                  {currentUser.folk_id}
                </span>
                <span className="flex items-center gap-1 text-[#E07A2B] dark:text-amber-400 font-bold">
                  <Flame className="w-3 h-3 text-[#E07A2B] dark:text-amber-400" />
                  {streak.current_reporting_streak}d Streak
                </span>
              </div>
            </div>
          </div>

          {/* VIEW MODE TOGGLE (Dark / Light Theme) */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#221E1B] border border-stone-200/70 dark:border-stone-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-amber-400" />
                ) : (
                  <Sun className="w-4 h-4 text-[#E07A2B]" />
                )}
                <span className="text-xs font-extrabold text-[#1B1917] dark:text-stone-100">
                  View Mode (Theme)
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#786E65] dark:text-stone-400">
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
                    : 'bg-white/60 dark:bg-stone-800/60 text-[#786E65] dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-800'
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
                    : 'bg-white/60 dark:bg-stone-800/60 text-[#786E65] dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-800'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>

          {/* EDITABLE PERSONAL DETAILS */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#786E65] dark:text-stone-400">
              Personal Information
            </h3>

            {/* Name */}
            <div>
              <label className="text-[11px] font-bold text-[#2C2825] dark:text-stone-300 block mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Radheshyam Patel"
                  required
                  className="w-full h-10 px-3 rounded-xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-[#1B1917] dark:text-stone-100 focus:border-[#E07A2B] outline-none"
                />
              </div>
            </div>

            {/* 10-Digit Mobile Number (Strict Validation) */}
            <div>
              <label className="text-[11px] font-bold text-[#2C2825] dark:text-stone-300 flex items-center justify-between mb-1">
                <span>10-Digit Mobile Number <span className="text-red-500">*</span></span>
                <span className="text-[10px] text-[#786E65] dark:text-stone-400">{phone.length}/10 digits</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                  className={`w-full h-10 px-3 rounded-xl bg-white dark:bg-stone-800/90 border text-xs font-semibold outline-none transition-all ${
                    phoneError
                      ? 'border-red-500 text-red-700 bg-red-50/20'
                      : phone.length === 10
                      ? 'border-emerald-500 text-[#1B1917] dark:text-stone-100'
                      : 'border-stone-200 dark:border-stone-700 text-[#1B1917] dark:text-stone-100 focus:border-[#E07A2B]'
                  }`}
                />
              </div>
              {phoneError && (
                <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold block mt-1">
                  {phoneError}
                </span>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="text-[11px] font-bold text-[#2C2825] dark:text-stone-300 block mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. radheshyam@folk.org"
                  required
                  className="w-full h-10 px-3 rounded-xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-[#1B1917] dark:text-stone-100 focus:border-[#E07A2B] outline-none"
                />
              </div>
            </div>

            {/* College or Profession */}
            <div>
              <label className="text-[11px] font-bold text-[#2C2825] dark:text-stone-300 block mb-1">
                College / Organization / Profession
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science, IIT Bombay"
                  className="w-full h-10 px-3 rounded-xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-[#1B1917] dark:text-stone-100 focus:border-[#E07A2B] outline-none"
                />
              </div>
            </div>

            {/* Daily Chanting Commitment */}
            <div>
              <label className="text-[11px] font-bold text-[#2C2825] dark:text-stone-300 block mb-1">
                Daily Japa Chanting Commitment (Rounds)
              </label>
              <select
                value={chantingCommitment}
                onChange={(e) => setChantingCommitment(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-[#1B1917] dark:text-stone-100 focus:border-[#E07A2B] outline-none cursor-pointer"
              >
                <option value={16}>16 Rounds Daily (Full Vow)</option>
                <option value={8}>8 Rounds Daily</option>
                <option value={4}>4 Rounds Daily</option>
                <option value={1}>1-2 Rounds Daily</option>
                <option value={20}>20+ Rounds Daily</option>
              </select>
            </div>

            {/* Assigned Guide Information & Selection */}
            {currentUser.role === 'folk_guide' ? (
              <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 text-[11px] flex items-center justify-between">
                <div>
                  <span className="text-[#8C460D] dark:text-amber-400 font-bold block">Account Authority:</span>
                  <span className="font-extrabold text-[#1B1917] dark:text-stone-100 text-xs">
                    Authorized FOLK Guide Counselor
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/60">
                  Temple Guide
                </span>
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-bold text-[#2C2825] dark:text-stone-300 flex items-center justify-between mb-1">
                  <span>Assigned FOLK Guide</span>
                  {selectedGuideName ? (
                    <span className="text-[10px] font-bold text-[#216E39] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active Guide
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full border border-stone-200 dark:border-stone-700">
                      Not Assigned
                    </span>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={selectedGuideName}
                    onChange={(e) => {
                      const name = e.target.value;
                      setSelectedGuideName(name);
                      const match = registeredGuides.find((g) => g.name === name);
                      setSelectedGuideId(match ? match.id : null);
                    }}
                    className="w-full h-10 px-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold text-[#1B1917] dark:text-stone-100 focus:border-[#E07A2B] outline-none cursor-pointer"
                  >
                    <option value="">
                      {registeredGuides.length > 0 ? '-- Select Your Registered FOLK Guide --' : 'No Guides Registered Yet'}
                    </option>
                    {registeredGuides.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedGuideName ? (
                  <span className="text-[10px] text-[#786E65] dark:text-stone-400 block mt-1">
                    Assigned Temple Guide: <strong className="text-[#E07A2B] font-bold">{selectedGuideName}</strong> will monitor your daily Sādhana reports.
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 block mt-1">
                    Select your registered temple guide to link your Sādhana reporting.
                  </span>
                )}
              </div>
            )}

            {/* App Version & In-App Auto Update Checker */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-200/60 dark:border-stone-700 text-[11px] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-[#1B1917] dark:text-stone-100">
                  <DownloadCloud className="w-3.5 h-3.5 text-[#E07A2B]" />
                  <span>FOLK Sādhana v{CURRENT_APP_VERSION}</span>
                </div>
                <span className="text-[10px] text-[#786E65] dark:text-stone-400 block mt-0.5">
                  {updateStatus || 'Production PWA • Up to date'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCheckUpdate}
                disabled={checkingUpdate}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[#8C460D] dark:text-amber-400 text-[10px] font-bold hover:bg-stone-50 dark:hover:bg-stone-700 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
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
                className="w-full h-10 rounded-xl bg-red-50 hover:bg-red-100/80 dark:bg-red-950/40 dark:hover:bg-red-900/50 border border-red-200/60 dark:border-red-800/60 text-red-600 dark:text-red-400 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
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
              className="flex-1 h-11 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || phone.replace(/\D/g, '').length !== 10}
              className="flex-2 h-11 rounded-xl saffron-gradient-btn font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
