'use client';

import React, { useEffect } from 'react';
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

  // Native Android Hardware Back Button & Gesture Handler
  useEffect(() => {
    let handler: any;
    import('@capacitor/app')
      .then(({ App }) => {
        handler = App.addListener('backButton', () => {
          if (isLogModalOpen) {
            closeLogModal();
          } else if (isProfileModalOpen) {
            setIsProfileModalOpen(false);
          } else if (isPointsModalOpen) {
            setIsPointsModalOpen(false);
          } else if (isExportModalOpen) {
            setIsExportModalOpen(false);
          } else if (currentScreen === 'signup' || currentScreen === 'login') {
            setScreen('welcome');
          } else {
            App.exitApp();
          }
        });
      })
      .catch(() => {});

    return () => {
      if (handler && typeof handler.remove === 'function') {
        handler.remove();
      }
    };
  }, [
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
  ]);

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
