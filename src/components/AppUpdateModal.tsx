'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  DownloadCloud,
  CheckCircle2,
  RefreshCw,
  X,
  AlertTriangle,
  Flame,
  ArrowRight,
} from 'lucide-react';
import {
  CURRENT_APP_VERSION,
  AppVersionInfo,
  checkForAppUpdates,
  applyAppUpdate,
} from '@/lib/appVersionService';

interface AppUpdateModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function AppUpdateModal({ forceOpen = false, onClose }: AppUpdateModalProps) {
  const [isOpen, setIsOpen] = useState(forceOpen);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<AppVersionInfo | null>(null);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    // Check on mount
    const check = async () => {
      const result = await checkForAppUpdates();
      if (result.updateAvailable) {
        setUpdateInfo(result.latest);
        setIsOpen(true);
      }
    };
    check();

    // Listen for custom trigger event
    const handleTrigger = (e: any) => {
      if (e.detail) {
        setUpdateInfo(e.detail);
      }
      setIsOpen(true);
    };

    window.addEventListener('trigger-app-update-modal', handleTrigger);
    return () => {
      window.removeEventListener('trigger-app-update-modal', handleTrigger);
    };
  }, [forceOpen]);

  const handleInstall = async () => {
    setIsUpdating(true);
    try {
      await applyAppUpdate();
    } catch (err) {
      console.error('Error applying update:', err);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-[28px] bg-white text-[#1B1917] shadow-2xl border border-stone-200/80 overflow-hidden flex flex-col">
        {/* Top Header with Gradient Saffron & Tilak Accent */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-[#E07A2B]/15 via-amber-500/10 to-stone-50 border-b border-stone-200/60 text-center">
          {!updateInfo?.mandatory && (
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-black/5 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-[#E07A2B] to-[#F59E0B] text-white flex items-center justify-center shadow-lg shadow-amber-500/25 ring-4 ring-amber-100">
            <DownloadCloud className="w-7 h-7 animate-bounce" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-[#8C460D] text-[10px] font-bold tracking-wide uppercase mb-1">
            <Sparkles className="w-3 h-3 text-[#E07A2B]" />
            New Version Available
          </div>

          <h2 className="text-lg font-extrabold text-[#1B1917]">
            Update FOLK Sādhana
          </h2>
          <p className="text-xs text-[#59534E] mt-0.5">
            {updateInfo?.version ? `Version ${updateInfo.version}` : 'Version 1.2.1'} is now ready
          </p>
        </div>

        {/* What's New Section */}
        <div className="p-5 max-h-60 overflow-y-auto space-y-3">
          <div className="text-[11px] font-bold text-[#786E65] uppercase tracking-wider">
            What&apos;s new in this release:
          </div>

          <ul className="space-y-2">
            {(updateInfo?.releaseNotes || [
              'Śrīmad Bhāgavatam hearing tracker in comparative analytics',
              'Prabhupada Level 5 Cantos with official covers',
              'Duolingo fire streak celebration & animation',
              'Dark mode contrast & clarity enhancements',
              'Supabase cloud sync for Guides and Devotees',
            ]).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-[#2C2825] leading-relaxed">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/50 text-[11px] text-[#8C460D] flex items-center gap-2">
            <Flame className="w-4 h-4 shrink-0 text-[#E07A2B]" />
            <span>
              Your Sādhana data, japa counts, and streaks are 100% saved and preserved!
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 pt-2 border-t border-stone-100 flex flex-col gap-2 bg-stone-50/50">
          <button
            onClick={handleInstall}
            disabled={isUpdating}
            className="w-full h-11 rounded-xl saffron-gradient-btn font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 transition-all text-white"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Installing & Refreshing...</span>
              </>
            ) : (
              <>
                <DownloadCloud className="w-4 h-4" />
                <span>Install & Restart Now</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-80" />
              </>
            )}
          </button>

          {!updateInfo?.mandatory && (
            <button
              onClick={handleDismiss}
              disabled={isUpdating}
              className="w-full h-9 rounded-xl bg-transparent hover:bg-stone-200/50 text-stone-500 hover:text-stone-800 text-xs font-semibold transition-all cursor-pointer"
            >
              Remind Me Later
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
