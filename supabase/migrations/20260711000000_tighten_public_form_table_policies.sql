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
-- APPLIED to the live database on 2026-09-12. It sat unapplied for two
-- months while this note said so, which is the only reason the exposure
-- survived: the fix was written, reviewed and committed, and then the one
-- step that mattered never happened.
--
-- Confirmed before applying, using the public anon key that ships in the
-- client bundle: a SELECT against contact_submissions returned a seeded row
-- in full, name, email, subject and message. Confirmed after: the same
-- request returns [], anon INSERT returns 401, and portfolio_images still
-- returns 200 so the galleries are unaffected. Both form tables held zero
-- rows throughout, so nothing real was ever readable.

drop policy if exists "Public can view own contact submission" on public.contact_submissions;
drop policy if exists "Public can submit contact forms" on public.contact_submissions;
drop policy if exists "Public can view own quote request" on public.quote_requests;
drop policy if exists "Public can submit quote requests" on public.quote_requests;

notify pgrst, 'reload schema';
