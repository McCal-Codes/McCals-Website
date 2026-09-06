-- Integrity hardening for the availability tables.
--
-- The initial migration (20260906120000) enforced only that two windows on the
-- same weekday could not *start* at the same minute. That still allowed
-- 09:00-12:00 and 10:00-11:00 to coexist, which is not a schedule anyone means
-- to write, and which would silently double-offer the overlapping slots.
--
-- Applied as a separate migration rather than by editing the previous one:
-- 20260906120000 has already run against the database, and rewriting an
-- applied migration leaves environments disagreeing about what was executed.

-- Required for an exclusion constraint that mixes equality (booking_type,
-- weekday) with range overlap.
create extension if not exists btree_gist;

-- booking_type is a free-text column referenced by api/_lib/booking-config.js.
-- A check constraint keeps typos out without introducing a lookup table for
-- two values; extend the list here when a new booking type ships.
alter table public.availability_rules
  drop constraint if exists availability_rules_booking_type_check;
alter table public.availability_rules
  add constraint availability_rules_booking_type_check
  check (booking_type in ('grab-coffee', 'book-podcast'));

alter table public.availability_blackouts
  drop constraint if exists availability_blackouts_booking_type_check;
alter table public.availability_blackouts
  add constraint availability_blackouts_booking_type_check
  check (booking_type is null or booking_type in ('grab-coffee', 'book-podcast'));

-- No two active windows for the same booking type and weekday may overlap.
-- int4range is half-open, so a window ending at 10:00 and another starting at
-- 10:00 are adjacent rather than overlapping — which is exactly how a shift
-- butts up against the free time either side of it.
alter table public.availability_rules
  drop constraint if exists availability_rules_no_overlap;
alter table public.availability_rules
  add constraint availability_rules_no_overlap
  exclude using gist (
    booking_type with =,
    weekday with =,
    int4range(start_minute::int, end_minute::int) with &&
  ) where (is_active);

-- The unique-start constraint is now implied by the overlap constraint.
alter table public.availability_rules
  drop constraint if exists availability_rules_unique;

-- updated_at was declared but nothing maintained it, so it recorded insert
-- time forever. Reuse the trigger function the rest of the schema already uses.
drop trigger if exists availability_rules_set_updated_at on public.availability_rules;
create trigger availability_rules_set_updated_at
  before update on public.availability_rules
  for each row
  execute function public.update_updated_at_column();

-- Resolves the `function_search_path_mutable` security advisory: without a
-- pinned search_path, a caller can prepend a schema and shadow the objects a
-- SECURITY DEFINER function resolves. The body touches only NOW() and NEW, so
-- an empty search_path is safe.
alter function public.update_updated_at_column() set search_path = '';

comment on column public.availability_rules.min_notice_hours is
  'Hours of lead time required. 24 for free time; 336 (14 days) for hours that need a day-job shift swapped.';
comment on column public.availability_rules.label is
  'Human note shown in the admin editor, e.g. "Best Buy shift".';
comment on column public.availability_rules.weekday is
  '0 = Sunday through 6 = Saturday, matching JavaScript Date.getDay().';

notify pgrst, 'reload schema';
