'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Flame, Coins, CheckCircle2, ArrowRight } from 'lucide-react';

export default function WelcomeView() {
  const { setScreen } = useApp();

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-between p-6 select-none max-w-md mx-auto">
      {/* Background Soft Lighting */}
      <div className="absolute top-10 right-4 w-60 h-60 bg-[#E07A2B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-4 w-64 h-64 bg-[#E5A93C]/12 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="pt-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full overflow-hidden shadow-md border-2 border-white/80 mb-3 bg-[#F7A01D]">
          <img
            src="/assets/images/folk_logo.png"
            alt="FOLK"
            className="w-full h-full object-cover scale-105"
          />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1B1917]">
          FOLK SĀDHANA
        </h1>
        <p className="text-xs font-medium text-[#786E65] mt-1">
          Daily rhythm, reflection, and consistency
        </p>
      </div>

      {/* Minimal Feature Highlights */}
      <div className="space-y-2.5 my-6">
        {/* Pillar 1 */}
        <div className="glass-surface px-4 py-3 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/50 flex items-center justify-center text-[#E07A2B] shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#1B1917]">Daily Sādhana</div>
            <div className="text-xs text-[#6E665E]">1–2 minute effortless reporting</div>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="glass-surface px-4 py-3 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/50 flex items-center justify-center text-[#E07A2B] shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#1B1917]">Reporting Streak</div>
            <div className="text-xs text-[#6E665E]">Personal consistency milestones</div>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="glass-surface px-4 py-3 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 border border-yellow-200/50 flex items-center justify-center text-[#E5A93C] shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#1B1917]">Chaitanya Currency</div>
            <div className="text-xs text-[#6E665E]">Reward ledger for daily discipline</div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-3 pb-6">
        <button
          onClick={() => setScreen('signup')}
          className="w-full h-13 rounded-2xl saffron-gradient-btn font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.99] transition-all"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => setScreen('login')}
          className="w-full h-12 rounded-2xl bg-white/80 hover:bg-white border border-white/90 text-[#36322E] font-semibold text-sm flex items-center justify-center cursor-pointer shadow-xs active:scale-[0.99] transition-all"
        >
          I already have an account
        </button>
      </div>
    </div>
  );
}
