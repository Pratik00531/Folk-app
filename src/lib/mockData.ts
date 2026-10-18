import {
  UserProfile,
  SadhanaRecord,
  StreakData,
  CCTransaction,
  ReminderNotification,
  BookItem,
  UserReadingState,
  PointRuleConfig,
  GuideDevoteeOverview,
} from '@/types/database';

export { folkBookCatalogue, getBookCoverUrl } from '@/lib/bookCatalogue';
export type { GuideDevoteeOverview } from '@/types/database';

// Initial clean user profiles (fallback if offline / guest)
export const mockUsers: Record<string, UserProfile> = {
  folk_boy: {
    id: 'guest-devotee-id',
    folk_id: 'FOLK-2026-0001',
    full_name: 'Devotee',
    email: '',
    phone: '',
    role: 'folk_boy',
    guide_id: null,
    guide_name: null,
    lead_id: null,
    lead_name: null,
    avatar_url: '/assets/images/Chanting.png',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  folk_lead: {
    id: 'guest-lead-id',
    folk_id: 'FOLK-2026-0002',
    full_name: 'FOLK Lead',
    email: '',
    phone: '',
    role: 'folk_lead',
    guide_id: null,
    guide_name: null,
    lead_id: null,
    lead_name: null,
    avatar_url: '/assets/images/SBclass.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  folk_guide: {
    id: 'guest-guide-id',
    folk_id: 'FLK-GUIDE-001',
    full_name: 'FOLK Guide',
    email: '',
    phone: '',
    role: 'folk_guide',
    guide_id: null,
    guide_name: null,
    lead_id: null,
    lead_name: null,
    avatar_url: '/assets/images/BookRead.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

// Clean initial streak (Starts at 0, increments with live Sādhana entries)
export const initialStreak: StreakData = {
  user_id: '',
  current_reporting_streak: 0,
  longest_reporting_streak: 0,
  last_reported_date: null,
  next_milestone: 3,
  milestones: [3, 7, 14, 30, 60, 90],
};

// Clean initial CC transactions (Empty)
export const initialCCTransactions: CCTransaction[] = [];

// Clean initial reminders (Empty)
export const initialReminder: ReminderNotification | null = null;

// Clean initial reading state (Starts at Level 1 Foundational Book with 0 minutes)
export const initialReadingState: UserReadingState = {
  user_id: '',
  current_book_id: 'b-01',
  current_book_title: 'Beyond Birth & Death',
  current_book_level: 1,
  started_at: new Date().toISOString().split('T')[0],
  total_minutes_read: 0,
  sessions_count: 0,
  last_reading_date: null,
  completed_books: [],
};

// Default baseline Point Rules (Max Point: 10)
// Configured as default, Guide / Lead can customize cutoffs and points dynamically
export const initialPointRules: PointRuleConfig[] = [
  {
    id: 'pr-01',
    activity: 'mangala_arati',
    title: 'Maṅgala Ārati Timing (AM)',
    condition: '4:30 – 5:04:59 (4 pts) | 5:05 – 5:14:59 (2 pts) | 5:15 – 5:30 (1 pt)',
    points: 4,
    ontime_cutoff: '04:30 AM – 05:04 AM',
    ontime_from: '04:30 AM',
    ontime_to: '05:04 AM',
    ontime_points: 4, // 4 points (Green)
    late_cutoff: '05:05 AM – 05:14 AM',
    late_from: '05:05 AM',
    late_to: '05:14 AM',
    late_points: 2, // 2 points (Light Green)
    lastmin_cutoff: '05:15 AM – 05:30 AM',
    lastmin_from: '05:15 AM',
    lastmin_to: '05:30 AM',
    lastmin_points: 1, // 1 point (Yellow)
    is_active: true,
    effective_date: '2026-01-01',
  },
  {
    id: 'pr-02',
    activity: 'japa',
    title: 'Morning Japa Slot Timing',
    condition: '5:30–7:30 (4 pts) | 5:30–7:00 (3 pts) | 5:30–6:30 (2 pts) | 5:30–6:00 (1 pt)',
    points: 4,
    ontime_cutoff: '05:30 AM – 07:30 AM',
    ontime_from: '05:30 AM',
    ontime_to: '07:30 AM',
    ontime_points: 4, // 4 points
    late_cutoff: '05:30 AM – 07:00 AM',
    late_from: '05:30 AM',
    late_to: '07:00 AM',
    late_points: 3, // 3 points
    lastmin_cutoff: '05:30 AM – 06:30 AM',
    lastmin_from: '05:30 AM',
    lastmin_to: '06:30 AM',
    lastmin_points: 2, // 2 points
    is_active: true,
    effective_date: '2026-01-01',
  },
  {
    id: 'pr-03',
    activity: 'srimad_bhagavatam',
    title: 'Śrīmad Bhāgavatam Morning Class',
    condition: 'In Temple (2 pts) | Outside Temple (1 pt) | Not heard (0 pts)',
    points: 2,
    ontime_cutoff: 'In Temple',
    ontime_from: 'In Temple',
    ontime_to: 'In Temple',
    ontime_points: 2, // 2 points
    late_cutoff: 'Outside Temple',
    late_from: 'Outside Temple',
    late_to: 'Outside Temple',
    late_points: 1, // 1 point
    lastmin_cutoff: 'Not heard',
    lastmin_from: 'Not heard',
    lastmin_to: 'Not heard',
    lastmin_points: 0, // 0 points
    is_active: true,
    effective_date: '2026-01-01',
  },
  {
    id: 'pr-04',
    activity: 'book_reading',
    title: 'Daily Prabhupada Book Reading',
    condition: 'No points — minutes tracked with weekly/monthly averages',
    points: 0,
    ontime_cutoff: 'Minutes logged (0 pts)',
    ontime_from: '0 mins',
    ontime_to: '60+ mins',
    ontime_points: 0,
    late_cutoff: 'Minutes logged (0 pts)',
    late_from: '0 mins',
    late_to: '30 mins',
    late_points: 0,
    lastmin_cutoff: 'Minutes logged (0 pts)',
    lastmin_from: '0 mins',
    lastmin_to: '15 mins',
    lastmin_points: 0,
    is_active: true,
    effective_date: '2026-01-01',
  },
  {
    id: 'pr-05',
    activity: 'darshan_arati',
    title: 'Darshan Ārati (Sundays)',
    condition: 'Sunday deity darshan worship (No points assigned)',
    points: 0,
    ontime_cutoff: '07:00 AM – 07:30 AM',
    ontime_from: '07:00 AM',
    ontime_to: '07:30 AM',
    ontime_points: 0,
    is_active: true,
    effective_date: '2026-01-01',
  },
  {
    id: 'pr-06',
    activity: 'japa_finish',
    title: 'JF (Japa Finish Slot)',
    condition: 'Time tracking for completing morning japa rounds',
    points: 0,
    ontime_cutoff: '06:00 AM – 07:30 AM',
    ontime_from: '06:00 AM',
    ontime_to: '07:30 AM',
    ontime_points: 0,
    is_active: true,
    effective_date: '2026-01-01',
  },
];

// Clean empty Sādhana records (Filled dynamically from Supabase database)
export const initialSadhanaRecords: Record<string, SadhanaRecord> = {};

// Clean empty approval requests (Filled dynamically from Supabase database)
export const initialSadhanaApprovalRequests: any[] = [];

// Clean empty Guide devotees roster (Filled dynamically from Supabase database)
export const mockGuideDevotees: GuideDevoteeOverview[] = [];
