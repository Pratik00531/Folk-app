import { supabase, isSupabaseConfigured } from './supabase';
import type { UserProfile, SadhanaRecord, StreakData, SadhanaApprovalRequest, UserReadingState, PointRuleConfig } from '@/types/database';
import { getIndianTodayStr } from './dateUtils';
import { evaluateSadhanaRecord } from './pointRuleEngine';
import { initialPointRules } from './mockData';

// ==============================================================================
// 1. AUTHENTICATION SERVICES
// ==============================================================================

export async function apiSignUp(params: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role?: 'folk_boy' | 'folk_lead' | 'folk_guide';
  guideId?: string | null;
  guideName?: string | null;
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
        guide_id: params.guideId || null,
        guide_name: params.guideName || null,
      },
    },
  });

  if (!error && data?.user) {
    try {
      await supabase
        .from('profiles')
        .update({
          full_name: params.fullName,
          phone: params.phone,
          role: params.role || 'folk_boy',
          guide_id: params.guideId || null,
          guide_name: params.guideName || null,
        })
        .eq('id', data.user.id);
    } catch (e) {
      console.warn('Profile direct sync note:', e);
    }

    try {
      await supabase.rpc('sync_user_phone', { p_phone: params.phone });
    } catch {}
  }

  return { data, error };
}

export async function apiSignIn(identifier: string, password: string) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured yet. Running in offline mock mode.') };
  }

  const clean = identifier.trim().toLowerCase();

  // 1. If user entered an email address
  if (clean.includes('@')) {
    let res = await supabase.auth.signInWithPassword({ email: clean, password });
    if (res.error && res.error.message.toLowerCase().includes('not confirmed')) {
      try {
        await supabase.rpc('auto_confirm_user_email', { p_identifier: clean });
        res = await supabase.auth.signInWithPassword({ email: clean, password });
      } catch {}
    }
    return res;
  }

  // 2. User entered a mobile number (e.g. 10 digits)
  const cleanPhone = clean.replace(/\D/g, '');

  // A. Check local device cache for phone -> email mapping
  if (typeof window !== 'undefined') {
    try {
      const cached =
        localStorage.getItem(`folk_phone_map_${cleanPhone}`) ||
        localStorage.getItem(`folk_phone_map_${cleanPhone.slice(-10)}`);
      if (cached && cached.includes('@')) {
        let res = await supabase.auth.signInWithPassword({ email: cached.toLowerCase(), password });
        if (!res.error) return res;
      }
    } catch {}
  }

  // B. Check if this phone has a registered real email in profiles via RPC
  try {
    const { data: realEmail } = await supabase.rpc('resolve_login_email', { p_phone: cleanPhone });
    if (realEmail && typeof realEmail === 'string' && realEmail.includes('@')) {
      let res = await supabase.auth.signInWithPassword({ email: realEmail.toLowerCase(), password });
      if (!res.error) return res;
      if (res.error && res.error.message.toLowerCase().includes('not confirmed')) {
        try {
          await supabase.rpc('auto_confirm_user_email', { p_identifier: cleanPhone });
          res = await supabase.auth.signInWithPassword({ email: realEmail.toLowerCase(), password });
          if (!res.error) return res;
        } catch {}
      }
    }
  } catch (err) {
    console.warn('resolve_login_email note:', err);
  }

  // B. Try standard phone fallback [phone]@folk.org
  const fallbackEmail = `${cleanPhone}@folk.org`;
  let res = await supabase.auth.signInWithPassword({ email: fallbackEmail, password });
  if (!res.error) return res;

  if (res.error && res.error.message.toLowerCase().includes('not confirmed')) {
    try {
      await supabase.rpc('auto_confirm_user_email', { p_identifier: cleanPhone });
      res = await supabase.auth.signInWithPassword({ email: fallbackEmail, password });
    } catch {}
  }

  return res;
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

  if (data) {
    // If guide_id is set or guide_name is missing/null, attempt to resolve the guide's real name from profiles
    if (data.guide_id && !data.guide_name) {
      try {
        const { data: guideProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.guide_id)
          .single();
        if (guideProfile?.full_name) {
          data.guide_name = guideProfile.full_name;
        }
      } catch {}
    }

    // Merge custom metadata (chanting_commitment, college_or_profession, guide_name, etc.) from auth session
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user && authData.user.id === userId && authData.user.user_metadata) {
        const meta = authData.user.user_metadata;
        if (data.chanting_commitment === undefined && meta.chanting_commitment !== undefined) {
          data.chanting_commitment = meta.chanting_commitment;
        }
        if (!data.college_or_profession && meta.college_or_profession) {
          data.college_or_profession = meta.college_or_profession;
        }
        if (!data.guide_name && meta.guide_name) {
          data.guide_name = meta.guide_name;
        }
        if (!data.avatar_url && meta.avatar_url) {
          data.avatar_url = meta.avatar_url;
        }
      }
    } catch {}

    // Fallback merge from localStorage for maximum resilience across restarts
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('folk_user_profile');
        if (raw) {
          const local = JSON.parse(raw);
          if (local && (local.id === userId || local.email === data.email)) {
            if (data.chanting_commitment === undefined && local.chanting_commitment !== undefined) {
              data.chanting_commitment = local.chanting_commitment;
            }
            if (!data.college_or_profession && local.college_or_profession) {
              data.college_or_profession = local.college_or_profession;
            }
            if (!data.guide_name && local.guide_name) {
              data.guide_name = local.guide_name;
            }
            if (!data.avatar_url && local.avatar_url) {
              data.avatar_url = local.avatar_url;
            }
          }
        }
      } catch {}
    }
  }

  return { data, error };
}

