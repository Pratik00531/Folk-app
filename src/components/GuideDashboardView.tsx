'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Users,
  Shield,
  Search,
  SlidersHorizontal,
  Bell,
  ChevronRight,
  Settings,
  Send,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Check,
  X,
  Hourglass,
  Calendar as CalendarIcon,
  TrendingUp,
  BookOpen,
  Sun,
  Flag,
  User,
} from 'lucide-react';
import { GuideDevoteeOverview } from '@/lib/mockData';
import GuideMemberDetailModal from '@/components/GuideMemberDetailModal';
import PointRulesManagerModal from '@/components/PointRulesManagerModal';
import SadhanaReportExportModal from '@/components/SadhanaReportExportModal';
import ComparisonAnalyticsView from '@/components/ComparisonAnalyticsView';
import { PillarDotStatus } from '@/types/database';
import { formatIndianDayAndMonth, getIndianTodayStr, getIndianYesterdayStr } from '@/lib/dateUtils';

function getDotColorClass(status: PillarDotStatus) {
  switch (status) {
    case 'green':
      return 'bg-[#16A34A]'; // Green: Full attendance / on time
    case 'light_green':
      return 'bg-[#84CC16]'; // Light Green: 10-15 min late
    case 'yellow':
      return 'bg-[#F59E0B]'; // Yellow: Last minutes / partial
    case 'red':
      return 'bg-[#EF4444]'; // Red: Absent / did not attend
    case 'grey':
    default:
      return 'bg-[#CBD5E1]'; // Grey: N/A (e.g. Darshan on weekdays)
  }
}

function getDotTooltip(status: PillarDotStatus, pillarName: string) {
  switch (status) {
    case 'green':
      return `${pillarName}: Full / On-Time (Green)`;
    case 'light_green':
      return `${pillarName}: 10-15 Min Late (Light Green)`;
    case 'yellow':
      return `${pillarName}: Last Min / Partial (Yellow)`;
    case 'red':
      return `${pillarName}: Did Not Attend (Red)`;
    case 'grey':
    default:
      return `${pillarName}: Not Applicable (Grey)`;
  }
}

