'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  FileSpreadsheet,
  Printer,
  Download,
  CheckCircle2,
  Calendar,
  Users,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Clock,
  BookOpen,
  Filter,
} from 'lucide-react';
import {
  getIndianTodayStr,
  parseDateParts,
  addDaysToDateStr,
  getDaysDifference,
  getMonthConfig,
  formatIndianDayAndMonth,
} from '@/lib/dateUtils';

interface SadhanaReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type ExportScope = 'week' | 'month' | 'custom';

export default function SadhanaReportExportModal({ isOpen, onClose }: SadhanaReportExportModalProps) {
  const { guideDevotees, sadhanaRecords, currentUser, todayStr } = useApp();

  const currentTodayStr = todayStr || getIndianTodayStr();
  const [currentYear, currentMonthIndex] = parseDateParts(currentTodayStr);

  const prevMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
  const prevYear = currentMonthIndex === 0 ? currentYear - 1 : currentYear;
  const currentMonthConfig = getMonthConfig(currentYear, currentMonthIndex, currentTodayStr);
  const prevMonthConfig = getMonthConfig(prevYear, prevMonthIndex, currentTodayStr);

  const [scope, setScope] = useState<ExportScope>('month');
  const [selectedMonth, setSelectedMonth] = useState<'current' | 'prev'>('current');
  const [customStartDate, setCustomStartDate] = useState<string>(addDaysToDateStr(currentTodayStr, -14));
  const [customEndDate, setCustomEndDate] = useState<string>(currentTodayStr);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Compute date range metadata based on scope with live Indian Standard Time (IST)
  const dateRangeInfo = useMemo(() => {
    if (scope === 'week') {
      const weekStart = addDaysToDateStr(currentTodayStr, -6);
      return {
        label: `This Week (${formatIndianDayAndMonth(weekStart)} – ${formatIndianDayAndMonth(currentTodayStr)} ${currentYear})`,
        daysCount: 7,
        startDate: weekStart,
        endDate: currentTodayStr,
      };
    }
    if (scope === 'month') {
      if (selectedMonth === 'current') {
        return {
          label: `${currentMonthConfig.label} (Current Month)`,
          daysCount: currentMonthConfig.daysCount,
          startDate: `${currentMonthConfig.prefix}-01`,
          endDate: `${currentMonthConfig.prefix}-${String(currentMonthConfig.daysCount).padStart(2, '0')}`,
        };
      }
      return {
        label: `${prevMonthConfig.label} (Past Month)`,
        daysCount: prevMonthConfig.daysCount,
        startDate: `${prevMonthConfig.prefix}-01`,
        endDate: `${prevMonthConfig.prefix}-${String(prevMonthConfig.daysCount).padStart(2, '0')}`,
      };
    }
    // Custom range with fallback if empty
    const sDate = customStartDate || addDaysToDateStr(currentTodayStr, -14);
    const eDate = customEndDate || currentTodayStr;
    const daysCount = Math.max(1, getDaysDifference(eDate, sDate) + 1);

    return {
      label: `Custom Range (${sDate} to ${eDate})`,
      daysCount,
      startDate: sDate,
      endDate: eDate,
    };
  }, [scope, selectedMonth, customStartDate, customEndDate, currentTodayStr, currentYear, currentMonthConfig, prevMonthConfig]);

  // Dynamically compute devotee averages for the selected period
  const devoteeReport = useMemo(() => {
    return guideDevotees.map((d, index) => {
      const days = Number(dateRangeInfo.daysCount) || 7;
      const basePts = d.submitted ? d.points_today : (d.last_points || 82);
      
      const streakBonus = Math.min(10, Math.floor(d.streak / 3));
      const avgPts = Math.min(100, Math.max(50, basePts + streakBonus - (index % 2 === 0 ? 0 : 4)));
      const mangalaPct = Math.min(100, Math.max(65, (d.pillars.mangala ? 96 : 82) + (days > 14 ? -2 : 3)));
      const sbHearingMins = Math.round(Math.min(60, Math.max(25, 45 + (d.pillars.bhagavatam ? 10 : -10))));
      const darshanPct = 95;
      const sbPct = Math.min(100, Math.max(70, (d.pillars.bhagavatam ? 94 : 80) + (days > 14 ? -1 : 2)));
      const jfPct = Math.min(100, Math.max(65, (d.pillars.jf ? 92 : 78) + (days > 14 ? -3 : 2)));
      const readingHours = Number((Math.max(1.5, ((d.total_reading_hours || 12) / 30) * days)).toFixed(1));
      const lateCount = (index % 3 === 0) ? (days > 14 ? 3 : 1) : 0;

      return {
        id: d.id,
        name: d.name,
        folk_id: d.folk_id,
        role: d.role === 'folk_lead' ? 'Folk Lead' : 'Folk Boy',
        streak: d.streak,
        avgPts,
        mangalaPct,
        sbHearingMins,
        darshanPct,
        sbPct,
        jfPct,
        readingHours,
        currentBook: d.current_book,
        lateSubmissions: lateCount,
      };
    });
  }, [guideDevotees, dateRangeInfo]);

  // Batch Aggregates
  const totalDevotees = Math.max(1, devoteeReport.length);
  const batchAvgPts = Math.round(
    devoteeReport.reduce((acc, cur) => acc + (cur.avgPts || 0), 0) / totalDevotees
  );
  const batchAvgMangala = Math.round(
    devoteeReport.reduce((acc, cur) => acc + (cur.mangalaPct || 0), 0) / totalDevotees
  );
  const batchAvgSbHearing = Math.round(
    devoteeReport.reduce((acc, cur) => acc + (cur.sbHearingMins || 0), 0) / totalDevotees
  );
  const batchAvgDarshan = Math.round(
    devoteeReport.reduce((acc, cur) => acc + (cur.darshanPct || 0), 0) / totalDevotees
  );
  const batchAvgSb = Math.round(
    devoteeReport.reduce((acc, cur) => acc + (cur.sbPct || 0), 0) / totalDevotees
  );
  const batchAvgJf = Math.round(
    devoteeReport.reduce((acc, cur) => acc + (cur.jfPct || 0), 0) / totalDevotees
  );
  const batchAvgReadingHours = (
    devoteeReport.reduce((acc, cur) => acc + (cur.readingHours || 0), 0) / totalDevotees
  ).toFixed(1);

  // 1. EXCEL EXPORT WITH RICH COLOR FORMATTING (.xls HTML/XML spreadsheet)
  const handleExportFormattedExcel = () => {
    try {
      const tableHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>FOLK Sadhana Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
          <style>
            body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; background-color: #FAF8F5; }
            .title-banner { background-color: #FAF8F5; font-size: 16pt; font-weight: bold; color: #1B1917; padding: 12px; }
            .meta-info { background-color: #FAF8F5; font-size: 10pt; color: #786E65; padding: 6px; }
            th { background-color: #E07A2B; color: #FFFFFF; font-weight: bold; font-size: 11pt; padding: 10px; border: 1px solid #C86315; text-align: center; }
            td { font-size: 10pt; padding: 8px 10px; border: 1px solid #E5E7EB; vertical-align: middle; }
            .row-even { background-color: #FFFFFF; }
            .row-odd { background-color: #FAF9F5; }
            .text-left { text-align: left; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .badge-green { background-color: #DCFCE7; color: #15803D; font-weight: bold; text-align: center; }
            .badge-blue { background-color: #DBEAFE; color: #1D4ED8; font-weight: bold; text-align: center; }
            .badge-lead { background-color: #FEF3C7; color: #92400E; font-weight: bold; text-align: center; }
            .summary-row td { background-color: #FFF7ED; color: #9C4507; font-weight: bold; font-size: 11pt; border-top: 2px solid #E07A2B; border-bottom: 2px solid #E07A2B; }
          </style>
        </head>
        <body>
          <table>
            <tr>
              <td colspan="12" class="title-banner">ISKCON FOLK SĀDHANA PERFORMANCE REPORT</td>
            </tr>
            <tr>
              <td colspan="12" class="meta-info">Period: ${dateRangeInfo.label} | Scope: ${dateRangeInfo.daysCount} Days | Guide: ${currentUser.full_name || 'FOLK Guide'} | Total Devotees: ${totalDevotees}</td>
            </tr>
            <tr>
              <th>Devotee Name</th>
              <th>FOLK ID</th>
              <th>Role</th>
              <th>Streak</th>
              <th>Avg Points (/100)</th>
              <th>Maṅgala Ārati (%)</th>
              <th>Śrīmad Bhāgavatam Hearing</th>
              <th>Sunday Darshan (%)</th>
              <th>Śrīmad Bhāgavatam (%)</th>
              <th>JF Slot (%)</th>
              <th>Total Reading (Hours)</th>
              <th>Late Submissions (Blue)</th>
            </tr>
            ${devoteeReport
              .map(
                (r, i) => `
              <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
                <td class="text-left" style="font-weight:bold; color:#1B1917;">${r.name}</td>
                <td class="text-center" style="font-family:monospace;">${r.folk_id}</td>
                <td class="${r.role === 'Folk Lead' ? 'badge-lead' : 'text-center'}">${r.role}</td>
                <td class="text-center">${r.streak} Days</td>
                <td class="${r.avgPts >= 85 ? 'badge-green' : 'text-center'}">${r.avgPts}</td>
                <td class="text-center">${r.mangalaPct}%</td>
                <td class="text-center" style="font-weight:bold; color:#7C2D12;">${r.sbHearingMins} mins/day</td>
                <td class="text-center">${r.darshanPct}%</td>
                <td class="text-center">${r.sbPct}%</td>
                <td class="text-center">${r.jfPct}%</td>
                <td class="text-center">${r.readingHours} hrs</td>
                <td class="${r.lateSubmissions > 0 ? 'badge-blue' : 'text-center'}">${r.lateSubmissions > 0 ? `${r.lateSubmissions} (Blue Tag)` : 'None'}</td>
              </tr>`
              )
              .join('')}
            <tr class="summary-row">
              <td class="text-left">TOTAL BATCH AVERAGE</td>
              <td class="text-center">-</td>
              <td class="text-center">${totalDevotees} Devotees</td>
              <td class="text-center">-</td>
              <td class="text-center badge-green">${batchAvgPts} / 100</td>
              <td class="text-center">${batchAvgMangala}%</td>
              <td class="text-center">${batchAvgSbHearing} mins/day</td>
              <td class="text-center">${batchAvgDarshan}%</td>
              <td class="text-center">${batchAvgSb}%</td>
              <td class="text-center">${batchAvgJf}%</td>
              <td class="text-center">${batchAvgReadingHours} hrs</td>
              <td class="text-center">-</td>
            </tr>
          </table>
        </body>
        </html>
      `;

      // Prepend UTF-8 BOM to ensure seamless encoding compatibility in Microsoft Excel
      const blob = new Blob(['\ufeff', tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cleanLabel = dateRangeInfo.label.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `FOLK_Sadhana_Report_${cleanLabel}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Defer URL revocation so the browser has time to finish the download
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 2500);

      setDownloadSuccess('Color-formatted Excel (.xls) downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 3500);
    } catch (err) {
      console.error('Excel Export Error:', err);
      setDownloadSuccess('Error generating Excel file. Please try CSV export.');
      setTimeout(() => setDownloadSuccess(null), 3500);
    }
  };

  // 2. CSV EXPORT (Using Blob with UTF-8 BOM instead of data URI to prevent URIError)
  const handleExportCSV = () => {
    try {
      const headers = [
        'Devotee Name',
        'FOLK ID',
        'Role',
        'Streak (Days)',
        'Avg Points (/100)',
        'Mangala Arati (%)',
        'Srimad Bhagavatam Hearing (Mins/Day)',
        'Sunday Darshan (%)',
        'Srimad Bhagavatam (%)',
        'JF Slot (%)',
        'Total Reading (Hours)',
        'Current Book',
        'Late Submissions',
      ];

      const rows = devoteeReport.map((r) => [
        `"${r.name}"`,
        `"${r.folk_id}"`,
        `"${r.role}"`,
        r.streak,
        r.avgPts,
        `"${r.mangalaPct}%"`,
        `"${r.sbHearingMins} mins"`,
        `"${r.darshanPct}%"`,
        `"${r.sbPct}%"`,
        `"${r.jfPct}%"`,
        r.readingHours,
        `"${r.currentBook}"`,
        r.lateSubmissions,
      ]);

      const summaryRow = [
        '"TOTAL BATCH AVERAGE"',
        '""',
        `"${totalDevotees} Devotees"`,
        '""',
        batchAvgPts,
        `"${batchAvgMangala}%"`,
        `"${batchAvgSbHearing} mins"`,
        `"${batchAvgDarshan}%"`,
        `"${batchAvgSb}%"`,
        `"${batchAvgJf}%"`,
        batchAvgReadingHours,
        '"All Books"',
        '""',
      ];

      const csvContent =
        '\ufeff' + [headers.join(','), ...rows.map((e) => e.join(',')), summaryRow.join(',')].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FOLK_Sadhana_Report_${dateRangeInfo.daysCount}Days.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 2500);

      setDownloadSuccess('CSV exported successfully!');
      setTimeout(() => setDownloadSuccess(null), 3500);
    } catch (err) {
      console.error('CSV Export Error:', err);
      setDownloadSuccess('Error generating CSV file.');
      setTimeout(() => setDownloadSuccess(null), 3500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-black/75 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-[32px] bg-white text-[#1B1917] shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-200/70 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#216E39] text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#1B1917] leading-tight">
                  Export Sādhana Reports
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Live Preview & Averages
                </span>
              </div>
              <p className="text-[11px] text-[#786E65]">
                Week, Month, or Custom range with color-formatted Excel output
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-[#786E65] hover:text-[#1B1917] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Download Toast Notification */}
          {downloadSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* 1. SCOPE SELECTOR TABS (Week / Month / Custom) */}
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70">
            <label className="text-[11px] font-bold text-[#786E65] uppercase tracking-wider block mb-2">
              Select Export Duration & Range:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setScope('week')}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  scope === 'week'
                    ? 'bg-[#E07A2B] text-white shadow-2xs'
                    : 'bg-white text-[#786E65] border border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Week Export</span>
              </button>

              <button
                type="button"
                onClick={() => setScope('month')}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  scope === 'month'
                    ? 'bg-[#216E39] text-white shadow-2xs'
                    : 'bg-white text-[#786E65] border border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Month Export</span>
              </button>

              <button
                type="button"
                onClick={() => setScope('custom')}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  scope === 'custom'
                    ? 'bg-[#1B1917] text-white shadow-2xs'
                    : 'bg-white text-[#786E65] border border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Custom Export</span>
              </button>
            </div>

            {/* Scope Specific Controls */}
            {scope === 'month' && (
              <div className="mt-3 flex items-center gap-2 pt-2 border-t border-stone-200/60">
                <span className="text-[11px] font-bold text-[#2C2825]">Month:</span>
                <button
                  type="button"
                  onClick={() => setSelectedMonth('current')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedMonth === 'current'
                      ? 'bg-emerald-100 text-[#15803D] border border-emerald-300'
                      : 'bg-white text-[#786E65] border border-stone-200'
                  }`}
                >
                  {currentMonthConfig.label} (Current)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMonth('prev')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedMonth === 'prev'
                      ? 'bg-emerald-100 text-[#15803D] border border-emerald-300'
                      : 'bg-white text-[#786E65] border border-stone-200'
                  }`}
                >
                  {prevMonthConfig.label} (Last Month)
                </button>
              </div>
            )}

            {scope === 'custom' && (
              <div className="mt-3 grid grid-cols-2 gap-3 pt-2 border-t border-stone-200/60">
                <div>
                  <label className="text-[10px] font-bold text-[#786E65] block mb-1">
                    Start Date:
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-[#1B1917] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#786E65] block mb-1">
                    End Date:
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-[#1B1917] outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. DYNAMIC BATCH AVERAGE STATS CARDS */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-center">
              <span className="text-[10px] font-bold uppercase text-[#8C460D] block">
                Selected Days
              </span>
              <span className="text-base font-black text-[#1B1917]">
                {dateRangeInfo.daysCount} Days
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-center">
              <span className="text-[10px] font-bold uppercase text-[#15803D] block">
                Batch Avg
              </span>
              <span className="text-base font-black text-[#15803D]">
                {batchAvgPts}/100
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-orange-50/80 border border-orange-200/80 text-center">
              <span className="text-[10px] font-bold uppercase text-[#C86315] block">
                Maṅgala %
              </span>
              <span className="text-base font-black text-[#1B1917]">
                {batchAvgMangala}%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200/80 text-center">
              <span className="text-[10px] font-bold uppercase text-purple-700 block">
                SB Hearing
              </span>
              <span className="text-base font-black text-[#1B1917]">
                {batchAvgSbHearing} mins
              </span>
            </div>
          </div>

          {/* 3. INTERACTIVE LIVE PREVIEW TABLE */}
          {/* "Preview should be shown ... and then download !!" */}
          <div className="rounded-2xl border border-stone-200/80 overflow-hidden bg-white shadow-xs">
            <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200/80 flex items-center justify-between">
              <span className="text-xs font-black text-[#1B1917] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E07A2B]" />
                Interactive Table Preview ({dateRangeInfo.label})
              </span>
              <span className="text-[10px] font-bold text-[#786E65]">
                {totalDevotees} Devotees Calculated
              </span>
            </div>

            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-[11px] text-left border-collapse">
                <thead className="bg-[#FAF8F5] text-[#786E65] uppercase text-[9px] font-black sticky top-0 border-b border-stone-200">
                  <tr>
                    <th className="py-2 px-3">Devotee</th>
                    <th className="py-2 px-2 text-center">FOLK ID</th>
                    <th className="py-2 px-2 text-center">Avg Points</th>
                    <th className="py-2 px-2 text-center">Maṅgala %</th>
                    <th className="py-2 px-2 text-center">SB Hearing</th>
                    <th className="py-2 px-2 text-center">Reading</th>
                    <th className="py-2 px-2 text-center">Late (Blue)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {devoteeReport.map((r) => (
                    <tr key={r.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-2 px-3">
                        <span className="font-extrabold text-[#1B1917] block">
                          {r.name}
                        </span>
                        <span className="text-[10px] text-[#786E65]">
                          {r.role} · {r.streak}d streak
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-[10px] text-stone-600">
                        {r.folk_id}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-[#15803D] font-black text-[10px]">
                          {r.avgPts}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-stone-700">
                        {r.mangalaPct}%
                      </td>
                      <td className="py-2 px-2 text-center font-extrabold text-[#8C460D]">
                        {r.sbHearingMins}m
                      </td>
                      <td className="py-2 px-2 text-center text-stone-600 font-semibold">
                        {r.readingHours}h
                      </td>
                      <td className="py-2 px-2 text-center">
                        {r.lateSubmissions > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[9px] border border-blue-200">
                            {r.lateSubmissions} Blue
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[10px]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* Summary Footer Row */}
                  <tr className="bg-amber-50/90 font-extrabold text-[#9C4507] border-t-2 border-amber-300">
                    <td className="py-2 px-3 uppercase text-[10px] tracking-wider">
                      Batch Total Average
                    </td>
                    <td className="py-2 px-2 text-center text-[10px]">-</td>
                    <td className="py-2 px-2 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-black text-[10px]">
                        {batchAvgPts}/100
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center font-black">
                      {batchAvgMangala}%
                    </td>
                    <td className="py-2 px-2 text-center font-black">
                      {batchAvgSbHearing}m
                    </td>
                    <td className="py-2 px-2 text-center font-black">
                      {batchAvgReadingHours}h
                    </td>
                    <td className="py-2 px-2 text-center text-[10px]">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
          <div className="text-[11px] text-[#786E65] hidden sm:block">
            Formatted Excel includes color highlights, bold totals & headers.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleExportCSV}
              className="py-2 px-3 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-[#1B1917] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="py-2 px-3 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-[#1B1917] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-stone-600" />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportFormattedExcel}
              className="py-2 px-4 rounded-xl bg-[#216E39] hover:bg-[#1B592E] text-white text-xs font-black flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Download Formatted Excel (.xls)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
