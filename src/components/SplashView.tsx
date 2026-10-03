'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ArrowRight } from 'lucide-react';

export default function SplashView() {
  const { setScreen } = useApp();

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-between p-6 select-none max-w-md mx-auto">
      {/* Soft Ambient Light Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#E07A2B]/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#E5A93C]/14 rounded-full blur-3xl pointer-events-none" />

      {/* Top Subtle Pill */}
      <div className="pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/75 border border-white/90 shadow-xs backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#E07A2B] animate-pulse" />
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#786E65]">
            Friends of Lord Krishna
          </span>
        </div>
      </div>

      {/* Centerpiece: Official FOLK LIFE Logo & Prabhupada Tagline */}
      <div className="flex flex-col items-center text-center my-auto px-2">
        {/* Floating Spatial Logo Container */}
        <div className="relative mb-8">
          <div className="w-36 h-36 rounded-full glass-surface-elevated p-1 flex items-center justify-center relative animate-soft-float shadow-xl">
            {/* Circular cropped official FOLK LIFE Logo */}
            <div className="w-full h-full rounded-full overflow-hidden bg-[#F7A01D] shadow-inner flex items-center justify-center border-2 border-white/60">
              <img
                src="/assets/images/folk_logo.png"
                alt="FOLK LIFE Logo"
                className="w-full h-full object-cover scale-[1.05]"
              />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-[#1B1917] mb-3">
          FOLK SĀDHANA
        </h1>

        {/* Prabhupada's spoken quote as requested */}
        <div className="max-w-xs px-4 py-3 rounded-2xl bg-white/60 border border-white/80 shadow-xs backdrop-blur-xs">
          <p className="text-sm font-medium italic text-[#2C2825] leading-relaxed">
            “Chant Hare Krishna and your life will be sublime.”
          </p>
          <div className="text-[11px] font-bold tracking-wide uppercase text-[#9C4507] mt-1.5">
            — Śrīla Prabhupāda
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="w-full max-w-xs pb-8">
        <button
          onClick={() => setScreen('welcome')}
          className="w-full h-13 rounded-2xl saffron-gradient-btn font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.99] transition-all"
        >
          <span>Begin</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
