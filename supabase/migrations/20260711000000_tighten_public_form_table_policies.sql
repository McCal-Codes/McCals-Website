-- SECURITY FIX (audit F-07 follow-up, 2026-07-11): the original
-- 002_rls_policies granted anon SELECT USING (true) on both public form
-- tables ("view own ..." in name only), which would expose every submitted
-- name/email/message to anyone holding the public anon key that ships in
-- the client bundle. The anon INSERT policies also allowed bots to bypass
-- the API's honeypot and rate limiting by writing to the tables directly.
--
-- All legitimate access goes through the service role (API routes in
-- sites/mcc-cal-vite/api/) or authenticated admin users, so the anon
-- policies are dropped entirely. No client code references these tables.
--
-- NOTE: not yet applied to the live database as of this commit, apply via
-- the Supabase SQL editor or `supabase db push` (both form tables were
-- empty at the time this was written, so nothing had leaked).

drop policy if exists "Public can view own contact submission" on public.contact_submissions;
drop policy if exists "Public can submit contact forms" on public.contact_submissions;
drop policy if exists "Public can view own quote request" on public.quote_requests;
drop policy if exists "Public can submit quote requests" on public.quote_requests;

notify pgrst, 'reload schema';