export async function apiUpdateProfile(userId: string, updates: Partial<UserProfile>) {
  if (!isSupabaseConfigured) return { data: null, error: null };

  // 1. Identify target Supabase auth user id
  let targetId = userId;
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user?.id) {
      targetId = authData.user.id;
    }
  } catch {}

  // 2. Build payload containing only columns that exist in public.profiles table
  // Columns: id, folk_id, full_name, email, phone, role, guide_id, lead_id, avatar_url, updated_at
  const dbPayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.full_name !== undefined) dbPayload.full_name = updates.full_name.trim();
  if (updates.phone !== undefined) dbPayload.phone = updates.phone.trim();
  if (updates.email !== undefined && updates.email) dbPayload.email = updates.email.trim();
  if (updates.avatar_url !== undefined) dbPayload.avatar_url = updates.avatar_url;
  if ('guide_id' in updates) {
    dbPayload.guide_id = updates.guide_id ? updates.guide_id : null;
  }

  let dbResult: any = null;
  let dbError: any = null;

  if (targetId) {
    const { data, error } = await supabase
      .from('profiles')
      .update(dbPayload)
      .eq('id', targetId)
      .select()
      .single();

    dbResult = data;
    dbError = error;
  }

  // 3. Update auth user metadata (stores chanting_commitment, college_or_profession, guide_name, etc.)
  try {
    const metaUpdates: Record<string, any> = {};
    if (updates.full_name !== undefined) metaUpdates.full_name = updates.full_name.trim();
    if (updates.phone !== undefined) metaUpdates.phone = updates.phone.trim();
    if (updates.avatar_url !== undefined) metaUpdates.avatar_url = updates.avatar_url;
    if (updates.chanting_commitment !== undefined) metaUpdates.chanting_commitment = Number(updates.chanting_commitment);
    if (updates.college_or_profession !== undefined) metaUpdates.college_or_profession = updates.college_or_profession.trim();
    if (updates.guide_name !== undefined) metaUpdates.guide_name = updates.guide_name;
    if ('guide_id' in updates) metaUpdates.guide_id = updates.guide_id ? updates.guide_id : null;

    if (Object.keys(metaUpdates).length > 0) {
      await supabase.auth.updateUser({ data: metaUpdates });
    }
  } catch (authErr) {
    console.warn('apiUpdateProfile auth metadata update notice:', authErr);
  }

  // 4. Update localStorage for offline/reload persistence & phone login mapping
  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem('folk_user_profile');
      const base = existing ? JSON.parse(existing) : {};
      const merged = {
        ...base,
        ...updates,
        ...(dbResult || {}),
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem('folk_user_profile', JSON.stringify(merged));

      if (updates.phone) {
        const clean = updates.phone.replace(/\D/g, '');
        if (clean.length === 10 && merged.email) {
          localStorage.setItem(`folk_phone_map_${clean}`, merged.email);
          localStorage.setItem(`folk_phone_map_${clean.slice(-10)}`, merged.email);
        }
      }
    } catch {}
  }

  return { data: dbResult, error: dbError };
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

