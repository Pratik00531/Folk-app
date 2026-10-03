export type UserRole = 'folk_boy' | 'folk_lead' | 'folk_guide';

export interface UserProfile {
  id: string;
  folk_id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  guide_id?: string | null;
  guide_name?: string | null;
  lead_id?: string | null;
  lead_name?: string | null;
  avatar_url?: string | null;
  spiritual_name?: string | null;
  chanting_commitment?: number;
  college_or_profession?: string;
  created_at: string;
  updated_at: string;
}

export interface SadhanaRecord {
  id: string;
  user_id: string;
  record_date: string; // YYYY-MM-DD
  mangala_arati_time: string | null; // e.g. "05:03 AM" or null
  japa_start_time: string | null; // Temple hall arrival time, e.g. "05:15 AM"
  japa_finish_time: string | null; // Temple hall leaving time, e.g. "06:45 AM"
  japa_duration_minutes: number | null; // auto-calculated
  japa_rounds: number; // e.g. 16, 12, 8, 4
  darshan_arati_time: string | null; // Sunday / daily e.g. "07:15 AM"
  srimad_bhagavatam_time: string | null; // e.g. "07:31 AM"
  japa_finish_slot_time: string | null; // JF slot e.g. "06:45 AM"
  book_title?: string;
  book_level?: number;
  book_reading_minutes: number;
  remarks: string | null;
  points_earned: number;
  cc_earned: number;
  point_rule_version: number;
  is_late_submission?: boolean; // When true: blue color on heatmap and calendar!
  submitted_at: string;
  updated_at: string;
}

export interface StreakData {
  user_id: string;
  current_reporting_streak: number;
  longest_reporting_streak: number;
  last_reported_date: string | null;
  next_milestone: number;
  milestones: number[];
}

export interface CCTransaction {
  id: string;
  user_id: string;
  sadhana_record_id?: string | null;
  amount: number;
  balance_after: number;
  reason: string;
  created_at: string;
}

// Late Sādhana Approval Request (>3 days locked in calendar)
export interface SadhanaApprovalRequest {
  id: string;
  user_id: string;
  user_name: string;
  folk_id: string;
  record_date: string;
  data: Partial<SadhanaRecord>;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  requested_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface ReminderNotification {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  recipient_id: string;
  recipient_name: string;
  message: string;
  deep_link: string;
  sent_at: string;
  is_read: boolean;
}

// Pillar Dot Status for M J D B JF R
export type PillarDotStatus = 'green' | 'light_green' | 'yellow' | 'red' | 'grey';

// Book Catalogue & Reading Tracker
export interface BookItem {
  id: string;
  order: number;
  title: string;
  level: 1 | 2 | 3 | 4 | 5;
  author: string;
  cover_url?: string;
  description?: string;
}

export interface UserReadingState {
  user_id: string;
  current_book_id: string;
  current_book_title: string;
  current_book_level: 1 | 2 | 3 | 4 | 5;
  started_at: string;
  total_minutes_read: number;
  sessions_count: number;
  last_reading_date?: string | null;
  completed_books: {
    book_id: string;
    title: string;
    completed_at: string;
    total_minutes: number;
  }[];
}

// Configurable Point Rule Entity with Tiered Time Windows
export interface PointRuleConfig {
  id: string;
  activity: 'mangala_arati' | 'japa' | 'darshan_arati' | 'srimad_bhagavatam' | 'japa_finish' | 'book_reading';
  title: string;
  condition: string;
  threshold_time?: string;
  points: number; // default/full points
  // Tiered thresholds with customizable ranges ("from this to this -> this much point")
  ontime_cutoff?: string; // Green
  ontime_from?: string;
  ontime_to?: string;
  ontime_points?: number;
  late_cutoff?: string; // Light Green (10-15m)
  late_from?: string;
  late_to?: string;
  late_points?: number;
  lastmin_cutoff?: string; // Yellow
  lastmin_from?: string;
  lastmin_to?: string;
  lastmin_points?: number;
  is_active: boolean;
  effective_date: string;
}

export interface GuideDevoteeOverview {
  id: string;
  name: string;
  folk_id: string;
  role: 'folk_boy' | 'folk_lead';
  avatar_url?: string;
  streak: number;
  points_today: number;
  submitted: boolean;
  last_sadhana_label: string;
  last_points: number;
  pillars: {
    mangala: boolean;
    japa: boolean;
    darshan: boolean;
    bhagavatam: boolean;
    jf: boolean;
    reading: boolean;
  };
  pillar_dots: {
    mangala: PillarDotStatus;
    japa: PillarDotStatus;
    darshan: PillarDotStatus;
    bhagavatam: PillarDotStatus;
    jf: PillarDotStatus;
    reading: PillarDotStatus;
  };
  japa_rounds: number;
  japa_arrival: string | null;
  japa_leaving: string | null;
  mangala_time: string | null;
  bhagavatam_time: string | null;
  jf_time: string | null;
  reading_mins: number;
  current_book: string;
  current_book_level: number;
  total_reading_hours: number;
  last_submitted_date: string;
}


