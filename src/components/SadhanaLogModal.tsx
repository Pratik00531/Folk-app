'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '@/context/AppContext';
import {
  ChevronLeft,
  Star,
  Sun,
  BookOpen,
  Flag,
  PenTool,
  Clock,
  X,
  Check,
  Minus,
  Calendar,
  ChevronRight,
  Plus,
  Sparkles,
  Lock,
  Send,
  ShieldAlert,
} from 'lucide-react';
import TimePickerAMPM from '@/components/TimePickerAMPM';
import { getBookCoverUrl } from '@/lib/mockData';

// Authentic Lotus Emblem SVG
function LotusIcon({ className = 'w-6 h-6 text-[#DC6820]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C12 2 10.5 6.5 10.5 8.5C10.5 10.5 12 12 12 12C12 12 13.5 10.5 13.5 8.5C13.5 6.5 12 2 12 2Z" />
      <path d="M7.5 5.5C7.5 5.5 8 9.5 9.5 11C11 12.5 12 12 12 12C12 12 10.5 10 9 8C7.5 6 7.5 5.5 7.5 5.5Z" />
      <path d="M16.5 5.5C16.5 5.5 16 9.5 14.5 11C13 12.5 12 12 12 12C12 12 13.5 10 15 8C16.5 6 16.5 5.5 16.5 5.5Z" />
      <path d="M3.5 10C3.5 10 5.5 13 8 13.5C10.5 14 12 12 12 12C12 12 9.5 11 7 9.5C4.5 8 3.5 10 3.5 10Z" />
      <path d="M20.5 10C20.5 10 18.5 13 16 13.5C13.5 14 12 12 12 12C12 12 14.5 11 17 9.5C19.5 8 20.5 10 20.5 10Z" />
      <path d="M5 15C7 16 10 16 12 14.5C14 16 17 16 19 15C18 17 15.5 18 12 18C8.5 18 6 17 5 15Z" />
    </svg>
  );
}

