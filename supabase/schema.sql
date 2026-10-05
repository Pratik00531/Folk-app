-- ==============================================================================
-- FOLK SĀDHANA - PostgreSQL Database Schema (Supabase)
-- Production-quality schema with Row Level Security (RLS), Triggers & Versioned Rules
-- ==============================================================================

-- Enable UUID & pgcrypto extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. ROLES ENUM
create type user_role as enum ('folk_boy', 'folk_lead', 'folk_guide');

-- 2. PROFILES
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    folk_id text unique not null,
    full_name text not null,
    email text unique not null,
    phone text not null,
    role user_role not null default 'folk_boy',
    guide_id uuid references public.profiles(id) on delete set null,
    lead_id uuid references public.profiles(id) on delete set null,
    avatar_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 3. GROUPS & GROUP MEMBERS
create table if not exists public.groups (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    guide_id uuid not null references public.profiles(id) on delete cascade,
    created_at timestamptz not null default now()
);

create table if not exists public.group_members (
    id uuid primary key default uuid_generate_v4(),
    group_id uuid not null references public.groups(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    assigned_lead_id uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default now(),
    unique(group_id, user_id)
);

-- 4. POINT RULES (VERSIONED)
create table if not exists public.point_rules (
    id uuid primary key default uuid_generate_v4(),
    version int not null unique,
    name text not null,
    rules jsonb not null,
    is_active boolean not null default false,
    created_at timestamptz not null default now()
);

-- 5. CC RULES (VERSIONED)
create table if not exists public.cc_rules (
    id uuid primary key default uuid_generate_v4(),
    version int not null unique,
    same_day_cc int not null default 10,
    next_day_cc int not null default 5,
    day_after_cc int not null default 2,
    older_day_cc int not null default 0,
    milestone_rules jsonb not null default '{"3": 10, "7": 25, "14": 50, "30": 100, "60": 200, "90": 350}'::jsonb,
    is_active boolean not null default false,
    created_at timestamptz not null default now()
);

-- 6. SĀDHANA RECORDS
create table if not exists public.sadhana_records (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    record_date date not null,
    mangala_arati_time time,
    japa_start_time time,
    japa_finish_time time,
    japa_duration_minutes int,
    japa_rounds int default 16,
    darshan_arati_time time,
    srimad_bhagavatam_time time,
    japa_finish_slot_time time,
    book_reading_minutes int default 0,
    book_title text,
    book_level int default 1,
    is_late_submission boolean not null default false,
    remarks text,
    points_earned int default 0,
    cc_earned int default 0,
    point_rule_version int references public.point_rules(version),
    submitted_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(user_id, record_date)
);

-- 7. SĀDHANA POINT TRANSACTIONS
create table if not exists public.sadhana_point_transactions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    sadhana_record_id uuid not null references public.sadhana_records(id) on delete cascade,
    rule_version int not null,
    points int not null,
    breakdown jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

-- 8. CHAITANYA CURRENCY (CC) TRANSACTIONS (LEDGER)
create table if not exists public.cc_transactions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    sadhana_record_id uuid references public.sadhana_records(id) on delete set null,
    amount int not null,
    balance_after int not null,
    reason text not null,
    created_at timestamptz not null default now()
);

-- 9. REPORTING STREAKS
create table if not exists public.streaks (
    user_id uuid primary key references public.profiles(id) on delete cascade,
    current_reporting_streak int not null default 0,
    longest_reporting_streak int not null default 0,
    last_reported_date date,
    next_milestone int not null default 3,
    updated_at timestamptz not null default now()
);

-- 10. REMINDER LOGS
create table if not exists public.reminder_logs (
    id uuid primary key default uuid_generate_v4(),
    sender_id uuid references public.profiles(id) on delete set null,
    recipient_id uuid not null references public.profiles(id) on delete cascade,
    sender_role user_role not null,
    sender_name text not null,
    message text not null,
    deep_link text not null default '/sadhana/today',
    sent_at timestamptz not null default now(),
    cooldown_expires_at timestamptz not null default (now() + interval '6 hours')
);

-- 11. NOTIFICATION PREFERENCES
create table if not exists public.notification_preferences (
    user_id uuid primary key references public.profiles(id) on delete cascade,
    push_enabled boolean not null default true,
    email_enabled boolean not null default true,
    daily_reminder_time time not null default '20:00:00',
    updated_at timestamptz not null default now()
);

