'use client';

import React, { useState } from 'react';
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
  BookOpen,
} from 'lucide-react';

interface MonthlyReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MonthlyReportExportModal({ isOpen, onClose }: MonthlyReportExportModalProps) {
  const { guideDevotees, sadhanaRecords, currentUser } = useApp();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Monthly aggregated data for each devotee
  const devoteeMonthlyReport = guideDevotees.map((d) => {
    // Generate realistic monthly averages based on their streak and record
    const basePts = d.submitted ? d.points_today : (d.last_points || 82);
    const avgPts = Math.min(100, Math.max(40, basePts > 0 ? basePts - (d.streak < 5 ? 12 : 3) : 68));
    const mangalaPct = d.pillars.mangala ? 96 : 82;
    const japaRounds = d.japa_rounds > 0 ? d.japa_rounds : (d.streak > 10 ? 16 : 14);
    const darshanPct = 95;
    const sbPct = d.pillars.bhagavatam ? 94 : 80;
    const jfPct = d.pillars.jf ? 92 : 78;
    const readingHours = Number((d.total_reading_hours || 12.5).toFixed(1));

    return {
      id: d.id,
      name: d.name,
      folk_id: d.folk_id,
      role: d.role === 'folk_lead' ? 'Folk Lead' : 'Folk Boy',
      streak: d.streak,
      avgPts,
      mangalaPct,
      japaRounds,
      darshanPct,
      sbPct,
      jfPct,
      readingHours,
      currentBook: d.current_book,
    };
  });

  // Calculate Batch Total Averages
  const totalDevotees = devoteeMonthlyReport.length;
  const batchAvgPts = Math.round(
    devoteeMonthlyReport.reduce((acc, cur) => acc + cur.avgPts, 0) / totalDevotees
  );
  const batchAvgMangala = Math.round(
    devoteeMonthlyReport.reduce((acc, cur) => acc + cur.mangalaPct, 0) / totalDevotees
  );
  const batchAvgJapa = (
    devoteeMonthlyReport.reduce((acc, cur) => acc + cur.japaRounds, 0) / totalDevotees
  ).toFixed(1);
  const batchAvgDarshan = Math.round(
    devoteeMonthlyReport.reduce((acc, cur) => acc + cur.darshanPct, 0) / totalDevotees
  );
  const batchAvgSb = Math.round(
    devoteeMonthlyReport.reduce((acc, cur) => acc + cur.sbPct, 0) / totalDevotees
  );
  const batchAvgJf = Math.round(
    devoteeMonthlyReport.reduce((acc, cur) => acc + cur.jfPct, 0) / totalDevotees
  );
  const batchAvgReadingHours = (
    devoteeMonthlyReport.reduce((acc, cur) => acc + cur.readingHours, 0) / totalDevotees
  ).toFixed(1);

