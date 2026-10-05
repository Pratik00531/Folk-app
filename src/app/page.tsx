'use client';

import React, { useEffect, useRef } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import SplashView from '@/components/SplashView';
import WelcomeView from '@/components/WelcomeView';
import LoginView from '@/components/LoginView';
import SignupView from '@/components/SignupView';
import FolkBoyHomeView from '@/components/FolkBoyHomeView';
import SadhanaCalendarView from '@/components/SadhanaCalendarView';
import BookReadingView from '@/components/BookReadingView';
import GuideDashboardView from '@/components/GuideDashboardView';
import SadhanaLogModal from '@/components/SadhanaLogModal';
import PointsBreakdownModal from '@/components/PointsBreakdownModal';
import DuolingoStreakCelebrationModal from '@/components/DuolingoStreakCelebrationModal';
import ProfileModal from '@/components/ProfileModal';
import AppUpdateModal from '@/components/AppUpdateModal';

function MainContent() {
  const {
    currentScreen,
    setScreen,
    currentUser,
    activeFolkBoyTab,
    isLogModalOpen,
    closeLogModal,
    isProfileModalOpen,
    setIsProfileModalOpen,
    isPointsModalOpen,
    setIsPointsModalOpen,
    isExportModalOpen,
    setIsExportModalOpen,
  } = useApp();

  // Register Progressive Web App service worker for fast offline caching & auto updates
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  window.dispatchEvent(new CustomEvent('trigger-app-update-modal'));
                }
              };
            }
          };
        })
        .catch((err) => console.log('SW registration note:', err));
    }
  }, []);

  // Keep refs for current state so back button listener doesn't need to be recreated on every state change
  const stateRef = useRef({
    isLogModalOpen,
    closeLogModal,
    isProfileModalOpen,
    setIsProfileModalOpen,
    isPointsModalOpen,
    setIsPointsModalOpen,
    isExportModalOpen,
    setIsExportModalOpen,
    currentScreen,
    setScreen,
  });

  useEffect(() => {
    stateRef.current = {
      isLogModalOpen,
      closeLogModal,
      isProfileModalOpen,
      setIsProfileModalOpen,
      isPointsModalOpen,
      setIsPointsModalOpen,
      isExportModalOpen,
      setIsExportModalOpen,
      currentScreen,
      setScreen,
    };
  });

  // Native Android Hardware Back Button & Gesture Handler (Native only)
  useEffect(() => {
    let isSubscribed = true;

    const setupListener = async () => {
      try {
        if (typeof window === 'undefined') return;
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;

        const { App } = await import('@capacitor/app');
        const listener = await App.addListener('backButton', () => {
          const s = stateRef.current;
          if (s.isLogModalOpen) {
            s.closeLogModal();
          } else if (s.isProfileModalOpen) {
            s.setIsProfileModalOpen(false);
          } else if (s.isPointsModalOpen) {
            s.setIsPointsModalOpen(false);
          } else if (s.isExportModalOpen) {
            s.setIsExportModalOpen(false);
          } else if (s.currentScreen === 'signup' || s.currentScreen === 'login') {
            s.setScreen('welcome');
          } else {
            try {
              App.exitApp();
            } catch {
              // ignore
            }
          }
        });

        if (!isSubscribed && listener) {
          try {
            await listener.remove();
          } catch {
            // ignore
          }
        }
      } catch {
        // Not running in capacitor or plugin unavailable
      }
    };

    setupListener().catch(() => {});

    return () => {
      isSubscribed = false;
    };
  }, []);

  const isGuide = currentUser.role === 'folk_guide';

  return (
    <main className="min-h-screen relative flex flex-col justify-start">

      {/* Screen Presentation Viewport */}
      <div className="flex-1 w-full max-w-md mx-auto">
        {currentScreen === 'splash' && <SplashView />}
        {currentScreen === 'welcome' && <WelcomeView />}
        {currentScreen === 'login' && <LoginView />}
        {currentScreen === 'signup' && <SignupView />}
        {currentScreen === 'home' && (
          <>
            {isGuide ? (
              <GuideDashboardView />
            ) : (
              <>
                {activeFolkBoyTab === 'home' && <FolkBoyHomeView />}
                {activeFolkBoyTab === 'calendar' && <SadhanaCalendarView />}
                {activeFolkBoyTab === 'books' && <BookReadingView />}
              </>
            )}
          </>
        )}
      </div>

      {/* SINGLE SCREEN SĀDHANA FORM (Opens for today or any tapped calendar date) */}
      <SadhanaLogModal />

      {/* POINTS BREAKDOWN POPUP (Opens when tapping View Points in Sādhana form) */}
      <PointsBreakdownModal />

      {/* DUOLINGO-STYLE BURNING FLAME STREAK CELEBRATION MODAL */}
      <DuolingoStreakCelebrationModal />

      {/* UNIVERSAL DEVOTEE PROFILE & VIEW MODE MODAL */}
      <ProfileModal />

      {/* IN-APP VERSION AUTO-UPDATE NOTICE & CACHE PURGER */}
      <AppUpdateModal />
    </main>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
