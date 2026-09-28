-- ========================================================================
-- Land Status Search Platform (Private Clone of "Know Land Status")
-- Database Schema for Supabase / PostgreSQL
-- ========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Enums
do $$ begin
  create type verification_status_enum as enum ('unverified', 'flagged', 'verified');
exception
  when duplicate_object then null;
end $$;

-- 2. Districts Table
create table if not exists public.districts (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  code text,
  created_at timestamptz default now()
);

-- 3. Mandals Table
create table if not exists public.mandals (
  id uuid primary key default uuid_generate_v4(),
  district_id uuid not null references public.districts(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  unique(district_id, name)
);

-- 4. Villages Table
create table if not exists public.villages (
  id uuid primary key default uuid_generate_v4(),
  mandal_id uuid not null references public.mandals(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  unique(mandal_id, name)
);

-- 5. Land Records Table
create table if not exists public.land_records (
  id uuid primary key default uuid_generate_v4(),
  village_id uuid not null references public.villages(id) on delete restrict,
  survey_number text not null,
  owner_name text not null,
  father_name text,
  extent_acres numeric(10, 2) not null check (extent_acres > 0),
  classification text not null default 'Agricultural',
  passbook_number text,
  khata_number text,
  verification_status verification_status_enum not null default 'unverified',
  submitted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_village_survey unique (village_id, survey_number)
);

-- 6. Flags Table (Disputes & Incorrect Data Reports)
create table if not exists public.flags (
  id uuid primary key default uuid_generate_v4(),
  land_record_id uuid not null references public.land_records(id) on delete cascade,
  flagged_by uuid references auth.users(id) on delete set null,
  reason text not null,
  created_at timestamptz default now()
);

-- 6b. Profiles Table (Linked to auth.users for display name and phone)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. Indexes for Fast Search
create index if not exists idx_profiles_phone on public.profiles(phone);
create index if not exists idx_land_records_village on public.land_records(village_id);
create index if not exists idx_land_records_survey on public.land_records(survey_number);
create index if not exists idx_land_records_owner on public.land_records using gin(to_tsvector('english', owner_name));
create index if not exists idx_land_records_passbook on public.land_records(passbook_number);
create index if not exists idx_land_records_classification on public.land_records(classification);
create index if not exists idx_mandals_district on public.mandals(district_id);
create index if not exists idx_villages_mandal on public.villages(mandal_id);
create index if not exists idx_flags_record on public.flags(land_record_id);

-- 8. Trigger to Automatically Update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_land_records_timestamp on public.land_records;
create trigger set_land_records_timestamp
before update on public.land_records
for each row execute function update_updated_at_column();

-- Trigger to set verification_status to 'flagged' when a flag is added
create or replace function update_record_flag_status()
returns trigger as $$
begin
  update public.land_records
  set verification_status = 'flagged'
  where id = new.land_record_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_record_flagged on public.flags;
create trigger set_record_flagged
after insert on public.flags
for each row execute function update_record_flag_status();

-- 9. Row Level Security (RLS) Policies
alter table public.districts enable row level security;
alter table public.mandals enable row level security;
alter table public.villages enable row level security;
alter table public.land_records enable row level security;
alter table public.flags enable row level security;
alter table public.profiles enable row level security;

-- Reference data is publicly readable
create policy "Allow public read access on districts"
  on public.districts for select using (true);

create policy "Allow public read access on mandals"
  on public.mandals for select using (true);

create policy "Allow public read access on villages"
  on public.villages for select using (true);

-- Land records are publicly searchable
create policy "Allow public read access on land_records"
  on public.land_records for select using (true);

-- Authenticated users can insert their own land records
create policy "Allow authenticated users to insert land_records"
  on public.land_records for insert
  with check (auth.uid() = submitted_by);

-- Authenticated users can update their own land records
create policy "Allow users to update their own land_records"
  on public.land_records for update
  using (auth.uid() = submitted_by);

-- Anyone authenticated can submit a flag
create policy "Allow authenticated users to flag records"
  on public.flags for insert
  with check (auth.uid() = flagged_by);

create policy "Allow public read access on flags"
  on public.flags for select using (true);

-- Profiles policies
create policy "Allow public read access on profiles"
  on public.profiles for select using (true);

create policy "Allow users to insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Allow users to update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger to automatically create profile on auth.users sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.phone
  )
  on conflict (id) do update
  set display_name = excluded.display_name,
      phone = excluded.phone;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.handle_new_user();


-- ========================================================================
-- SEED DATA (Telangana sample districts, mandals, villages, records)
-- ========================================================================

-- Insert Districts
insert into public.districts (id, name, code) values
  ('d1000000-0000-0000-0000-000000000001', 'Rangareddy', 'RR'),
  ('d1000000-0000-0000-0000-000000000002', 'Medchal-Malkajgiri', 'MM'),
  ('d1000000-0000-0000-0000-000000000003', 'Sangareddy', 'SR'),
  ('d1000000-0000-0000-0000-000000000004', 'Nalgonda', 'NG'),
  ('d1000000-0000-0000-0000-000000000005', 'Yadadri Bhuvanagiri', 'YB')
on conflict (name) do nothing;

-- Insert Mandals
insert into public.mandals (id, district_id, name) values
  -- Rangareddy
  ('m1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Shamshabad'),
  ('m1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'Rajendranagar'),
  ('m1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'Chevella'),
  -- Medchal-Malkajgiri
  ('m1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002', 'Ghatkesar'),
  ('m1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000002', 'Medchal'),
  -- Sangareddy
  ('m1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000003', 'Patancheru'),
  ('m1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000003', 'Ameenpur'),
  -- Nalgonda
  ('m1000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000004', 'Miryalaguda'),
  -- Yadadri Bhuvanagiri
  ('m1000000-0000-0000-0000-000000000009', 'd1000000-0000-0000-0000-000000000005', 'Bhongir')
on conflict (district_id, name) do nothing;

-- Insert Villages
insert into public.villages (id, mandal_id, name) values
  -- Shamshabad
  ('v1000000-0000-0000-0000-000000000001', 'm1000000-0000-0000-0000-000000000001', 'Mamidipally'),
  ('v1000000-0000-0000-0000-000000000002', 'm1000000-0000-0000-0000-000000000001', 'Mankhal'),
  ('v1000000-0000-0000-0000-000000000003', 'm1000000-0000-0000-0000-000000000001', 'Ootapally'),
  -- Rajendranagar
  ('v1000000-0000-0000-0000-000000000004', 'm1000000-0000-0000-0000-000000000002', 'Budvel'),
  ('v1000000-0000-0000-0000-000000000005', 'm1000000-0000-0000-0000-000000000002', 'Kismatpur'),
  -- Chevella
  ('v1000000-0000-0000-0000-000000000006', 'm1000000-0000-0000-0000-000000000003', 'Aloor'),
  ('v1000000-0000-0000-0000-000000000007', 'm1000000-0000-0000-0000-000000000003', 'Damargidda'),
  -- Ghatkesar
  ('v1000000-0000-0000-0000-000000000008', 'm1000000-0000-0000-0000-000000000004', 'Kondapur'),
  ('v1000000-0000-0000-0000-000000000009', 'm1000000-0000-0000-0000-000000000004', 'Pocharam'),
  -- Patancheru
  ('v1000000-0000-0000-0000-000000000010', 'm1000000-0000-0000-0000-000000000006', 'Muthangi'),
  ('v1000000-0000-0000-0000-000000000011', 'm1000000-0000-0000-0000-000000000006', 'Rudraram')
on conflict (mandal_id, name) do nothing;

-- Insert Initial Sample Land Records
insert into public.land_records (
  id,
  village_id,
  survey_number,
  owner_name,
  father_name,
  extent_acres,
  classification,
  passbook_number,
  khata_number,
  verification_status
) values
  (
    'r1000000-0000-0000-0000-000000000001',
    'v1000000-0000-0000-0000-000000000001',
    '142/A',
    'Kotha Venkataiah',
    'K. Ramulu',
    2.45,
    'Agricultural',
    'T0712004589',
    'KH-1042',
    'unverified'
  ),
  (
    'r1000000-0000-0000-0000-000000000002',
    'v1000000-0000-0000-0000-000000000001',
    '142/B',
    'Guduru Lakshmi Devi',
    'G. Narasimha Rao',
    1.80,
    'Agricultural',
    'T0712004590',
    'KH-1043',
    'unverified'
  ),
  (
    'r1000000-0000-0000-0000-000000000003',
    'v1000000-0000-0000-0000-000000000004',
    '208/2',
    'Bandi Srikanth Reddy',
    'B. Mohan Reddy',
    0.75,
    'Residential',
    'T0715009121',
    'KH-2309',
    'unverified'
  ),
  (
    'r1000000-0000-0000-0000-000000000004',
    'v1000000-0000-0000-0000-000000000008',
    '87/1',
    'Chintala Ramesh',
    'Ch. Narayana',
    4.20,
    'Commercial',
    'T0821003412',
    'KH-4412',
    'flagged'
  ),
  (
    'r1000000-0000-0000-0000-000000000005',
    'v1000000-0000-0000-0000-000000000010',
    '315/P',
    'Mohammed Abdul Razak',
    'Md. Ismail',
    3.10,
    'Agricultural',
    'T0932007623',
    'KH-5120',
    'unverified'
  )
on conflict (village_id, survey_number) do nothing;

-- Add a sample flag for record r1000000-0000-0000-0000-000000000004
insert into public.flags (
  id,
  land_record_id,
  reason,
  created_at
) values (
  'f1000000-0000-0000-0000-000000000001',
  'r1000000-0000-0000-0000-000000000004',
  'Survey number 87/1 classification is contested. Extent boundary overlaps with adjacent parcel 87/2.',
  now() - interval '2 days'
) on conflict do nothing;
