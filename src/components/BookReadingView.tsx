'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { folkBookCatalogue, getBookCoverUrl } from '@/lib/mockData';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Bookmark,
  ChevronRight,
  Layers,
  Sparkles,
  BookmarkCheck,
  History,
  Sun,
  Calendar,
} from 'lucide-react';
import BookBacklogModal from '@/components/BookBacklogModal';

export default function BookReadingView() {
  const {
    currentUser,
    readingState,
    updateCurrentBook,
    openLogModal,
    setIsBacklogModalOpen,
    setActiveFolkBoyTab,
    setIsProfileModalOpen,
  } = useApp();
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3 | 4 | 5>(readingState.current_book_level);

  const currentBookDetails = folkBookCatalogue.find((b) => b.id === readingState.current_book_id);
  const currentCoverUrl = getBookCoverUrl(readingState.current_book_title);
  const booksInLevel = folkBookCatalogue.filter((b) => b.level === selectedLevel);

  const hoursRead = Math.floor(readingState.total_minutes_read / 60);
  const minsRead = readingState.total_minutes_read % 60;

  return (
    <div className="pb-36 max-w-md mx-auto px-4 pt-3 select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#1B1917]">
            FOLK Book Reading
          </h1>
          <p className="text-xs text-[#786E65]">
            Srila Prabhupada&apos;s ordered books & reading log
          </p>
        </div>
        <div
          onClick={() => setIsProfileModalOpen(true)}
          title="Profile & Theme"
          className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-300 shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <img
            src={currentUser.avatar_url || '/assets/images/Chanting.png'}
            alt={currentUser.full_name}
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      {/* Hero Card: Current Book Reading with Cover Art */}
      <section className="mb-4">
        <div className="glass-surface-elevated p-5 rounded-[28px] relative overflow-hidden shadow-md">
          {/* Subtle amber gradient halo */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#DC6820]/12 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-[#9C4507] text-[10px] font-extrabold uppercase tracking-wider">
              <Bookmark className="w-3 h-3 text-[#DC6820]" />
              Currently Reading
            </span>
            <span className="text-[11px] font-bold text-[#8C460D] bg-white/80 border border-stone-200/60 px-2.5 py-0.5 rounded-full">
              Level {readingState.current_book_level}
            </span>
          </div>

          {/* Book Cover + Title Row */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-22 rounded-xl overflow-hidden border-2 border-amber-900/20 shadow-md shrink-0 bg-stone-100">
              <img
                src={currentCoverUrl}
                alt={readingState.current_book_title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#1B1917] leading-snug">
                {readingState.current_book_title}
              </h2>
              <p className="text-xs text-[#6E665E] font-medium mt-0.5">
                {currentBookDetails?.author || 'A.C. Bhaktivedanta Swami Prabhupada'}
              </p>
              <span className="inline-block mt-2 text-[10px] font-bold text-[#DC6820] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                Book #{currentBookDetails?.order || 25} in Catalogue
              </span>
            </div>
          </div>

          {/* Reading Stats Grid */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-stone-200/50 mb-4 text-center">
            <div>
              <div className="text-[10px] font-bold text-[#8E867F] uppercase tracking-wider">
                Total Time
              </div>
              <div className="text-base font-extrabold text-[#1B1917] mt-0.5">
                {hoursRead}h {minsRead}m
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#8E867F] uppercase tracking-wider">
                Sessions
              </div>
              <div className="text-base font-extrabold text-[#1B1917] mt-0.5">
                {readingState.sessions_count}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#8E867F] uppercase tracking-wider">
                Started
              </div>
              <div className="text-base font-extrabold text-[#1B1917] mt-0.5">
                {new Date(readingState.started_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>

          {/* Actions: Log Reading or Mark Backlog */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={openLogModal}
              className="py-2.5 px-3 rounded-2xl bg-[#DC6820] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-[0.99] transition-all"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Log Reading</span>
            </button>
            <button
              onClick={() => setIsBacklogModalOpen(true)}
              className="py-2.5 px-3 rounded-2xl bg-white border border-stone-200 text-[#1B1917] font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs hover:bg-stone-50 cursor-pointer transition-all"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-[#DC6820]" />
              <span>Mark Past Books</span>
            </button>
          </div>
        </div>
      </section>

      {/* Ordered FOLK Reading Sequence (Level 1 to 5) */}
      <section className="glass-surface p-4.5 rounded-[28px] mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#DC6820]" />
            <h2 className="text-sm font-extrabold text-[#1B1917]">
              Ordered Reading Catalogue
            </h2>
          </div>
          <span className="text-[11px] font-bold text-[#786E65]">
            {folkBookCatalogue.length} Books
          </span>
        </div>

        {/* Level selector tabs (Levels 1 to 5) */}
        <div className="flex gap-1 p-1 rounded-2xl bg-white/70 border border-white/90 shadow-2xs mb-3">
          {([1, 2, 3, 4, 5] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-[#DC6820] text-white shadow-2xs'
                  : 'text-[#6E665E] hover:text-[#1B1917]'
              }`}
            >
              Lvl {lvl}
            </button>
          ))}
        </div>

        {/* Level Description */}
        <div className="text-[11px] font-medium text-[#786E65] mb-3 px-1">
          {selectedLevel === 1 && 'Foundational literature introducing the science of bhakti.'}
          {selectedLevel === 2 && 'Intermediate philosophy on yoga, soul, and detachment.'}
          {selectedLevel === 3 && 'Advanced discussions, science, and the purpose of life.'}
          {selectedLevel === 4 && 'Major canonical shastras for serious spiritual scholarship.'}
          {selectedLevel === 5 && 'Śrīmad-Bhāgavatam (Amala Purāṇa) — 10 transcendental Cantos translated by Srila Prabhupada.'}
        </div>

        {/* Book List in Selected Level with Authentic Cover Art */}
        <div className="space-y-2.5">
          {booksInLevel.map((book) => {
            const isCurrent = readingState.current_book_id === book.id;
            const isCompleted = readingState.completed_books.some((cb) => cb.book_id === book.id);
            const coverUrl = getBookCoverUrl(book.title);

            return (
              <div
                key={book.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  isCurrent
                    ? 'bg-amber-50/90 border-[#DC6820]/40 shadow-xs'
                    : 'bg-white/70 border-white/80 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Real Book Cover Thumbnail */}
                  <div className="w-10 h-13 rounded-lg overflow-hidden border border-amber-900/15 shrink-0 bg-stone-100 shadow-2xs">
                    <img src={coverUrl} alt={book.title} className="w-full h-full object-cover" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-[#8E867F]">
                        #{book.order}
                      </span>
                      <h3 className="text-xs font-bold text-[#1B1917] leading-snug">
                        {book.title}
                      </h3>
                    </div>
                    <span className="text-[10px] text-[#786E65]">
                      {book.author}
                    </span>
                  </div>
                </div>

                <div>
                  {isCurrent ? (
                    <span className="text-[10px] font-bold text-[#9C4507] bg-amber-100/90 px-2.5 py-1 rounded-lg">
                      Active
                    </span>
                  ) : isCompleted ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-1 rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Read
                    </span>
                  ) : (
                    <button
                      onClick={() => updateCurrentBook(book.id)}
                      className="text-[10px] font-bold text-[#786E65] hover:text-[#DC6820] bg-white border border-stone-200/60 px-2.5 py-1 rounded-lg cursor-pointer"
                    >
                      Set Active
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Completed Books Log & History */}
      <section className="glass-surface p-4.5 rounded-[28px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#2E7D32]" />
            <h2 className="text-xs font-bold text-[#1B1917] uppercase tracking-wider">
              Completed Books Log
            </h2>
          </div>
          <button
            onClick={() => setIsBacklogModalOpen(true)}
            className="text-[10px] font-bold text-[#DC6820] hover:underline cursor-pointer"
          >
            + Add Past Book
          </button>
        </div>

        <div className="space-y-2">
          {readingState.completed_books.length === 0 ? (
            <div className="text-center py-4 text-xs text-[#8E867F]">
              No completed books logged yet. Tap &apos;Mark Past Books&apos; to log your history!
            </div>
          ) : (
            readingState.completed_books.map((b) => {
              const coverUrl = getBookCoverUrl(b.title);
              return (
                <div
                  key={b.book_id}
                  className="p-2.5 rounded-xl bg-white/70 border border-white/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-8 rounded overflow-hidden shrink-0 border border-stone-200">
                      <img src={coverUrl} alt={b.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="font-semibold text-[#1B1917] block leading-tight">{b.title}</span>
                      <span className="text-[10px] text-[#8E867F]">Completed: {b.completed_at}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                    {Math.round(b.total_minutes / 60)} hrs read
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Backlog Book Completion Modal */}
      <BookBacklogModal />

      {/* Floating Bottom Navigation Dock: STRICTLY 3 ITEMS (Home, Calendar, Books)
          "Alignments of Taskbar (remove that AI type thing only 3 things there ,home , calendar , books)" */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass-surface-elevated py-2.5 px-3 rounded-full grid grid-cols-3 items-center shadow-2xl border border-white/90 z-40">
        <button
          type="button"
          onClick={() => setActiveFolkBoyTab('home')}
          className="flex flex-col items-center justify-center gap-1 text-[#786E65] hover:text-[#1B1917] font-semibold cursor-pointer"
        >
          <div className="p-1 rounded-xl hover:bg-stone-100">
            <Sun className="w-5 h-5" />
          </div>
          <span className="text-[11px]">Home</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFolkBoyTab('calendar')}
          className="flex flex-col items-center justify-center gap-1 text-[#786E65] hover:text-[#1B1917] font-semibold cursor-pointer"
        >
          <div className="p-1 rounded-xl hover:bg-stone-100">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[11px]">Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFolkBoyTab('books')}
          className="flex flex-col items-center justify-center gap-1 text-[#E07A2B] font-bold cursor-pointer"
        >
          <div className="p-1 rounded-xl bg-amber-500/10">
            <BookOpen className="w-5 h-5 text-[#E07A2B]" />
          </div>
          <span className="text-[11px] font-black">Books</span>
        </button>
      </nav>
    </div>
  );
}
