-- Editable booking availability.
--
-- Working hours used to be hardcoded in api/schedule/availability.js (9-17 for
-- coffee, 9-20 for podcast, Sundays skipped), so changing when you could be
-- booked required a code change and a deploy. These tables move that to data.
--
-- Times are minutes from midnight in the OWNER's timezone (America/New_York),
-- matching api/_lib/timezone.js. Minutes rather than whole hours so boundaries
-- like 18:30 are expressible.
--
-- Two ideas make this fit a real schedule:
--
--   * Multiple windows per weekday. A day with a day-job shift in the middle
--     has a morning window and an evening window, not one continuous block.
--
--   * Per-window `min_notice_hours`. Genuinely free time is bookable at short
--     notice; hours that collide with a shift are still offered, but only far
--     enough ahead to request the time off (14 days). Without this, every
--     shift hour would have to be closed outright.
--
-- Access follows the convention set by 20260711000000: everything goes through
-- the service role (API routes) or an authenticated admin. RLS is enabled with
-- no anon policies, so the public anon key in the client bundle cannot read or
-- write these tables.

create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  -- Matches a key of BOOKING_CONFIGS in api/_lib/booking-config.js.
  booking_type text not null,
  -- 0 = Sunday, 6 = Saturday, matching JavaScript's Date.getDay().
  weekday smallint not null check (weekday between 0 and 6),
  start_minute smallint not null check (start_minute >= 0 and start_minute < 1440),
  end_minute smallint not null check (end_minute > 0 and end_minute <= 1440),
  -- How far ahead a slot in this window must be booked. 24h for free time,
  -- 336h (14 days) for hours that need a shift swapped.
  min_notice_hours integer not null default 24 check (min_notice_hours >= 0),
  -- Free-text note surfaced in the admin editor, e.g. 'Best Buy shift'.
  label text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint availability_rules_range check (end_minute > start_minute),
  -- Windows on the same day must start at distinct times; overlap beyond that
  -- is harmless because slot generation de-duplicates by start time.
  constraint availability_rules_unique unique (booking_type, weekday, start_minute)
);

comment on table public.availability_rules is
  'Recurring weekly booking windows, in owner-timezone minutes from midnight.';

-- Dates unavailable regardless of the weekly rules: holidays, travel, shoots.
-- Inclusive on both ends.
create table if not exists public.availability_blackouts (
  id uuid primary key default gen_random_uuid(),
  starts_on date not null,
  ends_on date not null,
  -- NULL blocks every booking type.
  booking_type text,
  reason text,
  created_at timestamptz not null default now(),
  constraint availability_blackouts_range check (ends_on >= starts_on)
);

comment on table public.availability_blackouts is
  'Date ranges when bookings are unavailable, overriding availability_rules.';

create index if not exists availability_rules_type_idx
  on public.availability_rules (booking_type, weekday)
  where is_active;

create index if not exists availability_blackouts_range_idx
  on public.availability_blackouts (starts_on, ends_on);

alter table public.availability_rules enable row level security;
alter table public.availability_blackouts enable row level security;

-- Authenticated admins manage availability through the admin app; the booking
-- API reads it with the service role, which bypasses RLS.
drop policy if exists "Authenticated users manage availability rules" on public.availability_rules;
create policy "Authenticated users manage availability rules"
  on public.availability_rules
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users manage availability blackouts" on public.availability_blackouts;
create policy "Authenticated users manage availability blackouts"
  on public.availability_blackouts
  for all
  to authenticated
  using (true)
  with check (true);

-- Seed the real schedule.
--
-- Day job: Mon/Wed 10:00-18:00, Tue 12:00-20:00, Sat/Sun 12:00-20:00; Thu and
-- Fri off. Free windows sit around those shifts at 24h notice; the shift hours
-- themselves are offered at 336h (14 day) notice so a shift can be swapped.
insert into public.availability_rules
  (booking_type, weekday, start_minute, end_minute, min_notice_hours, label)
select bookingType, weekday, startMinute, endMinute, notice, label
from (
  values
    -- Free time around the day job (24h notice).
    ('grab-coffee', 0,  540,  720,  24, 'Free morning'),
    ('grab-coffee', 1,  540,  600,  24, 'Before shift'),
    ('grab-coffee', 1, 1110, 1260,  24, 'After shift'),
    ('grab-coffee', 2,  540,  720,  24, 'Before shift'),
    ('grab-coffee', 3,  540,  600,  24, 'Before shift'),
    ('grab-coffee', 3, 1110, 1260,  24, 'After shift'),
    ('grab-coffee', 4,  540, 1200,  24, 'Day off'),
    ('grab-coffee', 5,  540, 1200,  24, 'Day off'),
    ('grab-coffee', 6,  540,  720,  24, 'Free morning'),
    -- Day-job hours, bookable two weeks out so the shift can be moved.
    ('grab-coffee', 0,  720, 1200, 336, 'Best Buy shift'),
    ('grab-coffee', 1,  600, 1080, 336, 'Best Buy shift'),
    ('grab-coffee', 2,  720, 1200, 336, 'Best Buy shift'),
    ('grab-coffee', 3,  600, 1080, 336, 'Best Buy shift'),
    ('grab-coffee', 6,  720, 1200, 336, 'Best Buy shift'),

    ('book-podcast', 0,  540,  720,  24, 'Free morning'),
    ('book-podcast', 1,  540,  600,  24, 'Before shift'),
    ('book-podcast', 1, 1110, 1260,  24, 'After shift'),
    ('book-podcast', 2,  540,  720,  24, 'Before shift'),
    ('book-podcast', 3,  540,  600,  24, 'Before shift'),
    ('book-podcast', 3, 1110, 1260,  24, 'After shift'),
    ('book-podcast', 4,  540, 1200,  24, 'Day off'),
    ('book-podcast', 5,  540, 1200,  24, 'Day off'),
    ('book-podcast', 6,  540,  720,  24, 'Free morning'),
    ('book-podcast', 0,  720, 1200, 336, 'Best Buy shift'),
    ('book-podcast', 1,  600, 1080, 336, 'Best Buy shift'),
    ('book-podcast', 2,  720, 1200, 336, 'Best Buy shift'),
    ('book-podcast', 3,  600, 1080, 336, 'Best Buy shift'),
    ('book-podcast', 6,  720, 1200, 336, 'Best Buy shift')
) as seed(bookingType, weekday, startMinute, endMinute, notice, label)
on conflict (booking_type, weekday, start_minute) do nothing;

notify pgrst, 'reload schema';