-- 12. AUDIT LOGS
create table if not exists public.audit_logs (
    id uuid primary key default uuid_generate_v4(),
    actor_id uuid references public.profiles(id) on delete set null,
    action text not null,
    target_user_id uuid references public.profiles(id) on delete set null,
    details jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

-- 13. LATE SĀDHANA APPROVAL REQUESTS (>3 Days Late Lock)
create table if not exists public.approval_requests (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    devotee_name text not null,
    devotee_folk_id text not null,
    record_date date not null,
    late_days int not null default 4,
    reason text not null,
    submitted_points int not null default 85,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    reviewed_by text,
    reviewed_at timestamptz,
    sadhana_payload jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

-- 14. BOOK READING PROGRESS
create table if not exists public.reading_progress (
    user_id uuid primary key references public.profiles(id) on delete cascade,
    current_book_title text not null default 'Bhagavad-gītā As It Is',
    current_book_level int not null default 1,
    current_page int not null default 45,
    total_pages int not null default 924,
    total_reading_minutes int not null default 420,
    completed_books text[] not null default array[]::text[],
    updated_at timestamptz not null default now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.sadhana_records enable row level security;
alter table public.point_rules enable row level security;
alter table public.sadhana_point_transactions enable row level security;
alter table public.cc_rules enable row level security;
alter table public.cc_transactions enable row level security;
alter table public.streaks enable row level security;
alter table public.reminder_logs enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.audit_logs enable row level security;
alter table public.approval_requests enable row level security;
alter table public.reading_progress enable row level security;

-- Helper function to check role securely server-side
create or replace function public.current_user_role()
returns user_role
language sql
stable
security definer
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- PROFILES POLICIES
create policy "Users can view own profile"
  on public.profiles for select
  using (
    auth.uid() = id
    or public.current_user_role() = 'folk_guide'
    or (
      public.current_user_role() = 'folk_lead'
      and id in (select user_id from public.group_members where assigned_lead_id = auth.uid())
    )
  );

create policy "Users can update own personal info (excluding role)"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
  );

-- SECURE SERVER FUNCTION TO PROMOTE/DEMOTE LEAD (Guide Only)
create or replace function public.set_lead_status(target_user_id uuid, promote boolean)
returns void
language plpgsql
security definer
as $$
declare
  caller_role user_role;
begin
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role is distinct from 'folk_guide' then
    raise exception 'Unauthorized: Only FOLK Guides can promote or demote Folk Leads';
  end if;

  if promote then
    update public.profiles set role = 'folk_lead', updated_at = now() where id = target_user_id;
    insert into public.audit_logs (actor_id, action, target_user_id, details)
    values (auth.uid(), 'PROMOTE_TO_LEAD', target_user_id, '{"new_role": "folk_lead"}'::jsonb);
  else
    update public.profiles set role = 'folk_boy', updated_at = now() where id = target_user_id;
    insert into public.audit_logs (actor_id, action, target_user_id, details)
    values (auth.uid(), 'DEMOTE_TO_BOY', target_user_id, '{"new_role": "folk_boy"}'::jsonb);
  end if;
end;
$$;

-- SĀDHANA RECORDS POLICIES
create policy "Sadhana select policy"
  on public.sadhana_records for select
  using (
    auth.uid() = user_id
    or public.current_user_role() = 'folk_guide'
    or (
      public.current_user_role() = 'folk_lead'
      and user_id in (select user_id from public.group_members where assigned_lead_id = auth.uid())
    )
  );

create policy "Users can insert own sadhana"
  on public.sadhana_records for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sadhana"
  on public.sadhana_records for update
  using (auth.uid() = user_id);

-- STREAKS POLICIES
create policy "Streaks view policy"
  on public.streaks for select
  using (
    auth.uid() = user_id
    or public.current_user_role() = 'folk_guide'
    or (
      public.current_user_role() = 'folk_lead'
      and user_id in (select user_id from public.group_members where assigned_lead_id = auth.uid())
    )
  );

-- CC TRANSACTIONS POLICIES
create policy "CC transactions view policy"
  on public.cc_transactions for select
  using (
    auth.uid() = user_id
    or public.current_user_role() = 'folk_guide'
    or (
      public.current_user_role() = 'folk_lead'
      and user_id in (select user_id from public.group_members where assigned_lead_id = auth.uid())
    )
  );

-- APPROVAL REQUESTS POLICIES
create policy "Approval requests select policy"
  on public.approval_requests for select
  using (
    auth.uid() = user_id
    or public.current_user_role() in ('folk_guide', 'folk_lead')
  );

create policy "Users can insert own approval request"
  on public.approval_requests for insert
  with check (auth.uid() = user_id);

create policy "Guides and Leads can update approval requests"
  on public.approval_requests for update
  using (public.current_user_role() in ('folk_guide', 'folk_lead'));

-- READING PROGRESS POLICIES
create policy "Reading progress select policy"
  on public.reading_progress for select
  using (
    auth.uid() = user_id
    or public.current_user_role() in ('folk_guide', 'folk_lead')
  );

create policy "Users can update own reading progress"
  on public.reading_progress for update
  using (auth.uid() = user_id);

create policy "Users can insert own reading progress"
  on public.reading_progress for insert
  with check (auth.uid() = user_id);

-- Sequence for auto-generating human-readable FOLK-IDs: FOLK-2026-XXXX
create sequence if not exists public.folk_id_seq start 1001;

-- Automatic Provisioning Trigger on User Sign-Up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  assigned_folk_id text;
  raw_role text;
  user_full_name text;
begin
  assigned_folk_id := 'FOLK-2026-' || nextval('public.folk_id_seq');
  user_full_name := coalesce(new.raw_user_meta_data->>'full_name', 'Devotee');
  raw_role := coalesce(new.raw_user_meta_data->>'role', 'folk_boy');

  insert into public.profiles (
    id,
    folk_id,
    full_name,
    email,
    phone,
    role
  ) values (
    new.id,
    assigned_folk_id,
    user_full_name,
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', ''),
    raw_role::user_role
  ) on conflict (id) do nothing;

  insert into public.streaks (user_id) values (new.id) on conflict (user_id) do nothing;
  insert into public.reading_progress (user_id) values (new.id) on conflict (user_id) do nothing;
  insert into public.notification_preferences (user_id) values (new.id) on conflict (user_id) do nothing;

  -- Auto-confirm email so devotees can log in immediately without email confirmation obstacles
  update auth.users
  set email_confirmed_at = coalesce(email_confirmed_at, now())
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable Realtime publication for tables requiring instant sync
alter publication supabase_realtime add table public.sadhana_records;
alter publication supabase_realtime add table public.approval_requests;
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.streaks;

-- INITIAL SEED DATA FOR POINT & CC RULES
insert into public.point_rules (version, name, rules, is_active)
values (
  1,
  'Standard Sādhana Matrix v1',
  '{
    "mangala_arati": {"target_time": "05:00:00", "full_points": 10, "late_points": 5},
    "japa": {"16_rounds_before_7_30": 20, "16_rounds_before_9_00": 15, "16_rounds_anytime": 10},
    "darshan_arati": {"attended": 5},
    "srimad_bhagavatam": {"attended": 10},
    "book_reading": {"per_15_mins": 5, "max_points": 15}
  }'::jsonb,
  true
) on conflict do nothing;

insert into public.cc_rules (version, same_day_cc, next_day_cc, day_after_cc, older_day_cc, milestone_rules, is_active)
values (
  1,
  10,
  5,
  2,
  0,
  '{"3": 10, "7": 25, "14": 50, "30": 100, "60": 200, "90": 350}'::jsonb,
  true
) on conflict do nothing;

-- 10. PASSWORD RESET FUNCTIONS (Devotee Self-Service & Guide Admin)
create or replace function public.reset_devotee_password_with_guide(
  p_phone text,
  p_guide_id uuid,
  p_guide_passcode text,
  p_new_password text
)
returns jsonb
language plpgsql
security definer set search_path = public, auth, extensions
as $$
declare
  v_user_id uuid;
  v_expected_passcode text := 'FOLK@GUIDE108';
  v_clean_phone text;
begin
  if p_guide_passcode <> v_expected_passcode then
    return jsonb_build_object('success', false, 'message', 'Invalid Guide Passcode. Please contact your FOLK Guide for authorization.');
  end if;

  v_clean_phone := regexp_replace(p_phone, '\D', '', 'g');

  select id into v_user_id
  from public.profiles
  where (
    phone = p_phone 
    or phone = v_clean_phone 
    or email = p_phone 
    or email = (v_clean_phone || '@folk.org')
  )
  limit 1;

  if v_user_id is null then
    return jsonb_build_object('success', false, 'message', 'No registered devotee found with this mobile number or email.');
  end if;

  update auth.users
  set encrypted_password = crypt(p_new_password, gen_salt('bf')),
      updated_at = now()
  where id = v_user_id;

  return jsonb_build_object('success', true, 'message', 'Password updated successfully! You can now log in.');
end;
$$;

grant execute on function public.reset_devotee_password_with_guide to anon, authenticated;

create or replace function public.guide_reset_student_password(
  p_devotee_id uuid,
  p_new_password text
)
returns jsonb
language plpgsql
security definer set search_path = public, auth, extensions
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'folk_guide') then
    return jsonb_build_object('success', false, 'message', 'Only registered FOLK Guides can reset student passwords.');
  end if;

  update auth.users
  set encrypted_password = crypt(p_new_password, gen_salt('bf')),
      updated_at = now()
  where id = p_devotee_id;

  return jsonb_build_object('success', true, 'message', 'Devotee password reset successfully.');
