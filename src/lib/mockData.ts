import {
  UserProfile,
  SadhanaRecord,
  StreakData,
  CCTransaction,
  ReminderNotification,
  BookItem,
  UserReadingState,
  PointRuleConfig,
  PillarDotStatus,
  SadhanaApprovalRequest,
} from '@/types/database';

export const mockUsers: Record<string, UserProfile> = {
  folk_boy: {
    id: 'user-pratik-108',
    folk_id: 'FOLK-1024',
    full_name: 'Pratik Patel',
    email: 'pratik@folkindia.org',
    phone: '+91 98765 43210',
    role: 'folk_boy',
    guide_id: 'user-guide-amogh',
    guide_name: 'HG Amogh Virya Dasa',
    lead_id: 'user-lead-madhav',
    lead_name: 'Madhav Das',
    avatar_url: '/assets/images/Chanting.png',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  folk_lead: {
    id: 'user-lead-madhav',
    folk_id: 'FOLK-1031',
    full_name: 'Madhav Das',
    email: 'madhav@folkindia.org',
    phone: '+91 98450 11223',
    role: 'folk_lead',
    guide_id: 'user-guide-amogh',
    guide_name: 'HG Amogh Virya Dasa',
    lead_id: null,
    lead_name: null,
    avatar_url: '/assets/images/SBclass.jpg',
    created_at: '2023-05-10T00:00:00Z',
    updated_at: '2023-05-10T00:00:00Z',
  },
  folk_guide: {
    id: 'user-guide-amogh',
    folk_id: 'FLK-GUIDE-001',
    full_name: 'HG Amogh Virya Dasa',
    email: 'amogh.virya@folkindia.org',
    phone: '+91 99000 88776',
    role: 'folk_guide',
    guide_id: null,
    guide_name: null,
    lead_id: null,
    lead_name: null,
    avatar_url: '/assets/images/BookRead.jpg',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2022-01-01T00:00:00Z',
  },
};

export const initialStreak: StreakData = {
  user_id: 'user-pratik-108',
  current_reporting_streak: 12,
  longest_reporting_streak: 24,
  last_reported_date: '2026-10-02',
  next_milestone: 14,
  milestones: [3, 7, 14, 30, 60, 90],
};

export const initialCCTransactions: CCTransaction[] = [
  {
    id: 'tx-001',
    user_id: 'user-pratik-108',
    amount: 10,
    balance_after: 145,
    reason: 'Same-day Sādhana submission',
    created_at: '2026-10-02T20:30:00Z',
  },
  {
    id: 'tx-002',
    user_id: 'user-pratik-108',
    amount: 25,
    balance_after: 135,
    reason: '7-Day Reporting Streak milestone reached',
    created_at: '2026-09-28T21:00:00Z',
  },
  {
    id: 'tx-003',
    user_id: 'user-pratik-108',
    amount: 10,
    balance_after: 110,
    reason: 'Same-day Sādhana submission',
    created_at: '2026-09-27T19:45:00Z',
  },
];

export const initialReminder: ReminderNotification = {
  id: 'rem-108',
  sender_id: 'user-guide-amogh',
  sender_name: 'HG Amogh Virya Dasa',
  sender_role: 'folk_guide',
  recipient_id: 'user-pratik-108',
  recipient_name: 'Pratik Patel',
  message: 'Your FOLK Guide, HG Amogh Virya Dasa, is requesting you to fill today’s Sādhana.',
  deep_link: '/sadhana/today',
  sent_at: '08:30 AM',
  is_read: false,
};

// 28-Book Ordered FOLK Reading Catalogue with Authentic Covers
export const folkBookCatalogue: BookItem[] = [
  // LEVEL 1: Foundational Literature
  {
    id: 'b-01',
    order: 1,
    level: 1,
    title: 'Beyond Birth & Death',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Beyond Birth and Death.jpeg',
  },
  {
    id: 'b-02',
    order: 2,
    level: 1,
    title: 'PQQA (Perfect Questions, Perfect Answers)',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Perfect_Questions_Perfect_Answers_wOMObWv_04pKdaN.jpg',
  },
  {
    id: 'b-03',
    order: 3,
    level: 1,
    title: 'On the Way to Krishna',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/On_the_Way_to_Krsna-1973_book.jpg',
  },
  {
    id: 'b-04',
    order: 4,
    level: 1,
    title: 'Krishna: The Reservoir of Pleasure',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/KRSNA_the_Reservoir_of_Pleasure.jpg',
  },
  {
    id: 'b-05',
    order: 5,
    level: 1,
    title: 'Second Chance',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/second chance.jpg',
  },
  {
    id: 'b-06',
    order: 6,
    level: 1,
    title: 'Raja-Vidya: The King of Knowledge',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Raja-Vidhya_HAY9BY4_7AP76uZ.jpg',
  },
  {
    id: 'b-07',
    order: 7,
    level: 1,
    title: 'The Laws of Nature',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/The-Laws-of-Nature-An-Infallible-Justice.jpg',
  },

  // LEVEL 2: Intermediate Devotional Science
  {
    id: 'b-08',
    order: 8,
    level: 2,
    title: 'Elevation to Krishna Consciousness',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Elevation-to-Krsna-Consciousness-Original-1973-edition.jpg',
  },
  {
    id: 'b-09',
    order: 9,
    level: 2,
    title: 'KC - The Matchless Gift',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Matchless Gift.webp',
  },
  {
    id: 'b-10',
    order: 10,
    level: 2,
    title: 'The Perfection of Yoga',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/The_Perfection_of_Yoga.jpg',
  },
  {
    id: 'b-11',
    order: 11,
    level: 2,
    title: 'Topmost Yoga System',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/KRSNA-Consciousness-The-Topmost-Yoga-System.jpg',
  },
  {
    id: 'b-12',
    order: 12,
    level: 2,
    title: 'Path of Perfection',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Path-of-Perfection.webp',
  },
  {
    id: 'b-13',
    order: 13,
    level: 2,
    title: 'Introduction to Bhagavad Gita',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Introduction-to-Bhagavad-gita.webp',
  },

  // LEVEL 3: Advanced Philosophical Inquiry
  {
    id: 'b-14',
    order: 14,
    level: 3,
    title: 'Easy Journey to Other Planets',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Easy-Journy-to-Other-Planets_-_His_Divine_Grace_A.C.Bhaktivedanta_Swami_Prabhupada.jpg',
  },
  {
    id: 'b-15',
    order: 15,
    level: 3,
    title: 'Life Comes from Life',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Life-Comes-from-Life.jpg',
  },
  {
    id: 'b-16',
    order: 16,
    level: 3,
    title: 'Dharma: The Way of Transcendence',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/dharma.webp',
  },
  {
    id: 'b-17',
    order: 17,
    level: 3,
    title: 'Science of Self Realization (SSR)',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/TheScienceofSelfRealization_1.webp',
  },
  {
    id: 'b-18',
    order: 18,
    level: 3,
    title: 'The Hare Krishna Challenge',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Hare-Krishna-Challenge.webp',
  },
  {
    id: 'b-19',
    order: 19,
    level: 3,
    title: 'Coming Back: The Science of Reincarnation',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/coming-back-the-science-of-reincarnation.webp',
  },
  {
    id: 'b-20',
    order: 20,
    level: 3,
    title: 'Message of Godhead',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/v_Message_Of_Godhead-600x895.webp',
  },
  {
    id: 'b-21',
    order: 21,
    level: 3,
    title: 'Civilization and Transcendence',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/civilization-and-transcendence.webp',
  },

  // LEVEL 4: Deep Shastric Study
  {
    id: 'b-22',
    order: 22,
    level: 4,
    title: 'Transcendental Teachings of Prahlada Maharaja',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Teachings of Prahlada Maharaj.webp',
  },
  {
    id: 'b-23',
    order: 23,
    level: 4,
    title: 'Teachings of Lord Chaitanya (TLC)',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Teachings-of-Lord-Chatanya_mT5GSXe.png',
  },
  {
    id: 'b-24',
    order: 24,
    level: 4,
    title: 'Journey of Self Discovery',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/the journey of self Discovery.webp',
  },
  {
    id: 'b-25',
    order: 25,
    level: 4,
    title: 'Bhagavad Gita As It Is',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Bhagavad Gita - As it is.jpeg',
  },
  {
    id: 'b-26',
    order: 26,
    level: 4,
    title: 'Krishna Book (Vols 1 & 2)',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/krsna_book.jpg',
  },
  {
    id: 'b-27',
    order: 27,
    level: 4,
    title: 'The Nectar of Instruction (Upadesamrita)',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Nectar of Instruction.jpg',
  },
  {
    id: 'b-28',
    order: 28,
    level: 4,
    title: 'Sri Isopanishad',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Sri Isoupnisad.jpg',
  },

  // LEVEL 5: Śrīmad-Bhāgavatam (10 Cantos)
  {
    id: 'sb-01',
    order: 29,
    level: 5,
    title: 'Śrīmad-Bhāgavatam Canto 1: Creation',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Srimad_Bhagavatam.jpg',
  },
  {
    id: 'sb-02',
    order: 30,
    level: 5,
    title: 'Śrīmad-Bhāgavatam Canto 2: The Cosmic Manifestation',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Srimad_Bhagavatam.jpg',
  },
  {
    id: 'sb-03',
    order: 31,
    level: 5,
    title: 'Śrīmad-Bhāgavatam Canto 3: The Status Quo',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Srimad_Bhagavatam.jpg',
  },
  {
    id: 'sb-04',
    order: 32,
    level: 5,
    title: 'Śrīmad-Bhāgavatam Canto 4: Creation of Fourth Order',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Srimad_Bhagavatam.jpg',
  },
  {
    id: 'sb-05',
    order: 33,
    level: 5,
    title: 'Śrīmad-Bhāgavatam Canto 5: The Creative Impetus',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Srimad_Bhagavatam.jpg',
  },
  {
    id: 'sb-06',
    order: 34,
    level: 5,
    title: 'Śrīmad-Bhāgavatam Canto 6: Prescribed Duties for Mankind',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Srimad_Bhagavatam.jpg',
  },
  {
    id: 'sb-07',
    order: 35,
    level: 5,
    title: 'Śrīmad-Bhāgavatam Canto 7: The Science of God',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Srimad_Bhagavatam.jpg',
  },
  {
    id: 'sb-08',
    order: 36,
    level: 5,
    title: 'Śrīmad-Bhāgavatam Canto 8: Withdrawal of Cosmic Creations',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Srimad_Bhagavatam.jpg',
  },
  {
    id: 'sb-09',
    order: 37,
    level: 5,
    title: 'Śrīmad-Bhāgavatam Canto 9: Liberation',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Srimad_Bhagavatam.jpg',
  },
  {
    id: 'sb-10',
    order: 38,
    level: 5,
    title: 'Śrīmad-Bhāgavatam Canto 10: The Summum Bonum',
    author: 'A.C. Bhaktivedanta Swami Prabhupada',
    cover_url: '/assets/images/books/Srimad_Bhagavatam.jpg',
  },
];

export const initialReadingState: UserReadingState = {
  user_id: 'user-pratik-108',
  current_book_id: 'b-25',
  current_book_title: 'Bhagavad Gita As It Is',
  current_book_level: 4,
  started_at: '2026-08-15',
  total_minutes_read: 870, // 14 hours 30 mins
  sessions_count: 29,
  last_reading_date: '2026-10-02',
  completed_books: [
    { book_id: 'b-01', title: 'Beyond Birth & Death', completed_at: '2026-02-10', total_minutes: 180 },
    { book_id: 'b-02', title: 'PQQA', completed_at: '2026-03-15', total_minutes: 240 },
    { book_id: 'b-03', title: 'On the Way to Krishna', completed_at: '2026-04-20', total_minutes: 210 },
    { book_id: 'b-10', title: 'The Perfection of Yoga', completed_at: '2026-06-05', total_minutes: 300 },
  ],
};

// Configurable Point Rules with Tiered Cutoffs (Assigned by FOLK Guide)
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

// Historical Records for Sādhana Calendar & Heatmap (Aug, Sep, Oct 2026)
// Provides full 3-month dataset for Heatmap & Calendar view
function generateHistoricalRecords(): Record<string, SadhanaRecord> {
  const records: Record<string, SadhanaRecord> = {};

  // August 2026 (31 days)
  for (let d = 1; d <= 31; d++) {
    const dStr = `2026-08-${String(d).padStart(2, '0')}`;
    const isMissed = [6, 15, 22, 28].includes(d);
    if (!isMissed) {
      const isSunday = new Date(2026, 7, d).getDay() === 0;
      const pts = [12, 19].includes(d) ? 70 : 100;
      records[dStr] = {
        id: `rec-${dStr}`,
        user_id: 'user-pratik-108',
        record_date: dStr,
        mangala_arati_time: '05:02 AM',
        japa_start_time: '05:15 AM',
        japa_finish_time: '06:45 AM',
        japa_duration_minutes: 90,
        japa_rounds: 16,
        darshan_arati_time: isSunday ? '07:15 AM' : null,
        srimad_bhagavatam_time: '07:30 AM',
        japa_finish_slot_time: '06:45 AM',
        book_title: 'Bhagavad Gita As It Is',
        book_level: 4,
        book_reading_minutes: 30,
        remarks: 'Attentive morning sadhana',
        points_earned: pts,
        cc_earned: 10,
        point_rule_version: 1,
        is_late_submission: [14, 23].includes(d),
        submitted_at: `${dStr}T20:00:00Z`,
        updated_at: `${dStr}T20:00:00Z`,
      };
    }
  }

  // September 2026 (30 days)
  for (let d = 1; d <= 30; d++) {
    const dStr = `2026-09-${String(d).padStart(2, '0')}`;
    const isMissed = [5, 13, 21, 28].includes(d);
    if (!isMissed) {
      const isSunday = new Date(2026, 8, d).getDay() === 0;
      const pts = [8, 17, 26].includes(d) ? 75 : 100;
      records[dStr] = {
        id: `rec-${dStr}`,
        user_id: 'user-pratik-108',
        record_date: dStr,
        mangala_arati_time: '05:03 AM',
        japa_start_time: '05:15 AM',
        japa_finish_time: '06:45 AM',
        japa_duration_minutes: 90,
        japa_rounds: 16,
        darshan_arati_time: isSunday ? '07:15 AM' : null,
        srimad_bhagavatam_time: '07:30 AM',
        japa_finish_slot_time: '06:45 AM',
        book_title: 'Bhagavad Gita As It Is',
        book_level: 4,
        book_reading_minutes: 30,
        remarks: 'Peaceful morning service',
        points_earned: pts,
        cc_earned: 10,
        point_rule_version: 1,
        is_late_submission: [11, 19, 27].includes(d),
        submitted_at: `${dStr}T20:00:00Z`,
        updated_at: `${dStr}T20:00:00Z`,
      };
    }
  }

  // October 2026 (Days 1 to 3; future days 4-31 locked)
  records['2026-10-01'] = {
    id: 'rec-2026-10-01',
    user_id: 'user-pratik-108',
    record_date: '2026-10-01',
    mangala_arati_time: '05:01 AM',
    japa_start_time: '05:15 AM',
    japa_finish_time: '06:45 AM',
    japa_duration_minutes: 90,
    japa_rounds: 16,
    darshan_arati_time: null,
    srimad_bhagavatam_time: '07:30 AM',
    japa_finish_slot_time: '06:45 AM',
    book_title: 'Bhagavad Gita As It Is',
    book_level: 4,
    book_reading_minutes: 30,
    remarks: 'Very attentive morning chanting',
    points_earned: 100,
    cc_earned: 10,
    point_rule_version: 1,
    submitted_at: '2026-10-01T20:00:00Z',
    updated_at: '2026-10-01T20:00:00Z',
  };

  records['2026-10-02'] = {
    id: 'rec-2026-10-02',
    user_id: 'user-pratik-108',
    record_date: '2026-10-02',
    mangala_arati_time: '05:10 AM',
    japa_start_time: '05:25 AM',
    japa_finish_time: '06:45 AM',
    japa_duration_minutes: 80,
    japa_rounds: 16,
    darshan_arati_time: null,
    srimad_bhagavatam_time: '07:35 AM',
    japa_finish_slot_time: null,
    book_title: 'Bhagavad Gita As It Is',
    book_level: 4,
    book_reading_minutes: 20,
    remarks: 'Decent concentration',
    points_earned: 68,
    cc_earned: 10,
    point_rule_version: 1,
    submitted_at: '2026-10-02T20:15:00Z',
    updated_at: '2026-10-02T20:15:00Z',
  };

  records['2026-10-03'] = {
    id: 'rec-2026-10-03',
    user_id: 'user-pratik-108',
    record_date: '2026-10-03',
    mangala_arati_time: '05:03 AM',
    japa_start_time: '05:15 AM',
    japa_finish_time: '06:47 AM',
    japa_duration_minutes: 92,
    japa_rounds: 16,
    darshan_arati_time: null,
    srimad_bhagavatam_time: '07:31 AM',
    japa_finish_slot_time: '06:45 AM',
    book_title: 'Bhagavad Gita As It Is',
    book_level: 4,
    book_reading_minutes: 30,
    remarks: 'Chapter 4 verses read peacefully',
    points_earned: 100,
    cc_earned: 10,
    point_rule_version: 1,
    submitted_at: '2026-10-03T19:30:00Z',
    updated_at: '2026-10-03T19:30:00Z',
  };

  return records;
}

export const initialSadhanaRecords: Record<string, SadhanaRecord> = generateHistoricalRecords();

// Late Sādhana Approval Requests (>3 days late locked in calendar)
export const initialSadhanaApprovalRequests: SadhanaApprovalRequest[] = [
  {
    id: 'req-01',
    user_id: 'user-rohan-mehta',
    user_name: 'Rohan Mehta',
    folk_id: 'FOLK-1034',
    record_date: '2026-09-28',
    data: {
      mangala_arati_time: '05:04 AM',
      japa_start_time: '05:15 AM',
      japa_finish_time: '06:45 AM',
      japa_rounds: 16,
      srimad_bhagavatam_time: '07:35 AM',
      japa_finish_slot_time: '06:45 AM',
      book_reading_minutes: 30,
      remarks: 'Forgot to report due to semester exam prep',
    },
    status: 'pending',
    reason: 'Was caught up in semester final examinations (Date >3 days late)',
    requested_at: '2026-10-02T18:30:00Z',
  },
];

// FOLK Guide Monitoring Roster (Folk Boys & Leads under Guide oversight)
export interface GuideDevoteeOverview {
  id: string;
  name: string;
  folk_id: string;
  role: 'folk_boy' | 'folk_lead';
  avatar_url?: string;
  streak: number;
  points_today: number;
  submitted: boolean;
  last_sadhana_label: string; // e.g. "Today's Sādhana" or "Yesterday's Sādhana (2 Oct)"
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

export const mockGuideDevotees: GuideDevoteeOverview[] = [
  {
    id: 'user-pratik-108',
    name: 'Pratik Patel',
    folk_id: 'FOLK-1024',
    role: 'folk_boy',
    avatar_url: '/assets/images/Chanting.png',
    streak: 12,
    points_today: 100,
    submitted: true,
    last_sadhana_label: "Today's Sādhana",
    last_points: 100,
    pillars: { mangala: true, japa: true, darshan: false, bhagavatam: true, jf: true, reading: true },
    pillar_dots: {
      mangala: 'green', // on time 05:03 AM (20 pts)
      japa: 'green', // 16 rounds (40 pts)
      darshan: 'grey', // Saturday: Darshan excluded
      bhagavatam: 'green', // 07:31 AM (20 pts)
      jf: 'green', // 06:45 AM (10 pts)
      reading: 'green', // 30m (10 pts)
    },
    japa_rounds: 16,
    japa_arrival: '5:15 AM',
    japa_leaving: '6:47 AM',
    mangala_time: '5:03 AM',
    bhagavatam_time: '7:31 AM',
    jf_time: '6:45 AM',
    reading_mins: 30,
    current_book: 'Bhagavad Gita As It Is',
    current_book_level: 4,
    total_reading_hours: 14.5,
    last_submitted_date: 'Today, 7:35 PM',
  },
  {
    id: 'user-rahul-shah',
    name: 'Rahul Shah',
    folk_id: 'FOLK-1028',
    role: 'folk_boy',
    avatar_url: '/assets/images/SBclass.jpg',
    streak: 8,
    points_today: 75,
    submitted: true,
    last_sadhana_label: "Today's Sādhana",
    last_points: 75,
    pillars: { mangala: true, japa: true, darshan: false, bhagavatam: true, jf: false, reading: true },
    pillar_dots: {
      mangala: 'light_green', // 10-15m late at 5:08 AM
      japa: 'green', // 16 rounds
      darshan: 'grey',
      bhagavatam: 'green', // on time
      jf: 'red', // missed JF
      reading: 'light_green', // 25m
    },
    japa_rounds: 16,
    japa_arrival: '5:20 AM',
    japa_leaving: '6:50 AM',
    mangala_time: '5:08 AM',
    bhagavatam_time: '7:35 AM',
    jf_time: null,
    reading_mins: 25,
    current_book: 'Krishna Book (Vols 1 & 2)',
    current_book_level: 4,
    total_reading_hours: 9.0,
    last_submitted_date: 'Today, 8:10 PM',
  },
  {
    id: 'user-lead-madhav',
    name: 'Madhav Das',
    folk_id: 'FOLK-1031',
    role: 'folk_lead',
    avatar_url: '/assets/images/BookRead.jpg',
    streak: 19,
    points_today: 48,
    submitted: true,
    last_sadhana_label: "Today's Sādhana",
    last_points: 48,
    pillars: { mangala: true, japa: true, darshan: false, bhagavatam: false, jf: true, reading: false },
    pillar_dots: {
      mangala: 'green',
      japa: 'yellow', // 12 rounds partial
      darshan: 'grey',
      bhagavatam: 'red', // missed class
      jf: 'green',
      reading: 'red', // 0 mins
    },
    japa_rounds: 12,
    japa_arrival: '5:15 AM',
    japa_leaving: '6:40 AM',
    mangala_time: '5:00 AM',
    bhagavatam_time: null,
    jf_time: '6:40 AM',
    reading_mins: 0,
    current_book: 'Science of Self Realization (SSR)',
    current_book_level: 3,
    total_reading_hours: 22.0,
    last_submitted_date: 'Today, 6:45 PM',
  },
  {
    id: 'user-rohan-mehta',
    name: 'Rohan Mehta',
    folk_id: 'FOLK-1034',
    role: 'folk_boy',
    avatar_url: '/assets/images/Service.jpg',
    streak: 3,
    points_today: 24,
    submitted: true,
    last_sadhana_label: "Today's Sādhana",
    last_points: 24,
    pillars: { mangala: false, japa: true, darshan: false, bhagavatam: false, jf: false, reading: true },
    pillar_dots: {
      mangala: 'red', // absent
      japa: 'yellow', // 8 rounds partial
      darshan: 'grey',
      bhagavatam: 'red', // absent
      jf: 'red',
      reading: 'yellow', // 15 mins
    },
    japa_rounds: 8,
    japa_arrival: '6:00 AM',
    japa_leaving: '7:00 AM',
    mangala_time: null,
    bhagavatam_time: null,
    jf_time: null,
    reading_mins: 15,
    current_book: 'Easy Journey to Other Planets',
    current_book_level: 3,
    total_reading_hours: 3.5,
    last_submitted_date: 'Today, 9:05 PM',
  },
  {
    id: 'user-vivek-joshi',
    name: 'Vivek Joshi',
    folk_id: 'FOLK-1038',
    role: 'folk_boy',
    avatar_url: '/assets/images/img.png',
    streak: 14,
    points_today: 76,
    submitted: true,
    last_sadhana_label: "Today's Sādhana",
    last_points: 76,
    pillars: { mangala: true, japa: true, darshan: false, bhagavatam: true, jf: true, reading: true },
    pillar_dots: {
      mangala: 'green',
      japa: 'green',
      darshan: 'grey',
      bhagavatam: 'green',
      jf: 'green',
      reading: 'light_green', // 20m
    },
    japa_rounds: 16,
    japa_arrival: '5:10 AM',
    japa_leaving: '6:45 AM',
    mangala_time: '5:02 AM',
    bhagavatam_time: '7:30 AM',
    jf_time: '6:45 AM',
    reading_mins: 20,
    current_book: 'The Perfection of Yoga',
    current_book_level: 2,
    total_reading_hours: 11.2,
    last_submitted_date: 'Today, 7:50 PM',
  },
  {
    id: 'user-ananda-k',
    name: 'Ananda Kumar',
    folk_id: 'FOLK-1042',
    role: 'folk_boy',
    avatar_url: '/assets/images/Chanting.png',
    streak: 0,
    points_today: 0,
    submitted: false,
    last_sadhana_label: "Yesterday's Sādhana (2 Oct)",
    last_points: 58,
    pillars: { mangala: true, japa: true, darshan: false, bhagavatam: true, jf: false, reading: true },
    pillar_dots: {
      mangala: 'light_green', // Yesterday 10m late
      japa: 'green', // Yesterday 16 rounds
      darshan: 'grey',
      bhagavatam: 'yellow', // Yesterday partial
      jf: 'red', // Yesterday missed
      reading: 'light_green', // Yesterday 20m
    },
    japa_rounds: 0,
    japa_arrival: null,
    japa_leaving: null,
    mangala_time: null,
    bhagavatam_time: null,
    jf_time: null,
    reading_mins: 0,
    current_book: 'Beyond Birth & Death',
    current_book_level: 1,
    total_reading_hours: 1.5,
    last_submitted_date: 'Yesterday, 8:40 PM',
  },
  {
    id: 'user-keshav-verma',
    name: 'Keshav Verma',
    folk_id: 'FOLK-1045',
    role: 'folk_boy',
    avatar_url: '/assets/images/SBclass.jpg',
    streak: 0,
    points_today: 0,
    submitted: false,
    last_sadhana_label: "Yesterday's Sādhana (2 Oct)",
    last_points: 0,
    pillars: { mangala: false, japa: false, darshan: false, bhagavatam: false, jf: false, reading: false },
    pillar_dots: {
      mangala: 'red', // missed
      japa: 'red', // missed
      darshan: 'grey',
      bhagavatam: 'red', // missed
      jf: 'red',
      reading: 'red',
    },
    japa_rounds: 0,
    japa_arrival: null,
    japa_leaving: null,
    mangala_time: null,
    bhagavatam_time: null,
    jf_time: null,
    reading_mins: 0,
    current_book: 'Second Chance',
    current_book_level: 1,
    total_reading_hours: 2.0,
    last_submitted_date: '2 days ago',
  },
];

export function getBookCoverUrl(title?: string): string {
  if (!title) return '/assets/images/books/Bhagavad Gita - As it is.jpeg';
  const found = folkBookCatalogue.find(
    (b) => b.title.toLowerCase().trim() === title.toLowerCase().trim()
  );
  return found?.cover_url || '/assets/images/books/Bhagavad Gita - As it is.jpeg';
}

