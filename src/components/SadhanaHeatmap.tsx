'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { GitCommit, Calendar as CalendarIcon, Info, Check } from 'lucide-react';

interface MonthData {
  id: 'aug' | 'sep' | 'oct' | 'all';
  label: string;
  shortLabel: string;
  year: number;
  monthIndex: number; // 0-indexed (7 = Aug, 8 = Sep, 9 = Oct)
  daysCount: number;
  prefix: string; // e.g. "2026-10"
}

const MONTHS: MonthData[] = [
  { id: 'aug', label: 'August 2026', shortLabel: 'Aug', year: 2026, monthIndex: 7, daysCount: 31, prefix: '2026-08' },
  { id: 'sep', label: 'September 2026', shortLabel: 'Sep', year: 2026, monthIndex: 8, daysCount: 30, prefix: '2026-09' },
  { id: 'oct', label: 'October 2026 (Now)', shortLabel: 'Oct', year: 2026, monthIndex: 9, daysCount: 31, prefix: '2026-10' },
];

export default function SadhanaHeatmap() {
  const { sadhanaRecords, openLogModalForDate } = useApp();
  const [selectedMonthId, setSelectedMonthId] = useState<'aug' | 'sep' | 'oct' | 'all'>('oct');
  const [hoveredDay, setHoveredDay] = useState<{ dayNum: number; dateStr: string; pts10: number; points: number; monthName: string } | null>(null);

  // Today is Oct 3, 2026
  const todayDateStr = '2026-10-03';

  // Convert points earned (0-100) to GitHub 10-point scale (at most 10 points)
  const getDayPoints10 = (pointsEarned: number) => {
    if (pointsEarned <= 0) return 0;
    return Math.min(10, Math.round(pointsEarned / 10));
  };

  const getGitHubLevelStyle = (pts10: number, isFuture: boolean, isLateFilled = false) => {
    if (isFuture) {
      return {
        bg: 'bg-[#F3F4F6]',
        border: 'border-[#E5E7EB]',
        text: 'text-[#9CA3AF]',
        badge: 'Upcoming',
      };
    }
    // LATE-FILLED SĀDHANA: Vibrant Blue Tile!
    if (isLateFilled && pts10 > 0) {
      return {
        bg: 'bg-[#2563EB]',
        border: 'border-[#1D4ED8]',
        text: 'text-white',
        badge: `${pts10}/10 pts (Late Filled)`,
      };
    }
    if (pts10 <= 0) {
      return {
        bg: 'bg-[#EBEDF0]',
        border: 'border-[#D0D7DE]',
        text: 'text-[#656D76]',
        badge: '0 pts',
      };
    }
    if (pts10 <= 3) {
      return {
        bg: 'bg-[#9BE9A8]',
        border: 'border-[#7EE08C]',
        text: 'text-[#14532D]',
        badge: `${pts10}/10 pts`,
      };
    }
    if (pts10 <= 6) {
      return {
        bg: 'bg-[#40C463]',
        border: 'border-[#36B055]',
        text: 'text-white',
        badge: `${pts10}/10 pts`,
      };
    }
    if (pts10 <= 8) {
      return {
        bg: 'bg-[#30A14E]',
        border: 'border-[#288E44]',
        text: 'text-white',
        badge: `${pts10}/10 pts`,
      };
    }
    // 9-10 pts: Darkest Rich Forest Green
    return {
      bg: 'bg-[#216E39]',
      border: 'border-[#1B592E]',
      text: 'text-white',
      badge: `${pts10}/10 pts`,
    };
  };

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Helper to build days for a specific month
  const buildMonthGrid = (m: MonthData) => {
    const startDayOfWeek = new Date(m.year, m.monthIndex, 1).getDay();
    const padding = Array.from({ length: startDayOfWeek });

    const days = Array.from({ length: m.daysCount }, (_, i) => {
      const dayNum = i + 1;
      const dateStr = `${m.prefix}-${String(dayNum).padStart(2, '0')}`;
      const record = sadhanaRecords[dateStr];
      const points = record ? record.points_earned : 0;
      const pts10 = getDayPoints10(points);
      const isFuture = dateStr > todayDateStr;
      const isToday = dateStr === todayDateStr;
      const isLateFilled = Boolean(record && record.is_late_submission);
      return { dayNum, dateStr, points, pts10, isFuture, isToday, isLateFilled, hasRecord: Boolean(record), monthName: m.shortLabel };
    });

    return { m, padding, days };
  };

  const activeMonthData = MONTHS.find((m) => m.id === selectedMonthId) || MONTHS[2];

  return (
    <div className="glass-surface p-4.5 rounded-[26px] shadow-xs">
      {/* Top Header - Strictly "Heat map" with 3-Month View */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#216E39]">
            <GitCommit className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-[#1B1917] tracking-tight">
              Heat map
            </h2>
            <span className="text-[11px] text-[#786E65]">
              Last 3 Months · Darker green = Higher Sādhana
            </span>
          </div>
        </div>

        {/* Real-time Today Status Pill */}
        {sadhanaRecords['2026-10-03'] ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#216E39] text-white text-[10px] font-black shadow-2xs">
            <Check className="w-3 h-3 stroke-[3]" />
            <span>Today: {getDayPoints10(sadhanaRecords['2026-10-03'].points_earned)}/10</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-[#9C4507] text-[10px] font-bold">
            <span>Today Pending</span>
          </div>
        )}
      </div>

      {/* 3 Months Segmented Switcher */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl mb-3.5 overflow-x-auto scrollbar-none">
        {MONTHS.map((m) => {
          const isSelected = selectedMonthId === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMonthId(m.id)}
              className={`flex-1 py-1 px-2.5 rounded-lg text-[11px] font-bold transition-all text-center whitespace-nowrap ${
                isSelected
                  ? 'bg-white text-[#1B1917] shadow-xs font-black'
                  : 'text-[#786E65] hover:text-[#1B1917]'
              }`}
            >
              {m.shortLabel} &apos;26
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setSelectedMonthId('all')}
          className={`py-1 px-3 rounded-lg text-[11px] font-bold transition-all text-center whitespace-nowrap ${
            selectedMonthId === 'all'
              ? 'bg-[#216E39] text-white shadow-xs font-black'
              : 'text-[#786E65] hover:text-[#1B1917]'
          }`}
        >
          All 3 Mo
        </button>
      </div>

      {/* If "all" is selected, show multi-month overview */}
      {selectedMonthId === 'all' ? (
        <div className="space-y-4">
          {MONTHS.map((m) => {
            const { padding, days } = buildMonthGrid(m);
            return (
              <div key={m.id} className="p-2.5 bg-stone-50/70 rounded-2xl border border-stone-200/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black text-[#1B1917] uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarIcon className="w-3 h-3 text-[#E07A2B]" />
                    {m.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedMonthId(m.id)}
                    className="text-[10px] font-bold text-[#E07A2B] hover:underline"
                  >
                    View Month →
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {padding.map((_, i) => (
                    <div key={`all-pad-${m.id}-${i}`} className="h-6 flex items-center justify-center opacity-20">
                      <span className="w-1 h-1 rounded-full bg-stone-300" />
                    </div>
                  ))}
                  {days.map(({ dayNum, dateStr, points, pts10, isFuture, isToday, isLateFilled }) => {
                    const style = getGitHubLevelStyle(pts10, isFuture, isLateFilled);
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        disabled={isFuture}
                        onClick={() => !isFuture && openLogModalForDate(dateStr)}
                        onMouseEnter={() => setHoveredDay({ dayNum, dateStr, pts10, points, monthName: m.shortLabel })}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`h-6 rounded-[5px] border flex items-center justify-center text-[9px] font-bold transition-transform ${
                          style.bg
                        } ${style.border} ${style.text} ${
                          isFuture ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110 active:scale-95'
                        } ${isToday ? 'ring-2 ring-[#E07A2B] scale-105' : ''}`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Single Month Detailed Grid */
        <div>
          {/* Days of week header */}
          <div className="grid grid-cols-7 text-center text-[10px] font-extrabold text-[#8E867F] mb-2">
            {daysOfWeek.map((d, idx) => (
              <div key={`dow-${idx}`}>{d}</div>
            ))}
          </div>

          {/* Tiles Grid */}
          {(() => {
            const { padding, days } = buildMonthGrid(activeMonthData);
            return (
              <div className="grid grid-cols-7 gap-2">
                {padding.map((_, i) => (
                  <div key={`heat-pad-${i}`} className="h-9 flex items-center justify-center opacity-30">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                  </div>
                ))}

                {days.map(({ dayNum, dateStr, points, pts10, isFuture, isToday, isLateFilled, monthName }) => {
                  const style = getGitHubLevelStyle(pts10, isFuture, isLateFilled);

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      disabled={isFuture}
                      onClick={() => !isFuture && openLogModalForDate(dateStr)}
                      onMouseEnter={() => setHoveredDay({ dayNum, dateStr, pts10, points, monthName })}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`group relative h-9 rounded-[7px] border flex flex-col items-center justify-center transition-all ${
                        style.bg
                      } ${style.border} ${
                        isFuture
                          ? 'cursor-not-allowed opacity-60'
                          : 'cursor-pointer hover:scale-110 active:scale-95 hover:shadow-md'
                      } ${isToday ? 'ring-2 ring-[#E07A2B] ring-offset-2 scale-105 shadow-sm' : ''}`}
                    >
                      {/* Day Number inside tile */}
                      <span className={`text-[10px] font-extrabold leading-none ${style.text}`}>
                        {dayNum}
                      </span>

                      {/* Indicator dot for high scores */}
                      {pts10 >= 9 && !isFuture && (
                        <span className="w-1 h-1 rounded-full bg-white/90 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Dynamic Hover/Tap Insight Bar */}
      <div className="mt-3.5 py-1.5 px-3 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center justify-between text-[11px] text-[#59534E]">
        {hoveredDay ? (
          <>
            <span className="font-bold text-[#1B1917]">
              {hoveredDay.dayNum} {hoveredDay.monthName}:
            </span>
            <span className="font-extrabold text-[#216E39]">
              {hoveredDay.pts10}/10 pts ({hoveredDay.points} score)
            </span>
          </>
        ) : (
          <>
            <span className="text-[#786E65] flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#E07A2B]" />
              Tap any tile to inspect or edit Sādhana
            </span>
            <span className="font-bold text-[#216E39]">
              {selectedMonthId === 'oct' ? 'Oct 3: 10/10 pts' : 'Showing verified scores'}
            </span>
          </>
        )}
      </div>

      {/* GitHub-Authentic Intensity Legend */}
      <div className="flex items-center justify-between text-[11px] text-[#786E65] pt-3 border-t border-stone-200/50 mt-3">
        <span className="text-[10px] font-bold text-[#8E867F]">
          Scale: Max 10 pts/day
        </span>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-[#8E867F]">Less</span>
          <span
            className="w-3.5 h-3.5 rounded-[4px] bg-[#EBEDF0] border border-[#D0D7DE]"
            title="0 pts (Not submitted)"
          />
          <span
            className="w-3.5 h-3.5 rounded-[4px] bg-[#9BE9A8] border border-[#7EE08C]"
            title="1–3 pts"
          />
          <span
            className="w-3.5 h-3.5 rounded-[4px] bg-[#40C463] border border-[#36B055]"
            title="4–6 pts"
          />
          <span
            className="w-3.5 h-3.5 rounded-[4px] bg-[#30A14E] border border-[#288E44]"
            title="7–8 pts"
          />
          <span
            className="w-3.5 h-3.5 rounded-[4px] bg-[#216E39] border border-[#1B592E]"
            title="9–10 pts (Darkest Emerald)"
          />
          <span className="text-[10px] font-semibold text-[#8E867F]">More</span>

          {/* Late Filled Blue Indicator */}
          <span className="text-stone-300 ml-1">|</span>
          <span
            className="w-3.5 h-3.5 rounded-[4px] bg-[#2563EB] border border-[#1D4ED8]"
            title="Late Filled Sādhana (Blue)"
          />
          <span className="text-[10px] font-bold text-[#2563EB]">Late Filled (Blue)</span>
        </div>
      </div>
    </div>
  );
}
