-- Mirrors the migration applied to the live database on 2026-06-26
-- (supabase_migrations.schema_migrations version 20260626155006).
-- Supersedes the repo's previous 20260625000000_portfolio_images.sql,
-- whose version number was never recorded in the live database.

create table if not exists portfolio_images (
  id              uuid primary key default gen_random_uuid(),
  portfolio_type  text not null
                    check (portfolio_type in ('journalism','concert','portrait','events','nature')),
  collection_name text not null,
  storage_path    text not null unique,
  filename        text not null,
  alt_text        text,
  caption         text,
  width           integer,
  height          integer,
  focal_point_x   numeric(4,3),
  focal_point_y   numeric(4,3),
  tags            text[]  default '{}',
  is_featured     boolean default false,
  sort_order      integer default 0,
  migrated_from   text,
  created_at      timestamptz default now()
);

create index if not exists portfolio_images_portfolio_type_idx on portfolio_images (portfolio_type);
create index if not exists portfolio_images_portfolio_type_collection_idx on portfolio_images (portfolio_type, collection_name);
create index if not exists portfolio_images_is_featured_idx on portfolio_images (is_featured) where is_featured = true;

alter table portfolio_images enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'portfolio_images' and policyname = 'public_read') then
    create policy "public_read" on portfolio_images for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'portfolio_images' and policyname = 'service_write') then
    create policy "service_write" on portfolio_images for all using (auth.role() = 'service_role');
  end if;
end $$;

notify pgrst, 'reload schema';
