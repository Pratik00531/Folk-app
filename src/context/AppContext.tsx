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

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { getIndianTodayStr, getIndianYesterdayStr } from '@/lib/dateUtils';
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
  apiSendRemindersToDevotees,
  apiGetLatestReminderForDevotee,
  apiGetActivePointRules,
  apiSavePointRules,
} from '@/lib/supabaseService';
import { sendDeviceNotification } from '@/lib/notificationService';
import { evaluateSadhanaRecord } from '@/lib/pointRuleEngine';

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
    guideId?: string | null;
    guideName?: string | null;
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
  todayStr: string;
  openLogModal: () => void;
  openLogModalForDate: (date: string) => void;
  closeLogModal: () => void;
  submitSadhanaForDate: (
    date: string,
    data: Partial<SadhanaRecord>,
    targetUserId?: string,
    targetFolkId?: string
  ) => void;
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
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: any }>;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentScreen, setScreen] = useState<ScreenType>('welcome');
  const [currentUser, setCurrentUser] = useState<UserProfile>(mockUsers.folk_boy);
  const [streak, setStreak] = useState<StreakData>(initialStreak);
  const [ccTransactions, setCcTransactions] = useState<CCTransaction[]>(initialCCTransactions);
  const [reminder, setReminder] = useState<ReminderNotification | null>(initialReminder);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<string>(getIndianTodayStr());
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

  const currentUserRef = React.useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Immediately hydrate profile from localStorage for offline/reload persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('folk_user_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.full_name || parsed.id)) {
            setCurrentUser((prev) => ({
              ...prev,
              ...parsed,
            }));
          }
        }
      } catch {}
    }
  }, []);

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
        setScreen('home');
        const uid = data.session.user.id;
        apiGetProfile(uid).then(({ data: profile }) => {
          if (profile) {
            let localCache: Partial<UserProfile> = {};
            if (typeof window !== 'undefined') {
              try {
                const raw = localStorage.getItem('folk_user_profile');
                if (raw) localCache = JSON.parse(raw);
              } catch {}
            }

            const mergedUser: UserProfile = {
              id: profile.id,
              folk_id: profile.folk_id || localCache.folk_id || 'FOLK-XXXX',
              full_name: profile.full_name || localCache.full_name || '',
              phone: profile.phone || localCache.phone || '',
              email: profile.email || data.session?.user.email || localCache.email || '',
              role: profile.role || localCache.role || 'folk_boy',
              avatar_url: profile.avatar_url || localCache.avatar_url || null,
              chanting_commitment: profile.chanting_commitment || localCache.chanting_commitment || 16,
              college_or_profession: profile.college_or_profession || localCache.college_or_profession || 'Devotee',
              guide_id: profile.guide_id || localCache.guide_id || null,
              guide_name: profile.guide_name || localCache.guide_name || null,
              lead_id: profile.lead_id || localCache.lead_id || null,
              lead_name: profile.lead_name || localCache.lead_name || null,
              created_at: profile.created_at,
              updated_at: profile.updated_at,
            };

            setCurrentUser(mergedUser);
            if (typeof window !== 'undefined') {
              localStorage.setItem('folk_user_profile', JSON.stringify(mergedUser));
            }
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
        // Check for active reminders sent to this devotee today
        apiGetLatestReminderForDevotee(uid).then((latest) => {
          if (latest) {
            const sentTime = new Date(latest.sent_at).getTime();
            if (Date.now() - sentTime < 16 * 60 * 60 * 1000) {
              setReminder({
                id: latest.id,
                sender_id: latest.sender_id,
                sender_name: latest.sender_name || 'FOLK Guide',
                sender_role: latest.sender_role || 'folk_guide',
                recipient_id: latest.recipient_id,
                recipient_name: currentUserRef.current?.full_name || 'Devotee',
                message: latest.message,
                deep_link: latest.deep_link || '/sadhana/today',
                sent_at: 'Earlier today',
                is_read: false,
              });

              const notifiedKey = `notified_rem_${latest.id}`;
              if (typeof window !== 'undefined' && !localStorage.getItem(notifiedKey)) {
                localStorage.setItem(notifiedKey, 'true');
                sendDeviceNotification({
                  title: `🔔 Sādhana Reminder from ${latest.sender_name || 'FOLK Guide'}`,
                  body: latest.message || 'Please submit your daily Sādhana report.',
                  deepLink: latest.deep_link || '/sadhana/today',
                });
              }
            }
          }
        });
      }
    });

    // Load Guide Point Rules from Supabase or localStorage
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('folk_point_rules');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) setPointRules(parsed);
        } catch {}
      }
    }
    apiGetActivePointRules().then(({ data: remoteRules }) => {
      if (remoteRules && remoteRules.length > 0) {
        setPointRules(remoteRules);
        if (typeof window !== 'undefined') {
          localStorage.setItem('folk_point_rules', JSON.stringify(remoteRules));
        }
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
        const r = payload.new;
        const mappedReq: SadhanaApprovalRequest = {
          id: r.id,
          user_id: r.user_id,
          user_name: r.devotee_name || r.user_name || 'Devotee',
          folk_id: r.devotee_folk_id || r.folk_id || 'FOLK-XXXX',
          record_date: r.record_date,
          data: r.sadhana_payload || r.data || {},
          status: r.status,
          reason: r.reason,
          requested_at: r.created_at || r.requested_at || new Date().toISOString(),
          reviewed_by: r.reviewed_by,
          reviewed_at: r.reviewed_at,
        };
        setApprovalRequests((prev) => [mappedReq, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        const r = payload.new;
        setApprovalRequests((prev) =>
          prev.map((req) =>
            req.id === r.id
              ? {
                  ...req,
                  status: r.status,
                  reviewed_by: r.reviewed_by,
                  reviewed_at: r.reviewed_at,
                  reason: r.reason || req.reason,
                }
              : req
          )
        );
      }
    });

    // Realtime subscription for incoming reminder_logs
    let reminderChannel: any = null;
    if (isSupabaseConfigured) {
      reminderChannel = supabase
        .channel('public:reminder_logs')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'reminder_logs',
          },
          (payload) => {
            const newReminder = payload.new as any;
            if (newReminder) {
              const currentUserId = currentUserRef.current?.id;
              if (currentUserId && newReminder.recipient_id === currentUserId) {
                setReminder({
                  id: newReminder.id,
                  sender_id: newReminder.sender_id,
                  sender_name: newReminder.sender_name || 'FOLK Guide',
                  sender_role: newReminder.sender_role || 'folk_guide',
                  recipient_id: newReminder.recipient_id,
                  recipient_name: currentUserRef.current?.full_name || 'Devotee',
                  message: newReminder.message || 'Your FOLK Guide is requesting you to submit today’s Sādhana.',
                  deep_link: newReminder.deep_link || '/sadhana/today',
                  sent_at: 'Just now',
                  is_read: false,
                });

                sendDeviceNotification({
                  title: `🔔 Sādhana Reminder from ${newReminder.sender_name || 'FOLK Guide'}`,
                  body: newReminder.message || 'Please submit your daily Sādhana report.',
                  deepLink: newReminder.deep_link || '/sadhana/today',
                });
              }
            }
          }
        )
        .subscribe();
    }

    return () => {
      sadhanaSub.unsubscribe();
      approvalSub.unsubscribe();
      if (reminderChannel) {
        supabase.removeChannel(reminderChannel);
      }
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
          phone: profile.phone || '',
          email: profile.email || data.user.email || '',
          role: profile.role || 'folk_boy',
          avatar_url: profile.avatar_url || null,
          chanting_commitment: profile.chanting_commitment || 16,
          college_or_profession: profile.college_or_profession || 'Devotee',
          guide_id: profile.guide_id || null,
          guide_name: profile.guide_name || null,
          lead_id: profile.lead_id || null,
          lead_name: profile.lead_name || null,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        });

        if (profile.phone && profile.email && typeof window !== 'undefined') {
          const clean = profile.phone.replace(/\D/g, '');
          localStorage.setItem(`folk_phone_map_${clean}`, profile.email);
          localStorage.setItem(`folk_phone_map_${clean.slice(-10)}`, profile.email);
        }
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
    guideId?: string | null;
    guideName?: string | null;
  }) => {
    // Immediately update local state with user's entered name and details so "Hare Krishna Devotee" is never shown!
    setCurrentUser((prev) => ({
      ...prev,
      full_name: params.fullName,
      phone: params.phone,
      email: params.email,
      role: params.role || 'folk_boy',
      guide_name: params.guideName || prev.guide_name,
      guide_id: params.guideId || prev.guide_id,
    }));

    if (!isSupabaseConfigured) {
      setScreen('home');
      return { error: null };
    }

    const { error } = await apiSignUp(params);
    if (!error) {
      // Auto sign-in to establish session & pull full profile
      await signIn(params.email, params.password);
      setScreen('home');
    }
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

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: any }> => {
    const current = currentUserRef.current;
    const updatedUser: UserProfile = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    setCurrentUser(updatedUser);
    currentUserRef.current = updatedUser;

    // Immediately persist locally for zero-latency reload and offline resilience
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('folk_user_profile', JSON.stringify(updatedUser));
        if (updatedUser.phone) {
          const clean = updatedUser.phone.replace(/\D/g, '');
          if (clean.length === 10 && updatedUser.email) {
            localStorage.setItem(`folk_phone_map_${clean}`, updatedUser.email);
            localStorage.setItem(`folk_phone_map_${clean.slice(-10)}`, updatedUser.email);
          }
        }
      } catch (err) {
        console.warn('localStorage profile save notice:', err);
      }
    }

    let backendError: any = null;
    if (isSupabaseConfigured) {
      try {
        const { error } = await apiUpdateProfile(current.id, updates);
        if (error) {
          console.warn('Supabase profile update warning:', error);
          backendError = error;
        } else {
          // Refresh Guide roster so the Guide sees updated devotee info immediately
          apiGetGuideDevotees().then(({ data: devs }) => {
            if (devs && devs.length > 0) setGuideDevotees(devs);
          });
        }
      } catch (err) {
        console.warn('apiUpdateProfile unexpected error:', err);
        backendError = err;
      }
    }

    return {
      success: !backendError,
      error: backendError,
    };
  };

  const todayStr = getIndianTodayStr();
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
  const submitSadhanaForDate = (
    date: string,
    data: Partial<SadhanaRecord>,
    targetUserId?: string,
    targetFolkId?: string
  ) => {
    const effectiveUserId = targetUserId || currentUser.id;
    const effectiveFolkId = targetFolkId || currentUser.folk_id;
    const isSelf = effectiveUserId === currentUser.id;

    const parts = date.split('-').map(Number);
    const dayOfWeek = new Date(parts[0], parts[1] - 1, parts[2]).getDay();
    const isSunday = dayOfWeek === 0;

    // Dynamically evaluate against the Guide's live configured rules (no hardcoded point numbers!)
    const evalResult = evaluateSadhanaRecord(data, pointRules, isSunday);
    const finalPoints = evalResult.totalPoints;
    const readingMins = Number(data.book_reading_minutes) || 0;
    const earnedCC = date === todayStr ? 10 : 5;
    const newBalance = ccBalance + earnedCC;

    // CC Ledger (only for self)
    if (isSelf) {
      const newTx: CCTransaction = {
        id: `tx-${Date.now()}`,
        user_id: currentUser.id,
        amount: earnedCC,
        balance_after: newBalance,
        reason: date === todayStr ? 'Same-day Sādhana submission' : `Sādhana recorded for ${date}`,
        created_at: new Date().toISOString(),
      };
      setCcTransactions((prev) => [newTx, ...prev]);
    }

    // Authentic Consecutive Day Streak Calculation
    let newStreakCount = 1;
    let isNewPersonalBest = false;
    if (isSelf && date === todayStr) {
      const yesterdayStr = getIndianYesterdayStr();
      if (streak.last_reported_date === yesterdayStr) {
        newStreakCount = streak.current_reporting_streak + 1;
      } else if (streak.last_reported_date === todayStr) {
        newStreakCount = streak.current_reporting_streak;
      } else {
        newStreakCount = 1;
      }
      isNewPersonalBest = newStreakCount > streak.longest_reporting_streak;

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
      id: `rec-${effectiveUserId}-${date}`,
      user_id: effectiveUserId,
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

    if (isSelf) {
      setSadhanaRecords((prev) => ({
        ...prev,
        [date]: record,
      }));
    }

    // Persist to Supabase if live backend is connected
    if (isSupabaseConfigured) {
      apiUpsertSadhanaRecord({
        ...record,
        user_id: effectiveUserId,
      });

      if (isSelf && date === todayStr) {
        apiUpdateStreak(currentUser.id, {
          current_reporting_streak: newStreakCount,
          longest_reporting_streak: isNewPersonalBest ? newStreakCount : streak.longest_reporting_streak,
          last_reported_date: date,
          next_milestone: streak.next_milestone,
        });
      } else if (!isSelf) {
        apiGetStreak(effectiveUserId).then(({ data: s }) => {
          const curr = s?.current_reporting_streak || 0;
          const longest = s?.longest_reporting_streak || 0;
          apiUpdateStreak(effectiveUserId, {
            current_reporting_streak: curr + 1,
            longest_reporting_streak: Math.max(longest, curr + 1),
            last_reported_date: date,
          });
        });
      }
    }

    // Update accumulated reading time for self
    if (isSelf && readingMins > 0) {
      setReadingState((prev) => ({
        ...prev,
        total_minutes_read: prev.total_minutes_read + readingMins,
        sessions_count: prev.sessions_count + 1,
        last_reading_date: date,
      }));
    }

    // REAL-TIME GUIDE ROSTER SYNCHRONIZATION
    setGuideDevotees((prev) =>
      prev.map((d) => {
        if (d.folk_id === effectiveFolkId || d.id === effectiveUserId) {
          return {
            ...d,
            submitted: (date === todayStr && finalPoints > 0) || d.submitted,
            points_today: date === todayStr ? finalPoints : d.points_today,
            last_sadhana_label: date === todayStr ? "Today's Sādhana" : `Previous: ${date}`,
            last_points: finalPoints,
            last_submitted_date: date === todayStr ? 'Today, Just now' : date,
            pillars: {
              mangala: Boolean(data.mangala_arati_time),
              japa: Boolean(data.japa_rounds && data.japa_rounds > 0),
              darshan: Boolean(data.darshan_arati_time),
              bhagavatam: Boolean(data.srimad_bhagavatam_time),
              jf: Boolean(data.japa_finish_slot_time),
              reading: Boolean(data.book_reading_minutes && data.book_reading_minutes > 0),
            },
            pillar_dots: evalResult.pillarDots,
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

    if (isSelf) {
      setReminder(null);

      // Duolingo-style Streak Celebration Trigger for Today's Sādhana
      if (date === todayStr) {
        const oldStreak = streak.current_reporting_streak;
        setStreakOldCount(oldStreak);
        setStreakNewCount(newStreakCount);
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
    setPointRules((prev) => {
      const nextRules = prev.map((r) => {
        if (r.id !== ruleId) return r;
        if (typeof updates === 'number') {
          return { ...r, points: updates, threshold_time: newThreshold ?? r.threshold_time };
        }
        return { ...r, ...updates, points: updates.points ?? updates.ontime_points ?? r.points };
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('folk_point_rules', JSON.stringify(nextRules));
      }
      apiSavePointRules(nextRules).catch((err) => console.warn('apiSavePointRules error:', err));

      return nextRules;
    });
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
    const recipientIds = pending.map((d) => d.id).filter(Boolean) as string[];

    // Send to Supabase reminder_logs so all devotees receive push & realtime notifications
    if (recipientIds.length > 0) {
      apiSendRemindersToDevotees({
        senderId: currentUser.id,
        senderName: currentUser.full_name || 'FOLK Guide',
        senderRole: 'folk_guide',
        recipientIds,
        message: 'Hare Krishna! Your FOLK Guide is reminding you to complete and submit today’s Sādhana.',
      }).catch((err) => console.warn('Failed to send reminders to Supabase:', err));
    }

    // If the currently logged in user is pending, set their reminder notification and trigger device alert
    if (pending.some((d) => d.folk_id === currentUser.folk_id || d.id === currentUser.id)) {
      setReminder({
        id: `rem-${Date.now()}`,
        sender_id: currentUser.id,
        sender_name: currentUser.full_name || 'FOLK Guide',
        sender_role: 'folk_guide',
        recipient_id: currentUser.id,
        recipient_name: currentUser.full_name,
        message: 'Your FOLK Guide is requesting you to submit today’s Sādhana.',
        deep_link: '/sadhana/today',
        sent_at: 'Just now',
        is_read: false,
      });

      sendDeviceNotification({
        title: `🔔 Sādhana Reminder`,
        body: 'Hare Krishna! Please submit today’s Sādhana chart.',
        deepLink: '/sadhana/today',
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

    // Commit the sadhana record for that date with is_late_submission = true under the devotee's user_id
    submitSadhanaForDate(
      target.record_date,
      {
        ...target.data,
        is_late_submission: true,
      },
      target.user_id,
      target.folk_id
    );
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
        todayStr,
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