end;
$$;

grant execute on function public.guide_reset_student_password to authenticated;

-- Simple Self-Service Password Reset (Mobile or Email)
create or replace function public.simple_reset_password(
  p_identifier text,
  p_new_password text
)
returns jsonb
language plpgsql
security definer set search_path = public, auth, extensions
as $$
declare
  v_user_id uuid;
  v_clean_phone text;
begin
  v_clean_phone := regexp_replace(p_identifier, '\D', '', 'g');

  select id into v_user_id
  from public.profiles
  where (
    phone = p_identifier
    or (length(v_clean_phone) = 10 and phone = v_clean_phone)
    or lower(email) = lower(p_identifier)
    or email = (v_clean_phone || '@folk.org')
  )
  limit 1;

  if v_user_id is null then
    return jsonb_build_object('success', false, 'message', 'No account found with this Mobile Number or Email.');
  end if;

  update auth.users
  set encrypted_password = crypt(p_new_password, gen_salt('bf')),
      updated_at = now()
  where id = v_user_id;

  return jsonb_build_object('success', true, 'message', 'Password updated successfully! You can now log in.');
end;
$$;

grant execute on function public.simple_reset_password to anon, authenticated;

-- Resolve login email by mobile number
create or replace function public.resolve_login_email(p_phone text)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  v_email text;
  v_clean text;
