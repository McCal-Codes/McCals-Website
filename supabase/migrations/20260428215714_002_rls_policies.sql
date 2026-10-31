-- Mirrors the migration applied to the live database on 2026-04-28
-- (supabase_migrations.schema_migrations version 20260428215714).
-- NOTE: the two anon SELECT policies and two anon INSERT policies created
-- here were later found to be over-permissive (USING (true) exposes
-- submitted PII to anyone holding the public anon key) and are removed by
-- 20260711000000_tighten_public_form_table_policies.sql. They are kept
-- here verbatim so this file matches what actually ran.

-- Enable RLS on all tables
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public can insert contact submissions
CREATE POLICY "Public can submit contact forms"
  ON contact_submissions FOR INSERT TO anon WITH CHECK (true);

-- Public can read contact submissions (optional, for confirmation)
CREATE POLICY "Public can view own contact submission"
  ON contact_submissions FOR SELECT TO anon USING (true);

-- Public can insert quote requests
CREATE POLICY "Public can submit quote requests"
  ON quote_requests FOR INSERT TO anon WITH CHECK (true);

-- Public can view quote requests
CREATE POLICY "Public can view own quote request"
  ON quote_requests FOR SELECT TO anon USING (true);

-- Public can read available slots
CREATE POLICY "Public can view available slots"
  ON availability_slots FOR SELECT TO anon USING (is_available = TRUE);

-- Public can read published blog posts
CREATE POLICY "Public can view published posts"
  ON blog_posts FOR SELECT TO anon USING (published = TRUE);

-- Public can read approved testimonials
CREATE POLICY "Public can view approved testimonials"
  ON testimonials FOR SELECT TO anon USING (is_approved = TRUE);

-- Authenticated users have full access
CREATE POLICY "Authenticated users full access on contact_submissions"
  ON contact_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access on quote_requests"
  ON quote_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access on bookings"
  ON bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access on availability_slots"
  ON availability_slots FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access on blog_posts"
  ON blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access on testimonials"
  ON testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow authenticated users to insert testimonials
CREATE POLICY "Authenticated users can insert testimonials"
  ON testimonials FOR INSERT TO authenticated WITH CHECK (true);
