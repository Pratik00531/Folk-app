'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  SadhanaRecord,
  StreakData,
  CCTransaction,
  ReminderNotification,
  UserRole,
  UserReadingState,
  PointRuleConfig,
  SadhanaApprovalRequest,
} from '@/types/database';
import {
  mockUsers,
  initialStreak,
  initialCCTransactions,
  initialReminder,
  initialReadingState,
  initialPointRules,
  initialSadhanaRecords,
  initialSadhanaApprovalRequests,
  mockGuideDevotees,
  GuideDevoteeOverview,
  folkBookCatalogue,
} from '@/lib/mockData';

import { isSupabaseConfigured } from '@/lib/supabase';
import {
  apiSignUp,
  apiSignIn,
  apiSignOut,
  apiGetSession,
  apiGetProfile,
  apiUpdateProfile,
  apiGetSadhanaRecords,
  apiUpsertSadhanaRecord,
  apiGetStreak,
  apiUpdateStreak,
  apiGetApprovalRequests,
  apiCreateApprovalRequest,
  apiReviewApprovalRequest,
  apiGetReadingProgress,
  apiUpdateReadingProgress,
  apiSubscribeToSadhanaChanges,
  apiSubscribeToApprovalChanges,
  apiGetGuideDevotees,
} from '@/lib/supabaseService';

export type ScreenType = 'splash' | 'welcome' | 'login' | 'signup' | 'home';