begin
  v_clean := regexp_replace(p_phone, '\D', '', 'g');

  select email into v_email
  from public.profiles
  where phone = p_phone or phone = v_clean
  limit 1;

  return v_email;
end;
$$;

grant execute on function public.resolve_login_email to anon, authenticated;

-- Auto-confirm email helper for unconfirmed accounts
create or replace function public.auto_confirm_user_email(p_identifier text)
returns boolean
language plpgsql
security definer set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_clean text;
begin
  v_clean := regexp_replace(p_identifier, '\D', '', 'g');

  select id into v_user_id
  from public.profiles
  where phone = p_identifier or phone = v_clean or lower(email) = lower(p_identifier)
  limit 1;

  if v_user_id is not null then
    update auth.users
    set email_confirmed_at = coalesce(email_confirmed_at, now())
    where id = v_user_id;
    return true;
  end if;
  return false;
end;
$$;

grant execute on function public.auto_confirm_user_email to anon, authenticated;

-- Check if account exists by phone or email
create or replace function public.check_account_exists(p_identifier text)
returns boolean
language plpgsql
security definer set search_path = public, auth
as $$
declare
  v_clean text;
begin
  v_clean := regexp_replace(p_identifier, '\D', '', 'g');

  -- Check profiles
  if exists (
    select 1 from public.profiles
    where phone = p_identifier
       or (length(v_clean) = 10 and phone = v_clean)
       or lower(email) = lower(p_identifier)
       or email = (v_clean || '@folk.org')
  ) then
    return true;
  end if;

  -- Check auth.users
  if exists (
    select 1 from auth.users
    where lower(email) = lower(p_identifier)
       or email = (v_clean || '@folk.org')
  ) then
    return true;
  end if;

  return false;
end;
$$;

grant execute on function public.check_account_exists to anon, authenticated;