// Prayer Mala Bead Icon SVG
function MalaIcon({ className = 'w-5 h-5 text-[#DC6820]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="4" r="1.5" fill="currentColor" />
      <circle cx="16.5" cy="5.5" r="1.5" fill="currentColor" />
      <circle cx="19.5" cy="9" r="1.5" fill="currentColor" />
      <circle cx="20" cy="13.5" r="1.5" fill="currentColor" />
      <circle cx="18" cy="17.5" r="1.5" fill="currentColor" />
      <circle cx="14" cy="20" r="1.5" fill="currentColor" />
      <circle cx="10" cy="20" r="1.5" fill="currentColor" />
      <circle cx="6" cy="17.5" r="1.5" fill="currentColor" />
      <circle cx="4" cy="13.5" r="1.5" fill="currentColor" />
      <circle cx="4.5" cy="9" r="1.5" fill="currentColor" />
      <circle cx="7.5" cy="5.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

// Temple Dome Shikhara Icon SVG
function TempleDomeIcon({ className = 'w-5 h-5 text-[#DC6820]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2v2" />
      <path d="M9 6c0-2 3-4 3-4s3 2 3 4c0 1.5-1 2-3 2s-3-.5-3-2z" />
      <path d="M7 10h10v3H7z" />
      <path d="M5 14h14v7H5z" />
      <path d="M10 21v-4h4v4" />
    </svg>
  );
}

export default function SadhanaLogModal() {
  const {
    isLogModalOpen,
    closeLogModal,
    submitSadhanaForDate,
    requestLateSadhanaApproval,
    selectedDateForModal,
    sadhanaRecords,
    readingState,
    setIsPointsModalOpen,
    setActiveFolkBoyTab,
  } = useApp();

  const existingRecord = sadhanaRecords[selectedDateForModal] || null;

  // 3-Day Lock Rule for late Sādhana submission
  const todayDateObj = new Date(2026, 9, 3);
  const dateParts = selectedDateForModal.split('-').map(Number);
  const targetDateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  const diffDays = Math.round((todayDateObj.getTime() - targetDateObj.getTime()) / (1000 * 60 * 60 * 24));
  const isOlderThan3Days = diffDays > 3;
  const [lateReason, setLateReason] = useState<string>('Semester exams and temple seva');

  // Sunday identification: Darshan Ārati is enabled ONLY on Sundays!
  const isSunday = new Date(selectedDateForModal).getDay() === 0;

  // 1. Maṅgala Ārati
  const [mangalaAttended, setMangalaAttended] = useState<boolean>(true);
  const [mangalaArati, setMangalaArati] = useState<string>('05:03 AM');

  // 2. Japa Morning
  const [japaAttended, setJapaAttended] = useState<boolean>(true);
  const [japaArrival, setJapaArrival] = useState<string>('05:15 AM');
  const [japaLeaving, setJapaLeaving] = useState<string>('06:45 AM');
  const [japaRounds, setJapaRounds] = useState<number>(8);

  // 3. Darshan Ārati (Sundays only)
  const [darshanAttended, setDarshanAttended] = useState<boolean>(false);
  const [darshanArati, setDarshanArati] = useState<string>('07:15 AM');

  // 4. Śrīmad Bhāgavatam
  const [sbAttended, setSbAttended] = useState<boolean>(true);
  const [sbClass, setSbClass] = useState<string>('07:30 AM');

  // 5. JF (Japa Finish)
  const [jfAttended, setJfAttended] = useState<boolean>(true);
  const [jfTime, setJfTime] = useState<string>('06:45 PM');

  // 6. Book Reading
  const [readingAttended, setReadingAttended] = useState<boolean>(true);
  const [readingMinutes, setReadingMinutes] = useState<number>(30);
  const [customReadingInput, setCustomReadingInput] = useState<string>('');
  const [isCustomReadingOpen, setIsCustomReadingOpen] = useState<boolean>(false);

  // 7. Remarks
  const [remarks, setRemarks] = useState<string>('');

  // Submission Celebration State
  const [isSubmittingSuccess, setIsSubmittingSuccess] = useState<boolean>(false);
  const [submittedScore, setSubmittedScore] = useState<number>(100);

  // Hydrate from existing or set defaults matching reference image
  useEffect(() => {
    if (existingRecord) {
      if (existingRecord.mangala_arati_time) {
        setMangalaAttended(true);
        setMangalaArati(existingRecord.mangala_arati_time);
      } else {
        setMangalaAttended(false);
      }

      if (existingRecord.japa_start_time) {
        setJapaAttended(true);
        setJapaArrival(existingRecord.japa_start_time);
        setJapaLeaving(existingRecord.japa_finish_time || '06:45 AM');
        setJapaRounds(existingRecord.japa_rounds || 8);
      } else {
        setJapaAttended(false);
      }

      if (existingRecord.darshan_arati_time) {
        setDarshanAttended(true);
        setDarshanArati(existingRecord.darshan_arati_time);
      } else {
        setDarshanAttended(false);
      }

      if (existingRecord.srimad_bhagavatam_time) {
        setSbAttended(true);
        setSbClass(existingRecord.srimad_bhagavatam_time);
      } else {
        setSbAttended(false);
      }

      if (existingRecord.japa_finish_slot_time) {
        setJfAttended(true);
        setJfTime(existingRecord.japa_finish_slot_time);
      } else {
        setJfAttended(false);
      }

      if (existingRecord.book_reading_minutes && existingRecord.book_reading_minutes > 0) {
        setReadingAttended(true);
        setReadingMinutes(existingRecord.book_reading_minutes);
      } else {
        setReadingAttended(false);
        setReadingMinutes(0);
      }

      setRemarks(existingRecord.remarks || '');
    } else {
      setMangalaAttended(true);
      setMangalaArati('05:03 AM');
      setJapaAttended(true);
      setJapaArrival('05:15 AM');
      setJapaLeaving('06:45 AM');
      setJapaRounds(8);
      setDarshanAttended(isSunday);
      setDarshanArati('07:15 AM');
      setSbAttended(true);
      setSbClass('07:30 AM');
      setJfAttended(true);
      setJfTime('06:45 PM');
      setReadingAttended(true);
      setReadingMinutes(30);
      setRemarks('');
    }
  }, [existingRecord, selectedDateForModal, isSunday]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLogModal();
      }
    };
    if (isLogModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isLogModalOpen, closeLogModal]);

  if (!isLogModalOpen) return null;

  // Format date display: e.g. "Thu, 3 October 2026"
  const formattedSubtitle = new Date(selectedDateForModal).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const currentBookCover = getBookCoverUrl(readingState.current_book_title);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Estimate Points for the celebration dialog based on the 100-pt rule
    let pts = 0;
    if (mangalaAttended) pts += 20;
    if (japaAttended) pts += isSunday ? 35 : (japaRounds >= 16 ? 40 : 28);
    if (isSunday && darshanAttended) pts += 10;
    if (sbAttended) pts += isSunday ? 15 : 20;
    if (jfAttended) pts += 10;
    if (readingAttended) pts += 10;
    const finalScore = pts > 0 ? pts : 100;
    setSubmittedScore(finalScore);

    // If older than 3 days, route as an approval request to Folk Lead!
    if (isOlderThan3Days) {
      requestLateSadhanaApproval(
        selectedDateForModal,
        {
          mangala_arati_time: mangalaAttended ? mangalaArati : null,
          japa_start_time: japaAttended ? japaArrival : null,
          japa_finish_time: japaAttended ? japaLeaving : null,
          japa_rounds: japaAttended ? japaRounds : 0,
          darshan_arati_time: isSunday && darshanAttended ? darshanArati : null,
          srimad_bhagavatam_time: sbAttended ? sbClass : null,
          japa_finish_slot_time: jfAttended ? jfTime : null,
          book_title: readingState.current_book_title,
          book_level: readingState.current_book_level,
          book_reading_minutes: readingAttended ? readingMinutes : 0,
          remarks: remarks.trim() ? remarks.trim() : null,
        },
        lateReason
      );

      setIsSubmittingSuccess(true);
      setTimeout(() => {
        closeLogModal();
        setIsSubmittingSuccess(false);
      }, 2000);
      return;
    }

    // Synchronously submit so heatmap and stats re-render immediately
    submitSadhanaForDate(selectedDateForModal, {
      mangala_arati_time: mangalaAttended ? mangalaArati : null,
      japa_start_time: japaAttended ? japaArrival : null,
      japa_finish_time: japaAttended ? japaLeaving : null,
      japa_rounds: japaAttended ? japaRounds : 0,
      darshan_arati_time: isSunday && darshanAttended ? darshanArati : null,
      srimad_bhagavatam_time: sbAttended ? sbClass : null,
      japa_finish_slot_time: jfAttended ? jfTime : null,
      book_title: readingState.current_book_title,
      book_level: readingState.current_book_level,
      book_reading_minutes: readingAttended ? readingMinutes : 0,
      remarks: remarks.trim() ? remarks.trim() : null,
    });

    // For today's Sādhana, close log modal immediately so Duolingo streak animation takes center stage!
    if (selectedDateForModal === '2026-10-03') {
      closeLogModal();
    } else {
      // Trigger celebration animation for past dates
      setIsSubmittingSuccess(true);
      try {
        confetti({
          particleCount: 75,
          spread: 75,
          origin: { y: 0.5 },
          colors: ['#216E39', '#30A14E', '#40C463', '#DC6820', '#F59E0B'],
        });
      } catch {}

      // Auto-dismiss after celebration
      setTimeout(() => {
        closeLogModal();
        setIsSubmittingSuccess(false);
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      {/* Background warm aesthetic canvas */}
      <div className="w-full max-w-[440px] h-full sm:h-auto sm:max-h-[92vh] bg-[#FAF5EE] dark:bg-[#181614] sm:rounded-[36px] shadow-2xl border border-white/70 dark:border-stone-800 overflow-hidden flex flex-col relative">
        {/* Subtle lotus / floral background watermark glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#F5DEB3]/35 to-transparent pointer-events-none rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-radial from-[#E07A2B]/10 to-transparent pointer-events-none rounded-full blur-3xl -z-10" />

        {/* Sticky Top Header that NEVER scrolls away */}
        <div className="sticky top-0 z-40 bg-[#FAF5EE]/95 dark:bg-[#181614]/95 backdrop-blur-md pt-4 pb-3 px-4 flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800 shrink-0 shadow-xs">
          {/* Back button */}
          <button
            type="button"
            onClick={closeLogModal}
            aria-label="Back"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 text-[#1B1917] dark:text-stone-200 font-bold text-xs hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Exit</span>
          </button>

          {/* Central Lotus & Title */}
          <div className="flex flex-col items-center text-center">
            <h1 className="text-base font-extrabold text-[#1B1917] dark:text-stone-100 leading-tight">
              Today's Sādhana
            </h1>
            <p className="text-[11px] text-[#786E65] dark:text-stone-400 font-medium">
              {formattedSubtitle}
            </p>
          </div>

          {/* View Points pill button */}
          <button
            type="button"
            onClick={() => setIsPointsModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-[11px] font-bold text-[#DC6820] hover:bg-white shadow-2xs cursor-pointer"
          >
            <Star className="w-3.5 h-3.5 fill-[#DC6820]" />
            <span>Points</span>
          </button>
        </div>

        {/* 3-Day Lock Rule Notice Banner */}
        {isOlderThan3Days && (
          <div className="mx-5 mb-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#9C4507] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-black text-[#9C4507] uppercase tracking-wider">
                Folk Lead Approval Required ({diffDays} Days Past)
              </h3>
              <p className="text-[11px] text-[#7A4B1A] leading-relaxed mt-0.5">
                Calendar locks direct submission for dates older than 3 days. Please fill in your details; this will be sent to your Folk Lead for acceptance.
              </p>
              <div className="mt-2.5">
                <label className="text-[10px] font-bold text-[#7A4B1A] uppercase block mb-1">
                  Reason for Late Submission:
                </label>
                <input
                  type="text"
                  value={lateReason}
                  onChange={(e) => setLateReason(e.target.value)}
                  placeholder="e.g. Traveling, Semester exams, Sickness"
                  className="w-full text-xs px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-[#1B1917] outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Body - Centered Activity Titles with Time Filling Below the text */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-4 pb-28 pt-1 space-y-3.5 flex-1">
          {/* 1. Maṅgala Ārati */}
          <div className="bg-white/90 rounded-[26px] p-4 border border-stone-200/50 shadow-xs space-y-3 transition-all">
            {/* Header: Icon + Title + Attendance Status Check Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#FFF8EE] border border-[#FBE6CC] flex items-center justify-center text-[#DC6820] shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1B1917]">Maṅgala Ārati</h3>
                  <p className="text-[11px] text-[#786E65]">Temple prayer</p>
                </div>
              </div>

              {/* Status Circle: Toggle attendance */}
              <button
                type="button"
                onClick={() => setMangalaAttended(!mangalaAttended)}
                title={mangalaAttended ? 'Attended' : 'Mark as attended'}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  mangalaAttended
                    ? 'bg-[#2E7D32] text-white shadow-2xs scale-100'
                    : 'bg-stone-200 text-stone-400 hover:bg-stone-300'
                }`}
              >
                {mangalaAttended ? <Check className="w-4.5 h-4.5 stroke-[2.8]" /> : <Minus className="w-4 h-4" />}
              </button>
            </div>

            {/* Time Filling Below the text */}
            <div className="pt-1">
              {mangalaAttended ? (
                <div className="flex justify-center">
                  <TimePickerAMPM
                    value={mangalaArati}
                    onChange={setMangalaArati}
                    onClear={() => setMangalaAttended(false)}
                    className="w-full justify-between py-2"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setMangalaAttended(true)}
                  className="w-full py-2.5 rounded-full border border-dashed border-stone-300 text-stone-500 text-xs font-semibold hover:bg-stone-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#DC6820]" />
                  <span>Tap to mark attended & set arrival time</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Japa (Morning) */}
          <div className="bg-white/90 rounded-[26px] p-4 border border-stone-200/50 shadow-xs space-y-3.5 transition-all">
            {/* Header: Icon + Title + Status Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#FFF8EE] border border-[#FBE6CC] flex items-center justify-center text-[#DC6820] shrink-0">
                  <MalaIcon className="w-5 h-5 text-[#DC6820]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1B1917]">Japa (Morning)</h3>
                  <p className="text-[11px] text-[#786E65]">Time in temple hall</p>
                </div>
              </div>

              {/* Status Circle */}
              <button
                type="button"
                onClick={() => setJapaAttended(!japaAttended)}
                title={japaAttended ? 'Attended' : 'Mark as attended'}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  japaAttended
                    ? 'bg-[#2E7D32] text-white shadow-2xs'
                    : 'bg-stone-200 text-stone-400 hover:bg-stone-300'
                }`}
              >
                {japaAttended ? <Check className="w-4.5 h-4.5 stroke-[2.8]" /> : <Minus className="w-4 h-4" />}
              </button>
            </div>

            {/* Time Filling Below the text */}
            {japaAttended ? (
              <div className="space-y-3 pt-1">
                {/* Arrival & Departure stacked cleanly with full width */}
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#786E65] block">
                      Arrived at temple hall
                    </label>
                    <TimePickerAMPM
                      value={japaArrival}
                      onChange={setJapaArrival}
                      className="w-full justify-between py-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#786E65] block">
                      Left temple hall
                    </label>
                    <TimePickerAMPM
                      value={japaLeaving}
                      onChange={setJapaLeaving}
                      className="w-full justify-between py-2"
                    />
                  </div>
                </div>

                {/* Rounds Completed Pills */}
                <div>
                  <span className="text-[11px] font-semibold text-[#786E65] block mb-1.5">
                    Rounds completed
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[4, 8, 12, 16].map((rounds) => {
                      const isSelected = japaRounds === rounds;
                      return (
                        <button
                          key={rounds}
                          type="button"
                          onClick={() => setJapaRounds(rounds)}
                          className={`py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#DC6820] text-white shadow-2xs'
                              : 'bg-[#FAF7F2] border border-stone-200/60 text-[#1B1917] hover:bg-stone-50'
                          }`}
                        >
                          {rounds}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setJapaAttended(true)}
                className="w-full py-2.5 rounded-full border border-dashed border-stone-300 text-stone-500 text-xs font-semibold hover:bg-stone-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#DC6820]" />
                <span>Tap to mark attended & set japa rounds</span>
              </button>
            )}
          </div>

          {/* 3. Darshan Ārati (Sundays Only) */}
          <div
            className={`rounded-[26px] p-4 border shadow-xs space-y-3 transition-all ${
              isSunday ? 'bg-white/90 border-stone-200/50' : 'bg-white/60 border-stone-200/40 opacity-90'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#FFF8EE] border border-[#FBE6CC] flex items-center justify-center text-[#DC6820] shrink-0">
                  <TempleDomeIcon className="w-5 h-5 text-[#DC6820]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#1B1917]">Darshan Ārati</h3>
                    {!isSunday ? (
                      <span className="text-[9px] font-bold text-[#9C4507] bg-[#FCE8D5] px-2 py-0.5 rounded-full">
                        Sundays only
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-[#2E7D32] bg-emerald-100 px-2 py-0.5 rounded-full">
                        Sunday Feast
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#786E65]">Deity darshan prayer</p>
                </div>
              </div>

              {/* Status Circle */}
              {isSunday ? (
                <button
                  type="button"
                  onClick={() => setDarshanAttended(!darshanAttended)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    darshanAttended
                      ? 'bg-[#2E7D32] text-white shadow-2xs'
                      : 'bg-stone-200 text-stone-400 hover:bg-stone-300'
                  }`}
                >
                  {darshanAttended ? <Check className="w-4.5 h-4.5 stroke-[2.8]" /> : <Minus className="w-4 h-4" />}
                </button>
              ) : (
                <div
                  title="Sundays only"
                  className="w-8 h-8 rounded-full bg-[#D5CDC3]/70 text-[#7D7368] flex items-center justify-center font-bold"
                >
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
            </div>

            {/* Time Filling Below the text */}
            <div className="pt-1">
              {isSunday ? (
                darshanAttended ? (
                  <TimePickerAMPM
                    value={darshanArati}
                    onChange={setDarshanArati}
                    onClear={() => setDarshanAttended(false)}
                    className="w-full justify-between py-2"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setDarshanAttended(true)}
                    className="w-full py-2.5 rounded-full border border-dashed border-stone-300 text-stone-500 text-xs font-semibold hover:bg-stone-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#DC6820]" />
                    <span>Tap to mark attended & set darshan time</span>
                  </button>
                )
              ) : (
                <div className="w-full py-2.5 px-4 rounded-full bg-[#F4EFEB]/80 border border-stone-200/50 flex items-center justify-between text-xs text-[#9E958C]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#C4B9AD]" />
                    <span>Darshan Ārati is logged on Sundays only</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#A89E95] uppercase">Weekday</span>
                </div>
              )}
            </div>
          </div>

          {/* 4. Śrīmad Bhāgavatam */}
          <div className="bg-white/90 rounded-[26px] p-4 border border-stone-200/50 shadow-xs space-y-3 transition-all">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#FFF8EE] border border-[#FBE6CC] flex items-center justify-center text-[#DC6820] shrink-0">
                  <BookOpen className="w-5 h-5 text-[#DC6820]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1B1917]">Śrīmad Bhāgavatam</h3>
                  <p className="text-[11px] text-[#786E65]">Morning class attendance</p>
                </div>
              </div>

              {/* Status Circle */}
              <button
                type="button"
                onClick={() => setSbAttended(!sbAttended)}
                title={sbAttended ? 'Attended' : 'Mark as attended'}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  sbAttended
                    ? 'bg-[#2E7D32] text-white shadow-2xs'
                    : 'bg-stone-200 text-stone-400 hover:bg-stone-300'
                }`}
              >
                {sbAttended ? <Check className="w-4.5 h-4.5 stroke-[2.8]" /> : <Minus className="w-4 h-4" />}
              </button>
            </div>

            {/* Time Filling Below the text */}
            <div className="pt-1">
              {sbAttended ? (
                <TimePickerAMPM
                  value={sbClass}
                  onChange={setSbClass}
                  onClear={() => setSbAttended(false)}
                  className="w-full justify-between py-2"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setSbAttended(true)}
                  className="w-full py-2.5 rounded-full border border-dashed border-stone-300 text-stone-500 text-xs font-semibold hover:bg-stone-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#DC6820]" />
                  <span>Tap to mark attended & set class time</span>
                </button>
              )}
            </div>
          </div>

          {/* 5. JF (Japa Finish) */}
          <div className="bg-white/90 rounded-[26px] p-4 border border-stone-200/50 shadow-xs space-y-3 transition-all">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#FFF8EE] border border-[#FBE6CC] flex items-center justify-center text-[#DC6820] shrink-0">
                  <Flag className="w-5 h-5 text-[#DC6820]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1B1917]">JF (Japa Finish)</h3>
                  <p className="text-[11px] text-[#786E65]">Time of completing your rounds</p>
                </div>
              </div>

              {/* Status Circle */}
              <button
                type="button"
                onClick={() => setJfAttended(!jfAttended)}
                title={jfAttended ? 'Attended' : 'Mark as attended'}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  jfAttended
                    ? 'bg-[#2E7D32] text-white shadow-2xs'
                    : 'bg-stone-200 text-stone-400 hover:bg-stone-300'
                }`}
              >
                {jfAttended ? <Check className="w-4.5 h-4.5 stroke-[2.8]" /> : <Minus className="w-4 h-4" />}
              </button>
            </div>

            {/* Time Filling Below the text */}
            <div className="pt-1">
              {jfAttended ? (
                <TimePickerAMPM
                  value={jfTime}
                  onChange={setJfTime}
                  onClear={() => setJfAttended(false)}
                  className="w-full justify-between py-2"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setJfAttended(true)}
                  className="w-full py-2.5 rounded-full border border-dashed border-stone-300 text-stone-500 text-xs font-semibold hover:bg-stone-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#DC6820]" />
                  <span>Tap to mark attended & set finish time</span>
                </button>
              )}
            </div>
          </div>

          {/* 6. Book Reading (With Srila Prabhupada Book Cover) */}
          <div className="bg-white/90 rounded-[26px] p-4 border border-stone-200/50 shadow-xs space-y-3.5 transition-all">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#FFF8EE] border border-[#FBE6CC] flex items-center justify-center text-[#DC6820] shrink-0">
                  <BookOpen className="w-5 h-5 text-[#DC6820]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1B1917]">Book Reading</h3>
                  <p className="text-[11px] text-[#786E65]">Time spent reading spiritual books</p>
                </div>
              </div>

              {/* Status Circle */}
              <button
                type="button"
                onClick={() => {
                  const nextState = !readingAttended;
                  setReadingAttended(nextState);
                  if (!nextState) setReadingMinutes(0);
                  else setReadingMinutes(30);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  readingAttended
                    ? 'bg-[#2E7D32] text-white shadow-2xs'
                    : 'bg-stone-200 text-stone-400 hover:bg-stone-300'
                }`}
              >
                {readingAttended ? <Check className="w-4.5 h-4.5 stroke-[2.8]" /> : <Minus className="w-4 h-4" />}
              </button>
            </div>

            {/* Filling section below text */}
            <div className="space-y-3 pt-1">
              {/* Current Book Inner Card */}
              <div
                onClick={() => {
                  closeLogModal();
                  setActiveFolkBoyTab('books');
                }}
                className="bg-[#FAF5EE] rounded-2xl p-2.5 flex items-center justify-between border border-stone-200/50 hover:bg-[#F5EFE5] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-15 rounded-lg overflow-hidden border border-amber-900/15 shadow-xs shrink-0 bg-amber-100">
                    <img
                      src={currentBookCover}
                      alt={readingState.current_book_title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8E867F] font-semibold block">
                      Current Book
                    </span>
                    <h4 className="text-xs font-bold text-[#1B1917] leading-snug">
                      {readingState.current_book_title}
                    </h4>
                    <span className="text-[10px] text-[#DC6820] font-bold">
                      Level {readingState.current_book_level}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#8E867F]" />
              </div>

              {/* Reading Duration Selector Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[0, 15, 30, 45, 60].map((mins) => {
                  const isSelected = readingAttended && readingMinutes === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setReadingAttended(mins > 0);
                        setReadingMinutes(mins);
                        setIsCustomReadingOpen(false);
                      }}
                      className={`flex-1 py-2 px-1 rounded-2xl text-xs font-bold transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'bg-[#DC6820] text-white shadow-2xs'
                          : 'bg-[#FAF7F2] border border-stone-200/60 text-[#1B1917] hover:bg-stone-100'
                      }`}
                    >
                      {mins}m
                    </button>
                  );
                })}

                {/* Custom (min) Pill */}
                <button
                  type="button"
                  onClick={() => setIsCustomReadingOpen(!isCustomReadingOpen)}
                  className={`py-2 px-3 rounded-2xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    isCustomReadingOpen || (readingMinutes !== 0 && ![15, 30, 45, 60].includes(readingMinutes))
                      ? 'bg-[#DC6820] text-white shadow-2xs'
                      : 'bg-[#FAF7F2] border border-stone-200/60 text-[#1B1917] hover:bg-stone-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Custom</span>
                </button>
              </div>

              {/* Custom Minutes Input if toggled */}
              {isCustomReadingOpen && (
                <div className="pt-1 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={customReadingInput}
                    onChange={(e) => setCustomReadingInput(e.target.value)}
                    placeholder="Enter minutes (e.g. 25)"
                    className="flex-1 px-3 py-2 text-xs bg-[#FAF7F2] rounded-xl border border-stone-200 outline-none font-semibold text-[#1B1917]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const parsed = Number(customReadingInput);
                      if (!isNaN(parsed) && parsed >= 0) {
                        setReadingMinutes(parsed);
                        setReadingAttended(parsed > 0);
                        setIsCustomReadingOpen(false);
                      }
                    }}
                    className="px-4 py-2 bg-[#DC6820] text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Set
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 7. Remarks */}
          <div className="bg-white/90 rounded-[26px] p-4 border border-stone-200/50 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FFF8EE] border border-[#FBE6CC] flex items-center justify-center text-[#DC6820]">
                <PenTool className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#1B1917]">Remarks</h3>
                <p className="text-[10px] text-[#786E65]">
                  Any reflection, realizations or notes (optional)
                </p>
              </div>
            </div>

            <div className="relative pt-1">
              <textarea
                value={remarks}
                onChange={(e) => {
                  if (e.target.value.length <= 300) {
                    setRemarks(e.target.value);
                  }
                }}
                maxLength={300}
                rows={3}
                placeholder="Write your thoughts here..."
                className="w-full p-3 text-xs bg-[#FAF7F2] rounded-2xl border border-stone-200/70 text-[#1B1917] placeholder:text-[#A89E95] outline-none resize-none focus:border-[#DC6820]"
              />
              <span className="absolute bottom-2.5 right-3 text-[10px] font-medium text-[#A89E95]">
                {remarks.length}/300
              </span>
            </div>
          </div>
        </form>

        {/* Floating Bottom Action: Exit / Cancel + Save Today's Sādhana */}
        <div className="absolute bottom-0 inset-x-0 p-3.5 bg-gradient-to-t from-[#FAF5EE] dark:from-[#181614] via-[#FAF5EE]/95 dark:via-[#181614]/95 to-transparent flex items-center gap-2 z-30">
          <button
            type="button"
            onClick={closeLogModal}
            className="h-12 px-4 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[#1B1917] dark:text-stone-200 font-bold text-xs shadow-xs hover:bg-stone-100 dark:hover:bg-stone-700 cursor-pointer active:scale-95 transition-all"
          >
            Exit
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`flex-1 h-12 rounded-full text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-[0.99] transition-all ${
              isOlderThan3Days
                ? 'bg-[#1B1917] hover:bg-stone-800 shadow-stone-900/20'
                : 'bg-[#DC6820] hover:bg-[#C95B16] shadow-amber-900/15'
            }`}
          >
            {isOlderThan3Days ? (
              <>
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Request Folk Lead Acceptance</span>
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                <span>Save Today&apos;s Sādhana</span>
              </>
            )}
          </button>
        </div>

        {/* Real-time Submission Celebration Overlay */}
        {isSubmittingSuccess && (
          <div className="absolute inset-0 z-50 bg-[#FAF5EE]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            {isOlderThan3Days ? (
              <>
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xl animate-bounce">
                    <Send className="w-9 h-9" />
                  </div>
                </div>

                <h2 className="text-xl font-black text-[#1B1917] mb-1">
                  Request Dispatched to Folk Lead!
                </h2>
                <p className="text-xs text-[#786E65] max-w-xs mb-4 leading-relaxed">
                  Your Sādhana for {selectedDateForModal} was forwarded to your Folk Lead (HG Madhav Das) for approval ({diffDays} days past). Once approved, it will be credited.
                </p>

                <div className="px-4 py-2 rounded-xl bg-amber-100 border border-amber-300 text-xs font-bold text-[#9C4507] mb-4">
                  Status: Pending Folk Lead Acceptance ⏳
                </div>

                <button
                  type="button"
                  onClick={() => {
                    closeLogModal();
                    setIsSubmittingSuccess(false);
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#1B1917] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  Close & Return
                </button>
              </>
            ) : (
              <>
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#216E39] to-[#40C463] text-white flex items-center justify-center shadow-xl animate-bounce">
                    <Check className="w-10 h-10 stroke-[3]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-xs font-black shadow-xs">
                    ✨
                  </div>
                </div>

                <h2 className="text-xl font-black text-[#1B1917] mb-1">
                  🎉 Sādhana Recorded!
                </h2>
                <p className="text-xs text-[#786E65] max-w-xs mb-4">
                  Your devotional score and GitHub Sādhana Heatmap have been updated immediately!
                </p>

                {/* Score & Heatmap Tile Showcase */}
                <div className="w-full max-w-xs p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-md space-y-2.5 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#786E65]">Points Earned</span>
                    <span className="text-base font-black text-[#216E39]">
                      {submittedScore} / 100 pts
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/90 border border-emerald-200/60 flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-[8px] bg-[#216E39] border border-[#1B592E] flex items-center justify-center text-white font-black text-sm shrink-0 shadow-xs">
                      {Math.min(10, Math.round(submittedScore / 10))}
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#216E39]">
                        GitHub Heatmap Updated ASAP!
                      </div>
                      <div className="text-[10px] text-[#59534E]">
                        {Math.min(10, Math.round(submittedScore / 10))}/10 Daily Points · Darkest Forest Green Tile
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    closeLogModal();
                    setIsSubmittingSuccess(false);
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#216E39] hover:bg-[#1B592E] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  View Updated Heatmap →
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
