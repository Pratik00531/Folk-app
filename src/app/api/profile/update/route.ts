import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return NextResponse.json({ error: 'Missing userId or updates' }, { status: 400 });
    }

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase service configuration missing' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const dbPayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.full_name !== undefined) dbPayload.full_name = updates.full_name.trim();
    if (updates.phone !== undefined) dbPayload.phone = updates.phone.trim();
    if (updates.email !== undefined && updates.email) dbPayload.email = updates.email.trim();
    if (updates.avatar_url !== undefined) dbPayload.avatar_url = updates.avatar_url;
    if (updates.role !== undefined) dbPayload.role = updates.role;
    if ('guide_id' in updates) dbPayload.guide_id = updates.guide_id ? updates.guide_id : null;
    if ('lead_id' in updates) dbPayload.lead_id = updates.lead_id ? updates.lead_id : null;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(dbPayload)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('API profile update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also update auth user metadata if needed
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
        await supabaseAdmin.auth.admin.updateUserById(userId, { user_metadata: metaUpdates });
      }
    } catch (metaErr) {
      console.warn('Auth metadata update notice:', metaErr);
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('API profile update server error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
