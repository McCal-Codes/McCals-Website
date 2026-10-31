-- Move btree_gist out of the public schema.
--
-- 20260906130000 installed it with the bare `create extension`, which defaults
-- to `public`. Supabase's database linter flags that (`extension_in_public`):
-- extension objects sharing a schema with application tables widen the surface
-- that a mutable search_path can shadow.
--
-- The exclusion constraint that depends on this extension references its
-- operator class by OID, so relocating the extension does not invalidate it.
-- Verified after applying: availability_rules_no_overlap is still present and
-- still rejects overlapping windows.

create schema if not exists extensions;
alter extension btree_gist set schema extensions;
