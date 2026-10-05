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
    guide_id: 'a953235f-5d8f-414d-a57f-4a3d2108fa0d',
    guide_name: 'Amogh',
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
    guide_id: 'a953235f-5d8f-414d-a57f-4a3d2108fa0d',
    guide_name: 'Amogh',
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

// Active Point Rules with Tiered Cutoffs (Assigned by FOLK Guide)
// Weekdays: Mangala (20) + Japa (40) + SB (20) + JF (10) + Book (10) = 100 pts (Darshan excluded = 0)
// Sundays:  Mangala (20) + Japa (35) + Darshan (10) + SB (15) + JF (10) + Book (10) = 100 pts
export const initialPointRules: PointRuleConfig[] = [
  {
    id: 'pr-01',
    activity: 'mangala_arati',
    title: 'Maṅgala Ārati Attendance',
    condition: 'Arrive before 05:05 AM for full points',
    points: 20,
    ontime_cutoff: '04:30 AM – 05:05 AM',
    ontime_from: '04:30 AM',
    ontime_to: '05:05 AM',
    ontime_points: 20, // Green
    late_cutoff: '05:06 AM – 05:15 AM',
    late_from: '05:06 AM',
    late_to: '05:15 AM',
    late_points: 14, // Light Green (10-15m)
    lastmin_cutoff: '05:16 AM – 05:30 AM',
    lastmin_from: '05:16 AM',
    lastmin_to: '05:30 AM',
    lastmin_points: 8, // Yellow (Last minutes)
    is_active: true,
    effective_date: '2026-01-01',
  },
  {
    id: 'pr-02',
    activity: 'japa',
    title: 'Morning Japa in Temple Hall (16 Rounds)',
    condition: '16 rounds chanted in temple hall presence',
    points: 40,
    ontime_cutoff: '16 rounds (Hall)',
    ontime_from: '16 rounds',
    ontime_to: '16 rounds in hall',
    ontime_points: 40, // Green (35 on Sundays)
    late_cutoff: '12 – 15 rounds',
    late_from: '12 rounds',
    late_to: '15 rounds',
    late_points: 28, // Light Green
    lastmin_cutoff: '8 – 11 rounds',
    lastmin_from: '8 rounds',
    lastmin_to: '11 rounds',
    lastmin_points: 16, // Yellow
    is_active: true,
    effective_date: '2026-01-01',
  },
  {
    id: 'pr-03',
    activity: 'srimad_bhagavatam',
    title: 'Śrīmad Bhāgavatam Morning Class',
    condition: 'Attended full class by 07:35 AM',
    points: 20,
    ontime_cutoff: '07:00 AM – 07:35 AM',
    ontime_from: '07:00 AM',
    ontime_to: '07:35 AM',
    ontime_points: 20, // Green (15 on Sundays)
    late_cutoff: '07:36 AM – 07:45 AM',
    late_from: '07:36 AM',
    late_to: '07:45 AM',
    late_points: 14, // Light Green
    lastmin_cutoff: '07:46 AM – 08:00 AM',
    lastmin_from: '07:46 AM',
    lastmin_to: '08:00 AM',
    lastmin_points: 8, // Yellow
    is_active: true,
    effective_date: '2026-01-01',
  },
  {
    id: 'pr-04',
    activity: 'japa_finish',
    title: 'JF (Japa Finish Slot)',
    condition: 'Complete morning rounds by target finish time',
    points: 10,
    ontime_cutoff: '06:00 AM – 07:00 AM',
    ontime_from: '06:00 AM',
    ontime_to: '07:00 AM',
    ontime_points: 10, // Green
    late_cutoff: '07:01 AM – 07:15 AM',
    late_from: '07:01 AM',
    late_to: '07:15 AM',
    late_points: 7, // Light Green
    lastmin_cutoff: '07:16 AM – 07:30 AM',
    lastmin_from: '07:16 AM',
    lastmin_to: '07:30 AM',
    lastmin_points: 4, // Yellow
    is_active: true,
    effective_date: '2026-01-01',
  },
  {
    id: 'pr-05',
    activity: 'darshan_arati',
    title: 'Darshan Ārati (Sundays Only)',
    condition: 'Sunday deity darshan worship (Excluded on weekdays)',
    points: 10,
    ontime_cutoff: '07:00 AM – 07:30 AM',
    ontime_from: '07:00 AM',
    ontime_to: '07:30 AM',
    ontime_points: 10, // Green on Sunday, 0 on weekdays
    late_cutoff: '07:31 AM – 07:45 AM',
    late_from: '07:31 AM',
    late_to: '07:45 AM',
    late_points: 7, // Light Green
    lastmin_cutoff: '07:46 AM – 08:00 AM',
    lastmin_from: '07:46 AM',
    lastmin_to: '08:00 AM',
    lastmin_points: 4, // Yellow
    is_active: true,
    effective_date: '2026-01-01',
  },
  {
    id: 'pr-06',
    activity: 'book_reading',
    title: 'Daily Prabhupada Book Reading',
    condition: '30+ minutes daily reading of Srila Prabhupada books',
    points: 10,
    ontime_cutoff: '30+ mins',
    ontime_from: '30 mins',
    ontime_to: '60+ mins',
    ontime_points: 10, // Green
    late_cutoff: '15 – 29 mins',
    late_from: '15 mins',
    late_to: '29 mins',
    late_points: 7, // Light Green
    lastmin_cutoff: '5 – 14 mins',
    lastmin_from: '5 mins',
    lastmin_to: '14 mins',
    lastmin_points: 4, // Yellow
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