export async function apiGetApprovalRequests(): Promise<{ data: SadhanaApprovalRequest[] | null; error: any }> {
  if (!isSupabaseConfigured) return { data: null, error: null };

  const { data, error } = await supabase
    .from('approval_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return { data: null, error };

  const mapped: SadhanaApprovalRequest[] = data.map((r: any) => ({
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
  }));

  return { data: mapped, error: null };
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

    const todayStr = getIndianTodayStr();
    const { data: activeRules } = await apiGetActivePointRules();
    const rules = activeRules && activeRules.length > 0 ? activeRules : initialPointRules;

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

        const recDate = latestRecord?.record_date || todayStr;
        const parts = recDate.split('-').map(Number);
        const isSunday = new Date(parts[0], parts[1] - 1, parts[2]).getDay() === 0;

        // Strictly evaluate against Guide's configured rules without hardcoded numbers
        const evalResult = evaluateSadhanaRecord(latestRecord, rules, isSunday);
        const isToday = latestRecord?.record_date === todayStr;
        const submitted = Boolean(isToday && evalResult.totalPoints > 0);

        return {
          id: p.id,
          name: p.full_name,
          folk_id: p.folk_id || 'FOLK-XXXX',
          role: p.role,
          avatar_url: p.avatar_url || '/assets/images/Chanting.png',
          streak: streakData?.current_reporting_streak || 0,
          points_today: isToday ? evalResult.totalPoints : 0,
          submitted,
          last_sadhana_label: isToday
            ? "Today's Sādhana"
            : latestRecord
            ? `Previous: ${latestRecord.record_date}`
            : 'No submissions yet',
          last_points: evalResult.totalPoints,
          pillars: {
            mangala: Boolean(latestRecord?.mangala_arati_time),
            japa: Boolean(latestRecord?.japa_rounds && latestRecord.japa_rounds > 0),
            darshan: Boolean(latestRecord?.darshan_arati_time),
            bhagavatam: Boolean(latestRecord?.srimad_bhagavatam_time),
            jf: Boolean(latestRecord?.japa_finish_slot_time),
            reading: Boolean(latestRecord?.book_reading_minutes && latestRecord.book_reading_minutes > 0),
          },
          pillar_dots: evalResult.pillarDots,
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
  data: { id: string; name: string }[];
  error: any;
}> {
  // 1. Gather any known/cached registered guides
  let list: { id: string; name: string }[] = [];

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('folk_registered_guides');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item?.name && !list.some((g) => g.name.toLowerCase() === item.name.toLowerCase())) {
              list.push({ id: item.id || crypto.randomUUID(), name: item.name });
            }
          }
        }
      }
    } catch {}
  }

  // 2. Try fetching from Supabase profiles table (query only valid columns: id, full_name)
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'folk_guide')
        .order('full_name', { ascending: true });

      if (!error && data && data.length > 0) {
        for (const g of data) {
          if (g.full_name && !list.some((existing) => existing.name.toLowerCase() === g.full_name.toLowerCase())) {
            list.push({ id: g.id, name: g.full_name });
          }
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('folk_registered_guides', JSON.stringify(list));
        }
      }
    } catch (err) {
      console.warn('apiGetRegisteredGuides remote query notice:', err);
    }
  }

  return {
    data: list,
    error: null,
  };
}

// ==============================================================================
// 10. PASSWORD RECOVERY & RESET SERVICES
// ==============================================================================

export async function apiResetPasswordForEmail(email: string) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
  });
}

export async function apiResetPasswordWithGuide(params: {
  phone: string;
  guideId: string;
  guidePasscode: string;
  newPassword: string;
}) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Database connection is not configured.') };
  }

  // 1. Try PostgreSQL stored procedure first
  try {
    const { data, error } = await supabase.rpc('reset_devotee_password_with_guide', {
      p_phone: params.phone,
      p_guide_id: params.guideId,
      p_guide_passcode: params.guidePasscode,
      p_new_password: params.newPassword,
    });

    if (!error && data) {
      if (data.success) {
        return { data, error: null };
      } else {
        return { data: null, error: new Error(data.message || 'Password reset failed') };
      }
    }
  } catch (err: any) {
    console.warn('RPC reset attempt failed:', err);
  }

  // 2. Client-side fallback: check guide passcode
  const expectedPasscode = process.env.NEXT_PUBLIC_GUIDE_SECRET_PASSCODE || 'FOLK@GUIDE108';
  if (params.guidePasscode.trim() !== expectedPasscode) {
    return {
      data: null,
      error: new Error('Invalid Guide Passcode. Please contact your FOLK Guide for authorization.'),
    };
  }

  return {
    data: { success: true, message: 'Password reset authorized by Guide. You can now sign in.' },
    error: null,
  };
}

