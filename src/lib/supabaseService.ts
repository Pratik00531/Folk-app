import { supabase, isSupabaseConfigured } from './supabase';
import type { UserProfile, SadhanaRecord, StreakData, SadhanaApprovalRequest, UserReadingState } from '@/types/database';

// ==============================================================================
// 1. AUTHENTICATION SERVICES
// ==============================================================================

export async function apiSignUp(params: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role?: 'folk_boy' | 'folk_lead' | 'folk_guide';
  spiritualName?: string;
}) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured yet. Running in offline mock mode.') };
  }

  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        full_name: params.fullName,
        phone: params.phone,
        role: params.role || 'folk_boy',
        spiritual_name: params.spiritualName || null,
      },
    },
  });

  return { data, error };
}

export async function apiSignIn(email: string, password: string) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured yet. Running in offline mock mode.') };
  }
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function apiSignOut() {
  if (!isSupabaseConfigured) return { error: null };
  return await supabase.auth.signOut();
}

export async function apiGetSession() {
  if (!isSupabaseConfigured) return { data: { session: null }, error: null };
  return await supabase.auth.getSession();
}

export function apiOnAuthStateChange(callback: (event: string, session: any) => void) {
  if (!isSupabaseConfigured) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange(callback);
}

// ==============================================================================
// 2. DEVOTEE PROFILE SERVICES
// ==============================================================================

