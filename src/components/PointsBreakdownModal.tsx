'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { X, Star, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export default function PointsBreakdownModal() {
  const { isPointsModalOpen, setIsPointsModalOpen, pointRules } = useApp();

  if (!isPointsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#FAF5EE] rounded-[32px] border border-white/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E2D8] flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-[#DC6820]">
              <Star className="w-4 h-4 fill-[#DC6820]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1B1917]">Sādhana Point System</h3>
              <p className="text-[11px] text-[#786E65]">Calculated from Guide's configured cutoffs</p>
            </div>
          </div>
          <button
            onClick={() => setIsPointsModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-4">
          {/* Dynamic Points Banner */}
          {(() => {
            const totalMaxPoints = pointRules.reduce(
              (acc, r) => acc + (r.is_active ? (r.ontime_points ?? r.points ?? 0) : 0),
              0
            );
            return (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-[#7A4B1A] space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span>🎯 Daily Sādhana Point Matrix</span>
                  <span className="text-[#15803D] bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-black">
                    Configured by Guide ({totalMaxPoints} pts Max)
                  </span>
                </div>
                <p className="text-[11px] text-[#786E65] dark:text-stone-300 leading-relaxed">
                  Points and time cutoffs are configured directly by your FOLK Guide. Points are awarded based on your arrival time or completion. Colors reflect points earned (Green for full points down to Red for 0).
                </p>
              </div>
            );
          })()}

          {/* Color Legend (Points-Based System) */}
          <div className="bg-white/80 dark:bg-stone-800/80 p-3.5 rounded-2xl border border-stone-200/50 dark:border-stone-700/60 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#786E65] dark:text-stone-400 block">
              Points & Dot Color System
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#16A34A] shrink-0" />
                <span className="text-[#1B1917] dark:text-stone-100 font-semibold">Green: Full Points</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#84CC16] shrink-0" />
                <span className="text-[#1B1917] dark:text-stone-100 font-semibold">Light Green: Good Points</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#F59E0B] shrink-0" />
                <span className="text-[#1B1917] dark:text-stone-100 font-semibold">Yellow: Low Points</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EF4444] shrink-0" />
                <span className="text-[#EF4444] dark:text-red-400 font-semibold">Red: 0 Points</span>
              </div>
            </div>
          </div>

          {/* Activities breakdown list */}
          <div className="space-y-2.5">
            {pointRules.map((rule) => (
              <div
                key={rule.id}
                className="bg-white/90 p-3.5 rounded-2xl border border-stone-200/50 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1B1917]">{rule.title}</h4>
                  <span className="text-xs font-black text-[#DC6820]">
                    Up to {rule.points} pts
                  </span>
                </div>
                <p className="text-[11px] text-[#786E65]">{rule.condition}</p>

                {/* Tier details */}
                <div className="pt-1 flex items-center gap-2 text-[10px] text-[#59534E]">
                  <span className="inline-flex items-center gap-1 font-semibold text-[#16A34A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                    {rule.ontime_cutoff || 'On time'}: {rule.ontime_points || rule.points} pts
                  </span>
                  {rule.late_cutoff && (
                    <span className="inline-flex items-center gap-1 font-semibold text-[#65A30D]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#84CC16]" />
                      {rule.late_cutoff}: {rule.late_points} pts
                    </span>
                  )}
                  {rule.lastmin_cutoff && (
                    <span className="inline-flex items-center gap-1 font-semibold text-[#D97706]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                      {rule.lastmin_cutoff}: {rule.lastmin_points} pts
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/60 text-xs text-[#8C460D]">
            <p className="font-semibold">Guide Point Assignment</p>
            <p className="text-[11px] text-[#786E65] mt-0.5">
              These points are awarded automatically based on the arrival times, rounds, and reading duration entered in your daily Sādhana report.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white/60 border-t border-stone-200/50">
          <button
            onClick={() => setIsPointsModalOpen(false)}
            className="w-full py-2.5 rounded-2xl bg-[#DC6820] text-white font-bold text-xs cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
