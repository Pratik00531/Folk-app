'use client';

import React from 'react';
import { Clock, X } from 'lucide-react';

interface TimePickerAMPMProps {
  value: string; // e.g. "05:03 AM"
  onChange: (val: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
}

export function parse12HourTime(timeStr: string): number | null {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function calculate12hDuration(start: string, finish: string): number | null {
  const startMins = parse12HourTime(start);
  const finishMins = parse12HourTime(finish);
  if (startMins === null || finishMins === null) return null;
  let diff = finishMins - startMins;
  if (diff < 0) diff += 24 * 60;
  return diff;
}

export default function TimePickerAMPM({
  value,
  onChange,
  onClear,
  disabled = false,
  className = '',
}: TimePickerAMPMProps) {
  // Parse current value or provide standard fallback
  const match = value ? value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i) : null;
  const hour = match ? match[1].padStart(2, '0') : '05';
  const minute = match ? match[2].padStart(2, '0') : '00';
  const period = match ? match[3].toUpperCase() : 'AM';

  const update = (newH: string, newM: string, newP: string) => {
    onChange(`${newH}:${newM} ${newP}`);
  };

  const hoursList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const minutesList = [
    '00', '01', '02', '03', '04', '05', '10', '15', '20', '25', '30', '35', '40', '45', '47', '50', '55'
  ];
  const fullMinutesList = minutesList.includes(minute)
    ? minutesList
    : [minute, ...minutesList].sort();

  return (
    <div
      className={`inline-flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-2xl bg-[#FAF7F2] border border-stone-200/80 shadow-2xs transition-all ${
        disabled ? 'opacity-40 pointer-events-none' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-1.5 shrink-0">
        <Clock className="w-3.5 h-3.5 text-[#DC6820] shrink-0" />

        {/* Hour Dropdown */}
        <select
          value={hour}
          onChange={(e) => update(e.target.value, minute, period)}
          disabled={disabled}
          className="text-xs font-bold text-[#1B1917] bg-transparent outline-none cursor-pointer py-0.5 px-0.5"
        >
          {hoursList.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        <span className="text-xs font-bold text-[#8E867F]">:</span>

        {/* Minute Dropdown */}
        <select
          value={minute}
          onChange={(e) => update(hour, e.target.value, period)}
          disabled={disabled}
          className="text-xs font-bold text-[#1B1917] bg-transparent outline-none cursor-pointer py-0.5 px-0.5"
        >
          {fullMinutesList.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* AM / PM Dropdown (As explicitly requested by user: "plz give Drop down to every AM and pM !!") */}
      <div className="flex items-center shrink-0 ml-1">
        <select
          value={period}
          onChange={(e) => update(hour, minute, e.target.value)}
          disabled={disabled}
          className="text-xs font-extrabold text-[#DC6820] bg-white border border-stone-200/80 rounded-lg px-2 py-0.5 outline-none cursor-pointer shadow-2xs"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>

        {/* Optional Clear Button */}
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            title="Clear time"
            className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer ml-1.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
