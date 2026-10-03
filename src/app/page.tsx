'use client';

import React, { useEffect } from 'react';
import { AppProvider, useApp, ScreenType } from '@/context/AppContext';
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
    setActiveFolkBoyTab,
    switchRole,
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

  const isGuide = currentUser.role === 'folk_guide';

  const screens: { id: ScreenType; label: string }[] = [
    { id: 'splash', label: '1. Splash' },
    { id: 'welcome', label: '2. Welcome' },
    { id: 'login', label: '3. Login' },
    { id: 'signup', label: '4. Signup' },
    { id: 'home', label: '5. Application' },
  ];

  return (
    <main className="min-h-screen relative flex flex-col justify-start">
      {/* Top Floating Screen Selector Bar for Seamless Design Review */}
      <div className="sticky top-0 z-40 bg-white/75 backdrop-blur-md border-b border-stone-200/50 px-3 py-1.5">
        <div className="max-w-md mx-auto flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 w-full justify-between">
            {screens.map((s) => (
              <button
                key={s.id}
                onClick={() => setScreen(s.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  currentScreen === s.id
                    ? 'bg-[#E07A2B] text-white shadow-xs'
                    : 'text-[#6E665E] hover:text-[#1B1917] hover:bg-stone-100/60'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Navigation Pills when inside Application Screen */}
        {currentScreen === 'home' && (
          <div className="max-w-md mx-auto pt-1.5 pb-0.5 flex items-center justify-between gap-1 border-t border-stone-200/40 mt-1">
            <span className="text-[10px] font-bold text-[#8C460D] uppercase tracking-wider shrink-0 mr-1">
              {isGuide ? 'Guide:' : 'Devotee:'}
            </span>

            {isGuide ? (
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-[#1B1917] bg-amber-100/80 px-2 py-0.5 rounded-lg">
                  Monitoring Dashboard
                </span>
                <button
                  onClick={() => switchRole('folk_boy')}
                  className="text-xs font-semibold text-[#8C460D] hover:underline px-2 py-0.5"
                >
                  Switch to Boy View
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 w-full justify-end">
                {(['home', 'calendar', 'books'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFolkBoyTab(tab)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      activeFolkBoyTab === tab
                        ? 'bg-stone-900 text-white shadow-2xs'
                        : 'text-[#59534E] hover:bg-stone-100'
                    }`}
                  >
                    {tab === 'home' ? 'Home' : tab === 'calendar' ? 'Calendar' : 'Books'}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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