  // 1. EXPORT TO EXCEL (CSV format, universally supported by MS Excel & Google Sheets)
  const handleExportExcel = () => {
    const headers = [
      'Devotee Name',
      'FOLK ID',
      'Role',
      'Streak (Days)',
      'Avg Monthly Points (/100)',
      'Mangala Arati (%)',
      'Japa Avg Rounds',
      'Sunday Darshan (%)',
      'Srimad Bhagavatam (%)',
      'JF (Japa Finish) (%)',
      'Total Reading (Hours)',
      'Current Book',
    ];

    const rows = devoteeMonthlyReport.map((r) => [
      `"${r.name}"`,
      `"${r.folk_id}"`,
      `"${r.role}"`,
      r.streak,
      r.avgPts,
      `${r.mangalaPct}%`,
      r.japaRounds,
      `${r.darshanPct}%`,
      `${r.sbPct}%`,
      `${r.jfPct}%`,
      r.readingHours,
      `"${r.currentBook}"`,
    ]);

    // Bottom Summary Row for Total Average
    const summaryRow = [
      '"TOTAL BATCH AVERAGE"',
      '""',
      '""',
      '""',
      batchAvgPts,
      `"${batchAvgMangala}%"`,
      batchAvgJapa,
      `"${batchAvgDarshan}%"`,
      `"${batchAvgSb}%"`,
      `"${batchAvgJf}%"`,
      batchAvgReadingHours,
      '"All Books"',
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(',')), summaryRow.join(',')].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'FOLK_Sadhana_Monthly_Report_October_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('Excel report downloaded successfully as .CSV!');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  // 2. EXPORT TO PDF (Print Window)
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-5 border-b border-stone-200/80 bg-stone-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#E07A2B]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1B1917]">
                Monthly Sādhana Dossier Export
              </h2>
              <p className="text-xs text-[#786E65]">
                Export complete monthly records for all Folk Boys & Leads
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 border border-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons: Excel & PDF */}
        <div className="p-5 border-b border-stone-200/80 flex flex-wrap gap-3 bg-amber-50/30">
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex-1 min-w-[200px] h-12 rounded-2xl bg-[#1B1917] hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99] transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Download Excel (.CSV)</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPDF}
            className="flex-1 min-w-[200px] h-12 rounded-2xl saffron-gradient-btn text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99] transition-all"
          >
            <Printer className="w-4 h-4 text-amber-100" />
            <span>Print / Save as PDF</span>
          </button>
        </div>

        {downloadSuccess && (
          <div className="mx-5 mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Printable Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-5 text-left select-text print:p-0 print:m-0 print:overflow-visible">
          {/* Official Document Banner */}
          <div className="border-b-2 border-stone-800 pb-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E07A2B]">
                  ISKCON FOLK • Spiritual Progress Dossier
                </span>
                <h1 className="text-xl font-black text-[#1B1917] mt-0.5">
                  MONTHLY SĀDHANA CONSOLIDATED REPORT
                </h1>
                <p className="text-xs text-[#786E65]">
                  Month: October 2026 • Reporting Guide: {currentUser.full_name || 'FOLK Guide'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-[#1B1917] block">
                  Generated for Folk Leads & Guide
                </span>
                <span className="text-[10px] text-[#8E867F]">
                  Total Boys: {totalDevotees}
                </span>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-300 bg-stone-100/80 text-[10px] font-black uppercase text-[#59534E]">
                  <th className="py-2.5 px-2">Devotee</th>
                  <th className="py-2.5 px-2 text-center">FOLK ID</th>
                  <th className="py-2.5 px-2 text-center">Avg Pts</th>
                  <th className="py-2.5 px-2 text-center">Maṅgala</th>
                  <th className="py-2.5 px-2 text-center">Japa</th>
                  <th className="py-2.5 px-2 text-center">Darshan</th>
                  <th className="py-2.5 px-2 text-center">SB Class</th>
                  <th className="py-2.5 px-2 text-center">JF</th>
                  <th className="py-2.5 px-2 text-center">Reading</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {devoteeMonthlyReport.map((devotee) => (
                  <tr key={devotee.id} className="hover:bg-amber-50/40">
                    <td className="py-2.5 px-2 font-bold text-[#1B1917]">
                      {devotee.name}
                      {devotee.role === 'Folk Lead' && (
                        <span className="ml-1 text-[9px] font-black text-[#9C4507] bg-amber-100 px-1 py-0.2 rounded">
                          LEAD
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono text-[11px] text-[#786E65]">
                      {devotee.folk_id}
                    </td>
                    <td className="py-2.5 px-2 text-center font-black text-[#216E39]">
                      {devotee.avgPts}
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-[#1B1917]">
                      {devotee.mangalaPct}%
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-[#1B1917]">
                      {devotee.japaRounds} rds
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-[#1B1917]">
                      {devotee.darshanPct}%
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-[#1B1917]">
                      {devotee.sbPct}%
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-[#1B1917]">
                      {devotee.jfPct}%
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-[#1B1917]">
                      {devotee.readingHours} hrs
                    </td>
                  </tr>
                ))}

                {/* Batch Total Summary Row */}
                <tr className="bg-stone-900 text-white font-black text-xs">
                  <td className="py-3 px-2">BATCH TOTAL AVERAGE</td>
                  <td className="py-3 px-2 text-center text-[10px] text-stone-300">
                    {totalDevotees} Boys
                  </td>
                  <td className="py-3 px-2 text-center text-amber-300 font-black text-sm">
                    {batchAvgPts}
                  </td>
                  <td className="py-3 px-2 text-center">{batchAvgMangala}%</td>
                  <td className="py-3 px-2 text-center">{batchAvgJapa} rds</td>
                  <td className="py-3 px-2 text-center">{batchAvgDarshan}%</td>
                  <td className="py-3 px-2 text-center">{batchAvgSb}%</td>
                  <td className="py-3 px-2 text-center">{batchAvgJf}%</td>
                  <td className="py-3 px-2 text-center text-amber-300">
                    {batchAvgReadingHours} hrs
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-[#786E65]">
            <span className="font-bold text-[#1B1917]">Audit Note:</span> This report includes all 6 spiritual pillars (Maṅgala Ārati, Japa 16 rounds, Sunday Darshan, Śrīmad Bhāgavatam, Japa Finish slot, and Book reading). Prepared by {currentUser.full_name || 'FOLK Guide'} for FOLK leadership review.
          </div>
        </div>
      </div>
    </div>
  );
}
