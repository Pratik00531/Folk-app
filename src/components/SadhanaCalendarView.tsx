'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Calendar,
  Calendar as CalendarIcon,
  Sun,
  Clock,
  BookOpen,
  Flag,
  Edit3,
  Plus,
  Check,
  Lock,
  Hourglass,
} from 'lucide-react';

import {
  getIndianTodayStr,
  parseDateParts,
  isOlderThan3DaysIST,
  getMonthConfig,
  getMonthStartDayOfWeek,
  DynamicMonthConfig,
} from '@/lib/dateUtils';

export default function SadhanaCalendarView() {
  const {
    currentUser,
    streak,
    sadhanaRecords,
    openLogModalForDate,
    setActiveFolkBoyTab,
    approvalRequests,
    setIsProfileModalOpen,
    todayStr,
  } = useApp();

  // Mobile/device date configuration linked with live Indian Standard Time (IST / Gujarat)
  const todayDateStr = todayStr || getIndianTodayStr();
  const [currentYear, currentMonthIndex, currentDayNum] = parseDateParts(todayDateStr);

  // Month configs for current month and previous month
  const prevMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
  const prevYear = currentMonthIndex === 0 ? currentYear - 1 : currentYear;
  const prevMonthConfig = getMonthConfig(prevYear, prevMonthIndex, todayDateStr);
  const currentMonthConfig = getMonthConfig(currentYear, currentMonthIndex, todayDateStr);

  const [activeMonthKey, setActiveMonthKey] = useState<'prev' | 'current'>('current');
  const activeMonth = activeMonthKey === 'prev' ? prevMonthConfig : currentMonthConfig;

  const [selectedDay, setSelectedDay] = useState<number>(currentDayNum);

  const selectedDateStr = `${activeMonth.prefix}-${String(selectedDay).padStart(2, '0')}`;
  const dayRecord = sadhanaRecords[selectedDateStr] || null;

  // Future check: strictly compared against today's date
  const isSelectedDayFuture = selectedDateStr > todayDateStr;
  const isSelectedDayFilled = Boolean(dayRecord && dayRecord.points_earned > 0);

  // 3-Day Lock Rule calculation
  const isOlderThan3Days = isOlderThan3DaysIST(selectedDateStr, todayDateStr);

  // Check if there is a pending approval request for the selected date
  const pendingApproval = approvalRequests.find(
    (req) => req.record_date === selectedDateStr && req.status === 'pending'
  );

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate start day padding
  const startDayOfWeek = getMonthStartDayOfWeek(activeMonth.year, activeMonth.monthIndex);
  const paddingDays = Array.from({ length: startDayOfWeek });

  return (
    <div className="pb-36 max-w-md mx-auto px-4 pt-3 select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setActiveFolkBoyTab('home')}
          className="w-9 h-9 rounded-full bg-white/80 border border-white flex items-center justify-center text-[#1B1917] shadow-xs cursor-pointer hover:bg-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h1 className="text-lg font-extrabold text-[#1B1917]">
          Sādhana Calendar
        </h1>

        <div
          onClick={() => setIsProfileModalOpen(true)}
          title="Profile & Theme"
          className="relative w-9 h-9 rounded-full overflow-hidden border border-amber-300 shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <img
            src={currentUser.avatar_url || '/assets/images/Chanting.png'}
            alt={currentUser.full_name}
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      {/* 2 Months Navigator Selector (Dynamic IST) */}
      <div className="flex items-center justify-between p-1 bg-stone-100/90 rounded-2xl mb-4 border border-stone-200/60">
        <button
          type="button"
          onClick={() => {
            setActiveMonthKey('prev');
            setSelectedDay(prevMonthConfig.daysCount);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeMonthKey === 'prev'
              ? 'bg-white text-[#1B1917] shadow-xs'
              : 'text-[#786E65] hover:text-[#1B1917]'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>{prevMonthConfig.label}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMonthKey('current');
            setSelectedDay(currentDayNum);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeMonthKey === 'current'
              ? 'bg-white text-[#1B1917] shadow-xs'
              : 'text-[#786E65] hover:text-[#1B1917]'
          }`}
        >
          <span>{currentMonthConfig.label} (Now)</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Streak Header Card */}
      <div className="glass-surface-elevated p-4 rounded-[26px] mb-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#E07A2B] shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#1B1917] leading-tight">
              {streak.current_reporting_streak}{' '}
              <span className="text-xs font-bold text-[#786E65] uppercase tracking-wider">
                Day Streak
              </span>
            </div>
            <div className="text-xs text-[#8C460D] font-semibold mt-0.5">
              Keep going · {streak.next_milestone - streak.current_reporting_streak} days to {streak.next_milestone}-day milestone
            </div>
          </div>
        </div>

        <div className="text-right pl-2 border-l border-stone-200/50">
          <div className="text-[10px] font-semibold text-[#8E867F] uppercase tracking-wider">
            Personal Best
          </div>
          <div className="text-sm font-extrabold text-[#1B1917]">
            {streak.longest_reporting_streak} Days
          </div>
        </div>
      </div>

      {/* Calendar Grid Card */}
      <div className="glass-surface p-4.5 rounded-[28px] mb-4">
        {/* Month Title & 3-Day Lock Rule Pill */}
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-black text-[#1B1917] uppercase tracking-wider">
            {activeMonth.label}
          </span>
          <span className="text-[10px] font-bold text-[#8C460D] bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" />
            3-Day Lock Active
          </span>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#8E867F] mb-3">
          {daysOfWeek.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days Grid
            Rule: "Rather than showing U, show green tick , and put the number in that (3 in green) (3 in red) ...
            Calendar is specifically for showing that this day they have not filled sadhna!!
            Green filled , red not filled simple !!"
        */}
        <div className="grid grid-cols-7 gap-y-3 gap-x-1.5 text-center">
          {/* Empty padding days */}
          {paddingDays.map((_, i) => (
            <div key={`pad-${activeMonth.id}-${i}`} className="h-10 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-300/40" />
            </div>
          ))}

          {/* Days 1 to daysCount */}
          {Array.from({ length: activeMonth.daysCount }, (_, i) => i + 1).map((dayNum) => {
            const dStr = `${activeMonth.prefix}-${String(dayNum).padStart(2, '0')}`;
            const isFuture = dStr > todayDateStr;
            const rec = sadhanaRecords[dStr];
            const isFilled = Boolean(rec && rec.points_earned > 0);
            const isLateFilled = Boolean(rec && rec.points_earned > 0 && rec.is_late_submission);
            const isSelected = selectedDay === dayNum;

            // Check if day is >3 days late (IST)
            const isLocked = isOlderThan3DaysIST(dStr, todayDateStr);

            return (
              <div key={`${activeMonth.id}-${dayNum}`} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setSelectedDay(dayNum)}
                  className={`w-10 h-10 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                    isFuture
                      ? 'bg-[#F5F5F4] border border-[#E7E5E4] text-[#A8A29E] opacity-75 cursor-not-allowed'
                      : isLateFilled
                      ? 'bg-[#DBEAFE] border-2 border-[#2563EB] text-[#1D4ED8] shadow-2xs'
                      : isFilled
                      ? 'bg-[#DCFCE7] border-2 border-[#16A34A] text-[#15803D] shadow-2xs'
                      : 'bg-[#FEE2E2] border-2 border-[#EF4444] text-[#DC2626] shadow-2xs'
                  } ${
                    isSelected
                      ? 'ring-3 ring-[#1B1917] ring-offset-2 scale-110 shadow-md font-bold z-10'
                      : 'hover:scale-105 active:scale-95'
                  }`}
                >
                  {isFuture ? (
                    // Future date
                    <span className="text-xs font-semibold text-[#A8A29E]">{dayNum}</span>
                  ) : isLateFilled ? (
                    // Late Filled: Blue Number + Blue Tick!
                    <div className="flex flex-col items-center justify-center -space-y-0.5">
                      <span className="text-[11px] font-black text-[#1D4ED8] leading-none">
                        {dayNum}
                      </span>
                      <Check className="w-3.5 h-3.5 text-[#2563EB] stroke-[3]" />
                    </div>
                  ) : isFilled ? (
                    // Green filled: Green number + Green tick
                    <div className="flex flex-col items-center justify-center -space-y-0.5">
                      <span className="text-[11px] font-black text-[#15803D] leading-none">
                        {dayNum}
                      </span>
                      <Check className="w-3.5 h-3.5 text-[#15803D] stroke-[3]" />
                    </div>
                  ) : (
                    // Red not filled: Red number + lock icon if >3 days
                    <div className="flex flex-col items-center justify-center -space-y-0.5">
                      <span className="text-xs font-black text-[#DC2626] leading-none">
                        {dayNum}
                      </span>
                      {isLocked && <Lock className="w-2.5 h-2.5 text-[#DC2626]/80" />}
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-around text-[10px] text-[#786E65]">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-[#DCFCE7] border-2 border-[#16A34A] flex items-center justify-center text-[#15803D]">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
            <span className="font-bold text-[#15803D]">Filled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-[#DBEAFE] border-2 border-[#2563EB] flex items-center justify-center text-[#2563EB]">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
            <span className="font-bold text-[#2563EB]">Late Filled (Blue)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-[#FEE2E2] border-2 border-[#EF4444] flex items-center justify-center text-[#DC2626] font-bold text-[9px]">
              ✕
            </span>
            <span className="font-bold text-[#DC2626]">Not Filled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-stone-100 border border-stone-300" />
            <span className="text-stone-400">Future</span>
          </div>
        </div>
      </div>

      {/* Selected Day Sādhana Breakdown Card */}
      <div className="glass-surface-elevated p-4.5 rounded-[26px] mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-stone-200/60">
          <div>
            <div className="text-xs text-[#786E65] font-semibold">
              Selected Day Details
            </div>
            <div className="text-base font-extrabold text-[#1B1917] flex items-center gap-2">
              <span>{selectedDay} {activeMonth.label}</span>
              {isOlderThan3Days && !isSelectedDayFuture && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-[#9C4507] text-[10px] font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  &gt;3 Days Late
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            {isSelectedDayFilled ? (
              <span
                className={`inline-block px-3 py-1 rounded-full font-extrabold text-xs ${
                  dayRecord.is_late_submission
                    ? 'bg-[#DBEAFE] text-[#1D4ED8] border border-blue-200'
                    : 'bg-[#DCFCE7] text-[#15803D]'
                }`}
              >
                {dayRecord.points_earned}/100 pts {dayRecord.is_late_submission ? '• Late Filled 🔵' : ''}
              </span>
            ) : isSelectedDayFuture ? (
              <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-400 font-bold text-xs">
                Upcoming
              </span>
            ) : pendingApproval ? (
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-[#9C4507] font-bold text-xs flex items-center gap-1">
                <Hourglass className="w-3 h-3 animate-spin" />
                Pending Lead
              </span>
            ) : (
              <span className="inline-block px-3 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] font-extrabold text-xs">
                0/100 pts
              </span>
            )}
          </div>
        </div>

        {/* Pending Approval Notice if requested */}
        {pendingApproval && (
          <div className="p-3 mb-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-[#9C4507] flex items-center gap-2.5">
            <Hourglass className="w-4 h-4 text-[#E07A2B] shrink-0" />
            <div>
              <span className="font-bold">Approval Request Pending:</span> Submitted to Folk Lead (Madhav Das). Once reviewed, points will be credited immediately.
            </div>
          </div>
        )}

        {/* Selected Day Pillars List */}
        {isSelectedDayFilled ? (
          <div className="space-y-2 mb-4">
            {dayRecord.mangala_arati_time && (
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2 text-[#1B1917] font-semibold">
                  <Sun className="w-4 h-4 text-[#E07A2B]" />
                  <span>Maṅgala Ārati</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#6E665E]">{dayRecord.mangala_arati_time}</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    20 pts
                  </span>
                </div>
              </div>
            )}

            {dayRecord.japa_rounds > 0 && (
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2 text-[#1B1917] font-semibold">
                  <Clock className="w-4 h-4 text-[#E07A2B]" />
                  <span>Japa ({dayRecord.japa_rounds} rounds)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#6E665E]">
                    {dayRecord.japa_start_time} → {dayRecord.japa_finish_time || '06:45 AM'}
                  </span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    40 pts
                  </span>
                </div>
              </div>
            )}

            {dayRecord.srimad_bhagavatam_time && (
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2 text-[#1B1917] font-semibold">
                  <BookOpen className="w-4 h-4 text-[#E07A2B]" />
                  <span>Śrīmad Bhāgavatam</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#6E665E]">{dayRecord.srimad_bhagavatam_time}</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    20 pts
                  </span>
                </div>
              </div>
            )}

            {dayRecord.japa_finish_slot_time && (
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2 text-[#1B1917] font-semibold">
                  <Flag className="w-4 h-4 text-[#E07A2B]" />
                  <span>JF (Japa Finish)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#6E665E]">{dayRecord.japa_finish_slot_time}</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    10 pts
                  </span>
                </div>
              </div>
            )}

            {dayRecord.book_reading_minutes > 0 && (
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2 text-[#1B1917] font-semibold">
                  <BookOpen className="w-4 h-4 text-[#E07A2B]" />
                  <span>Book Reading</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#6E665E]">
                    {dayRecord.book_reading_minutes} min
                  </span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    10 pts
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-[#DC2626] bg-red-50/60 rounded-2xl border border-red-100 mb-4 font-semibold">
            {isSelectedDayFuture
              ? 'Future date. You cannot submit Sādhana ahead of time.'
              : isOlderThan3Days
              ? 'No Sādhana recorded. Date is locked (>3 days late) and requires Folk Lead approval.'
              : 'No Sādhana was reported on this day.'}
          </div>
        )}

        {/* Action Button: Disabled for future dates, active for past/today */}
        {isSelectedDayFuture ? (
          <button
            type="button"
            disabled
            className="w-full h-12 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Lock className="w-4 h-4" />
            <span>Cannot Fill Sādhana Ahead of Time</span>
          </button>
        ) : isOlderThan3Days ? (
          /* Locked State for dates older than 3 days: Request Folk Lead Approval */
          <button
            type="button"
            onClick={() => openLogModalForDate(selectedDateStr)}
            className="w-full h-12 rounded-2xl bg-[#1B1917] hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-[0.99] transition-all"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>
              {pendingApproval
                ? 'Review Approval Request (>3 Days Late)'
                : isSelectedDayFilled
                ? `Edit Late Sādhana (${selectedDay} ${activeMonth.label})`
                : `Request Folk Lead Approval (${selectedDay} ${activeMonth.label})`}
            </span>
          </button>
        ) : (
          /* Normal State within 3 days: Direct Fill / Edit */
          <button
            type="button"
            onClick={() => openLogModalForDate(selectedDateStr)}
            className="w-full h-12 rounded-2xl saffron-gradient-btn text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99] transition-all"
          >
            {isSelectedDayFilled ? (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Edit Sādhana for {selectedDay} {activeMonth.label}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Fill Sādhana for {selectedDay} {activeMonth.label}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Floating Bottom Navigation Dock: STRICTLY 3 ITEMS (Home, Calendar, Books)
          "Alignments of Taskbar (remove that AI type thing only 3 things there ,home , calendar , books)" */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass-surface-elevated py-2.5 px-3 rounded-full grid grid-cols-3 items-center shadow-2xl border border-white/90 z-40">
        <button
          type="button"
          onClick={() => setActiveFolkBoyTab('home')}
          className="flex flex-col items-center justify-center gap-1 text-[#786E65] hover:text-[#1B1917] font-semibold cursor-pointer"
        >
          <div className="p-1 rounded-xl hover:bg-stone-100">
            <Sun className="w-5 h-5" />
          </div>
          <span className="text-[11px]">Home</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFolkBoyTab('calendar')}
          className="flex flex-col items-center justify-center gap-1 text-[#E07A2B] font-bold cursor-pointer"
        >
          <div className="p-1 rounded-xl bg-amber-500/10">
            <Calendar className="w-5 h-5 text-[#E07A2B]" />
          </div>
          <span className="text-[11px] font-black">Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFolkBoyTab('books')}
          className="flex flex-col items-center justify-center gap-1 text-[#786E65] hover:text-[#1B1917] font-semibold cursor-pointer"
        >
          <div className="p-1 rounded-xl hover:bg-stone-100">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[11px]">Books</span>
        </button>
      </nav>
    </div>
  );
}
