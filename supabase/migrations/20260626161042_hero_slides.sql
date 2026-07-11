-- Mirrors the migration applied to the live database on 2026-06-26
-- (supabase_migrations.schema_migrations version 20260626161042).

CREATE TABLE IF NOT EXISTS hero_slides (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  meta            text,
  href            text NOT NULL,
  cta             text NOT NULL UNIQUE,
  links           jsonb DEFAULT '[]',
  image_url       text NOT NULL,
  storage_path    text,
  alt_text        text NOT NULL DEFAULT '',
  focal_point_mobile_x  numeric(4,3) DEFAULT 0.5,
  focal_point_mobile_y  numeric(4,3) DEFAULT 0.5,
  focal_point_desktop_x numeric(4,3) DEFAULT 0.5,
  focal_point_desktop_y numeric(4,3) DEFAULT 0.5,
  sort_order      integer DEFAULT 0,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hero_slide_variants (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_cta       text NOT NULL REFERENCES hero_slides(cta) ON DELETE CASCADE,
  image_url       text NOT NULL,
  storage_path    text,
  alt_text        text NOT NULL DEFAULT '',
  focal_point_mobile_x  numeric(4,3) DEFAULT 0.5,
  focal_point_mobile_y  numeric(4,3) DEFAULT 0.5,
  focal_point_desktop_x numeric(4,3) DEFAULT 0.5,
  focal_point_desktop_y numeric(4,3) DEFAULT 0.5,
  sort_order      integer DEFAULT 0
);

CREATE INDEX IF NOT EXISTS hero_slides_sort ON hero_slides (sort_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS hero_slide_variants_cta ON hero_slide_variants (slide_cta);

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slide_variants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='hero_slides' AND policyname='public_read') THEN
    CREATE POLICY "public_read" ON hero_slides FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='hero_slides' AND policyname='service_write') THEN
    CREATE POLICY "service_write" ON hero_slides FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='hero_slide_variants' AND policyname='public_read') THEN
    CREATE POLICY "public_read" ON hero_slide_variants FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='hero_slide_variants' AND policyname='service_write') THEN
    CREATE POLICY "service_write" ON hero_slide_variants FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
