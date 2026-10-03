'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, X, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DuolingoOdometerDigitProps {
  oldChar: string;
  newChar: string;
  isIgnited: boolean;
}

function DuolingoOdometerDigit({ oldChar, newChar, isIgnited }: DuolingoOdometerDigitProps) {
  const isSame = oldChar === newChar;

  if (isSame) {
    // Digit which is same won't change: stays completely static
    return (
      <span className="inline-block text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] px-0.5">
        {oldChar}
      </span>
    );
  }

  // Digit which changes (e.g. 2 rolls up to 3): vertical rolling transition
  return (
    <div className="inline-block h-[72px] overflow-hidden relative leading-[72px] px-0.5">
      <div
        className={`flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isIgnited ? '-translate-y-1/2' : 'translate-y-0'
        }`}
      >
        <span className="h-[72px] flex items-center justify-center text-6xl font-black text-stone-300">
          {oldChar}
        </span>
        <span className="h-[72px] flex items-center justify-center text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.7)] scale-105">
          {newChar}
        </span>
      </div>
    </div>
  );
}

export default function DuolingoStreakCelebrationModal() {
  const {
    showDuolingoStreakAnimation,
    setShowDuolingoStreakAnimation,
    streakOldCount,
    streakNewCount,
  } = useApp();

  const [hasIgnited, setHasIgnited] = useState<boolean>(false);

  // Split old and new into character arrays
  const oldStr = String(streakOldCount);
  const newStr = String(streakNewCount);

  // Align length if digits expanded (e.g. 9 -> 10)
  const maxLen = Math.max(oldStr.length, newStr.length);
  const paddedOld = oldStr.padStart(maxLen, '0');
  const paddedNew = newStr.padStart(maxLen, '0');

  useEffect(() => {
    if (showDuolingoStreakAnimation) {
      setHasIgnited(false);

      // Trigger ignition & digit-by-digit roll after 750ms
      const timer = setTimeout(() => {
        setHasIgnited(true);

        try {
          confetti({
            particleCount: 80,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#FF5722', '#FF9800', '#FFC107', '#4CAF50', '#FFFFFF'],
          });
        } catch {
          // Fallback
        }
      }, 750);

      return () => clearTimeout(timer);
    }
  }, [showDuolingoStreakAnimation]);

  if (!showDuolingoStreakAnimation) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300">
      <div className="relative w-full max-w-sm rounded-[32px] bg-gradient-to-b from-[#1C1917] via-[#2A180E] to-[#140C07] text-white p-7 text-center shadow-2xl border border-amber-500/30 overflow-hidden">
        {/* Ambient Fire Aura Glow in Background */}
        <div
          className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            hasIgnited
              ? 'bg-gradient-to-tr from-red-600/50 via-orange-500/60 to-amber-300/40 scale-125'
              : 'bg-orange-600/30 scale-100'
          }`}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setShowDuolingoStreakAnimation(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Mini Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-[11px] font-extrabold uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>Daily Sādhana Logged</span>
        </div>

        {/* Central Burning Flame (Duolingo Style) */}
        <div className="relative my-4 flex items-center justify-center h-44">
          {/* Embers/Sparks rising */}
          {hasIgnited && (
            <>
              <div
                className="absolute w-2 h-2 rounded-full bg-amber-300"
                style={{
                  animation: 'sparkRise 1.2s infinite ease-out',
                  left: '42%',
                  bottom: '30%',
                  ['--drift' as string]: '-20px',
                }}
              />
              <div
                className="absolute w-1.5 h-1.5 rounded-full bg-orange-400"
                style={{
                  animation: 'sparkRise 1.4s infinite ease-out 0.3s',
                  left: '55%',
                  bottom: '25%',
                  ['--drift' as string]: '24px',
                }}
              />
              <div
                className="absolute w-2 h-2 rounded-full bg-yellow-200"
                style={{
                  animation: 'sparkRise 1.1s infinite ease-out 0.6s',
                  left: '48%',
                  bottom: '28%',
                  ['--drift' as string]: '8px',
                }}
              />
            </>
          )}

          {/* SVG Animated Flame */}
          <div
            className={`transition-transform duration-500 ${
              hasIgnited ? 'scale-110 animate-flame-burn' : 'scale-95'
            }`}
          >
            <svg
              className={`w-32 h-32 drop-shadow-2xl transition-all duration-500 ${
                hasIgnited ? 'animate-flame-flare' : ''
              }`}
              viewBox="0 0 100 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="flameOuter" x1="50" y1="0" x2="50" y2="120" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FF3D00" />
                  <stop offset="50%" stopColor="#FF7A00" />
                  <stop offset="100%" stopColor="#D50000" />
                </linearGradient>

                <linearGradient id="flameMid" x1="50" y1="20" x2="50" y2="110" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFD54F" />
                  <stop offset="50%" stopColor="#FFA000" />
                  <stop offset="100%" stopColor="#FF5722" />
                </linearGradient>

                <linearGradient id="flameCore" x1="50" y1="50" x2="50" y2="105" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="60%" stopColor="#FFF176" />
                  <stop offset="100%" stopColor="#FFB300" />
                </linearGradient>
              </defs>

              <path
                d="M50 5C50 5 62 25 66 38C71 28 73 20 73 20C73 20 88 45 88 72C88 95 72 115 50 115C28 115 12 95 12 72C12 43 32 23 42 16C40 28 44 38 44 38C44 38 48 18 50 5Z"
                fill="url(#flameOuter)"
              />

              <path
                d="M50 25C50 25 58 40 60 50C64 43 65 37 65 37C65 37 75 54 75 75C75 92 63 107 50 107C37 107 25 92 25 75C25 54 39 39 46 33C45 42 47 48 47 48C47 48 49 34 50 25Z"
                fill="url(#flameMid)"
              />

              <path
                d="M50 52C50 52 54 62 55 68C58 64 58 60 58 60C58 60 63 71 63 82C63 93 57 101 50 101C43 101 37 93 37 82C37 69 45 61 48 57C47 63 48 66 48 66C48 66 49 57 50 52Z"
                fill="url(#flameCore)"
              />
            </svg>
          </div>
        </div>

        {/* DIGIT-BY-DIGIT ODOMETER ANIMATION
            12 -> 13: 1 stays rock solid, 2 rolls smoothly into 3! */}
        <div className="relative mb-2">
          <div className="flex items-center justify-center h-[72px]">
            {paddedOld.split('').map((char, idx) => {
              const newChar = paddedNew[idx];
              // If it's a leading zero from padding, skip rendering unless both are zero
              if (char === '0' && newChar === '0' && idx < maxLen - 1) return null;
              return (
                <DuolingoOdometerDigit
                  key={`digit-roller-${idx}`}
                  oldChar={char}
                  newChar={newChar}
                  isIgnited={hasIgnited}
                />
              );
            })}
          </div>
          <div className="text-sm font-extrabold uppercase tracking-widest text-amber-400 mt-1">
            Day Sādhana Streak!
          </div>
        </div>

        {/* Motivational Devotional Message */}
        <p className="text-xs text-stone-300/90 font-medium px-4 leading-relaxed mb-6">
          {hasIgnited
            ? '🔥 Sri Krishna is pleased with your steady daily devotion. Keep your spiritual fire blazing!'
            : 'Igniting your steady practice...'}
        </p>

        {/* Personal Best & Milestone Pill */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 mb-6 flex items-center justify-around text-xs">
          <div className="text-center">
            <span className="text-[10px] text-stone-400 block font-semibold uppercase tracking-wider">
              Personal Best
            </span>
            <span className="font-extrabold text-white text-sm">24 Days</span>
          </div>
          <div className="w-[1px] h-6 bg-white/10" />
          <div className="text-center">
            <span className="text-[10px] text-stone-400 block font-semibold uppercase tracking-wider">
              Next Goal
            </span>
            <span className="font-extrabold text-amber-400 text-sm flex items-center gap-1 justify-center">
              <Trophy className="w-3.5 h-3.5" />
              14 Days
            </span>
          </div>
        </div>

        {/* Continue / Celebrate Button */}
        <button
          type="button"
          onClick={() => setShowDuolingoStreakAnimation(false)}
          className="w-full h-12 rounded-2xl saffron-gradient-btn text-white font-extrabold text-sm shadow-xl active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Continue Sādhana</span>
          <span className="text-xs">→</span>
        </button>
      </div>
    </div>
  );
}
