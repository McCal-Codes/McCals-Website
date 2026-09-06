-- Self-service reschedule and cancel links.
--
-- Confirmation emails carry a link that lets the requester change or cancel
-- their own booking without emailing back and forth. The link needs to
-- authenticate someone who has no account, so it carries a high-entropy token.
--
-- Only the SHA-256 hash of that token is stored, exactly as a password-reset
-- token would be: the raw value exists in the recipient's inbox and nowhere
-- else, so a leaked database snapshot cannot be used to cancel or move anyone's
-- booking. Lookups hash the presented token and match on the hash.

alter table public.bookings
  add column if not exists manage_token_hash text,
  add column if not exists manage_token_expires_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists rescheduled_at timestamptz;

comment on column public.bookings.manage_token_hash is
  'SHA-256 of the self-service manage token. The raw token is never stored.';
comment on column public.bookings.manage_token_expires_at is
  'After this instant the manage link stops working, independent of booking status.';

-- Unique so a hash collision or a duplicated token cannot address two
-- bookings; partial because historical rows have no token.
create unique index if not exists bookings_manage_token_hash_key
  on public.bookings (manage_token_hash)
  where manage_token_hash is not null;

notify pgrst, 'reload schema';
