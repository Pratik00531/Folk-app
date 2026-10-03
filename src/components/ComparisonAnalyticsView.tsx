'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { GuideDevoteeOverview, folkBookCatalogue, getBookCoverUrl } from '@/lib/mockData';
import {
  TrendingUp,
  TrendingDown,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  Calendar,
  Sparkles,
  Sun,
  Shield,
  Send,
  MessageCircle,
  ChevronRight,
  User,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface ComparisonAnalyticsViewProps {
  devotee?: GuideDevoteeOverview;
  isSelfView?: boolean;
}

export default function ComparisonAnalyticsView({ devotee, isSelfView = false }: ComparisonAnalyticsViewProps) {
  const { currentUser, guideDevotees, sadhanaRecords, readingState } = useApp();

  // If no devotee provided, default to current user representation
  const targetDevotee: GuideDevoteeOverview = devotee || {
    id: currentUser.id,
    name: currentUser.full_name,
    folk_id: currentUser.folk_id,
    role: currentUser.role === 'folk_lead' ? 'folk_lead' : 'folk_boy',
    avatar_url: currentUser.avatar_url || '/assets/images/Chanting.png',
    submitted: true,
    points_today: 92,
    streak: 13,
    last_points: 92,
    last_submitted_date: 'Today, 06:45 AM',
    last_sadhana_label: "Today's Sādhana",
    pillars: {
      mangala: true,
      japa: true,
      darshan: true,
      bhagavatam: true,
      jf: true,
      reading: true,
    },
    pillar_dots: {
      mangala: 'green',
      japa: 'green',
      darshan: 'grey',
      bhagavatam: 'green',
      jf: 'green',
      reading: 'green',
    },
    japa_rounds: 16,
    japa_arrival: '05:08 AM',
    japa_leaving: '06:42 AM',
    mangala_time: '05:03 AM',
    bhagavatam_time: '07:31 AM',
    jf_time: '06:42 AM',
    reading_mins: 45,
    current_book: readingState.current_book_title || 'Bhagavad-gītā As It Is',
    current_book_level: readingState.current_book_level || 1,
    total_reading_hours: 14.5,
  };

  // Find book cover from catalogue
  const activeBook = folkBookCatalogue.find(
    (b) => b.title.toLowerCase() === targetDevotee.current_book.toLowerCase()
  ) || folkBookCatalogue[0];

  // Realistic Month-over-Month Data (October 2026 vs September 2026)
  const momData = {
    points: {
      lastMonth: 81,
      thisMonth: 93,
      delta: '+12 pts',
      improved: true,
    },
    mangala: {
      lastMonth: 78,
      thisMonth: 95,
      delta: '+17%',
      improved: true,
    },
    hearing: {
      lastMonth: 18.5,
      thisMonth: 26.5,
      delta: '+8.0 hrs (Śrīmad Bhāgavatam)',
      improved: true,
      dailyMinutes: '52 mins/day avg',
    },
    bhagavatam: {
      lastMonth: 74,
      thisMonth: 92,
      delta: '+18%',
      improved: true,
    },
    darshan: {
      lastMonth: 80,
      thisMonth: 100,
      delta: '+20%',
      improved: true,
    },
    readingHours: {
      lastMonth: 9.8,
      thisMonth: 15.4,
      delta: '+5.6 hrs',
      improved: true,
    },
  };

  // Realistic Week-over-Week Data (This Week vs Last Week)
  const wowData = {
    weeklyPoints: {
      lastWeek: 85,
      thisWeek: 94,
      delta: '+9 pts',
      improved: true,
    },
    mangalaOnTime: {
      lastWeek: '5 / 7 days',
      thisWeek: '7 / 7 days',
      delta: '100% on-time',
      improved: true,
    },
    hearingWeek: {
      lastWeek: '210 mins (3.5 hrs)',
      thisWeek: '345 mins (5.75 hrs)',
      delta: '+135 mins hearing (SB)',
      improved: true,
    },
    readingMinutes: {
      lastWeek: 165,
      thisWeek: 260,
      delta: '+95 mins',
      improved: true,
    },
  };

  const [mentorNote, setMentorNote] = useState('');
  const [noteSent, setNoteSent] = useState(false);

  const handleSendEncouragement = () => {
    if (!mentorNote.trim()) return;
    setNoteSent(true);
    setTimeout(() => {
      setNoteSent(false);
      setMentorNote('');
    }, 3000);
  };

  return (
    <div className="space-y-4 text-[#1B1917]">
      {/* Devotee Overview Card */}
      <div className="glass-surface-elevated p-4 rounded-[26px] shadow-xs border border-stone-200/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative w-13 h-13 rounded-full p-0.5 bg-gradient-to-tr from-[#E07A2B] to-[#E5A93C] shadow-xs shrink-0">
              <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                <img
                  src={targetDevotee.avatar_url || '/assets/images/Chanting.png'}
                  alt={targetDevotee.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#1B1917] leading-tight">
                  {targetDevotee.name}
                </h3>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    targetDevotee.role === 'folk_lead'
                      ? 'bg-amber-100 text-[#9C4507] border border-amber-300'
                      : 'bg-white text-[#786E65] border border-stone-200'
                  }`}
                >
                  {targetDevotee.role === 'folk_lead' ? 'Folk Lead' : 'Folk Boy'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 mt-1 text-[11px] text-[#786E65]">
                <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                  {targetDevotee.folk_id}
                </span>
                <span className="flex items-center gap-1 text-[#E07A2B] font-bold">
                  <Flame className="w-3.5 h-3.5 text-[#E07A2B]" />
                  {targetDevotee.streak}d Streak
                </span>
                <span className="text-emerald-700 font-bold">
                  {targetDevotee.submitted ? 'Submitted Today' : 'Pending Today'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#786E65] block">
              Oct Sādhana Avg
            </span>
            <span className="text-xl font-black text-[#15803D]">
              {momData.points.thisMonth}/100
            </span>
          </div>
        </div>
      </div>

      {/* 1. CURRENT BOOK READING SPOTLIGHT */}
      {/* "Which book he is reading , managla arti coming or not , japa (everything)" */}
      <div className="glass-surface p-4 rounded-[26px] border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-200/60">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#E07A2B]" />
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1B1917]">
              Current Book Reading
            </h4>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-[#9C4507]">
            Level {activeBook?.level || 1}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Book Cover Image */}
          <div className="relative w-16 h-22 rounded-xl overflow-hidden shadow-md border border-stone-200 shrink-0 bg-stone-100">
            <img
              src={getBookCoverUrl(targetDevotee.current_book)}
              alt={targetDevotee.current_book}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-1.5">
            <h5 className="text-sm font-extrabold text-[#1B1917] leading-tight">
              {targetDevotee.current_book}
            </h5>
            <p className="text-[11px] text-[#786E65]">
              Author: His Divine Grace A.C. Bhaktivedanta Swami Prabhupada
            </p>

            {/* Reading Progress */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                <span className="text-[#8C460D]">Reading Progress</span>
                <span className="text-[#1B1917]">{targetDevotee.total_reading_hours} hrs logged</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-[#E07A2B] rounded-full"
                  style={{ width: '68%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PILLAR DETAILS (Maṅgala, Japa, SB, Darshan) */}
      <div className="glass-surface p-4 rounded-[26px] border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-200/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#216E39]" />
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1B1917]">
              Daily Pillars Status
            </h4>
          </div>
          <span className="text-[10px] font-bold text-[#786E65]">
            Last Recorded: {targetDevotee.last_submitted_date}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-stone-200/70">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#786E65] uppercase">
                Maṅgala Ārati
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="font-extrabold text-[#1B1917] mt-0.5">
              {targetDevotee.mangala_time || '05:03 AM'}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">
              On-time (Full 20 pts)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-[#24201E] border border-stone-200/70 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#786E65] dark:text-[#A8A29E] uppercase">
                Hearing (Śrīmad Bhāgavatam)
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="font-extrabold text-[#1B1917] dark:text-[#F5F5F4] mt-0.5">
              55 Mins
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
              Daily SB Class Heard (20 pts)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-stone-200/70">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#786E65] uppercase">
                Śrīmad Bhāgavatam
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="font-extrabold text-[#1B1917] mt-0.5">
              {targetDevotee.bhagavatam_time || '07:31 AM'}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">
              Class Attended (20 pts)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-stone-200/70">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#786E65] uppercase">
                Sunday Darshan
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            </div>
            <div className="font-extrabold text-[#1B1917] mt-0.5">
              Sunday Only
            </div>
            <span className="text-[10px] text-stone-500 font-semibold">
              100% on Sundays
            </span>
          </div>
        </div>
      </div>

      {/* 3. MONTH-OVER-MONTH COMPARISON (October vs September) */}
      {/* "A comparision view from the last month , that last month was this much and this month it is this month (progress and all) !!" */}
      <div className="glass-surface p-4.5 rounded-[28px] border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#15803D]" />
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1B1917]">
              Month-over-Month Progress (Oct vs Sep)
            </h4>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-[#15803D] flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            Strong Growth
          </span>
        </div>

        {/* Comparison Grid */}
        <div className="space-y-2.5 text-xs">
          {/* Average Sādhana Points */}
          <div className="p-3 rounded-2xl bg-white border border-stone-200/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-[#1B1917]">Average Sādhana Points</span>
              <span className="text-xs font-black text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {momData.points.delta} ↗
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#786E65]">
              <span>Sep 2026: <strong className="text-[#1B1917]">{momData.points.lastMonth} pts</strong></span>
              <span>Oct 2026: <strong className="text-[#15803D]">{momData.points.thisMonth} pts</strong></span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-stone-100 mt-2 overflow-hidden flex">
              <div className="h-full bg-stone-300" style={{ width: `${momData.points.lastMonth}%` }} />
              <div className="h-full bg-[#15803D]" style={{ width: `${momData.points.thisMonth - momData.points.lastMonth}%` }} />
            </div>
          </div>

          {/* Maṅgala Ārati Attendance */}
          <div className="p-3 rounded-2xl bg-white border border-stone-200/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-[#1B1917]">Maṅgala Ārati On-Time</span>
              <span className="text-xs font-black text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {momData.mangala.delta} ↗
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#786E65]">
              <span>Sep: <strong className="text-[#1B1917]">{momData.mangala.lastMonth}%</strong></span>
              <span>Oct: <strong className="text-[#15803D]">{momData.mangala.thisMonth}%</strong></span>
            </div>
          </div>

          {/* Śrīmad Bhāgavatam Hearing Hours */}
          <div className="p-3 rounded-2xl bg-white dark:bg-[#24201E] border border-stone-200/70 dark:border-stone-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-[#1B1917] dark:text-[#F5F5F4]">Śrīmad Bhāgavatam Hearing</span>
              <span className="text-xs font-black text-[#15803D] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                {momData.hearing.delta} ↗
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#786E65] dark:text-[#A8A29E]">
              <span>Sep: <strong className="text-[#1B1917] dark:text-[#F5F5F4]">{momData.hearing.lastMonth} hrs</strong></span>
              <span>Oct: <strong className="text-[#15803D] dark:text-emerald-400">{momData.hearing.thisMonth} hrs ({momData.hearing.dailyMinutes})</strong></span>
            </div>
          </div>

          {/* Reading Hours */}
          <div className="p-3 rounded-2xl bg-white border border-stone-200/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-[#1B1917]">Book Reading Time</span>
              <span className="text-xs font-black text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {momData.readingHours.delta} ↗
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#786E65]">
              <span>Sep: <strong className="text-[#1B1917]">{momData.readingHours.lastMonth} hrs</strong></span>
              <span>Oct: <strong className="text-[#15803D]">{momData.readingHours.thisMonth} hrs</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. WEEK-OVER-WEEK COMPARISON (This Week vs Last Week) */}
      <div className="glass-surface p-4.5 rounded-[28px] border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#E07A2B]" />
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1B1917]">
              Week-over-Week Comparison
            </h4>
          </div>
          <span className="text-[10px] font-bold text-[#786E65]">
            This Week vs Last Week
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-white border border-stone-200/70">
            <span className="text-[10px] font-bold text-[#786E65] uppercase block">
              Weekly Points Delta
            </span>
            <div className="text-sm font-black text-[#1B1917] mt-0.5">
              {wowData.weeklyPoints.lastWeek} → {wowData.weeklyPoints.thisWeek} pts
            </div>
            <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
              {wowData.weeklyPoints.delta} ↗
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-stone-200/70">
            <span className="text-[10px] font-bold text-[#786E65] uppercase block">
              Maṅgala On-Time
            </span>
            <div className="text-sm font-black text-[#1B1917] mt-0.5">
              {wowData.mangalaOnTime.thisWeek}
            </div>
            <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
              {wowData.mangalaOnTime.delta}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-[#24201E] border border-stone-200/70 dark:border-stone-800">
            <span className="text-[10px] font-bold text-[#786E65] dark:text-[#A8A29E] uppercase block">
              Hearing (Śrīmad Bhāgavatam)
            </span>
            <div className="text-sm font-black text-[#1B1917] dark:text-[#F5F5F4] mt-0.5">
              {wowData.hearingWeek.thisWeek}
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5">
              {wowData.hearingWeek.delta} ↗
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-stone-200/70">
            <span className="text-[10px] font-bold text-[#786E65] uppercase block">
              Reading Time
            </span>
            <div className="text-sm font-black text-[#1B1917] mt-0.5">
              {wowData.readingMinutes.thisWeek} mins
            </div>
            <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
              {wowData.readingMinutes.delta} ↗
            </span>
          </div>
        </div>
      </div>

      {/* Guide Mentorship Note / Direct Encouragement (If Guide is viewing) */}
      {!isSelfView && (
        <div className="p-4 rounded-[26px] bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#9C4507] flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" />
              Send Personal Encouragement / Mentorship Note
            </span>
            <span className="text-[10px] text-[#786E65]">Via FOLK In-App</span>
          </div>

          {noteSent && (
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Encouragement message sent to {targetDevotee.name}!</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={mentorNote}
              onChange={(e) => setMentorNote(e.target.value)}
              placeholder={`Write a note for ${targetDevotee.name.split(' ')[0]}...`}
              className="flex-1 h-9 px-3 rounded-xl bg-white border border-amber-300 text-xs text-[#1B1917] outline-none"
            />
            <button
              type="button"
              onClick={handleSendEncouragement}
              disabled={!mentorNote.trim()}
              className="h-9 px-3 rounded-xl bg-[#E07A2B] hover:bg-[#C86315] text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 transition-all"
            >
              <Send className="w-3 h-3" />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