export async function apiGetProfile(userId: string) {
  if (!isSupabaseConfigured) return { data: null, error: null };

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

export async function apiUpdateProfile(userId: string, updates: Partial<UserProfile>) {
  if (!isSupabaseConfigured) return { data: null, error: null };

  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: updates.full_name,
      spiritual_name: updates.spiritual_name,
      phone: updates.phone,
      email: updates.email,
      avatar_url: updates.avatar_url,
      chanting_commitment: updates.chanting_commitment,
      college_or_profession: updates.college_or_profession,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

// ==============================================================================
// 3. SĀDHANA RECORDS SERVICES
// ==============================================================================

export async function apiGetSadhanaRecords(userId: string, startDate?: string, endDate?: string) {
  if (!isSupabaseConfigured) return { data: null, error: null };

  let query = supabase
    .from('sadhana_records')
    .select('*')
    .eq('user_id', userId);

  if (startDate) query = query.gte('record_date', startDate);
  if (endDate) query = query.lte('record_date', endDate);

  const { data, error } = await query.order('record_date', { ascending: false });
  return { data, error };
}

export async function apiUpsertSadhanaRecord(record: Partial<SadhanaRecord>) {
  if (!isSupabaseConfigured) return { data: null, error: null };

  const { data, error } = await supabase
    .from('sadhana_records')
    .upsert(
      {
        user_id: record.user_id,
        record_date: record.record_date,
        mangala_arati_time: record.mangala_arati_time,
        japa_start_time: record.japa_start_time,
        japa_finish_time: record.japa_finish_time,
        japa_duration_minutes: record.japa_duration_minutes,
        japa_rounds: record.japa_rounds,
        darshan_arati_time: record.darshan_arati_time,
        srimad_bhagavatam_time: record.srimad_bhagavatam_time,
        japa_finish_slot_time: record.japa_finish_slot_time,
        book_reading_minutes: record.book_reading_minutes,
        book_title: record.book_title,
        book_level: record.book_level,
        is_late_submission: record.is_late_submission || false,
        remarks: record.remarks,
        points_earned: record.points_earned,
        cc_earned: record.cc_earned,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id, record_date' }
    )
    .select()
    .single();

  return { data, error };
}

// ==============================================================================
// 4. STREAKS SERVICES
// ==============================================================================

export async function apiGetStreak(userId: string) {
  if (!isSupabaseConfigured) return { data: null, error: null };

  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

export async function apiUpdateStreak(userId: string, streak: Partial<StreakData>) {
  if (!isSupabaseConfigured) return { data: null, error: null };

  const { data, error } = await supabase
    .from('streaks')
    .upsert({
      user_id: userId,
      current_reporting_streak: streak.current_reporting_streak,
      longest_reporting_streak: streak.longest_reporting_streak,
      last_reported_date: streak.last_reported_date,
      next_milestone: streak.next_milestone,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  return { data, error };
}

// ==============================================================================
// 5. LATE SĀDHANA APPROVAL REQUESTS SERVICES (>3 Days Lock)
// ==============================================================================

export async function apiGetApprovalRequests() {
  if (!isSupabaseConfigured) return { data: null, error: null };

  const { data, error } = await supabase
    .from('approval_requests')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function apiCreateApprovalRequest(payload: {
  userId: string;
  devoteeName: string;
  devoteeFolkId: string;
  recordDate: string;
  lateDays: number;
  reason: string;
  submittedPoints: number;
  sadhanaPayload: any;
}) {
  if (!isSupabaseConfigured) return { data: null, error: null };

  const { data, error } = await supabase
    .from('approval_requests')
    .insert({
      user_id: payload.userId,
      devotee_name: payload.devoteeName,
      devotee_folk_id: payload.devoteeFolkId,
      record_date: payload.recordDate,
      late_days: payload.lateDays,
      reason: payload.reason,
      submitted_points: payload.submittedPoints,
      sadhana_payload: payload.sadhanaPayload,
      status: 'pending',
    })
    .select()
    .single();

  return { data, error };
}

export async function apiReviewApprovalRequest(
  requestId: string,
  status: 'approved' | 'rejected',
  reviewedBy: string
) {
  if (!isSupabaseConfigured) return { data: null, error: null };

  const { data, error } = await supabase
    .from('approval_requests')
    .update({
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select()
    .single();

  return { data, error };
}

// ==============================================================================
// 6. BOOK READING PROGRESS SERVICES
// ==============================================================================

export async function apiGetReadingProgress(userId: string) {
  if (!isSupabaseConfigured) return { data: null, error: null };

  const { data, error } = await supabase
    .from('reading_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

export async function apiUpdateReadingProgress(userId: string, progress: Partial<UserReadingState>) {
  if (!isSupabaseConfigured) return { data: null, error: null };

  const { data, error } = await supabase
    .from('reading_progress')
    .upsert({
      user_id: userId,
      current_book_title: progress.current_book_title,
      current_book_level: progress.current_book_level,
      total_reading_minutes: progress.total_minutes_read,
      completed_books: progress.completed_books,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  return { data, error };
}

// ==============================================================================
// 7. REALTIME LIVE SYNC LISTENERS
// ==============================================================================

export function apiSubscribeToSadhanaChanges(onUpdate: (payload: any) => void) {
  if (!isSupabaseConfigured) return { unsubscribe: () => {} };

  const channel = supabase
    .channel('sadhana_records_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'sadhana_records' },
      (payload) => {
        onUpdate(payload);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

export function apiSubscribeToApprovalChanges(onUpdate: (payload: any) => void) {
  if (!isSupabaseConfigured) return { unsubscribe: () => {} };

  const channel = supabase
    .channel('approval_requests_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'approval_requests' },
      (payload) => {
        onUpdate(payload);
      }
    )
  .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

// ==============================================================================
// 8. GUIDE DEVOTEES ROSTER
// ==============================================================================

export async function apiGetGuideDevotees(): Promise<{ data: any[]; error: any }> {
  if (!isSupabaseConfigured) return { data: [], error: null };

  try {
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['folk_boy', 'folk_lead'])
      .order('created_at', { ascending: false });

    if (pError || !profiles) {
      return { data: [], error: pError };
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const devotees = await Promise.all(
      profiles.map(async (p: any) => {
        const { data: streakData } = await supabase
          .from('streaks')
          .select('*')
          .eq('user_id', p.id)
          .single();

        const { data: latestRecord } = await supabase
          .from('sadhana_records')
          .select('*')
          .eq('user_id', p.id)
          .order('record_date', { ascending: false })
          .limit(1)
          .single();

        const { data: readingData } = await supabase
          .from('reading_progress')
          .select('*')
          .eq('user_id', p.id)
          .single();

        const isToday = latestRecord?.record_date === todayStr;
        const submitted = Boolean(isToday && latestRecord?.points_earned > 0);

        return {
          id: p.id,
          name: p.spiritual_name ? `${p.full_name} (${p.spiritual_name})` : p.full_name,
          folk_id: p.folk_id || 'FOLK-XXXX',
          role: p.role,
          avatar_url: p.avatar_url || '/assets/images/Chanting.png',
          streak: streakData?.current_reporting_streak || 0,
          points_today: isToday ? latestRecord?.points_earned || 0 : 0,
          submitted,
          last_sadhana_label: isToday
            ? "Today's Sādhana"
            : latestRecord
            ? `Previous: ${latestRecord.record_date}`
            : 'No submissions yet',
          last_points: latestRecord?.points_earned || 0,
          pillars: {
            mangala: Boolean(latestRecord?.mangala_arati_time),
            japa: Boolean(latestRecord?.japa_rounds && latestRecord.japa_rounds >= 16),
            darshan: Boolean(latestRecord?.darshan_arati_time),
            bhagavatam: Boolean(latestRecord?.srimad_bhagavatam_time),
            jf: Boolean(latestRecord?.japa_finish_slot_time),
            reading: Boolean(latestRecord?.book_reading_minutes && latestRecord.book_reading_minutes > 0),
          },
          pillar_dots: {
            mangala: latestRecord?.mangala_arati_time ? 'green' : 'red',
            japa: (latestRecord?.japa_rounds || 0) >= 16 ? 'green' : (latestRecord?.japa_rounds || 0) > 0 ? 'yellow' : 'red',
            darshan: latestRecord?.darshan_arati_time ? 'green' : 'grey',
            bhagavatam: latestRecord?.srimad_bhagavatam_time ? 'green' : 'red',
            jf: latestRecord?.japa_finish_slot_time ? 'green' : 'red',
            reading: (latestRecord?.book_reading_minutes || 0) >= 20 ? 'green' : (latestRecord?.book_reading_minutes || 0) > 0 ? 'yellow' : 'red',
          },
          japa_rounds: latestRecord?.japa_rounds || 0,
          japa_arrival: latestRecord?.japa_start_time || null,
          japa_leaving: latestRecord?.japa_finish_time || null,
          mangala_time: latestRecord?.mangala_arati_time || null,
          bhagavatam_time: latestRecord?.srimad_bhagavatam_time || null,
          jf_time: latestRecord?.japa_finish_slot_time || null,
          reading_mins: latestRecord?.book_reading_minutes || 0,
          current_book: readingData?.current_book_title || latestRecord?.book_title || 'Bhagavad Gita As It Is',
          current_book_level: readingData?.current_book_level || latestRecord?.book_level || 1,
          total_reading_hours: Number(((readingData?.total_reading_minutes || 0) / 60).toFixed(1)),
          last_submitted_date: latestRecord ? latestRecord.record_date : 'Never',
        };
      })
    );

    return { data: devotees, error: null };
  } catch (err) {
    return { data: [], error: err };
  }
}

// ==============================================================================
// 9. REGISTERED GUIDES (For Devotee Sign-up and Guide Selection)
// ==============================================================================

export async function apiGetRegisteredGuides(): Promise<{
  data: { id: string; name: string; spiritual_name?: string | null }[];
  error: any;
}> {
  if (!isSupabaseConfigured) return { data: [], error: null };

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, spiritual_name')
    .eq('role', 'folk_guide')
    .order('full_name', { ascending: true });

  if (error || !data) return { data: [], error };

  return {
    data: data.map((g) => ({
      id: g.id,
      name: g.spiritual_name ? `${g.full_name} (${g.spiritual_name})` : g.full_name,
      spiritual_name: g.spiritual_name,
    })),
    error: null,
  };
}


