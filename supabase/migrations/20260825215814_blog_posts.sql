-- Blog posts, authored through the admin app instead of hand-edited markdown
-- files. Mirrors portfolio_images' shape/RLS pattern: public read, writes
-- restricted to the service role (the admin app's API routes).
-- body/sources reuse the exact block-array shape scripts/blog/post-source-utils.js
-- already produces from markdown, so the public site's renderer needs no changes.

create table if not exists blog_posts (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique,
  title                 text not null,
  author_id             text not null default 'mccal',
  date                  date not null default current_date,
  category              text,
  excerpt               text,
  lead_image            text,
  lead_image_alt        text,
  lead_image_caption    text,
  published             boolean default true,
  tags                  text[] default '{}',
  sources               jsonb default '[]',
  body                  jsonb not null default '[]',
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists blog_posts_published_date_idx on blog_posts (published, date desc);

alter table blog_posts enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'blog_posts' and policyname = 'public_read') then
    create policy "public_read" on blog_posts for select using (published = true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'blog_posts' and policyname = 'service_write') then
    create policy "service_write" on blog_posts for all using (auth.role() = 'service_role');
  end if;
end $$;

notify pgrst, 'reload schema';