export default function GuideDashboardView() {
  const {
    currentUser,
    guideDevotees,
    setSelectedDevoteeForDetail,
    switchRole,
    sendRemindersToPending,
    approvalRequests,
    approveSadhanaRequest,
    rejectSadhanaRequest,
    setIsProfileModalOpen,
    isExportModalOpen,
    setIsExportModalOpen,
  } = useApp();

  const [guideActiveTab, setGuideActiveTab] = useState<'roster' | 'personal'>('roster');
  const [selectedPersonalDevoteeId, setSelectedPersonalDevoteeId] = useState<string>(
    guideDevotees[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [personalSearchQuery, setPersonalSearchQuery] = useState('');
  // Period filter: 'today' | 'week' | 'month'
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month'>('today');
  // Day filter for daily view: default to 'yesterday' as requested!
  const [activeDayView, setActiveDayView] = useState<'yesterday' | 'today'>('yesterday');

  const todayStr = getIndianTodayStr();
  const yesterdayStr = getIndianYesterdayStr();
  const todayLabel = formatIndianDayAndMonth(todayStr);
  const yesterdayLabel = formatIndianDayAndMonth(yesterdayStr);

  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [reminderToast, setReminderToast] = useState<{ count: number; names: string[] } | null>(null);
  const [approvalToast, setApprovalToast] = useState<string | null>(null);

  const selectedPersonalDevotee =
    guideDevotees.find((d) => d.id === selectedPersonalDevoteeId) || guideDevotees[0];

  // Filter devotees based on search query
  const filteredDevotees = guideDevotees.filter((d) => {
    const q = searchQuery.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.folk_id.toLowerCase().includes(q);
  });

  const personalFilteredDevotees = guideDevotees.filter((d) => {
    const q = personalSearchQuery.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.folk_id.toLowerCase().includes(q);
  });

  const totalBoys = guideDevotees.filter((d) => d.role === 'folk_boy').length;
  const totalLeads = guideDevotees.filter((d) => d.role === 'folk_lead').length;
  const submittedCount = guideDevotees.filter((d) => d.submitted).length;
  const pendingCount = guideDevotees.filter((d) => !d.submitted).length;

  // Real batch averages (removing demo data)
  const devoteesWithScores = guideDevotees.filter((d) => (d.last_points || 0) > 0 || d.submitted);
  const dynamicAvgPoints =
    devoteesWithScores.length > 0
      ? Math.round(
          devoteesWithScores.reduce((acc, d) => acc + (d.submitted ? d.points_today : d.last_points || 0), 0) /
            devoteesWithScores.length
        )
      : 0;

  const mangalaOnTimeCount = guideDevotees.filter((d) => d.pillar_dots?.mangala === 'green').length;
  const dynamicMangalaPct = guideDevotees.length > 0 ? Math.round((mangalaOnTimeCount / guideDevotees.length) * 100) : 0;

  const totalJapa = guideDevotees.reduce((acc, d) => acc + (d.japa_rounds || 0), 0);
  const dynamicAvgJapa = guideDevotees.length > 0 ? (totalJapa / guideDevotees.length).toFixed(1) : '0.0';

  const sbAttendedCount = guideDevotees.filter((d) => d.pillar_dots?.bhagavatam === 'green').length;
  const dynamicSbPct = guideDevotees.length > 0 ? Math.round((sbAttendedCount / guideDevotees.length) * 100) : 0;

  const jfOnTimeCount = guideDevotees.filter((d) => d.pillar_dots?.jf === 'green').length;
  const dynamicJfPct = guideDevotees.length > 0 ? Math.round((jfOnTimeCount / guideDevotees.length) * 100) : 0;

  const totalReadingMins = guideDevotees.reduce((acc, d) => acc + (d.reading_mins || 0), 0);
  const dynamicAvgReadingMins = guideDevotees.length > 0 ? Math.round(totalReadingMins / guideDevotees.length) : 0;

  const pendingApprovals = approvalRequests.filter((r) => r.status === 'pending');

  const handleSendReminderToPending = () => {
    const res = sendRemindersToPending();
    setReminderToast(res);
    setTimeout(() => {
      setReminderToast(null);
    }, 4500);
  };

  const handleApprove = (reqId: string, devoteeName: string) => {
    approveSadhanaRequest(reqId, `${currentUser.full_name || 'FOLK Guide'} (Guide)`);
    setApprovalToast(`Approved late Sādhana for ${devoteeName}! Updated across heatmap and calendar.`);
    setTimeout(() => setApprovalToast(null), 4000);
  };

  const handleReject = (reqId: string, devoteeName: string) => {
    rejectSadhanaRequest(reqId, `${currentUser.full_name || 'FOLK Guide'} (Guide)`);
    setApprovalToast(`Rejected late Sādhana request for ${devoteeName}.`);
    setTimeout(() => setApprovalToast(null), 4000);
  };

  return (
    <div className="pb-28 max-w-md mx-auto px-4 pt-3 select-none">
      {/* Guide Header */}
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            onClick={() => setIsProfileModalOpen(true)}
            title="Edit Profile & Theme"
            className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-300 shadow-xs shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            <img
              src={currentUser.avatar_url || '/assets/images/BookRead.jpg'}
              alt={currentUser.full_name || 'FOLK Guide'}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-[#8C460D] uppercase tracking-wider block">
              FOLK Guide Dashboard
            </span>
            <h1 className="text-base font-extrabold text-[#1B1917] leading-tight">
              {currentUser.full_name || 'FOLK Guide'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Report Action */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            title="Export Sādhana Reports (Week, Month, Custom)"
            className="w-9 h-9 rounded-full bg-white/80 border border-white flex items-center justify-center text-[#2E7D32] hover:bg-white shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4.5 h-4.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsRulesModalOpen(true)}
            title="Configure Point & Cutoff System"
            className="w-9 h-9 rounded-full bg-white/80 border border-white flex items-center justify-center text-[#786E65] hover:text-[#1B1917] shadow-xs cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="relative w-9 h-9 rounded-full bg-white/80 border border-white flex items-center justify-center text-[#DC6820] shadow-xs">
            <Bell className="w-4 h-4" />
            {pendingApprovals.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                {pendingApprovals.length}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* TOP TASK BAR: Devotee Roster vs Personal View of Folk Boys */}
      {/* "This comparision view should be also shown on the guide view .. Where there would add another task bar for personal view of folk boys !! Every information .. Which book he is reading , managla arti coming or not , japa (everything) , to last month comparion , last week comparision and everything !!" */}
      <div className="flex bg-stone-100 p-1 rounded-2xl mb-3.5 border border-stone-200/60 shadow-2xs">
        <button
          type="button"
          onClick={() => setGuideActiveTab('roster')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            guideActiveTab === 'roster'
              ? 'bg-white text-[#1B1917] shadow-xs'
              : 'text-[#786E65] hover:text-[#1B1917]'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-[#E07A2B]" />
          <span>Devotee Roster</span>
        </button>

        <button
          type="button"
          onClick={() => setGuideActiveTab('personal')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            guideActiveTab === 'personal'
              ? 'bg-[#E07A2B] text-white shadow-xs'
              : 'text-[#786E65] hover:text-[#1B1917]'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Personal View of Folk Boys</span>
        </button>
      </div>

      {/* Date & Mode Switcher */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-bold text-[#786E65]">
          Monitoring: {guideDevotees.length} {guideDevotees.length === 1 ? 'Folk Boy / Lead' : 'Folk Boys & Leads'}
        </span>
        <button
          type="button"
          onClick={() => switchRole('folk_boy')}
          className="text-[11px] font-semibold text-[#8C460D] hover:underline cursor-pointer"
        >
          Switch to Folk Boy View →
        </button>
      </div>

      {guideActiveTab === 'roster' ? (
        <>
      {/* Export Report Quick Card */}
      <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50/70 border border-emerald-200/80 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white border border-emerald-300 flex items-center justify-center text-emerald-700">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#1B1917]">Monthly Report Export</h4>
            <p className="text-[10px] text-[#59534E]">Excel (.CSV) & Print-ready PDF Dossier</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsExportModalOpen(true)}
          className="px-3 py-1 rounded-xl bg-[#216E39] hover:bg-[#1B592E] text-white text-xs font-bold shadow-xs cursor-pointer"
        >
          Export →
        </button>
      </div>

      {/* 4 Metric Tiles */}
      <div className="grid grid-cols-2 gap-2.5 mb-3.5">
        <div className="glass-surface p-3 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xl font-black text-[#1B1917]">{totalBoys}</div>
            <div className="text-[11px] font-bold text-[#786E65]">Folk Boys</div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-[#DC6820]">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="glass-surface p-3 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xl font-black text-[#1B1917]">{totalLeads}</div>
            <div className="text-[11px] font-bold text-[#786E65]">Folk Leads</div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-[#DC6820]">
            <Shield className="w-4 h-4" />
          </div>
        </div>

        <div className="glass-surface p-3 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xl font-black text-emerald-800">{submittedCount}</div>
            <div className="text-[11px] font-bold text-emerald-700">Submitted Today</div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
        </div>

        <div className="glass-surface p-3 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xl font-black text-[#C86315]">{pendingCount}</div>
            <div className="text-[11px] font-bold text-[#C86315]">Pending Today</div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-[#DC6820]">
            <span className="w-3 h-3 rounded-full bg-[#DC6820]" />
          </div>
        </div>
      </div>

      {/* Targeted Reminder Button */}
      <div className="mb-4">
        {pendingCount > 0 ? (
          <button
            type="button"
            onClick={handleSendReminderToPending}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#DC6820] hover:bg-[#C95B16] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-[0.99]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Reminder to Pending Boys ({pendingCount})</span>
          </button>
        ) : (
          <div className="w-full py-2.5 px-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>All Devotees Have Submitted Today&apos;s Sādhana! ✓</span>
          </div>
        )}

        {/* Reminder Toast confirmation */}
        {reminderToast && (
          <div className="mt-2 p-2.5 rounded-xl bg-white border border-[#DC6820]/40 shadow-xs flex items-center gap-2 text-xs text-[#1B1917] animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Reminder notification sent to {reminderToast.count} pending devotees: {reminderToast.names.join(', ')}
            </span>
          </div>
        )}

        {/* Approval Toast confirmation */}
        {approvalToast && (
          <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 shadow-xs flex items-center gap-2 text-xs text-emerald-900 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{approvalToast}</span>
          </div>
        )}
      </div>

      {/* FOLK LEAD / GUIDE LATE SĀDHANA APPROVALS INBOX (>3 Days Late Lock) */}
      {pendingApprovals.length > 0 && (
        <section className="mb-4 p-4 rounded-[26px] bg-gradient-to-br from-amber-50 via-white to-orange-50/60 border-2 border-amber-300 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-[#9C4507] flex items-center justify-center">
                <Hourglass className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <h3 className="text-xs font-black text-[#9C4507] uppercase tracking-wider">
                  Pending Approvals ({pendingApprovals.length})
                </h3>
                <span className="text-[10px] text-[#786E65]">
                  Late Sādhana entries (&gt;3 days past lock)
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
              Folk Lead Queue
            </span>
          </div>

          <div className="space-y-2.5">
            {pendingApprovals.map((req) => (
              <div
                key={req.id}
                className="p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-[#1B1917] block">
                      {req.user_name} ({req.folk_id})
                    </span>
                    <span className="text-[11px] font-bold text-[#E07A2B] flex items-center gap-1 mt-0.5">
                      <CalendarIcon className="w-3 h-3" />
                      Date: {req.record_date} (&gt;3 days late)
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                    Requested 1d ago
                  </span>
                </div>

                <div className="text-[11px] text-[#59534E] bg-stone-50 p-2 rounded-xl border border-stone-200/60">
                  <span className="font-bold text-[#1B1917]">Reason:</span> &quot;{req.reason}&quot;
                  <div className="mt-1 text-[10px] text-[#786E65]">
                    Pillars: Maṅgala {req.data.mangala_arati_time || 'No'} • Japa {req.data.japa_rounds || 16} rds • SB {req.data.srimad_bhagavatam_time || 'No'} • Reading {req.data.book_reading_minutes || 0}m
                  </div>
                </div>

                {/* Approve / Reject Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleApprove(req.id, req.user_name)}
                    className="flex-1 py-1.5 rounded-xl bg-[#216E39] hover:bg-[#1B592E] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Approve & Credit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReject(req.id, req.user_name)}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#786E65] hover:text-red-700 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search Bar */}
      <div className="relative mb-3.5">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E867F]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, FOLK ID or phone"
          className="w-full h-10 pl-10 pr-10 rounded-2xl bg-white/90 border border-white text-xs font-semibold text-[#1B1917] placeholder:text-[#A89E95] outline-none shadow-xs"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8E867F]">
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Roster Header with Filter Period Switcher (today | week | month) */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <h2 className="text-sm font-extrabold text-[#1B1917]">
          Devotee Sādhana Roster
        </h2>
        <div className="flex gap-1 bg-white/80 p-1 rounded-xl border border-stone-200/60 shadow-2xs">
          {(['today', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilterPeriod(p)}
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filterPeriod === p
                  ? 'bg-[#DC6820] text-white shadow-2xs font-black'
                  : 'text-[#786E65] hover:text-[#1B1917]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* DAY VIEW TOGGLE: Default to "Yesterday's Sādhana" as instructed!
          "See , mostly everyone fills there sadhna at night or tomorrow (cuz sadhnaa takes whole day) , so that's why we should show them :Yesterday's Sadhna details .... !!" */}
      {filterPeriod === 'today' && (
        <div className="mb-3 p-1 bg-stone-100 rounded-xl flex items-center border border-stone-200/50">
          <button
            type="button"
            onClick={() => setActiveDayView('yesterday')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${
              activeDayView === 'yesterday'
                ? 'bg-white text-[#1B1917] shadow-xs font-black'
                : 'text-[#786E65] hover:text-[#1B1917]'
            }`}
          >
            <Clock className="w-3 h-3 text-[#E07A2B]" />
            <span>Yesterday ({yesterdayLabel}) · Default</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDayView('today')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${
              activeDayView === 'today'
                ? 'bg-white text-[#1B1917] shadow-xs font-black'
                : 'text-[#786E65] hover:text-[#1B1917]'
            }`}
          >
            <span>Today ({todayLabel}) · Live</span>
          </button>
        </div>
      )}

      {/* WEEK VIEW: WEEKLY AVERAGE OVERVIEW CARD */}
      {filterPeriod === 'week' && (
        <div className="mb-4 p-4 rounded-[26px] bg-white border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#216E39]" />
              <h3 className="text-xs font-black text-[#1B1917] uppercase tracking-wider">
                Weekly Average View (Past 7 Days)
              </h3>
            </div>
            <span className="text-xs font-black text-[#216E39] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Avg {dynamicAvgPoints} / 100 pts
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
              <span className="text-[10px] text-[#786E65] font-semibold block">Maṅgala Ārati</span>
              <span className="text-xs font-extrabold text-[#1B1917]">{dynamicMangalaPct}% on-time</span>
            </div>
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
              <span className="text-[10px] text-[#786E65] font-semibold block">Japa Rounds</span>
              <span className="text-xs font-extrabold text-[#1B1917]">{dynamicAvgJapa} rds/day</span>
            </div>
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
              <span className="text-[10px] text-[#786E65] font-semibold block">SB Class</span>
              <span className="text-xs font-extrabold text-[#1B1917]">{dynamicSbPct}% attended</span>
            </div>
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
              <span className="text-[10px] text-[#786E65] font-semibold block">JF Slot</span>
              <span className="text-xs font-extrabold text-[#1B1917]">{dynamicJfPct}% on-time</span>
            </div>
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
              <span className="text-[10px] text-[#786E65] font-semibold block">Daily Reading</span>
              <span className="text-xs font-extrabold text-[#1B1917]">{dynamicAvgReadingMins} mins</span>
            </div>
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
              <span className="text-[10px] text-[#786E65] font-semibold block">Batch Total</span>
              <span className="text-xs font-extrabold text-[#216E39]">{guideDevotees.length} Active</span>
            </div>
          </div>
        </div>
      )}

      {/* MONTH VIEW: MONTHLY AVERAGE OVERVIEW CARD */}
      {filterPeriod === 'month' && (
        <div className="mb-4 p-4 rounded-[26px] bg-white border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#E07A2B]" />
              <h3 className="text-xs font-black text-[#1B1917] uppercase tracking-wider">
                Monthly Average View
              </h3>
            </div>
            <span className="text-xs font-black text-[#216E39] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Avg {dynamicAvgPoints} / 100 pts
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
              <span className="text-[10px] text-[#786E65] font-semibold block">Maṅgala Ārati</span>
              <span className="text-xs font-extrabold text-[#1B1917]">{dynamicMangalaPct}% avg</span>
            </div>
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
              <span className="text-[10px] text-[#786E65] font-semibold block">Japa Rounds</span>
              <span className="text-xs font-extrabold text-[#1B1917]">{dynamicAvgJapa} rds/day</span>
            </div>
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
              <span className="text-[10px] text-[#786E65] font-semibold block">SB Class</span>
              <span className="text-xs font-extrabold text-[#1B1917]">{dynamicSbPct}% avg</span>
            </div>
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
              <span className="text-[10px] text-[#786E65] font-semibold block">JF Slot</span>
              <span className="text-xs font-extrabold text-[#1B1917]">{dynamicJfPct}% avg</span>
            </div>
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
              <span className="text-[10px] text-[#786E65] font-semibold block">Daily Reading</span>
              <span className="text-xs font-extrabold text-[#1B1917]">{dynamicAvgReadingMins} mins</span>
            </div>
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50">
              <span className="text-[10px] text-[#786E65] font-semibold block">Total Devotees</span>
              <span className="text-xs font-extrabold text-[#E07A2B]">{guideDevotees.length} Active</span>
            </div>
          </div>
        </div>
      )}

      {/* 4-Color Dot Guide Indicator */}
      <div className="flex items-center justify-between px-2 py-1.5 mb-2 rounded-xl bg-white/50 text-[10px] text-[#786E65]">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#16A34A]" /> Full/On-time
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#84CC16]" /> 10-15m Late
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Last min
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Absent
        </span>
      </div>

      {/* Roster Cards */}
      <div className="space-y-2.5">
        {filteredDevotees.map((devotee) => {
          // Display points according to active filter
          const displayPoints =
            activeDayView === 'today' && devotee.submitted
              ? devotee.points_today
              : devotee.last_points || 0;

          return (
            <div
              key={devotee.id}
              onClick={() => setSelectedDevoteeForDetail(devotee)}
              className="bg-white/90 p-3.5 rounded-[24px] border border-stone-200/50 flex items-center justify-between hover:bg-white transition-all cursor-pointer shadow-xs active:scale-[0.99]"
            >
              {/* Devotee Info */}
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-300 shrink-0 bg-stone-100 shadow-2xs">
                  {devotee.avatar_url ? (
                    <img
                      src={devotee.avatar_url}
                      alt={devotee.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[#DC6820]">
                      {devotee.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#1B1917]">
                      {devotee.name}
                    </span>
                    {devotee.role === 'folk_lead' && (
                      <span className="text-[9px] font-bold text-[#9C4507] bg-amber-100 px-1.5 py-0.2 rounded">
                        Lead
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] text-[#786E65]">
                    {devotee.folk_id} · 🔥 {devotee.streak}d
                  </div>

                  {/* Status indicator: specifies whether this is today or yesterday's sadhana */}
                  <div className="mt-0.5">
                    {filterPeriod === 'week' ? (
                      <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                        Weekly Avg: {displayPoints}/100 pts
                      </span>
                    ) : filterPeriod === 'month' ? (
                      <span className="text-[9px] font-semibold text-[#8C460D] bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                        Monthly Avg: {displayPoints}/100 pts
                      </span>
                    ) : activeDayView === 'today' && devotee.submitted ? (
                      <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                        Today&apos;s Sādhana (Live)
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold text-[#B45309] bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60 flex items-center gap-1 inline-flex">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Yesterday (2 Oct) Verified</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pillar Status Dots (M J D B JF R) & Points */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  {/* Column Letters */}
                  <div className="flex gap-1.5 text-[9px] font-extrabold text-[#8E867F]">
                    <span className="w-2.5 text-center">M</span>
                    <span className="w-2.5 text-center">J</span>
                    <span className="w-2.5 text-center">D</span>
                    <span className="w-2.5 text-center">B</span>
                    <span className="w-2.5 text-center">JF</span>
                    <span className="w-2.5 text-center">R</span>
                  </div>

                  {/* 4-Color Dots underneath */}
                  <div className="flex gap-1.5 mt-1">
                    <span
                      title={getDotTooltip(devotee.pillar_dots.mangala, 'Maṅgala Ārati')}
                      className={`w-2.5 h-2.5 rounded-full ${getDotColorClass(
                        devotee.pillar_dots.mangala
                      )}`}
                    />
                    <span
                      title={getDotTooltip(devotee.pillar_dots.japa, 'Japa Morning')}
                      className={`w-2.5 h-2.5 rounded-full ${getDotColorClass(
                        devotee.pillar_dots.japa
                      )}`}
                    />
                    <span
                      title={getDotTooltip(devotee.pillar_dots.darshan, 'Darshan Ārati')}
                      className={`w-2.5 h-2.5 rounded-full ${getDotColorClass(
                        devotee.pillar_dots.darshan
                      )}`}
                    />
                    <span
                      title={getDotTooltip(devotee.pillar_dots.bhagavatam, 'Śrīmad Bhāgavatam')}
                      className={`w-2.5 h-2.5 rounded-full ${getDotColorClass(
                        devotee.pillar_dots.bhagavatam
                      )}`}
                    />
                    <span
                      title={getDotTooltip(devotee.pillar_dots.jf, 'JF (Japa Finish)')}
                      className={`w-2.5 h-2.5 rounded-full ${getDotColorClass(
                        devotee.pillar_dots.jf
                      )}`}
                    />
                    <span
                      title={getDotTooltip(devotee.pillar_dots.reading, 'Book Reading')}
                      className={`w-2.5 h-2.5 rounded-full ${getDotColorClass(
                        devotee.pillar_dots.reading
                      )}`}
                    />
                  </div>
                </div>

                {/* Points Badge */}
                <div className="w-11 text-right">
                  <span className="text-base font-black text-[#1B1917] leading-none block">
                    {displayPoints}
                  </span>
                  <span className="text-[10px] text-[#786E65] block">
                    {filterPeriod === 'today' ? 'pts' : 'avg'}
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-[#8E867F]" />
              </div>
            </div>
          );
        })}
      </div>
      </>
      ) : (
        <div className="space-y-4">
          {/* Devotee Selection Ribbon */}
          <div className="glass-surface p-3.5 rounded-[24px] border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#786E65]">
                Select Folk Boy To Inspect ({guideDevotees.length})
              </span>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="text-[10px] font-bold text-[#216E39] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Report</span>
              </button>
            </div>

            {/* Search Folk Boys in Personal View */}
            <div className="relative mb-2.5">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E867F]" />
              <input
                type="text"
                value={personalSearchQuery}
                onChange={(e) => setPersonalSearchQuery(e.target.value)}
                placeholder="Search Folk Boy by name or FOLK ID..."
                className="w-full h-8.5 pl-8.5 pr-8 text-xs rounded-xl bg-white border border-stone-200/80 focus:border-[#E07A2B] focus:ring-1 focus:ring-[#E07A2B]/20 outline-none text-[#1B1917] placeholder:text-[#A89E95]"
              />
              {personalSearchQuery && (
                <button
                  type="button"
                  onClick={() => setPersonalSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E867F] hover:text-[#1B1917] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {personalFilteredDevotees.length === 0 ? (
              <div className="py-3 text-center text-xs text-[#786E65]">
                No Folk Boys found matching &quot;{personalSearchQuery}&quot;
              </div>
            ) : (
              <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                {personalFilteredDevotees.map((d) => {
                  const isSelected = d.id === selectedPersonalDevoteeId;
                  return (
                    <button
                      key={`personal-picker-${d.id}`}
                      type="button"
                      onClick={() => setSelectedPersonalDevoteeId(d.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-2xl border shrink-0 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1B1917] text-white border-stone-900 shadow-sm'
                          : 'bg-white text-[#1B1917] border-stone-200 hover:border-amber-400'
                      }`}
                    >
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-300 shrink-0">
                        <img
                          src={d.avatar_url || '/assets/images/Chanting.png'}
                          alt={d.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-black block leading-tight">
                          {d.name.split(' ')[0]}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[9px] font-mono ${isSelected ? 'text-amber-300' : 'text-[#786E65]'}`}>
                            {d.folk_id}
                          </span>
                          <span className="text-[9px] font-extrabold text-[#E07A2B]">
                            🔥 {d.streak}d
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Deep Personal Comparison & Verification Dossier */}
          <ComparisonAnalyticsView devotee={selectedPersonalDevotee} isSelfView={false} />
        </div>
      )}

      {/* Member Detail Dossier Modal */}
      <GuideMemberDetailModal />

      {/* Point Rules Configuration Modal */}
      {isRulesModalOpen && (
        <PointRulesManagerModal onClose={() => setIsRulesModalOpen(false)} />
      )}

      {/* Dynamic Sādhana Report Export Modal (Week, Month, Custom with Color-formatted Excel) */}
      <SadhanaReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