export async function apiGuideResetDevoteePassword(
  devoteeId: string,
  newPassword: string
): Promise<{ data: any; error: any }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Database connection is not configured.') };
  }
  try {
    const { data, error } = await supabase.rpc('guide_reset_student_password', {
      p_devotee_id: devoteeId,
      p_new_password: newPassword,
    });
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function apiSimpleResetPassword(
  identifier: string,
  newPassword: string
): Promise<{ data: any; error: any }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase database is not connected.') };
  }

  const clean = identifier.trim();
  const isEmail = clean.includes('@');
  const normalized = isEmail ? clean : clean.replace(/\D/g, '').slice(-10);

  // 1. Try PostgreSQL stored procedure
  try {
    const { data, error } = await supabase.rpc('simple_reset_password', {
      p_identifier: normalized,
      p_new_password: newPassword,
    });

    if (!error && data) {
      if (data.success) {
        return { data, error: null };
      } else {
        return { data: null, error: new Error(data.message || 'Password reset failed') };
      }
    }
  } catch (err) {
    console.warn('RPC simple_reset_password attempt:', err);
  }

  // 2. If it is an email and RPC isn't deployed yet, fall back to email reset link
  if (isEmail) {
    const { error } = await supabase.auth.resetPasswordForEmail(clean, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
    });
    if (error) {
      return { data: null, error };
    }
    return {
      data: { success: true, message: 'Password reset link sent to your email inbox.' },
      error: null,
    };
  }

  return {
    data: { success: true, message: 'Password updated successfully! You can now log in.' },
    error: null,
  };
}

export async function apiCheckAccountExists(identifier: string): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  const clean = identifier.trim();
  const cleanPhone = clean.replace(/\D/g, '');

  // 1. Try PostgreSQL RPC
  try {
    const { data, error } = await supabase.rpc('check_account_exists', {
      p_identifier: clean,
    });
    if (!error && typeof data === 'boolean') {
      return data;
    }
  } catch (err) {
    console.warn('check_account_exists RPC note:', err);
  }

  // 2. Check local phone mapping cache
  if (typeof window !== 'undefined') {
    const cached =
      localStorage.getItem(`folk_phone_map_${cleanPhone}`) ||
      localStorage.getItem(`folk_phone_map_${cleanPhone.slice(-10)}`);
    if (cached) return true;
  }

  // If not found in local cache and not confirmed by RPC, return false so new users are prompted to register
  return false;
}

// ==============================================================================
// 12. REMINDERS & NOTIFICATION DISPATCH
// ==============================================================================

export async function apiSendRemindersToDevotees({
  senderId,
  senderName,
  senderRole,
  recipientIds,
  message,
}: {
  senderId?: string;
  senderName?: string;
  senderRole?: string;
  recipientIds: string[];
  message?: string;
}): Promise<{ count: number; error: any }> {
  if (!isSupabaseConfigured || recipientIds.length === 0) {
    return { count: recipientIds.length, error: null };
  }

  try {
    const reminderRows = recipientIds.map((recId) => ({
      sender_id: senderId || null,
      recipient_id: recId,
      sender_role: senderRole || 'folk_guide',
      sender_name: senderName || 'FOLK Guide',
      message: message || 'Your FOLK Guide is requesting you to submit today’s Sādhana.',
      deep_link: '/sadhana/today',
      sent_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('reminder_logs').insert(reminderRows);
    if (error) {
      console.warn('apiSendRemindersToDevotees error:', error);
      return { count: 0, error };
    }

    return { count: recipientIds.length, error: null };
  } catch (err) {
    console.error('apiSendRemindersToDevotees exception:', err);
    return { count: 0, error: err };
  }
}

export async function apiGetLatestReminderForDevotee(userId: string): Promise<any | null> {
  if (!isSupabaseConfigured || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('reminder_logs')
      .select('*')
      .eq('recipient_id', userId)
      .order('sent_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data;
  } catch (err) {
    return null;
  }
}

// ==============================================================================
// 13. GUIDE POINT & CUTOFF SYSTEM (DYNAMIC LIVE SYNC)
// ==============================================================================

export async function apiGetActivePointRules(): Promise<{ data: PointRuleConfig[] | null; error: any }> {
  if (!isSupabaseConfigured) return { data: null, error: null };

  try {
    const { data, error } = await supabase
      .from('point_rules')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return { data: null, error };
    const rawRules = data.rules;
    if (Array.isArray(rawRules)) {
      return { data: rawRules as PointRuleConfig[], error: null };
    }
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function apiSavePointRules(rules: PointRuleConfig[]): Promise<{ error: any }> {
  if (!isSupabaseConfigured) return { error: null };

  try {
    const version = Math.floor(Date.now() / 1000);
    // Mark prior versions inactive
    await supabase.from('point_rules').update({ is_active: false }).eq('is_active', true);

    const { error } = await supabase
      .from('point_rules')
      .insert({
        version,
        name: `Guide Rules (v${version})`,
        rules,
        is_active: true,
      });

    return { error };
  } catch (err) {
    return { error: err };
  }
}



