'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Flame,
  Check,
  Clock,
  BookOpen,
  Sun,
  ShieldCheck,
  ChevronRight,
  Bell,
  Calendar,
  Bookmark,
  Flag,
  Sparkles,
  Edit3,
  FileSpreadsheet,
  TrendingUp,
  User,
  CheckCircle2,
  X,
} from 'lucide-react';
import SadhanaHeatmap from '@/components/SadhanaHeatmap';
import ComparisonAnalyticsView from '@/components/ComparisonAnalyticsView';
import SadhanaReportExportModal from '@/components/SadhanaReportExportModal';
import { formatIndianDateShort, formatIndianDateLong, isSundayDate } from '@/lib/dateUtils';

export default function FolkBoyHomeView() {
  const {
    currentUser,
    streak,
    todaySadhanaSubmitted,
    todayRecord,
    todayStr,
    reminder,
    dismissReminder,
    openLogModal,
    readingState,
    setActiveFolkBoyTab,
    setIsProfileModalOpen,
    isExportModalOpen,
    setIsExportModalOpen,
    approvalRequests,
    approveSadhanaRequest,
    rejectSadhanaRequest,
  } = useApp();

  const [showComparison, setShowComparison] = useState(false);
  const [showLeadApprovalsModal, setShowLeadApprovalsModal] = useState(false);
  const [leadToast, setLeadToast] = useState<string | null>(null);

  const isLead = currentUser.role === 'folk_lead';
  const pendingApprovals = approvalRequests.filter((r) => r.status === 'pending');

  // Dynamic day and date formatting (e.g. 5 Oct, Mon)
  const todayDateFormatted = formatIndianDateShort(todayStr);

  // Check if today is Sunday (IST)
  const isSunday = isSundayDate(todayStr);

  // Calculate completion percentage and count (5 pillars on weekdays, 6 on Sunday)
  let completedCount = 0;
  const totalPillars = isSunday ? 6 : 5;
  if (todayRecord) {
    if (todayRecord.mangala_arati_time) completedCount++;
    if (todayRecord.japa_start_time) completedCount++;
    if (isSunday && todayRecord.darshan_arati_time) completedCount++;
    if (todayRecord.srimad_bhagavatam_time) completedCount++;
    if (todayRecord.japa_finish_slot_time) completedCount++;
    if (todayRecord.book_reading_minutes > 0) completedCount++;
  }
  const completionPercentage = Math.round((completedCount / totalPillars) * 100);

  return (
    <div className="relative min-h-screen pb-36 max-w-md mx-auto px-4 pt-3 select-none">
      {/* Background Ambient Soft Lighting */}
      <div className="fixed top-0 right-0 w-80 h-80 bg-[#E07A2B]/8 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-0 w-72 h-72 bg-[#E5A93C]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Bar / Profile Header */}
      <header className="flex items-center justify-between mb-3.5 pt-1">
        <div className="flex items-center gap-3">
          {/* Avatar with gold border - Tap to edit Profile & Theme */}
          <div
            onClick={() => setIsProfileModalOpen(true)}
            title="Edit Profile & Theme"
            className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-[#E07A2B] to-[#E5A93C] shadow-xs shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            <div className="w-full h-full rounded-full bg-[#FAF8F5] overflow-hidden flex items-center justify-center">
              <img
                src={currentUser.avatar_url || '/assets/images/Chanting.png'}
                alt={currentUser.full_name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div>
            <span className="text-[11px] font-medium text-[#786E65] block">
              Hare Krishna
            </span>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-extrabold text-[#1B1917] leading-tight">
                {currentUser.full_name.split(' ')[0]}
              </h2>
              <span className="text-xs text-[#E07A2B]">🙏</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                  currentUser.role === 'folk_lead'
                    ? 'bg-amber-100 text-[#9C4507] border border-amber-300/60'
                    : 'bg-white/80 text-[#786E65] border border-stone-200/60'
                }`}
              >
                {currentUser.role === 'folk_lead' ? 'Folk Lead' : 'Folk Boy'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Calendar & Daily Points Badge */}
        <button
          onClick={() => setActiveFolkBoyTab('calendar')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-stone-200/60 shadow-2xs hover:bg-white active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Calendar className="w-3.5 h-3.5 text-[#E07A2B]" />
          <span className="text-xs font-bold text-[#1B1917]">
            {todayRecord ? `${todayRecord.points_earned}/100 pts` : todayDateFormatted}
          </span>
          <ChevronRight className="w-3 h-3 text-[#8E867F]" />
        </button>
      </header>



      {/* FOLK LEAD ACTION HUB (Export Reports & Late Sadhana Approvals) */}
      {/* "folk Lead will also have same view like this folk boy, but this request and export things will also go to him ... (that's the onlly thing)" */}
      {isLead && (
        <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-300/80 dark:border-stone-700/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#9C4507] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E07A2B]" />
              Folk Lead Controls
            </span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
              Lead Privileges Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Approvals Button */}
            <button
              type="button"
              onClick={() => setShowLeadApprovalsModal(true)}
              className="py-2 px-3 rounded-xl bg-white border border-amber-300 text-xs font-bold text-[#1B1917] flex items-center justify-between shadow-2xs hover:bg-amber-50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#E07A2B]" />
                <span>Approvals</span>
              </div>
              {pendingApprovals.length > 0 ? (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                  {pendingApprovals.length}
                </span>
              ) : (
                <span className="text-[10px] text-stone-400">0</span>
              )}
            </button>

            {/* Export Reports Button */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="py-2 px-3 rounded-xl bg-[#216E39] hover:bg-[#1B592E] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Reports</span>
            </button>
          </div>
        </div>
      )}

      {/* Lead Notification Toast */}
      {leadToast && (
        <div className="p-3 mb-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{leadToast}</span>
        </div>
      )}

      {/* Dynamic Personalized Reminder Banner (Only shown if pending & not dismissed) */}
      {!todaySadhanaSubmitted && reminder && (
        <div className="glass-surface-elevated p-3.5 rounded-[22px] mb-3.5 border border-amber-200/70 dark:border-stone-700 bg-gradient-to-r from-amber-50/90 to-orange-50/70 dark:from-[#26201B] dark:to-[#1E1916] relative transition-all">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E07A2B] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9C4507]">
                  {reminder.sender_name}
                </span>
                <button
                  onClick={dismissReminder}
                  className="text-[10px] text-[#8E867F] hover:text-[#1B1917] cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-xs text-[#2C2825] mt-0.5 font-medium leading-relaxed">
                &quot;Today&apos;s Sādhana is waiting. Please take 2 minutes to submit your reflection.&quot;
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={openLogModal}
                  className="px-3 py-1 rounded-xl bg-[#E07A2B] text-white text-xs font-semibold shadow-xs hover:bg-[#C86315] active:scale-95 transition-all cursor-pointer"
                >
                  Log Sādhana
                </button>
                <span className="text-[10px] text-[#786E65]">1–2 mins</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. REPORTING STREAK CARD with Duolingo-style burning flame */}
      {/* "And this Streak , it should not be like current as we are clicking and gets updates ... It should start from 0 , and animation should change the number" */}
      <section className="mb-4">
        <div className="glass-surface-elevated p-4 rounded-[26px] relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3.5">
              {/* Flame Icon with subtle glow */}
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#E07A2B] shrink-0 group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6 animate-pulse text-[#E07A2B] drop-shadow-[0_0_8px_rgba(224,122,43,0.5)]" />
              </div>
              <div>
                <div className="text-2xl font-black text-[#1B1917] leading-tight flex items-center gap-1.5">
                  <span>{streak.current_reporting_streak}</span>
                  <span className="text-xs font-bold text-[#786E65] uppercase tracking-wider">
                    Day Streak
                  </span>
                </div>
                <div className="text-xs text-[#8C460D] font-semibold mt-0.5">
                  {streak.next_milestone - streak.current_reporting_streak} days to {streak.next_milestone}-day milestone
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

          {/* Progress bar towards next milestone */}
          <div className="w-full h-1.5 bg-stone-200/60 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#E5A93C] to-[#E07A2B] rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  (streak.current_reporting_streak / streak.next_milestone) * 100
                )}%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* 2. HERO SĀDHANA ACTION CARD
          "For Filling sadhna it should be shown on Home page only as fill today's sadhna if remaining !!" */}
      <section className="mb-4">
        {!todaySadhanaSubmitted ? (
          /* UNFILLED STATE: Prominent "Fill Today's Sādhana" Hero Button */
          <div className="glass-surface-elevated p-5 rounded-[28px] relative overflow-hidden shadow-lg border-2 border-amber-300/80 dark:border-amber-700/60 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/70 dark:from-[#26201B] dark:via-[#1E1916] dark:to-[#171412]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-[#9C4507] text-[10px] font-extrabold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3 text-[#E07A2B]" />
                  Remaining For Today
                </span>
                <h1 className="text-xl font-extrabold text-[#1B1917]">
                  Today&apos;s Sādhana
                </h1>
                <p className="text-xs text-[#786E65] mt-0.5">
                  {formatIndianDateLong(todayStr)} · Keep your streak burning!
                </p>
              </div>

              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#E07A2B]">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <p className="text-xs text-[#59534E] leading-relaxed mb-4">
              You haven&apos;t recorded today&apos;s Sādhana yet. Please take 2 minutes to submit your Maṅgala, Japa, and Reading.
            </p>

            <button
              type="button"
              onClick={openLogModal}
              className="w-full h-13 rounded-2xl saffron-gradient-btn font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
            >
              <Flame className="w-5 h-5 text-amber-200" />
              <span>Fill Today&apos;s Sādhana</span>
              <span className="text-xs opacity-90">→</span>
            </button>
          </div>
        ) : (
          /* COMPLETED STATE: Summary of Today's Completed Sādhana with Edit Action */
          <div className="glass-surface-elevated p-5 rounded-[28px] relative overflow-hidden shadow-md">
            {/* Header with Circular Completion Gauge */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200/50">
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  Today Completed
                </div>
                <h1 className="text-xl font-extrabold text-[#1B1917]">
                  Today&apos;s Sādhana
                </h1>
                <p className="text-xs text-[#786E65] font-semibold mt-0.5">
                  {completedCount} of {totalPillars} completed · {todayRecord?.points_earned || 100}/100 pts
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#786E65]">
                  {todayDateFormatted}
                </span>

                {/* Circular Progress Gauge */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-stone-200/80"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#2E7D32]"
                      strokeDasharray={`${completionPercentage}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-black text-[#1B1917]">
                    {completionPercentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Activities List */}
            <div className="space-y-3">
              {/* 1. Mangala Arati */}
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200/50 flex items-center justify-center text-[#E07A2B] shrink-0">
                    <Sun className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-[#1B1917]">Maṅgala Ārati</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#6E665E] font-medium">
                    {todayRecord?.mangala_arati_time || '5:03 AM'}
                  </span>
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                </div>
              </div>

              {/* 2. Japa (16 rounds) */}
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-200/50 flex items-center justify-center text-[#E07A2B] shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-[#1B1917]">Japa (16 rounds)</div>
                    <div className="text-[10px] text-[#786E65]">
                      {todayRecord?.japa_start_time
                        ? `${todayRecord.japa_duration_minutes || 92}m · ${todayRecord.japa_start_time} → ${todayRecord.japa_finish_time}`
                        : '1h 32m · 05:15 → 06:47'}
                    </div>
                  </div>
                </div>
                <div>
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                </div>
              </div>

              {/* 3. Darshan Arati (Sundays only) */}
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-50 border border-yellow-200/50 flex items-center justify-center text-[#E5A93C] shrink-0">
                    <Sun className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-[#1B1917]">Darshan Ārati</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#8E867F] font-medium">{isSunday ? 'Attended' : 'Sunday only'}</span>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                    isSunday && todayRecord?.darshan_arati_time
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-200 text-[#786E65]'
                  }`}>
                    {isSunday && todayRecord?.darshan_arati_time ? <Check className="w-3 h-3 stroke-[3]" /> : '—'}
                  </span>
                </div>
              </div>

              {/* 4. Srimad Bhagavatam */}
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200/50 flex items-center justify-center text-[#E07A2B] shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-[#1B1917]">Śrīmad Bhāgavatam</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#6E665E] font-medium">
                    {todayRecord?.srimad_bhagavatam_time || '7:31 AM'}
                  </span>
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                </div>
              </div>

              {/* 5. JF (Japa Finish) */}
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-200/50 flex items-center justify-center text-[#E07A2B] shrink-0">
                    <Flag className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-[#1B1917]">JF (Japa Finish)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#6E665E] font-medium">
                    {todayRecord?.japa_finish_slot_time || '6:45 AM'}
                  </span>
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                </div>
              </div>

              {/* 6. Book Reading */}
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200/50 flex items-center justify-center text-[#E07A2B] shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-[#1B1917]">Book Reading</div>
                    <div className="text-[10px] text-[#786E65]">
                      {todayRecord?.book_reading_minutes || 30} min · {readingState.current_book_title.split(' ')[0]} {readingState.current_book_title.split(' ')[1]}
                    </div>
                  </div>
                </div>
                <div>
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Action: Edit Sādhana & View Calendar */}
            <div className="mt-5 pt-3 border-t border-stone-200/50 flex gap-2">
              <button
                type="button"
                onClick={() => setActiveFolkBoyTab('calendar')}
                className="flex-1 h-11 rounded-2xl bg-white/90 hover:bg-white border border-stone-200/70 text-xs font-bold text-[#1B1917] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
              >
                <Calendar className="w-4 h-4 text-[#E07A2B]" />
                <span>Calendar →</span>
              </button>

              <button
                type="button"
                onClick={openLogModal}
                className="px-4 h-11 rounded-2xl saffron-gradient-btn text-xs font-bold text-white flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Today</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3. HEAT MAP COMPONENT (Strictly "Heat map", with 3-month support) */}
      <section className="mb-4">
        <SadhanaHeatmap />
      </section>

      {/* 4. MONTH-OVER-MONTH & WEEK-OVER-WEEK PROGRESS COMPARISON */}
      {/* "A comparision view from the last month , that last month was this much and this month it is this month (progress and all) !!" */}
      <section className="mb-4">
        <div className="glass-surface p-4 rounded-[26px] border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#216E39]">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-[#1B1917] uppercase tracking-wider">
                  Month-over-Month Comparison
                </h3>
                <span className="text-[11px] text-[#786E65]">
                  October vs September · Japa, Maṅgala & Reading
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowComparison(!showComparison)}
              className="px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#E07A2B] text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-all"
            >
              <span>{showComparison ? 'Hide' : 'View'}</span>
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showComparison ? 'rotate-90' : ''
                }`}
              />
            </button>
          </div>

          {showComparison && (
            <div className="pt-3 mt-3 border-t border-stone-200/60 animate-fadeIn">
              <ComparisonAnalyticsView isSelfView={true} />
            </div>
          )}
        </div>
      </section>

      {/* 5. CURRENT READING BOOK SUMMARY WIDGET */}
      <section className="glass-surface p-4 rounded-[24px] mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#E07A2B]">
            <Bookmark className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#8C460D] uppercase tracking-wider">
              Current Book · Level {readingState.current_book_level}
            </div>
            <div className="text-xs font-extrabold text-[#1B1917] truncate max-w-[180px]">
              {readingState.current_book_title}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveFolkBoyTab('books')}
          className="text-xs font-bold text-[#E07A2B] hover:underline cursor-pointer"
        >
          View Books →
        </button>
      </section>

      {/* LEAD APPROVALS QUEUE MODAL (Available to Folk Lead) */}
      {showLeadApprovalsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-md max-h-[85vh] flex flex-col rounded-[30px] bg-white text-[#1B1917] shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-amber-50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#E07A2B]" />
                <h3 className="text-sm font-extrabold text-[#1B1917]">
                  Folk Lead Approvals Inbox ({pendingApprovals.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLeadApprovalsModal(false)}
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8 text-[#786E65]">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  <p className="text-xs font-bold">All late Sādhana requests are reviewed!</p>
                </div>
              ) : (
                pendingApprovals.map((req) => (
                  <div key={req.id} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-extrabold text-[#1B1917] block">
                          {req.user_name} ({req.folk_id})
                        </span>
                        <span className="text-[11px] font-bold text-[#2563EB]">
                          Date: {req.record_date} (&gt;3 days late)
                        </span>
                      </div>
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                        Pending
                      </span>
                    </div>

                    <p className="text-[11px] text-[#59534E] bg-white p-2 rounded-xl border border-stone-200/60">
                      <strong>Reason:</strong> &quot;{req.reason}&quot;
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          approveSadhanaRequest(req.id, `${currentUser.full_name} (Lead)`);
                          setLeadToast(`Approved late Sādhana for ${req.user_name}! Tagged in Blue.`);
                          setTimeout(() => setLeadToast(null), 3500);
                        }}
                        className="flex-1 py-1.5 rounded-xl bg-[#216E39] hover:bg-[#1B592E] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve (Blue Tag)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          rejectSadhanaRequest(req.id, `${currentUser.full_name} (Lead)`);
                          setLeadToast(`Rejected request for ${req.user_name}.`);
                          setTimeout(() => setLeadToast(null), 3500);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SĀDHANA REPORT EXPORT MODAL */}
      <SadhanaReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Floating Bottom Navigation Dock: STRICTLY 3 THINGS (Home, Calendar, Books)
          "Alignments of Taskbar (remove that AI type thing only 3 things there ,home , calendar , books)" */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass-surface-elevated py-2.5 px-3 rounded-full grid grid-cols-3 items-center shadow-2xl border border-white/90 z-40">
        <button
          type="button"
          onClick={() => setActiveFolkBoyTab('home')}
          className="flex flex-col items-center justify-center gap-1 text-[#E07A2B] font-bold cursor-pointer"
        >
          <div className="p-1 rounded-xl bg-amber-500/10">
            <Sun className="w-5 h-5 text-[#E07A2B]" />
          </div>
          <span className="text-[11px] font-black">Home</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFolkBoyTab('calendar')}
          className="flex flex-col items-center justify-center gap-1 text-[#786E65] hover:text-[#1B1917] font-semibold cursor-pointer"
        >
          <div className="p-1 rounded-xl hover:bg-stone-100">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[11px]">Calendar</span>
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
