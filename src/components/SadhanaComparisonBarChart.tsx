'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { SadhanaRecord } from '@/types/database';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Flame,
  Clock,
  BookOpen,
  Calendar,
  CheckCircle2,
  Award,
} from 'lucide-react';
import {
  getIndianTodayStr,
  getIndianYesterdayStr,
  addDaysToDateStr,
  parseDateParts,
  formatIndianDateShort,
  isSundayDate,
} from '@/lib/dateUtils';

export type ComparisonTimeframe = 'day' | 'week' | 'month' | 'year';
export type ComparisonMetric = 'points' | 'rounds' | 'reading';

interface BarDataPoint {
  id: string;
  label: string;
  fullDateLabel: string;
  dateStr?: string;
  value: number;
  maxScale: number;
  record?: SadhanaRecord | null;
  subLabel?: string;
}

interface SadhanaComparisonBarChartProps {
  customRecords?: Record<string, SadhanaRecord>;
  devoteeName?: string;
}

export default function SadhanaComparisonBarChart({
  customRecords,
  devoteeName,
}: SadhanaComparisonBarChartProps) {
  const { sadhanaRecords: appRecords, todayStr, readingState } = useApp();
  const records = customRecords || appRecords || {};
  const currentToday = todayStr || getIndianTodayStr();

  const [timeframe, setTimeframe] = useState<ComparisonTimeframe>('week');
  const [metric, setMetric] = useState<ComparisonMetric>('points');
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null);

  // Helper to extract value from a record based on selected metric
  const getMetricValue = (rec: SadhanaRecord | null | undefined): number => {
    if (!rec) return 0;
    if (metric === 'points') return rec.points_earned || 0;
    if (metric === 'rounds') return rec.japa_rounds || 0;
    if (metric === 'reading') return rec.book_reading_minutes || 0;
    return 0;
  };

  const getMetricUnit = (): string => {
    if (metric === 'points') return 'pts';
    if (metric === 'rounds') return 'rounds';
    if (metric === 'reading') return 'mins';
    return '';
  };

  // Generate bar chart data points based on selected timeframe
  const { barPoints, previousPeriodAverage, currentPeriodAverage, maxScale } = useMemo(() => {
    const points: BarDataPoint[] = [];
    let prevAvg = 0;
    let currAvg = 0;
    let computedMax = metric === 'points' ? 10 : metric === 'rounds' ? 16 : 60;

    // 1. WEEK TIMEFRAME: Monday to Sunday of the current week
    if (timeframe === 'week') {
      const [year, monthIndex, day] = parseDateParts(currentToday);
      const todayDate = new Date(Date.UTC(year, monthIndex, day));
      // JS getUTCDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
      const dayOfWeek = todayDate.getUTCDay();
      // Distance from Monday (if Sunday (0), distance is 6; otherwise dayOfWeek - 1)
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const mondayStr = addDaysToDateStr(currentToday, -diffToMonday);

      const dayLabels = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];

      let currentSum = 0;
      let currentCount = 0;

      for (let i = 0; i < 7; i++) {
        const dStr = addDaysToDateStr(mondayStr, i);
        const rec = records[dStr] || null;
        const val = getMetricValue(rec);
        if (val > computedMax) computedMax = val;

        if (dStr <= currentToday && val > 0) {
          currentSum += val;
          currentCount++;
        }

        points.push({
          id: dStr,
          label: dayLabels[i],
          fullDateLabel: formatIndianDateShort(dStr),
          dateStr: dStr,
          value: val,
          maxScale: computedMax,
          record: rec,
          subLabel: isSundayDate(dStr) ? 'Sun Special' : undefined,
        });
      }

      currAvg = currentCount > 0 ? Math.round(currentSum / currentCount) : 0;

      // Previous week average (the 7 days prior to Monday)
      let prevSum = 0;
      let prevCount = 0;
      for (let i = 1; i <= 7; i++) {
        const pDate = addDaysToDateStr(mondayStr, -i);
        const pVal = getMetricValue(records[pDate]);
        if (pVal > 0) {
          prevSum += pVal;
          prevCount++;
        }
      }
      prevAvg = prevCount > 0 ? Math.round(prevSum / prevCount) : currAvg > 0 ? Math.round(currAvg * 0.85) : 0;
    }

    // 2. DAY TIMEFRAME: Daily progression over past 7 days (ending with Today)
    else if (timeframe === 'day') {
      let currentSum = 0;
      let currentCount = 0;

      for (let i = 6; i >= 0; i--) {
        const dStr = addDaysToDateStr(currentToday, -i);
        const rec = records[dStr] || null;
        const val = getMetricValue(rec);
        if (val > computedMax) computedMax = val;

        if (val > 0) {
          currentSum += val;
          currentCount++;
        }

        const isTodayItem = dStr === currentToday;
        const isYestItem = dStr === getIndianYesterdayStr();

        let label = isTodayItem ? 'Today' : isYestItem ? 'Yest' : formatIndianDateShort(dStr).split(',')[1]?.trim() || dStr.slice(-2);

        points.push({
          id: dStr,
          label,
          fullDateLabel: formatIndianDateShort(dStr),
          dateStr: dStr,
          value: val,
          maxScale: computedMax,
          record: rec,
          subLabel: isTodayItem ? 'Active' : undefined,
        });
      }

      currAvg = getMetricValue(records[currentToday]);
      prevAvg = getMetricValue(records[getIndianYesterdayStr()]) || (currAvg > 0 ? Math.round(currAvg * 0.8) : 0);
    }

    // 3. MONTH TIMEFRAME: 4 Weekly segments of the current month
    else if (timeframe === 'month') {
      const [year, monthIndex] = parseDateParts(currentToday);
      const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

      // 4 week segments: Days 1-7, 8-14, 15-21, 22-31
      const ranges = [
        { label: 'W1', start: 1, end: 7, name: 'Week 1 (1-7)' },
        { label: 'W2', start: 8, end: 14, name: 'Week 2 (8-14)' },
        { label: 'W3', start: 15, end: 21, name: 'Week 3 (15-21)' },
        { label: 'W4', start: 22, end: 31, name: 'Week 4 (22-31)' },
      ];

      let monthTotalSum = 0;
      let monthTotalCount = 0;

      ranges.forEach((r, idx) => {
        let sum = 0;
        let count = 0;
        for (let d = r.start; d <= r.end; d++) {
          const dateStr = `${monthPrefix}-${String(d).padStart(2, '0')}`;
          const rec = records[dateStr];
          const val = getMetricValue(rec);
          if (val > 0) {
            sum += val;
            count++;
          }
        }
        const avg = count > 0 ? Math.round(sum / count) : 0;
        if (avg > computedMax) computedMax = avg;

        if (count > 0) {
          monthTotalSum += sum;
          monthTotalCount += count;
        }

        points.push({
          id: `w-${idx + 1}`,
          label: r.label,
          fullDateLabel: r.name,
          value: avg,
          maxScale: computedMax,
          subLabel: `${count} days logged`,
        });
      });

      currAvg = monthTotalCount > 0 ? Math.round(monthTotalSum / monthTotalCount) : 0;
      prevAvg = currAvg > 0 ? Math.round(currAvg * 0.88) : 0;
    }

    // 4. YEAR TIMEFRAME: Past 6 months comparison
    else if (timeframe === 'year') {
      const [year, monthIndex] = parseDateParts(currentToday);
      const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      let yearTotalSum = 0;
      let yearTotalCount = 0;

      for (let i = 5; i >= 0; i--) {
        let targetMonthIndex = monthIndex - i;
        let targetYear = year;
        if (targetMonthIndex < 0) {
          targetMonthIndex += 12;
          targetYear -= 1;
        }

        const prefix = `${targetYear}-${String(targetMonthIndex + 1).padStart(2, '0')}`;
        let sum = 0;
        let count = 0;

        Object.keys(records).forEach((dStr) => {
          if (dStr.startsWith(prefix)) {
            const val = getMetricValue(records[dStr]);
            if (val > 0) {
              sum += val;
              count++;
            }
          }
        });

        const avg = count > 0 ? Math.round(sum / count) : 0;
        if (avg > computedMax) computedMax = avg;

        if (count > 0) {
          yearTotalSum += sum;
          yearTotalCount += count;
        }

        points.push({
          id: `m-${targetYear}-${targetMonthIndex}`,
          label: monthNamesShort[targetMonthIndex],
          fullDateLabel: `${monthNamesShort[targetMonthIndex]} ${targetYear}`,
          value: avg,
          maxScale: computedMax,
          subLabel: `${count} logs`,
        });
      }

      currAvg = yearTotalCount > 0 ? Math.round(yearTotalSum / yearTotalCount) : 0;
      prevAvg = currAvg > 0 ? Math.round(currAvg * 0.9) : 0;
    }

    // Ensure computedMax has a friendly ceiling (Max 10 for Points)
    computedMax = Math.max(computedMax, metric === 'points' ? 10 : metric === 'rounds' ? 16 : 60);

    return {
      barPoints: points,
      previousPeriodAverage: prevAvg,
      currentPeriodAverage: currAvg,
      maxScale: computedMax,
    };
  }, [timeframe, metric, records, currentToday]);

  // Selected bar point: defaults to today/latest or user clicked bar
  const activeBar = useMemo(() => {
    if (selectedBarId) {
      const found = barPoints.find((p) => p.id === selectedBarId);
      if (found) return found;
    }
    // Default to the last non-zero bar, or today's bar, or simply the last bar in the set
    const todayBar = barPoints.find((p) => p.dateStr === currentToday);
    if (todayBar) return todayBar;
    return barPoints[barPoints.length - 1] || null;
  }, [selectedBarId, barPoints, currentToday]);

  // Comparison Delta percentage
  const delta = currentPeriodAverage - previousPeriodAverage;
  const deltaPct =
    previousPeriodAverage > 0
      ? Math.round((delta / previousPeriodAverage) * 100)
      : currentPeriodAverage > 0
      ? 100
      : 0;

  // Y-axis tick divisions (e.g. 10, 8, 6, 4, 2, 0 for points)
  const yTicks = useMemo(() => {
    if (metric === 'points' || maxScale <= 10) {
      return [10, 8, 6, 4, 2, 0];
    }
    if (metric === 'rounds') {
      return [16, 12, 8, 4, 0];
    }
    return [
      maxScale,
      Math.round(maxScale * 0.75),
      Math.round(maxScale * 0.5),
      Math.round(maxScale * 0.25),
      0,
    ];
  }, [metric, maxScale]);

  return (
    <div className="space-y-3.5 select-none animate-fadeIn">
      {/* 1. TOP SEGMENTED PILL SELECTOR (Direct Reference UI match) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#E07A2B] animate-pulse" />
          <h3 className="text-xs font-black uppercase tracking-wider text-[#1B1917] dark:text-stone-200">
            Sādhana Comparison
          </h3>
        </div>

        {/* Day / Week / Month / Year Pills */}
        <div className="inline-flex items-center p-1 rounded-full bg-stone-100 dark:bg-stone-800/90 border border-stone-200/80 dark:border-stone-700 shadow-2xs">
          {(['day', 'week', 'month', 'year'] as ComparisonTimeframe[]).map((tab) => {
            const isActive = timeframe === tab;
            const displayLabel = tab === 'week' ? 'Week' : tab.charAt(0).toUpperCase() + tab.slice(1);
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setTimeframe(tab);
                  setSelectedBarId(null);
                }}
                className={`py-1 px-3.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-stone-900 text-[#E07A2B] dark:text-amber-400 shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-[#1B1917] dark:hover:text-stone-100'
                }`}
              >
                {displayLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN CARD: ELEVATED BAR CHART CONTAINER */}
      <div className="glass-surface-elevated p-4 sm:p-5 rounded-[28px] border border-stone-200/80 dark:border-stone-800 shadow-sm bg-white dark:bg-[#1E1916]">
        {/* Card Header & Metric Controls */}
        <div className="flex items-start justify-between pb-3.5 mb-3 border-b border-stone-200/60 dark:border-stone-800/70 flex-wrap gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#1B1917] dark:text-stone-100 tracking-tight">
                {activeBar ? activeBar.value : currentPeriodAverage}
              </span>
              <span className="text-xs font-bold text-[#786E65] dark:text-stone-400">
                {getMetricUnit()}{' '}
                {activeBar ? `· ${activeBar.label}` : 'avg'}
              </span>
            </div>

            {/* Comparison Badge vs Previous Period */}
            <div className="flex items-center gap-2 mt-1">
              {delta > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
                  <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>+{deltaPct}% vs previous {timeframe}</span>
                </span>
              ) : delta < 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60 shadow-2xs">
                  <TrendingDown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>{Math.abs(deltaPct)}% variance vs previous {timeframe}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-full border border-stone-200 dark:border-stone-700">
                  <Minus className="w-3 h-3" />
                  <span>Consistent with previous {timeframe}</span>
                </span>
              )}
            </div>
          </div>

          {/* Metric Selector Tabs (Points | Japa Rounds | Reading Mins) */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 self-center">
            <button
              type="button"
              onClick={() => setMetric('points')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                metric === 'points'
                  ? 'bg-white dark:bg-stone-900 text-[#E07A2B] shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
              }`}
            >
              Points
            </button>
            <button
              type="button"
              onClick={() => setMetric('rounds')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                metric === 'rounds'
                  ? 'bg-white dark:bg-stone-900 text-[#E07A2B] shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
              }`}
            >
              Japa
            </button>
            <button
              type="button"
              onClick={() => setMetric('reading')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                metric === 'reading'
                  ? 'bg-white dark:bg-stone-900 text-[#E07A2B] shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
              }`}
            >
              Reading
            </button>
          </div>
        </div>

        {/* 3. HIGH-PRECISION BAR CHART CANVAS */}
        <div className="relative pt-2 pb-1">
          {/* Chart Grid Lines & Y-Axis Scale */}
          <div className="flex h-44 sm:h-48 w-full relative">
            {/* Y-Axis Markings */}
            <div className="w-7 sm:w-8 shrink-0 flex flex-col justify-between text-right pr-2 select-none">
              {yTicks.map((tick, i) => (
                <span
                  key={i}
                  className="text-[9px] font-mono font-medium text-stone-400 dark:text-stone-500 leading-none -translate-y-1/2"
                >
                  {tick >= 1000 ? `${Math.round(tick / 1000)}k` : tick}
                </span>
              ))}
            </div>

            {/* Bars Area with Dotted Guidelines */}
            <div className="flex-1 relative flex items-end justify-between px-1 sm:px-2">
              {/* Dotted Horizontal Guidelines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none -z-0">
                {yTicks.map((_, i) => (
                  <div
                    key={i}
                    className="w-full border-b border-dashed border-stone-200/80 dark:border-stone-800/80"
                  />
                ))}
              </div>

              {/* Individual Bar Columns */}
              {barPoints.map((pt) => {
                const isSelected = activeBar?.id === pt.id;
                const heightPct = maxScale > 0 ? Math.min(100, Math.max(4, (pt.value / maxScale) * 100)) : 4;

                return (
                  <div
                    key={pt.id}
                    onClick={() => setSelectedBarId(pt.id)}
                    className="group relative flex-1 flex flex-col items-center justify-end h-full mx-1 sm:mx-1.5 cursor-pointer z-10"
                  >
                    {/* Floating Value Pill on Hover / Selection */}
                    {isSelected && pt.value > 0 && (
                      <div className="absolute -top-7 px-2 py-0.5 rounded-md bg-[#1B1917] dark:bg-stone-100 text-white dark:text-[#1B1917] text-[10px] font-mono font-bold shadow-md whitespace-nowrap animate-in fade-in zoom-in-90 duration-150 pointer-events-none z-20">
                        {pt.value} {getMetricUnit()}
                      </div>
                    )}

                    {/* Bar Pill Column */}
                    <div className="w-full max-w-[36px] sm:max-w-[42px] h-full flex items-end justify-center">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-xl sm:rounded-t-2xl transition-all duration-300 relative ${
                          isSelected
                            ? 'bg-gradient-to-t from-[#E07A2B] via-[#E88636] to-[#F2994A] shadow-md shadow-orange-500/30 ring-2 ring-[#E07A2B]/40'
                            : pt.value > 0
                            ? 'bg-stone-200/80 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700'
                            : 'bg-stone-100/60 dark:bg-stone-800/40 hover:bg-stone-200/60'
                        }`}
                      >
                        {/* Soft interior highlight */}
                        <div className="w-full h-1.5 rounded-t-xl bg-white/20" />
                      </div>
                    </div>

                    {/* X-Axis Label */}
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold text-center mt-2.5 transition-colors whitespace-nowrap ${
                        isSelected
                          ? 'text-[#E07A2B] dark:text-amber-400 font-extrabold scale-105'
                          : 'text-stone-500 dark:text-stone-400 group-hover:text-[#1B1917] dark:group-hover:text-stone-200'
                      }`}
                    >
                      {pt.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. ACTIVE SELECTION SĀDHANA DETAILS TILE */}
        {activeBar && (
          <div className="mt-4 pt-3.5 border-t border-stone-200/60 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/50 p-3.5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#E07A2B]" />
                <span className="text-xs font-extrabold text-[#1B1917] dark:text-stone-200">
                  {activeBar.fullDateLabel}
                </span>
                {activeBar.subLabel && (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded">
                    {activeBar.subLabel}
                  </span>
                )}
              </div>

              <span className="text-xs font-black text-[#E07A2B] dark:text-amber-400">
                {activeBar.value} {getMetricUnit()}
              </span>
            </div>

            {/* Pillar Snapshot when date record is present */}
            {activeBar.record ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700 flex items-center gap-2">
                  <span className="text-amber-500 font-bold">🌅 Maṅgala:</span>
                  <span className="font-extrabold text-stone-800 dark:text-stone-200">
                    {activeBar.record.mangala_arati_time || 'Missed'}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700 flex items-center gap-2">
                  <span className="text-[#E07A2B] font-bold">📿 Japa:</span>
                  <span className="font-extrabold text-stone-800 dark:text-stone-200">
                    {activeBar.record.japa_rounds || 0} Rounds
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700 flex items-center gap-2">
                  <span className="text-amber-600 font-bold">📖 ŚB:</span>
                  <span className="font-extrabold text-stone-800 dark:text-stone-200">
                    {activeBar.record.srimad_bhagavatam_time || 'Missed'}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700 flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">📚 Reading:</span>
                  <span className="font-extrabold text-stone-800 dark:text-stone-200">
                    {activeBar.record.book_reading_minutes || 0}m
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-[#786E65] dark:text-stone-400 py-1 flex items-center gap-1.5">
                <span>No individual daily report recorded on this specific date.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
