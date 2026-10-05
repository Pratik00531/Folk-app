'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Check, Sliders, Shield, Clock, Star, ArrowRight, Save } from 'lucide-react';
import { PointRuleConfig } from '@/types/database';

export default function PointRulesManagerModal({ onClose }: { onClose: () => void }) {
  const { pointRules, updatePointRule } = useApp();
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Editable fields for the selected rule
  const [ontimeFrom, setOntimeFrom] = useState<string>('04:30 AM');
  const [ontimeTo, setOntimeTo] = useState<string>('05:05 AM');
  const [ontimePts, setOntimePts] = useState<number>(20);

  const [lateFrom, setLateFrom] = useState<string>('05:06 AM');
  const [lateTo, setLateTo] = useState<string>('05:15 AM');
  const [latePts, setLatePts] = useState<number>(14);

  const [lastminFrom, setLastminFrom] = useState<string>('05:16 AM');
  const [lastminTo, setLastminTo] = useState<string>('05:30 AM');
  const [lastminPts, setLastminPts] = useState<number>(8);

  const startEdit = (rule: PointRuleConfig) => {
    setEditingRuleId(rule.id);
    setOntimeFrom(rule.ontime_from || (rule.ontime_cutoff ? rule.ontime_cutoff.split('–')[0]?.trim() : '04:30 AM'));
    setOntimeTo(rule.ontime_to || (rule.ontime_cutoff ? rule.ontime_cutoff.split('–')[1]?.trim() : '05:05 AM'));
    setOntimePts(rule.ontime_points ?? rule.points);

    setLateFrom(rule.late_from || (rule.late_cutoff ? rule.late_cutoff.split('–')[0]?.trim() : '05:06 AM'));
    setLateTo(rule.late_to || (rule.late_cutoff ? rule.late_cutoff.split('–')[1]?.trim() : '05:15 AM'));
    setLatePts(rule.late_points ?? Math.round((rule.ontime_points ?? rule.points) * 0.7));

    setLastminFrom(rule.lastmin_from || (rule.lastmin_cutoff ? rule.lastmin_cutoff.split('–')[0]?.trim() : '05:16 AM'));
    setLastminTo(rule.lastmin_to || (rule.lastmin_cutoff ? rule.lastmin_cutoff.split('–')[1]?.trim() : '05:30 AM'));
    setLastminPts(rule.lastmin_points ?? Math.round((rule.ontime_points ?? rule.points) * 0.4));
  };

  const saveEdit = (ruleId: string) => {
    updatePointRule(ruleId, {
      ontime_from: ontimeFrom,
      ontime_to: ontimeTo,
      ontime_points: Number(ontimePts),
      ontime_cutoff: `${ontimeFrom} – ${ontimeTo}`,
      late_from: lateFrom,
      late_to: lateTo,
      late_points: Number(latePts),
      late_cutoff: `${lateFrom} – ${lateTo}`,
      lastmin_from: lastminFrom,
      lastmin_to: lastminTo,
      lastmin_points: Number(lastminPts),
      lastmin_cutoff: `${lastminFrom} – ${lastminTo}`,
      points: Number(ontimePts),
    });
    setEditingRuleId(null);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#FAF8F5] border border-white/80 rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E2D8] flex items-center justify-between bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#DC6820]" />
            <div>
              <h2 className="text-base font-bold text-[#1B1917]">
                Guide Point & Cutoff System
              </h2>
              <p className="text-[11px] text-[#786E65]">
                Configure flexible time windows & points for boys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 border border-white flex items-center justify-center text-[#786E65] hover:text-[#1B1917] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-3.5">
          {/* Legend Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-[#7A4B1A] space-y-1.5">
            <div className="flex items-center gap-2 font-bold">
              <Shield className="w-4 h-4 text-[#DC6820] shrink-0" />
              <span>FOLK Guide Point Configuration Matrix</span>
            </div>
            <p className="text-[11px] text-[#786E65]">
              Set custom time ranges: "From this time to this time → this much points".
              Weekdays reach 100 points (Darshan excluded). Sundays reach 100 points (Darshan included).
            </p>
            <div className="flex items-center gap-3 pt-1 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-[#16A34A]">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" /> Green (Full Points)
              </span>
              <span className="flex items-center gap-1 text-[#65A30D]">
                <span className="w-2 h-2 rounded-full bg-[#84CC16]" /> Light Green (Good Points)
              </span>
              <span className="flex items-center gap-1 text-[#D97706]">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Yellow (Low Points)
              </span>
              <span className="flex items-center gap-1 text-red-600">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Red (0 Points)
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {pointRules.map((rule) => {
              const isEditing = editingRuleId === rule.id;

              return (
                <div
                  key={rule.id}
                  className="bg-white/95 p-4 rounded-2xl border border-stone-200/70 shadow-2xs space-y-2.5 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#1B1917]">
                        {rule.title}
                      </h4>
                      <p className="text-[11px] text-[#786E65]">
                        {rule.condition}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-[#15803D]">
                        {rule.points} pts
                      </span>
                      <span className="text-[9px] text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded block mt-0.5 font-bold">
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Range Display */}
                  <div className="space-y-1.5 pt-1 border-t border-stone-100 text-xs">
                    {/* On-Time Tier */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 border border-emerald-200/40">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] shrink-0" />
                        <span className="text-[11px] font-semibold text-[#15803D]">
                          On-Time: {rule.ontime_cutoff || `${rule.ontime_from || 'Start'} to ${rule.ontime_to || 'Cutoff'}`}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-[#15803D]">
                        {rule.ontime_points || rule.points} pts
                      </span>
                    </div>

                    {/* Late Tier */}
                    {rule.late_cutoff && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-lime-50/60 border border-lime-200/40">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#84CC16] shrink-0" />
                          <span className="text-[11px] font-semibold text-[#4D7C0F]">
                            Late: {rule.late_cutoff || `${rule.late_from} to ${rule.late_to}`}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-[#4D7C0F]">
                          {rule.late_points} pts
                        </span>
                      </div>
                    )}

                    {/* Last-min Tier */}
                    {rule.lastmin_cutoff && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/60 border border-amber-200/40">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
                          <span className="text-[11px] font-semibold text-[#B45309]">
                            Last Min: {rule.lastmin_cutoff || `${rule.lastmin_from} to ${rule.lastmin_to}`}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-[#B45309]">
                          {rule.lastmin_points} pts
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Customizable Time Range Editor (Devotee selects from this to this -> this much point) */}
                  {isEditing ? (
                    <div className="mt-3 pt-3 border-t border-stone-200 space-y-3 bg-[#FAF7F2] p-3.5 rounded-xl border border-stone-200/80">
                      <div className="text-[11px] font-bold text-[#8C460D] uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#DC6820]" />
                        <span>Edit Time Ranges & Points</span>
                      </div>

                      {/* 1. On-Time (Green) Range */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#15803D] flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                          On-Time Range (Green):
                        </label>
                        <div className="grid grid-cols-5 gap-1.5 items-center">
                          <input
                            type="text"
                            value={ontimeFrom}
                            onChange={(e) => setOntimeFrom(e.target.value)}
                            placeholder="From"
                            className="col-span-2 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold text-center"
                          />
                          <span className="text-center text-xs text-stone-400 font-bold">to</span>
                          <input
                            type="text"
                            value={ontimeTo}
                            onChange={(e) => setOntimeTo(e.target.value)}
                            placeholder="To"
                            className="col-span-2 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold text-center"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-1.5 pt-0.5">
                          <span className="text-[10px] text-stone-500 font-semibold">Points:</span>
                          <input
                            type="number"
                            value={ontimePts}
                            onChange={(e) => setOntimePts(Number(e.target.value))}
                            className="w-16 px-2 py-0.5 bg-white border border-stone-300 rounded-lg text-xs font-black text-center text-[#15803D]"
                          />
                        </div>
                      </div>

                      {/* 2. Late (Light Green) Range */}
                      <div className="space-y-1 pt-1 border-t border-stone-200/60">
                        <label className="text-[10px] font-bold text-[#4D7C0F] flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#84CC16]" />
                          Late Range (Light Green):
                        </label>
                        <div className="grid grid-cols-5 gap-1.5 items-center">
                          <input
                            type="text"
                            value={lateFrom}
                            onChange={(e) => setLateFrom(e.target.value)}
                            placeholder="From"
                            className="col-span-2 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold text-center"
                          />
                          <span className="text-center text-xs text-stone-400 font-bold">to</span>
                          <input
                            type="text"
                            value={lateTo}
                            onChange={(e) => setLateTo(e.target.value)}
                            placeholder="To"
                            className="col-span-2 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold text-center"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-1.5 pt-0.5">
                          <span className="text-[10px] text-stone-500 font-semibold">Points:</span>
                          <input
                            type="number"
                            value={latePts}
                            onChange={(e) => setLatePts(Number(e.target.value))}
                            className="w-16 px-2 py-0.5 bg-white border border-stone-300 rounded-lg text-xs font-black text-center text-[#4D7C0F]"
                          />
                        </div>
                      </div>

                      {/* 3. Last Min (Yellow) Range */}
                      <div className="space-y-1 pt-1 border-t border-stone-200/60">
                        <label className="text-[10px] font-bold text-[#B45309] flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                          Last-Minute Range (Yellow):
                        </label>
                        <div className="grid grid-cols-5 gap-1.5 items-center">
                          <input
                            type="text"
                            value={lastminFrom}
                            onChange={(e) => setLastminFrom(e.target.value)}
                            placeholder="From"
                            className="col-span-2 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold text-center"
                          />
                          <span className="text-center text-xs text-stone-400 font-bold">to</span>
                          <input
                            type="text"
                            value={lastminTo}
                            onChange={(e) => setLastminTo(e.target.value)}
                            placeholder="To"
                            className="col-span-2 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold text-center"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-1.5 pt-0.5">
                          <span className="text-[10px] text-stone-500 font-semibold">Points:</span>
                          <input
                            type="number"
                            value={lastminPts}
                            onChange={(e) => setLastminPts(Number(e.target.value))}
                            className="w-16 px-2 py-0.5 bg-white border border-stone-300 rounded-lg text-xs font-black text-center text-[#B45309]"
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingRuleId(null)}
                          className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-xs font-semibold text-[#786E65] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(rule.id)}
                          className="px-4 py-1.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-xs font-bold text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Cutoff Rules</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => startEdit(rule)}
                        className="text-[11px] font-bold text-[#DC6820] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>Change Time Ranges & Points</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200/50 bg-white/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#DC6820] hover:bg-[#C95B16] text-xs font-bold text-white shadow-xs cursor-pointer"
          >
            Apply Point Rules
          </button>
        </div>
      </div>
    </div>
  );
}