interface AppContextType {
  isLiveBackend: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: any }>;
  signUp: (params: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role?: UserRole;
  }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  currentScreen: ScreenType;
  setScreen: (screen: ScreenType) => void;
  currentUser: UserProfile;
  switchRole: (role: UserRole) => void;
  streak: StreakData;
  ccBalance: number;
  ccTransactions: CCTransaction[];
  todaySadhanaSubmitted: boolean;
  todayRecord: SadhanaRecord | null;
  sadhanaRecords: Record<string, SadhanaRecord>;
  reminder: ReminderNotification | null;
  dismissReminder: () => void;
  isLogModalOpen: boolean;
  selectedDateForModal: string;
  openLogModal: () => void;
  openLogModalForDate: (date: string) => void;
  closeLogModal: () => void;
  submitSadhanaForDate: (date: string, data: Partial<SadhanaRecord>) => void;
  resetTodaySadhana: () => void;
  readingState: UserReadingState;
  updateCurrentBook: (bookId: string) => void;
  markBooksAsCompleted: (bookIds: string[], completedDate?: string, estMinutesPerBook?: number) => void;
  pointRules: PointRuleConfig[];
  updatePointRule: (ruleId: string, updates: Partial<PointRuleConfig> | number, newThreshold?: string) => void;
  guideDevotees: GuideDevoteeOverview[];
  toggleLeadRole: (devoteeId: string) => void;
  activeFolkBoyTab: 'home' | 'calendar' | 'books' | 'profile';
  setActiveFolkBoyTab: (tab: 'home' | 'calendar' | 'books' | 'profile') => void;
  selectedDevoteeForDetail: GuideDevoteeOverview | null;
  setSelectedDevoteeForDetail: (d: GuideDevoteeOverview | null) => void;
  isPointsModalOpen: boolean;
  setIsPointsModalOpen: (open: boolean) => void;
  isBacklogModalOpen: boolean;
  setIsBacklogModalOpen: (open: boolean) => void;
  sendRemindersToPending: () => { count: number; names: string[] };
  approvalRequests: SadhanaApprovalRequest[];
  requestLateSadhanaApproval: (date: string, data: Partial<SadhanaRecord>, reason?: string) => void;
  approveSadhanaRequest: (requestId: string, leadName: string) => void;
  rejectSadhanaRequest: (requestId: string, leadName: string, reason?: string) => void;
  showDuolingoStreakAnimation: boolean;
  setShowDuolingoStreakAnimation: (show: boolean) => void;
  streakOldCount: number;
  streakNewCount: number;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  toggleTheme: () => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentScreen, setScreen] = useState<ScreenType>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile>(mockUsers.folk_boy);
  const [streak, setStreak] = useState<StreakData>(initialStreak);
  const [ccTransactions, setCcTransactions] = useState<CCTransaction[]>(initialCCTransactions);
  const [reminder, setReminder] = useState<ReminderNotification | null>(initialReminder);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<string>('2026-10-03');
  const [sadhanaRecords, setSadhanaRecords] = useState<Record<string, SadhanaRecord>>(initialSadhanaRecords);
  const [readingState, setReadingState] = useState<UserReadingState>(initialReadingState);
  const [pointRules, setPointRules] = useState<PointRuleConfig[]>(initialPointRules);
  const [guideDevotees, setGuideDevotees] = useState<GuideDevoteeOverview[]>(mockGuideDevotees);
  const [activeFolkBoyTab, setActiveFolkBoyTab] = useState<'home' | 'calendar' | 'books' | 'profile'>('home');
  const [selectedDevoteeForDetail, setSelectedDevoteeForDetail] = useState<GuideDevoteeOverview | null>(null);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState<boolean>(false);
  const [isBacklogModalOpen, setIsBacklogModalOpen] = useState<boolean>(false);
  const [approvalRequests, setApprovalRequests] = useState<SadhanaApprovalRequest[]>(initialSadhanaApprovalRequests);
  const [showDuolingoStreakAnimation, setShowDuolingoStreakAnimation] = useState<boolean>(false);
  const [streakOldCount, setStreakOldCount] = useState<number>(initialStreak.current_reporting_streak);
  const [streakNewCount, setStreakNewCount] = useState<number>(initialStreak.current_reporting_streak + 1);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [isLiveBackend] = useState<boolean>(isSupabaseConfigured);

  // Check Supabase session & setup realtime listeners if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Initial session load
    apiGetSession().then(({ data }) => {
      if (data?.session?.user) {
        const uid = data.session.user.id;
        apiGetProfile(uid).then(({ data: profile }) => {
          if (profile) {
            setCurrentUser({
              id: profile.id,
              folk_id: profile.folk_id,
              full_name: profile.full_name,
              spiritual_name: profile.spiritual_name || null,
              phone: profile.phone || '',
              email: profile.email || data.session?.user.email || '',
              role: profile.role || 'folk_boy',
              avatar_url: profile.avatar_url || null,
              chanting_commitment: profile.chanting_commitment || 16,
              college_or_profession: profile.college_or_profession || 'Devotee',
              guide_name: 'HG Amogh Virya Dasa',
              lead_name: 'HG Madhav Das',
              created_at: profile.created_at,
              updated_at: profile.updated_at,
            });
          }
        });

        apiGetSadhanaRecords(uid).then(({ data: records }) => {
          if (records && records.length > 0) {
            const mapped: Record<string, SadhanaRecord> = {};
            records.forEach((r: any) => {
              mapped[r.record_date] = r;
            });
            setSadhanaRecords(mapped);
          } else {
            setSadhanaRecords({});
          }
        });

        apiGetStreak(uid).then(({ data: s }) => {
          if (s) {
            setStreak((prev) => ({
              ...prev,
              current_reporting_streak: s.current_reporting_streak || 0,
              longest_reporting_streak: s.longest_reporting_streak || 0,
              last_reported_date: s.last_reported_date,
              next_milestone: s.next_milestone || 3,
            }));
          }
        });

        apiGetReadingProgress(uid).then(({ data: p }) => {
          if (p) {
            setReadingState((prev) => ({
              ...prev,
              current_book_title: p.current_book_title || prev.current_book_title,
              current_book_level: p.current_book_level || prev.current_book_level,
              total_minutes_read: p.total_reading_minutes || prev.total_minutes_read,
              completed_books: p.completed_books || prev.completed_books,
            }));
          }
        });
      }
    });

    // Always fetch live Guide roster and approvals from Supabase
    apiGetGuideDevotees().then(({ data: devs }) => {
      if (devs && devs.length > 0) {
        setGuideDevotees(devs);
      }
    });

    apiGetApprovalRequests().then(({ data: reqs }) => {
      if (reqs && reqs.length > 0) {
        setApprovalRequests(reqs);
      }
    });

    // Realtime subscriptions
    const sadhanaSub = apiSubscribeToSadhanaChanges((payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const newRecord = payload.new as SadhanaRecord;
        if (newRecord?.record_date) {
          setSadhanaRecords((prev) => ({
            ...prev,
            [newRecord.record_date]: newRecord,
          }));
        }
        // Update Guide roster in real time as boys submit their Sādhana
        apiGetGuideDevotees().then(({ data: devs }) => {
          if (devs && devs.length > 0) {
            setGuideDevotees(devs);
          }
        });
      }
    });

    const approvalSub = apiSubscribeToApprovalChanges((payload) => {
      if (payload.eventType === 'INSERT') {
        setApprovalRequests((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setApprovalRequests((prev) =>
          prev.map((req) => (req.id === payload.new.id ? payload.new : req))
        );
      }
    });

    return () => {
      sadhanaSub.unsubscribe();
      approvalSub.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, pass: string) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    const { data, error } = await apiSignIn(email, pass);
    if (!error && data?.user) {
      const uid = data.user.id;
      const { data: profile } = await apiGetProfile(uid);
      if (profile) {
        setCurrentUser({
          id: profile.id,
          folk_id: profile.folk_id,
          full_name: profile.full_name,
          spiritual_name: profile.spiritual_name || null,
          phone: profile.phone || '',
          email: profile.email || data.user.email || '',
          role: profile.role || 'folk_boy',
          avatar_url: profile.avatar_url || null,
          chanting_commitment: profile.chanting_commitment || 16,
          college_or_profession: profile.college_or_profession || 'Devotee',
          guide_name: 'HG Amogh Virya Dasa',
          lead_name: 'HG Madhav Das',
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        });
      }

      // Fetch user's sadhana records
      apiGetSadhanaRecords(uid).then(({ data: records }) => {
        if (records && records.length > 0) {
          const mapped: Record<string, SadhanaRecord> = {};
          records.forEach((r: any) => {
            mapped[r.record_date] = r;
          });
          setSadhanaRecords(mapped);
        } else {
          setSadhanaRecords({});
        }
      });

      // Fetch user's streak
      apiGetStreak(uid).then(({ data: s }) => {
        if (s) {
          setStreak((prev) => ({
            ...prev,
            current_reporting_streak: s.current_reporting_streak || 0,
            longest_reporting_streak: s.longest_reporting_streak || 0,
            last_reported_date: s.last_reported_date,
            next_milestone: s.next_milestone || 3,
          }));
        }
      });

      // Fetch guide roster and approvals
      apiGetGuideDevotees().then(({ data: devs }) => {
        if (devs && devs.length > 0) setGuideDevotees(devs);
      });
      apiGetApprovalRequests().then(({ data: reqs }) => {
        if (reqs && reqs.length > 0) setApprovalRequests(reqs);
      });

      setScreen('home');
    }
    return { error };
  };

  const signUp = async (params: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role?: UserRole;
  }) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    const { error } = await apiSignUp(params);
    return { error };
  };

  const signOut = async () => {
    await apiSignOut();
    setSadhanaRecords({});
    setStreak(initialStreak);
    setGuideDevotees([]);
    setApprovalRequests([]);
    setScreen('login');
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...updates,
      updated_at: new Date().toISOString(),
    }));
    if (isSupabaseConfigured) {
      apiUpdateProfile(currentUser.id, updates);
    }
  };

  const todayStr = '2026-10-03';
  const todayRecord = sadhanaRecords[todayStr] || null;
  const todaySadhanaSubmitted = Boolean(todayRecord && todayRecord.points_earned > 0);

  const ccBalance = ccTransactions.length > 0 ? ccTransactions[0].balance_after : 145;

  const switchRole = (role: UserRole) => {
    setCurrentUser(mockUsers[role] || mockUsers.folk_boy);
  };

  const openLogModal = () => {
    setSelectedDateForModal(todayStr);
    setIsLogModalOpen(true);
  };

  const openLogModalForDate = (date: string) => {
    setSelectedDateForModal(date);
    setIsLogModalOpen(true);
  };

  const closeLogModal = () => setIsLogModalOpen(false);

  const dismissReminder = () => setReminder(null);

  // Single Screen Sādhana Submission with Real-Time Guide Synchronization
  const submitSadhanaForDate = (date: string, data: Partial<SadhanaRecord>) => {
    const parts = date.split('-').map(Number);
    const dayOfWeek = new Date(parts[0], parts[1] - 1, parts[2]).getDay();
    const isSunday = dayOfWeek === 0;

    // Dynamic points calculation based on current pointRules
    let calculatedPoints = 0;
    const mangalaRule = pointRules.find((r) => r.activity === 'mangala_arati');
    const japaRule = pointRules.find((r) => r.activity === 'japa');
    const sbRule = pointRules.find((r) => r.activity === 'srimad_bhagavatam');
    const jfRule = pointRules.find((r) => r.activity === 'japa_finish');
    const darshanRule = pointRules.find((r) => r.activity === 'darshan_arati');
    const bookRule = pointRules.find((r) => r.activity === 'book_reading');

    // 1. Mangala dot & points (20 pts)
    let mangalaDot: 'green' | 'light_green' | 'yellow' | 'red' | 'grey' = 'red';
    if (data.mangala_arati_time) {
      const timeStr = data.mangala_arati_time.toUpperCase();
      const ontimeLimit = mangalaRule?.ontime_to || mangalaRule?.ontime_cutoff || '05:05 AM';
      const lateLimit = mangalaRule?.late_to || mangalaRule?.late_cutoff || '05:15 AM';
      if (timeStr <= ontimeLimit) {
        mangalaDot = 'green';
        calculatedPoints += mangalaRule?.ontime_points ?? 20;
      } else if (timeStr <= lateLimit) {
        mangalaDot = 'light_green';
        calculatedPoints += mangalaRule?.late_points ?? 14;
      } else {
        mangalaDot = 'yellow';
        calculatedPoints += mangalaRule?.lastmin_points ?? 8;
      }
    }

    // 2. Japa dot & points (Weekday: 40 pts, Sunday: 35 pts)
    let japaDot: 'green' | 'light_green' | 'yellow' | 'red' | 'grey' = 'red';
    if (data.japa_start_time && data.japa_rounds && data.japa_rounds > 0) {
      const fullJapa = isSunday ? 35 : (japaRule?.ontime_points ?? 40);
      const lateJapa = isSunday ? 24 : (japaRule?.late_points ?? 28);
      const lastminJapa = isSunday ? 14 : (japaRule?.lastmin_points ?? 16);

      if (data.japa_rounds >= 16) {
        japaDot = 'green';
        calculatedPoints += fullJapa;
      } else if (data.japa_rounds >= 12) {
        japaDot = 'light_green';
        calculatedPoints += lateJapa;
      } else if (data.japa_rounds >= 8) {
        japaDot = 'yellow';
        calculatedPoints += lastminJapa;
      } else {
        japaDot = 'yellow';
        calculatedPoints += Math.round(lastminJapa / 2);
      }
    }

    // 3. Darshan Ārati (Sunday only: 10 pts; Weekday: 0 pts, NOT calculated)
    let darshanDot: 'green' | 'light_green' | 'yellow' | 'red' | 'grey' = 'grey';
    if (isSunday) {
      if (data.darshan_arati_time) {
        const timeStr = data.darshan_arati_time.toUpperCase();
        const ontimeLimit = darshanRule?.ontime_to || darshanRule?.ontime_cutoff || '07:30 AM';
        const lateLimit = darshanRule?.late_to || darshanRule?.late_cutoff || '07:45 AM';
        if (timeStr <= ontimeLimit) {
          darshanDot = 'green';
          calculatedPoints += darshanRule?.ontime_points ?? 10;
        } else if (timeStr <= lateLimit) {
          darshanDot = 'light_green';
          calculatedPoints += darshanRule?.late_points ?? 7;
        } else {
          darshanDot = 'yellow';
          calculatedPoints += darshanRule?.lastmin_points ?? 4;
        }
      } else {
        darshanDot = 'red';
      }
    } else {
      // Not Sunday -> Darshan is strictly NOT calculated
      darshanDot = 'grey';
    }

    // 4. Śrīmad Bhāgavatam (Weekday: 20 pts, Sunday: 15 pts)
    let sbDot: 'green' | 'light_green' | 'yellow' | 'red' | 'grey' = 'red';
    if (data.srimad_bhagavatam_time) {
      const timeStr = data.srimad_bhagavatam_time.toUpperCase();
      const ontimeLimit = sbRule?.ontime_to || sbRule?.ontime_cutoff || '07:35 AM';
      const lateLimit = sbRule?.late_to || sbRule?.late_cutoff || '07:45 AM';
      const fullSb = isSunday ? 15 : (sbRule?.ontime_points ?? 20);
      const lateSb = isSunday ? 10 : (sbRule?.late_points ?? 14);
      const lastminSb = isSunday ? 5 : (sbRule?.lastmin_points ?? 8);

      if (timeStr <= ontimeLimit) {
        sbDot = 'green';
        calculatedPoints += fullSb;
      } else if (timeStr <= lateLimit) {
        sbDot = 'light_green';
        calculatedPoints += lateSb;
      } else {
        sbDot = 'yellow';
        calculatedPoints += lastminSb;
      }
    }

    // 5. JF (Japa Finish Slot) (10 pts)
    let jfDot: 'green' | 'light_green' | 'yellow' | 'red' | 'grey' = 'red';
    if (data.japa_finish_slot_time) {
      jfDot = 'green';
      calculatedPoints += jfRule?.ontime_points ?? 10;
    }

    // 6. Book Reading (10 pts)
    let readingDot: 'green' | 'light_green' | 'yellow' | 'red' | 'grey' = 'red';
    const readingMins = Number(data.book_reading_minutes) || 0;
    if (readingMins >= 30) {
      readingDot = 'green';
      calculatedPoints += bookRule?.ontime_points ?? 10;
    } else if (readingMins >= 15) {
      readingDot = 'light_green';
      calculatedPoints += bookRule?.late_points ?? 7;
    } else if (readingMins >= 5) {
      readingDot = 'yellow';
      calculatedPoints += bookRule?.lastmin_points ?? 4;
    }

    const finalPoints = calculatedPoints;
    const earnedCC = date === todayStr ? 10 : 5;
    const newBalance = ccBalance + earnedCC;

    // CC Ledger
    const newTx: CCTransaction = {
      id: `tx-${Date.now()}`,
      user_id: currentUser.id,
      amount: earnedCC,
      balance_after: newBalance,
      reason: date === todayStr ? 'Same-day Sādhana submission' : `Sādhana recorded for ${date}`,
      created_at: new Date().toISOString(),
    };

    // Update Streak if it was today
    if (date === todayStr && !todaySadhanaSubmitted) {
      const newStreakCount = streak.current_reporting_streak + 1;
      const isNewPersonalBest = newStreakCount > streak.longest_reporting_streak;
      setStreak((prev) => ({
        ...prev,
        current_reporting_streak: newStreakCount,
        longest_reporting_streak: isNewPersonalBest ? newStreakCount : prev.longest_reporting_streak,
        last_reported_date: date,
        next_milestone: prev.milestones.find((m) => m > newStreakCount) || prev.next_milestone,
      }));
    }

    // Save Sādhana Record for that date
    const record: SadhanaRecord = {
      id: `rec-${date}`,
      user_id: currentUser.id,
      record_date: date,
      mangala_arati_time: data.mangala_arati_time || null,
      japa_start_time: data.japa_start_time || null,
      japa_finish_time: data.japa_finish_time || null,
      japa_duration_minutes: data.japa_duration_minutes || null,
      japa_rounds: data.japa_rounds || 16,
      darshan_arati_time: data.darshan_arati_time || null,
      srimad_bhagavatam_time: data.srimad_bhagavatam_time || null,
      japa_finish_slot_time: data.japa_finish_slot_time || null,
      book_title: data.book_title || readingState.current_book_title,
      book_level: data.book_level || readingState.current_book_level,
      book_reading_minutes: readingMins,
      remarks: data.remarks || null,
      points_earned: finalPoints,
      cc_earned: earnedCC,
      point_rule_version: 1,
      is_late_submission: Boolean(data.is_late_submission || date < todayStr),
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSadhanaRecords((prev) => ({
      ...prev,
      [date]: record,
    }));

    // Persist to Supabase if live backend is connected
    if (isSupabaseConfigured) {
      apiUpsertSadhanaRecord({
        ...record,
        user_id: currentUser.id,
      });
      apiUpdateStreak(currentUser.id, {
        current_reporting_streak:
          streak.current_reporting_streak + (date === todayStr && !todaySadhanaSubmitted ? 1 : 0),
        longest_reporting_streak: streak.longest_reporting_streak,
        last_reported_date: date,
        next_milestone: streak.next_milestone,
      });
    }

    // Update accumulated reading time
    if (readingMins > 0) {
      setReadingState((prev) => ({
        ...prev,
        total_minutes_read: prev.total_minutes_read + readingMins,
        sessions_count: prev.sessions_count + 1,
        last_reading_date: date,
      }));
    }

    // REAL-TIME GUIDE ROSTER SYNCHRONIZATION ("Things should be updated asap the boys fill its sadhna !!")
    setGuideDevotees((prev) =>
      prev.map((d) => {
        if (d.folk_id === currentUser.folk_id || d.id === currentUser.id) {
          return {
            ...d,
            submitted: true,
            points_today: finalPoints,
            last_sadhana_label: "Today's Sādhana",
            last_points: finalPoints,
            last_submitted_date: 'Today, Just now',
            pillars: {
              mangala: Boolean(data.mangala_arati_time),
              japa: Boolean(data.japa_start_time),
              darshan: Boolean(data.darshan_arati_time),
              bhagavatam: Boolean(data.srimad_bhagavatam_time),
              jf: Boolean(data.japa_finish_slot_time),
              reading: readingMins > 0,
            },
            pillar_dots: {
              mangala: mangalaDot,
              japa: japaDot,
              darshan: darshanDot,
              bhagavatam: sbDot,
              jf: jfDot,
              reading: readingDot,
            },
            japa_rounds: data.japa_rounds || 16,
            japa_arrival: data.japa_start_time || null,
            japa_leaving: data.japa_finish_time || null,
            mangala_time: data.mangala_arati_time || null,
            bhagavatam_time: data.srimad_bhagavatam_time || null,
            jf_time: data.japa_finish_slot_time || null,
            reading_mins: readingMins,
          };
        }
        return d;
      })
    );

    setCcTransactions([newTx, ...ccTransactions]);
    setReminder(null);

    // Duolingo-style Streak Celebration Trigger for Today's Sādhana
    if (date === todayStr) {
      const oldStreak = streak.current_reporting_streak;
      const newStreak = !todaySadhanaSubmitted ? oldStreak + 1 : oldStreak;
      setStreakOldCount(oldStreak);
      setStreakNewCount(newStreak);
      setShowDuolingoStreakAnimation(true);
    }

    // Confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#E07A2B', '#E5A93C', '#2E7D32', '#1B1917'],
      });
    } catch {
      // Fallback
    }
  };

  const resetTodaySadhana = () => {
    setSadhanaRecords((prev) => {
      const copy = { ...prev };
      delete copy[todayStr];
      return copy;
    });
    setStreak(initialStreak);
    setReminder(initialReminder);
  };

  const updateCurrentBook = (bookId: string) => {
    const book = folkBookCatalogue.find((b) => b.id === bookId);
    if (!book) return;
    setReadingState((prev) => ({
      ...prev,
      current_book_id: book.id,
      current_book_title: book.title,
      current_book_level: book.level,
    }));
  };

  // Backlog Book Completion: Mark books finished before app rollout
  const markBooksAsCompleted = (bookIds: string[], completedDate = '2026-06-01', estMinutesPerBook = 180) => {
    setReadingState((prev) => {
      const existingIds = new Set(prev.completed_books.map((b) => b.book_id));
      const newlyCompleted = bookIds
        .filter((id) => !existingIds.has(id))
        .map((id) => {
          const book = folkBookCatalogue.find((b) => b.id === id);
          return {
            book_id: id,
            title: book?.title || 'Srila Prabhupada Book',
            completed_at: completedDate,
            total_minutes: estMinutesPerBook,
          };
        });

      const addedMinutes = newlyCompleted.length * estMinutesPerBook;
      return {
        ...prev,
        completed_books: [...prev.completed_books, ...newlyCompleted],
        total_minutes_read: prev.total_minutes_read + addedMinutes,
        sessions_count: prev.sessions_count + newlyCompleted.length * 4,
      };
    });
  };

  const updatePointRule = (ruleId: string, updates: Partial<PointRuleConfig> | number, newThreshold?: string) => {
    setPointRules((prev) =>
      prev.map((r) => {
        if (r.id !== ruleId) return r;
        if (typeof updates === 'number') {
          return { ...r, points: updates, threshold_time: newThreshold ?? r.threshold_time };
        }
        return { ...r, ...updates, points: updates.points ?? updates.ontime_points ?? r.points };
      })
    );
  };

  const toggleLeadRole = (devoteeId: string) => {
    setGuideDevotees((prev) =>
      prev.map((d) =>
        d.id === devoteeId ? { ...d, role: d.role === 'folk_boy' ? 'folk_lead' : 'folk_boy' } : d
      )
    );
  };

  // Targeted reminder to ONLY those devotees who haven't filled today's sadhana
  const sendRemindersToPending = () => {
    const pending = guideDevotees.filter((d) => !d.submitted);
    const names = pending.map((d) => d.name);
    // If the currently logged in user is pending, set their reminder notification
    if (pending.some((d) => d.folk_id === currentUser.folk_id)) {
      setReminder({
        id: `rem-${Date.now()}`,
        sender_id: 'user-guide-amogh',
        sender_name: 'HG Amogh Virya Dasa',
        sender_role: 'folk_guide',
        recipient_id: currentUser.id,
        recipient_name: currentUser.full_name,
        message: 'Your FOLK Guide is requesting you to submit today’s Sādhana.',
        deep_link: '/sadhana/today',
        sent_at: 'Just now',
        is_read: false,
      });
    }
    return { count: pending.length, names };
  };

  // Late Sādhana Submission Approval (>3 days late locked in calendar)
  const requestLateSadhanaApproval = (date: string, data: Partial<SadhanaRecord>, reason?: string) => {
    const newReq: SadhanaApprovalRequest = {
      id: `req-${Date.now()}`,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      folk_id: currentUser.folk_id,
      record_date: date,
      data,
      status: 'pending',
      reason: reason || 'Late submission (>3 days past) requested for Folk Lead approval',
      requested_at: new Date().toISOString(),
    };
    setApprovalRequests((prev) => [newReq, ...prev]);
    setIsLogModalOpen(false);

    if (isSupabaseConfigured) {
      apiCreateApprovalRequest({
        userId: currentUser.id,
        devoteeName: currentUser.full_name,
        devoteeFolkId: currentUser.folk_id,
        recordDate: date,
        lateDays: 4,
        reason: reason || 'Late submission (>3 days past) requested for Folk Lead approval',
        submittedPoints: 85,
        sadhanaPayload: data,
      });
    }
  };

  const approveSadhanaRequest = (requestId: string, leadName: string) => {
    const target = approvalRequests.find((r) => r.id === requestId);
    if (!target) return;
    setApprovalRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'approved', reviewed_by: leadName, reviewed_at: new Date().toISOString() }
          : r
      )
    );

    if (isSupabaseConfigured) {
      apiReviewApprovalRequest(requestId, 'approved', leadName);
    }

    // Commit the sadhana record for that date with is_late_submission = true (Blue color!)
    submitSadhanaForDate(target.record_date, {
      ...target.data,
      is_late_submission: true,
    });
  };

  const rejectSadhanaRequest = (requestId: string, leadName: string, reason?: string) => {
    setApprovalRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected',
              reviewed_by: leadName,
              reviewed_at: new Date().toISOString(),
              reason: reason || r.reason,
            }
          : r
      )
    );

    if (isSupabaseConfigured) {
      apiReviewApprovalRequest(requestId, 'rejected', leadName);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isLiveBackend,
        signIn,
        signUp,
        signOut,
        currentScreen,
        setScreen,
        currentUser,
        switchRole,
        streak,
        ccBalance,
        ccTransactions,
        todaySadhanaSubmitted,
        todayRecord,
        sadhanaRecords,
        reminder,
        dismissReminder,
        isLogModalOpen,
        selectedDateForModal,
        openLogModal,
        openLogModalForDate,
        closeLogModal,
        submitSadhanaForDate,
        resetTodaySadhana,
        readingState,
        updateCurrentBook,
        markBooksAsCompleted,
        pointRules,
        updatePointRule,
        guideDevotees,
        toggleLeadRole,
        activeFolkBoyTab,
        setActiveFolkBoyTab,
        selectedDevoteeForDetail,
        setSelectedDevoteeForDetail,
        isPointsModalOpen,
        setIsPointsModalOpen,
        isBacklogModalOpen,
        setIsBacklogModalOpen,
        sendRemindersToPending,
        approvalRequests,
        requestLateSadhanaApproval,
        approveSadhanaRequest,
        rejectSadhanaRequest,
        showDuolingoStreakAnimation,
        setShowDuolingoStreakAnimation,
        streakOldCount,
        streakNewCount,
        theme,
        setTheme,
        toggleTheme,
        isProfileModalOpen,
        setIsProfileModalOpen,
        updateUserProfile,
        isExportModalOpen,
        setIsExportModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
