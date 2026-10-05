'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  Shield,
  Flame,
  Clock,
  BookOpen,
  Sun,
  CheckCircle2,
  Send,
  UserCheck,
  UserMinus,
  Sparkles,
  KeyRound,
  Lock,
} from 'lucide-react';
import { apiGuideResetDevoteePassword } from '@/lib/supabaseService';

export default function GuideMemberDetailModal() {
  const { selectedDevoteeForDetail, setSelectedDevoteeForDetail, toggleLeadRole } = useApp();
  const [reminderSent, setReminderSent] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newTempPassword, setNewTempPassword] = useState('HareKrishna@108');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  if (!selectedDevoteeForDetail) return null;

  const devotee = selectedDevoteeForDetail;
  const isLead = devotee.role === 'folk_lead';

  const handleSendReminder = () => {
    setReminderSent(true);
    setTimeout(() => setReminderSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#FAF8F5] border border-white/80 rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E8E2D8] flex items-center justify-between bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-[#E07A2B]" />
            <h2 className="text-base font-bold text-[#1B1917]">
              Devotee Sādhana Dossier
            </h2>
          </div>
          <button
            onClick={() => setSelectedDevoteeForDetail(null)}
            className="w-8 h-8 rounded-full bg-white/80 border border-white flex items-center justify-center text-[#786E65] hover:text-[#1B1917] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Profile Overview Card */}
          <div className="glass-surface p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-300 shrink-0 bg-stone-100">
                {devotee.avatar_url ? (
                  <img
                    src={devotee.avatar_url}
                    alt={devotee.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-sm text-[#E07A2B]">
                    {devotee.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-[#1B1917]">
                    {devotee.name}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isLead
                        ? 'bg-amber-100 text-[#9C4507] border border-amber-300'
                        : 'bg-stone-100 text-[#786E65]'
                    }`}
                  >
                    {isLead ? 'Folk Lead' : 'Folk Boy'}
                  </span>
                </div>
                <p className="text-xs text-[#786E65]">
                  {devotee.folk_id} · Last active: {devotee.last_submitted_date}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-black text-[#E07A2B]">
                🔥 {devotee.streak}d
              </div>
              <div className="text-[10px] text-[#786E65]">Streak</div>
            </div>
          </div>

          {/* Today's Activities Breakdown */}
          <div className="glass-surface p-4.5 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200/50">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1B1917]">
                Today's Sādhana Breakdown
              </h4>
              <span className="text-xs font-black text-[#2E7D32]">
                {devotee.points_today} points
              </span>
            </div>

            {/* Maṅgala */}
            <div className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2 text-[#59534E]">
                <Sun className="w-4 h-4 text-[#E07A2B]" />
                <span className="font-semibold">Maṅgala Ārati</span>
              </div>
              <span className="font-bold text-[#1B1917]">
                {devotee.mangala_time || 'Not attended'}
              </span>
            </div>

            {/* Japa Hall Timing & Rounds */}
            <div className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2 text-[#59534E]">
                <Clock className="w-4 h-4 text-[#E07A2B]" />
                <span className="font-semibold">Morning Japa (Hall Presence)</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#1B1917] block">
                  {devotee.japa_arrival
                    ? `${devotee.japa_arrival} → ${devotee.japa_leaving}`
                    : 'Missed'}
                </span>
                <span className="text-[10px] text-[#E07A2B] font-bold">
                  {devotee.japa_rounds} rounds completed
                </span>
              </div>
            </div>

            {/* Śrīmad Bhāgavatam */}
            <div className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2 text-[#59534E]">
                <BookOpen className="w-4 h-4 text-[#E07A2B]" />
                <span className="font-semibold">Śrīmad Bhāgavatam</span>
              </div>
              <span className="font-bold text-[#1B1917]">
                {devotee.bhagavatam_time || 'Not attended'}
              </span>
            </div>

            {/* JF */}
            <div className="flex items-center justify-between text-xs py-1">
              <span className="font-semibold text-[#59534E] ml-6">
                JF (Japa Finish)
              </span>
              <span className="font-bold text-[#1B1917]">
                {devotee.jf_time || '—'}
              </span>
            </div>

            {/* Book Reading */}
            <div className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2 text-[#59534E]">
                <BookOpen className="w-4 h-4 text-[#E07A2B]" />
                <span className="font-semibold">Reading Duration</span>
              </div>
              <span className="font-bold text-[#1B1917]">
                {devotee.reading_mins} minutes
              </span>
            </div>
          </div>

          {/* Current Book & Study Details */}
          <div className="glass-surface p-4.5 rounded-2xl space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1B1917] mb-2">
              Current Reading Progress
            </h4>
            <div className="p-3 rounded-xl bg-white/80 border border-stone-200/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#8C460D] bg-amber-100 px-1.5 py-0.5 rounded uppercase">
                  Level {devotee.current_book_level}
                </span>
                <div className="text-xs font-bold text-[#1B1917] mt-1">
                  {devotee.current_book}
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-[#1B1917]">
                  {devotee.total_reading_hours} hrs
                </span>
                <span className="text-[10px] text-[#786E65] block">accumulated</span>
              </div>
            </div>
          </div>

          {/* Guide Administration Actions */}
          <div className="pt-2 space-y-2">
            {/* Toggle Lead Status */}
            <button
              onClick={() => {
                toggleLeadRole(devotee.id);
                setSelectedDevoteeForDetail({
                  ...devotee,
                  role: isLead ? 'folk_boy' : 'folk_lead',
                });
              }}
              className="w-full h-11 rounded-2xl bg-white/90 hover:bg-white border border-stone-200/80 text-xs font-bold text-[#1B1917] flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
            >
              {isLead ? (
                <>
                  <UserMinus className="w-4 h-4 text-[#C86315]" />
                  <span>Remove Lead Privileges</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-[#E07A2B]" />
                  <span>Promote to FOLK Lead</span>
                </>
              )}
            </button>

            {/* Reset Devotee Password (For Guide Admin) */}
            <button
              onClick={() => {
                setShowResetPassword(!showResetPassword);
                setResetSuccess(null);
                setResetError(null);
              }}
              className="w-full h-11 rounded-2xl bg-white/90 hover:bg-white border border-stone-200/80 text-xs font-bold text-[#1B1917] flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
            >
              <KeyRound className="w-4 h-4 text-[#E07A2B]" />
              <span>{showResetPassword ? 'Hide Password Reset' : 'Reset Devotee Password'}</span>
            </button>

            {showResetPassword && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2.5 animate-in fade-in duration-150">
                <div className="text-[11px] font-bold text-[#8C460D] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#E07A2B]" />
                  <span>Set New Password for {devotee.name}</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={newTempPassword}
                    onChange={(e) => setNewTempPassword(e.target.value)}
                    placeholder="Enter new temporary password"
                    className="w-full h-10 px-3 rounded-xl bg-white border border-amber-200 text-xs font-mono font-bold text-[#1B1917] outline-none"
                  />
                </div>
                {resetSuccess && (
                  <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                    {resetSuccess}
                  </div>
                )}
                {resetError && (
                  <div className="text-[11px] font-bold text-red-700 bg-red-50 p-2 rounded-xl border border-red-200">
                    {resetError}
                  </div>
                )}
                <button
                  type="button"
                  disabled={resetting || newTempPassword.length < 6}
                  onClick={async () => {
                    setResetting(true);
                    setResetError(null);
                    setResetSuccess(null);
                    const { error } = await apiGuideResetDevoteePassword(devotee.id, newTempPassword);
                    setResetting(false);
                    if (error) {
                      setResetError((error as any)?.message || 'Could not reset password. Ensure the stored procedure is deployed.');
                    } else {
                      setResetSuccess(`Password reset to "${newTempPassword}". Please inform ${devotee.name}.`);
                    }
                  }}
                  className="w-full h-9 rounded-xl bg-[#1B1917] text-white text-xs font-bold flex items-center justify-center cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                >
                  {resetting ? 'Saving...' : 'Confirm Password Reset'}
                </button>
              </div>
            )}

            {/* Send Personalized Reminder */}
            <button
              onClick={handleSendReminder}
              disabled={reminderSent}
              className="w-full h-12 rounded-2xl saffron-gradient-btn text-xs font-bold text-white flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-[0.99] transition-all"
            >
              <Send className="w-4 h-4" />
              <span>
                {reminderSent
                  ? 'Personalized Reminder Sent!'
                  : 'Send Personalized Reminder to Fill Sādhana'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
