create table portfolio_images (
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

create index on portfolio_images (portfolio_type);
create index on portfolio_images (portfolio_type, collection_name);
create index on portfolio_images (is_featured) where is_featured = true;

alter table portfolio_images enable row level security;

create policy "public_read" on portfolio_images
  for select using (true);

create policy "service_write" on portfolio_images
  for all using (auth.role() = 'service_role');
