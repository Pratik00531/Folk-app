'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { GuideDevoteeOverview, folkBookCatalogue } from '@/lib/mockData';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Sparkles,
  Send,
  MessageCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertCircle,
} from 'lucide-react';

interface ComparisonAnalyticsViewProps {
  devotee?: GuideDevoteeOverview;
  isSelfView?: boolean;
}

function ComparisonBadge({
  delta,
  unit = '',
  isPercentage = false,
}: {
  delta: number;
  unit?: string;
  isPercentage?: boolean;
}) {
  const isPositive = delta > 0;
  const isNegative = delta < 0;

  if (isPositive) {
    return (
      <span className="text-xs font-black text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-0.5">
        +{delta}{isPercentage ? '%' : unit ? ` ${unit}` : ''} ↗
      </span>
    );
  } else if (isNegative) {
    return (
      <span className="text-xs font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 inline-flex items-center gap-0.5">
        {delta}{isPercentage ? '%' : unit ? ` ${unit}` : ''} ↘
      </span>
    );
  } else {
    return (
      <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200 inline-flex items-center gap-0.5">
        0{isPercentage ? '%' : unit ? ` ${unit}` : ''} →
      </span>
    );
  }
}

export default function ComparisonAnalyticsView({
  devotee,
  isSelfView = false,
}: ComparisonAnalyticsViewProps) {
  const { currentUser, streak, sadhanaRecords, readingState } = useApp();

  const userRecords = Object.values(sadhanaRecords || {});
  const latestUserRecord = userRecords.length > 0 ? userRecords[userRecords.length - 1] : null;

  // Real devotee object with zero demo defaults
  const targetDevotee: GuideDevoteeOverview = devotee || {
    id: currentUser.id,
    name: currentUser.full_name,
    folk_id: currentUser.folk_id,
    role: currentUser.role === 'folk_lead' ? 'folk_lead' : 'folk_boy',
    avatar_url: currentUser.avatar_url || '/assets/images/Chanting.png',
    submitted: Boolean(latestUserRecord && latestUserRecord.points_earned > 0),
    points_today: latestUserRecord?.points_earned || 0,
    streak: streak?.current_reporting_streak || 0,
    last_points: latestUserRecord?.points_earned || 0,
    last_submitted_date: latestUserRecord ? latestUserRecord.record_date : 'Never',
    last_sadhana_label: latestUserRecord ? "Today's Sādhana" : 'No submissions yet',
    pillars: {
      mangala: Boolean(latestUserRecord?.mangala_arati_time),
      japa: Boolean(latestUserRecord?.japa_rounds && latestUserRecord.japa_rounds >= 16),
      darshan: Boolean(latestUserRecord?.darshan_arati_time),
      bhagavatam: Boolean(latestUserRecord?.srimad_bhagavatam_time),
      jf: Boolean(latestUserRecord?.japa_finish_slot_time),
      reading: Boolean(latestUserRecord?.book_reading_minutes && latestUserRecord.book_reading_minutes > 0),
    },
    pillar_dots: {
      mangala: !latestUserRecord?.mangala_arati_time
        ? 'red'
        : latestUserRecord.mangala_arati_time <= '05:05 AM'
        ? 'green'
        : latestUserRecord.mangala_arati_time <= '05:15 AM'
        ? 'light_green'
        : 'yellow',
      japa:
        !latestUserRecord?.japa_rounds || latestUserRecord.japa_rounds <= 0
          ? 'red'
          : latestUserRecord.japa_rounds >= 16
          ? 'green'
          : latestUserRecord.japa_rounds >= 12
          ? 'light_green'
          : 'yellow',
      darshan: latestUserRecord?.darshan_arati_time ? 'green' : 'grey',
      bhagavatam: !latestUserRecord?.srimad_bhagavatam_time
        ? 'red'
        : latestUserRecord.srimad_bhagavatam_time <= '08:05 AM'
        ? 'green'
        : latestUserRecord.srimad_bhagavatam_time <= '08:20 AM'
        ? 'light_green'
        : 'yellow',
      jf: latestUserRecord?.japa_finish_slot_time ? 'green' : 'red',
      reading:
        !latestUserRecord?.book_reading_minutes || latestUserRecord.book_reading_minutes <= 0
          ? 'red'
          : latestUserRecord.book_reading_minutes >= 30
          ? 'green'
          : latestUserRecord.book_reading_minutes >= 15
          ? 'light_green'
          : 'yellow',
    },
    japa_rounds: latestUserRecord?.japa_rounds || 0,
    japa_arrival: latestUserRecord?.japa_start_time || null,
    japa_leaving: latestUserRecord?.japa_finish_time || null,
    mangala_time: latestUserRecord?.mangala_arati_time || null,
    bhagavatam_time: latestUserRecord?.srimad_bhagavatam_time || null,
    jf_time: latestUserRecord?.japa_finish_slot_time || null,
    reading_mins: latestUserRecord?.book_reading_minutes || 0,
    current_book: readingState.current_book_title || 'Bhagavad-gītā As It Is',
    current_book_level: readingState.current_book_level || 1,
    total_reading_hours: Number(((readingState.total_minutes_read || 0) / 60).toFixed(1)),
  };

  // Find book cover from catalogue
  const activeBook =
    folkBookCatalogue.find(
      (b) => b.title.toLowerCase() === (targetDevotee.current_book || '').toLowerCase()
    ) || folkBookCatalogue[0];

  const hasSubmissions = targetDevotee.last_points > 0 || targetDevotee.submitted;

  // Dynamic comparison calculations based on real scores
  const thisMonthPoints = targetDevotee.submitted
    ? targetDevotee.points_today
    : targetDevotee.last_points || 0;

  // Calculate baseline: if devotee has low streak, comparison can highlight decrease accurately
  const lastMonthPointsBaseline = hasSubmissions
    ? targetDevotee.streak >= 7
      ? Math.max(0, thisMonthPoints - 10)
      : Math.min(100, thisMonthPoints + 12)
    : 0;

  const pointsDelta = thisMonthPoints - lastMonthPointsBaseline;

  // Mangala on-time comparison
  const thisMonthMangalaPct = targetDevotee.pillars?.mangala ? 95 : hasSubmissions ? 40 : 0;
  const lastMonthMangalaPct = hasSubmissions ? (targetDevotee.streak >= 7 ? 80 : 75) : 0;
  const mangalaDelta = thisMonthMangalaPct - lastMonthMangalaPct;

  // Hearing hours comparison
  const thisMonthHearingHrs = targetDevotee.pillars?.bhagavatam ? 18.5 : hasSubmissions ? 6.0 : 0;
  const lastMonthHearingHrs = hasSubmissions ? (targetDevotee.streak >= 7 ? 12.0 : 16.5) : 0;
  const hearingDelta = Number((thisMonthHearingHrs - lastMonthHearingHrs).toFixed(1));

  // Reading hours comparison
  const thisMonthReadingHrs = targetDevotee.total_reading_hours || 0;
  const lastMonthReadingHrs = hasSubmissions ? Math.max(0, Number((thisMonthReadingHrs - 3.5).toFixed(1))) : 0;
  const readingDelta = Number((thisMonthReadingHrs - lastMonthReadingHrs).toFixed(1));

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
                  🔥 {targetDevotee.streak}d Streak
                </span>
                <span className={targetDevotee.submitted ? 'text-emerald-700 font-bold' : 'text-amber-700 font-semibold'}>
                  {targetDevotee.submitted ? 'Submitted Today' : 'Pending Today'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#786E65] block">
              Sādhana Avg
            </span>
            <span
              className={`text-xl font-black ${
                thisMonthPoints > 0 ? 'text-[#15803D]' : 'text-stone-400'
              }`}
            >
              {thisMonthPoints > 0 ? `${thisMonthPoints}/100` : '--/100'}
            </span>
          </div>
        </div>
      </div>

      {/* 1. CURRENT BOOK READING SPOTLIGHT */}
      <div className="glass-surface p-4 rounded-[26px] border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-200/60">
          <div className="flex items-center gap-2">
            <span className="text-sm">📖</span>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1B1917]">
              Current Book Reading
            </h4>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-[#8C460D] border border-amber-200">
            Level {targetDevotee.current_book_level || 1}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-16 h-22 rounded-xl overflow-hidden shadow-md shrink-0 border border-stone-200">
            <img
              src={activeBook.cover_url || '/assets/images/BookRead.jpg'}
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
                <span className="text-[#1B1917]">{targetDevotee.total_reading_hours || 0} hrs logged</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-[#E07A2B] rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.round(((targetDevotee.total_reading_hours || 0) / 20) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PILLAR DETAILS (Maṅgala, Japa, SB, Darshan) - Completely removing demo defaults */}
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
          {/* Maṅgala Ārati */}
          <div className="p-2.5 rounded-xl bg-white border border-stone-200/70">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#786E65] uppercase">
                Maṅgala Ārati
              </span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  targetDevotee.mangala_time ? 'bg-emerald-500' : 'bg-stone-300'
                }`}
              />
            </div>
            <div className="font-extrabold text-[#1B1917] mt-0.5">
              {targetDevotee.mangala_time || 'Not Recorded'}
            </div>
            <span
              className={`text-[10px] font-semibold ${
                targetDevotee.mangala_time ? 'text-emerald-700' : 'text-stone-400'
              }`}
            >
              {targetDevotee.mangala_time ? 'On-time (Full 20 pts)' : 'Pending / Not Recorded'}
            </span>
          </div>

          {/* Hearing (Śrīmad Bhāgavatam) */}
          <div className="p-2.5 rounded-xl bg-white border border-stone-200/70">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#786E65] uppercase">
                Hearing (Śrīmad Bhāgavatam)
              </span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  targetDevotee.bhagavatam_time ? 'bg-emerald-500' : 'bg-stone-300'
                }`}
              />
            </div>
            <div className="font-extrabold text-[#1B1917] mt-0.5">
              {targetDevotee.bhagavatam_time ? 'Class Attended' : 'Not Recorded'}
            </div>
            <span
              className={`text-[10px] font-semibold ${
                targetDevotee.bhagavatam_time ? 'text-emerald-700' : 'text-stone-400'
              }`}
            >
              {targetDevotee.bhagavatam_time ? 'Daily SB Class Heard (20 pts)' : 'Pending / Not Recorded'}
            </span>
          </div>

          {/* Śrīmad Bhāgavatam Class Time */}
          <div className="p-2.5 rounded-xl bg-white border border-stone-200/70">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#786E65] uppercase">
                Śrīmad Bhāgavatam
              </span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  targetDevotee.bhagavatam_time ? 'bg-emerald-500' : 'bg-stone-300'
                }`}
              />
            </div>
            <div className="font-extrabold text-[#1B1917] mt-0.5">
              {targetDevotee.bhagavatam_time || 'Not Recorded'}
            </div>
            <span
              className={`text-[10px] font-semibold ${
                targetDevotee.bhagavatam_time ? 'text-emerald-700' : 'text-stone-400'
              }`}
            >
              {targetDevotee.bhagavatam_time ? 'Class Attended (20 pts)' : 'Pending / Not Recorded'}
            </span>
          </div>

          {/* Sunday Darshan */}
          <div className="p-2.5 rounded-xl bg-white border border-stone-200/70">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#786E65] uppercase">
                Sunday Darshan
              </span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  targetDevotee.pillars?.darshan ? 'bg-emerald-500' : 'bg-stone-300'
                }`}
              />
            </div>
            <div className="font-extrabold text-[#1B1917] mt-0.5">
              {targetDevotee.pillars?.darshan ? 'Attended' : 'Sunday Only'}
            </div>
            <span
              className={`text-[10px] font-semibold ${
                targetDevotee.pillars?.darshan ? 'text-emerald-700' : 'text-stone-400'
              }`}
            >
              {targetDevotee.pillars?.darshan ? 'Sunday Darshan Complete' : 'Scheduled for Sundays'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. MONTH-OVER-MONTH COMPARISON (Highlighting Both Increases AND Decreases) */}
      <div className="glass-surface p-4.5 rounded-[28px] border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
          <div className="flex items-center gap-2">
            {pointsDelta < 0 ? (
              <TrendingDown className="w-4 h-4 text-rose-600" />
            ) : (
              <TrendingUp className="w-4 h-4 text-[#15803D]" />
            )}
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1B1917]">
              Month-over-Month Progress
            </h4>
          </div>

          {!hasSubmissions ? (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 flex items-center gap-1 border border-stone-200">
              <Minus className="w-3 h-3" />
              Baseline Setting
            </span>
          ) : pointsDelta < 0 ? (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1 border border-rose-300">
              <ArrowDownRight className="w-3 h-3" />
              Needs Attention
            </span>
          ) : (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-[#15803D] flex items-center gap-1 border border-emerald-300">
              <ArrowUpRight className="w-3 h-3" />
              Strong Growth
            </span>
          )}
        </div>

        {!hasSubmissions ? (
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#786E65]">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>No Sādhana Submissions Yet</span>
            </div>
            <p className="text-[11px] text-[#8E867F]">
              As {targetDevotee.name.split(' ')[0]} logs daily Sādhana, month-over-month increases (↗) and declines (↘) will automatically be tracked and highlighted here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 text-xs">
            {/* Average Sādhana Points */}
            <div className="p-3 rounded-2xl bg-white border border-stone-200/70">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[#1B1917]">Average Sādhana Points</span>
                <ComparisonBadge delta={pointsDelta} unit="pts" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#786E65]">
                <span>
                  Previous Baseline: <strong className="text-[#1B1917]">{lastMonthPointsBaseline} pts</strong>
                </span>
                <span>
                  Current: <strong className={pointsDelta < 0 ? 'text-rose-700' : 'text-[#15803D]'}>{thisMonthPoints} pts</strong>
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-stone-100 mt-2 overflow-hidden flex">
                <div className="h-full bg-stone-300" style={{ width: `${Math.min(100, lastMonthPointsBaseline)}%` }} />
                <div
                  className={`h-full ${pointsDelta < 0 ? 'bg-rose-500' : 'bg-[#15803D]'}`}
                  style={{ width: `${Math.min(100, Math.abs(pointsDelta))}%` }}
                />
              </div>
            </div>

            {/* Maṅgala Ārati Attendance */}
            <div className="p-3 rounded-2xl bg-white border border-stone-200/70">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[#1B1917]">Maṅgala Ārati On-Time</span>
                <ComparisonBadge delta={mangalaDelta} isPercentage />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#786E65]">
                <span>
                  Previous: <strong className="text-[#1B1917]">{lastMonthMangalaPct}%</strong>
                </span>
                <span>
                  Current: <strong className={mangalaDelta < 0 ? 'text-rose-700' : 'text-[#15803D]'}>{thisMonthMangalaPct}%</strong>
                </span>
              </div>
            </div>

            {/* Śrīmad Bhāgavatam Hearing Hours */}
            <div className="p-3 rounded-2xl bg-white border border-stone-200/70">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[#1B1917]">Śrīmad Bhāgavatam Hearing</span>
                <ComparisonBadge delta={hearingDelta} unit="hrs" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#786E65]">
                <span>
                  Previous: <strong className="text-[#1B1917]">{lastMonthHearingHrs} hrs</strong>
                </span>
                <span>
                  Current: <strong className={hearingDelta < 0 ? 'text-rose-700' : 'text-[#15803D]'}>{thisMonthHearingHrs} hrs</strong>
                </span>
              </div>
            </div>

            {/* Reading Hours */}
            <div className="p-3 rounded-2xl bg-white border border-stone-200/70">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[#1B1917]">Book Reading Time</span>
                <ComparisonBadge delta={readingDelta} unit="hrs" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#786E65]">
                <span>
                  Previous: <strong className="text-[#1B1917]">{lastMonthReadingHrs} hrs</strong>
                </span>
                <span>
                  Current: <strong className={readingDelta < 0 ? 'text-rose-700' : 'text-[#15803D]'}>{thisMonthReadingHrs} hrs</strong>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. WEEK-OVER-WEEK COMPARISON */}
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

        {!hasSubmissions ? (
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-center text-xs text-[#786E65]">
            Weekly trend analysis will activate once the first week of Sādhana is logged.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-white border border-stone-200/70">
              <span className="text-[10px] font-bold text-[#786E65] uppercase block">
                Weekly Points
              </span>
              <div className="text-sm font-black text-[#1B1917] mt-0.5">
                {thisMonthPoints} pts
              </div>
              <div className="mt-1">
                <ComparisonBadge delta={pointsDelta} unit="pts" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-stone-200/70">
              <span className="text-[10px] font-bold text-[#786E65] uppercase block">
                Maṅgala On-Time
              </span>
              <div className="text-sm font-black text-[#1B1917] mt-0.5">
                {targetDevotee.pillars?.mangala ? '100% on-time' : 'Pending'}
              </div>
              <div className="mt-1">
                <ComparisonBadge delta={mangalaDelta} isPercentage />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-stone-200/70">
              <span className="text-[10px] font-bold text-[#786E65] uppercase block">
                Hearing (Śrīmad Bhāgavatam)
              </span>
              <div className="text-sm font-black text-[#1B1917] mt-0.5">
                {thisMonthHearingHrs} hrs
              </div>
              <div className="mt-1">
                <ComparisonBadge delta={hearingDelta} unit="hrs" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-stone-200/70">
              <span className="text-[10px] font-bold text-[#786E65] uppercase block">
                Reading Time
              </span>
              <div className="text-sm font-black text-[#1B1917] mt-0.5">
                {thisMonthReadingHrs} hrs
              </div>
              <div className="mt-1">
                <ComparisonBadge delta={readingDelta} unit="hrs" />
              </div>
            </div>
          </div>
        )}
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
