'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { folkBookCatalogue, getBookCoverUrl } from '@/lib/mockData';
import { X, CheckCircle2, BookmarkCheck, Calendar, BookOpen, Layers } from 'lucide-react';

export default function BookBacklogModal() {
  const { isBacklogModalOpen, setIsBacklogModalOpen, readingState, markBooksAsCompleted } = useApp();

  const completedSet = new Set(readingState.completed_books.map((b) => b.book_id));
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>(Array.from(completedSet));
  const [completedDate, setCompletedDate] = useState<string>('2026-06-01');
  const [estMinutes, setEstMinutes] = useState<number>(180);
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3 | 4 | 5>(1);

  if (!isBacklogModalOpen) return null;

  const toggleBook = (bookId: string) => {
    setSelectedBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const handleSave = () => {
    markBooksAsCompleted(selectedBookIds, completedDate, estMinutes);
    setIsBacklogModalOpen(false);
  };

  const booksInLevel = folkBookCatalogue.filter((b) => b.level === selectedLevel);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#FAF5EE] rounded-[32px] border border-white/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E8E2D8] flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#DC6820]">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1B1917]">
                Log Previously Finished Books
              </h3>
              <p className="text-[11px] text-[#786E65]">
                Mark books you finished before using the FOLK app
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBacklogModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level Tabs */}
        <div className="px-6 pt-3 pb-2 flex gap-1 bg-white/40 border-b border-stone-200/40">
          {([1, 2, 3, 4, 5] as const).map((lvl) => {
            const completedCountInLevel = folkBookCatalogue
              .filter((b) => b.level === lvl)
              .filter((b) => selectedBookIds.includes(b.id)).length;
            const totalInLevel = folkBookCatalogue.filter((b) => b.level === lvl).length;

            return (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center ${
                  selectedLevel === lvl
                    ? 'bg-[#DC6820] text-white shadow-2xs'
                    : 'bg-white/80 text-[#6E665E] hover:bg-white border border-stone-200/50'
                }`}
              >
                <span>Lvl {lvl}</span>
                <span className={`text-[9px] ${selectedLevel === lvl ? 'text-white/80' : 'text-[#8E867F]'}`}>
                  {completedCountInLevel}/{totalInLevel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Books List in Level */}
        <div className="overflow-y-auto p-5 space-y-2.5 flex-1">
          {booksInLevel.map((book) => {
            const isChecked = selectedBookIds.includes(book.id);
            const coverUrl = getBookCoverUrl(book.title);

            return (
              <div
                key={book.id}
                onClick={() => toggleBook(book.id)}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  isChecked
                    ? 'bg-amber-50/90 border-[#DC6820]/40 shadow-xs'
                    : 'bg-white/80 border-stone-200/60 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Book Cover Thumbnail */}
                  <div className="w-9 h-12 rounded-lg overflow-hidden border border-amber-900/15 shrink-0 bg-stone-100 shadow-2xs">
                    <img src={coverUrl} alt={book.title} className="w-full h-full object-cover" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-[#8E867F]">
                        #{book.order}
                      </span>
                      <h4 className="text-xs font-bold text-[#1B1917] leading-snug">
                        {book.title}
                      </h4>
                    </div>
                    <span className="text-[10px] text-[#786E65] line-clamp-1">
                      {book.author}
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isChecked
                        ? 'bg-[#2E7D32] text-white shadow-2xs'
                        : 'border-2 border-stone-300'
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-4 h-4 fill-white text-[#2E7D32]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Options & Save Action */}
        <div className="p-4 bg-white/90 border-t border-stone-200/60 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#1B1917]">
              Total Marked Completed:
            </span>
            <span className="font-extrabold text-[#2E7D32] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {selectedBookIds.length} of {folkBookCatalogue.length} Books
            </span>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 rounded-2xl bg-[#DC6820] hover:bg-[#C95B16] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-[0.99]"
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Save Completed Books Log</span>
          </button>
        </div>
      </div>
    </div>
  );
}
