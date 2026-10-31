-- Drop the service_write policies on the three public-read tables.
--
-- Each table carried a pair:
--
--   public_read    FOR SELECT  USING (true)
--   service_write  FOR ALL     USING (auth.role() = 'service_role')
--
-- service_write has no TO clause, so it defaults to TO public and is evaluated
-- on every anonymous SELECT alongside public_read. auth.role() is STABLE rather
-- than IMMUTABLE, so Postgres does not fold it: it is called once per row.
-- Supabase's own linter reports both problems, auth_rls_initplan and
-- multiple_permissive_policies, against all three tables.
--
-- The policy also grants nothing. service_role carries rolbypassrls, verified
-- against this database:
--
--   rolname       | rolbypassrls
--   service_role  | t
--
-- so it already reaches these tables regardless of any policy. Dropping the
-- policy therefore changes no one's access:
--
--   * service_role  bypasses RLS, unchanged.
--   * anon          keeps public_read for SELECT. For INSERT/UPDATE/DELETE it
--                   had no grant before either, because auth.role() was 'anon',
--                   so the USING clause was false. With no policy at all, still
--                   denied.
--   * authenticated same reasoning; auth.role() was never 'service_role'.
--
-- Timing: portfolio_images holds 422 rows today, all journalism. Issue #280
-- would migrate the events portfolio, over 1,600 images, at which point every
-- gallery read pays this per row across four paged requests.

drop policy if exists "service_write" on portfolio_images;
drop policy if exists "service_write" on hero_slides;
drop policy if exists "service_write" on hero_slide_variants;
