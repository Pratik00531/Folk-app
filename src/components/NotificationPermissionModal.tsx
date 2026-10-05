'use client';

import React, { useState, useEffect } from 'react';
import { BellRing, ShieldCheck, X } from 'lucide-react';
import {
  checkNotificationPermission,
  requestNotificationPermission,
  sendDeviceNotification,
} from '@/lib/notificationService';

export default function NotificationPermissionModal() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const checkPermissionState = async () => {
      // Don't show if user dismissed in the last 24 hours
      const dismissedUntil = localStorage.getItem('folk_notif_dismissed_until');
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        return;
      }

      const status = await checkNotificationPermission();
      if (status === 'prompt') {
        // Slight delay so the app UI loads smoothly first
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    };

    checkPermissionState();
  }, []);

  const handleAllow = async () => {
    setIsRequesting(true);
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        setShowPrompt(false);
        localStorage.removeItem('folk_notif_dismissed_until');
        // Welcome notification to confirm it's working
        await sendDeviceNotification({
          title: 'Hare Krishna! 🙏',
          body: 'Sādhana reminders are now active on your phone.',
        });
      } else {
        // User denied or dismissed system prompt
        setShowPrompt(false);
        localStorage.setItem(
          'folk_notif_dismissed_until',
          String(Date.now() + 24 * 60 * 60 * 1000)
        );
      }
    } catch (err) {
      console.warn('handleAllow error:', err);
      setShowPrompt(false);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Dismiss for 24 hours
    localStorage.setItem(
      'folk_notif_dismissed_until',
      String(Date.now() + 24 * 60 * 60 * 1000)
    );
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-[32px] bg-white dark:bg-[#1C1816] text-[#1B1917] dark:text-stone-100 p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-center animate-in zoom-in-95 duration-200">
        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-[#786E65] dark:text-stone-400 cursor-pointer transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Bell Icon */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-amber-500/15 dark:bg-amber-500/20 text-[#DC6820] dark:text-amber-400 flex items-center justify-center mb-4 shadow-xs">
          <BellRing className="w-8 h-8 animate-bounce" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-[#1B1917] dark:text-stone-100 mb-1">
          Stay Updated with Reminders
        </h3>

        {/* Description */}
        <p className="text-xs text-[#786E65] dark:text-stone-400 leading-relaxed mb-5">
          Allow notifications so your <strong className="text-[#1B1917] dark:text-stone-200">FOLK Guide</strong> can send you instant daily Sādhana reminders and late submission approvals directly on your phone.
        </p>

        {/* Feature Pills */}
        <div className="space-y-2 mb-5 text-left">
          <div className="flex items-center gap-2 text-[11px] text-[#59534E] dark:text-stone-300 bg-stone-50 dark:bg-stone-900/60 p-2.5 rounded-xl border border-stone-200/60 dark:border-stone-800">
            <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span>Instant alerts when your Guide reminds you</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#59534E] dark:text-stone-300 bg-stone-50 dark:bg-stone-900/60 p-2.5 rounded-xl border border-stone-200/60 dark:border-stone-800">
            <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span>Late Sādhana approval notifications</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleAllow}
            disabled={isRequesting}
            className="w-full py-3 px-4 rounded-2xl bg-[#DC6820] hover:bg-[#C95B16] text-white text-xs font-black shadow-md cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <BellRing className="w-4 h-4" />
            <span>{isRequesting ? 'Enabling...' : 'Allow Notifications'}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-2.5 px-4 rounded-2xl bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800/60 text-xs font-bold text-[#786E65] dark:text-stone-400 cursor-pointer transition-all"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
