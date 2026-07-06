-- Fix admin/category/settings/log schema and RLS without recursive admin_users policies.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  role text not null default 'viewer',
  active boolean default true,
  permissions jsonb default '{}'::jsonb,
  created_by text,
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.admin_users
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists role text not null default 'viewer',
  add column if not exists active boolean default true,
  add column if not exists permissions jsonb default '{}'::jsonb,
  add column if not exists created_by text,
  add column if not exists last_login_at timestamptz,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create unique index if not exists admin_users_email_key on public.admin_users (email);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  image text,
  parent_slug text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.categories
  add column if not exists description text,
  add column if not exists image text,
  add column if not exists parent_slug text,
  add column if not exists sort_order integer default 0,
  add column if not exists is_active boolean default true,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_email text,
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb default '{}'::jsonb,
  updated_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.site_settings
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists key text,
  add column if not exists value jsonb default '{}'::jsonb,
  add column if not exists updated_by text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create unique index if not exists site_settings_key_key on public.site_settings (key);

alter table public.products
  add column if not exists short_description text,
  add column if not exists condition text,
  add column if not exists processor text,
  add column if not exists ram text,
  add column if not exists storage text,
  add column if not exists screen_size text,
  add column if not exists graphics text,
  add column if not exists color text,
  add column if not exists model text,
  add column if not exists year integer,
  add column if not exists delivery_available boolean default true,
  add column if not exists free_delivery boolean default true,
  add column if not exists software_included text,
  add column if not exists views integer default 0,
  add column if not exists is_active boolean default true,
  add column if not exists sort_order integer default 0,
  add column if not exists updated_at timestamptz default now();

insert into public.site_settings (key, value)
values
  ('store_name', '"MaiElectro"'::jsonb),
  ('phone', '"0725952161"'::jsonb),
  ('whatsapp', '"212725952161"'::jsonb),
  ('address', '"Casablanca, Maroc"'::jsonb),
  ('hours', '"Lun-Sam 10:00-20:00"'::jsonb),
  ('promo_bar_text', '"Livraison rapide et garantie boutique sur une sélection de produits."'::jsonb),
  ('delivery_message', '"Livraison disponible à Casablanca et partout au Maroc."'::jsonb),
  ('warranty_message', '"Garantie boutique selon produit."'::jsonb),
  ('social_links', '{"facebook":"","instagram":"","youtube":""}'::jsonb)
on conflict (key) do nothing;

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.admin_logs enable row level security;
alter table public.site_settings enable row level security;
alter table public.products enable row level security;

drop policy if exists "super admin manages admin_users" on public.admin_users;
drop policy if exists "admins can read own admin_user row" on public.admin_users;
drop policy if exists "categories active are public" on public.categories;
drop policy if exists "super admin selects all categories" on public.categories;
drop policy if exists "super admin inserts categories" on public.categories;
drop policy if exists "super admin updates categories" on public.categories;
drop policy if exists "super admin deletes categories" on public.categories;
drop policy if exists "super admin selects all admin logs" on public.admin_logs;
drop policy if exists "authenticated admins insert admin logs" on public.admin_logs;
drop policy if exists "settings are public" on public.site_settings;
drop policy if exists "super admin writes settings" on public.site_settings;
drop policy if exists "products active are public" on public.products;
drop policy if exists "super admin selects all products" on public.products;
drop policy if exists "super admin inserts products" on public.products;
drop policy if exists "super admin updates products" on public.products;
drop policy if exists "super admin deletes products" on public.products;

create policy "super admin manages admin_users" on public.admin_users
  for all
  using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'))
  with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "admins can read own admin_user row" on public.admin_users
  for select
  using (lower(email) = lower(auth.jwt() ->> 'email'));

create policy "categories active are public" on public.categories
  for select
  using (is_active is true);

create policy "super admin selects all categories" on public.categories
  for select
  using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "super admin inserts categories" on public.categories
  for insert
  with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "super admin updates categories" on public.categories
  for update
  using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'))
  with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "super admin deletes categories" on public.categories
  for delete
  using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "super admin selects all admin logs" on public.admin_logs
  for select
  using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "authenticated admins insert admin logs" on public.admin_logs
  for insert
  with check (auth.role() = 'authenticated');

create policy "settings are public" on public.site_settings
  for select
  using (true);

create policy "super admin writes settings" on public.site_settings
  for all
  using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'))
  with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "products active are public" on public.products
  for select
  using (coalesce(is_active, true) is true);

create policy "super admin selects all products" on public.products
  for select
  using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "super admin inserts products" on public.products
  for insert
  with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "super admin updates products" on public.products
  for update
  using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'))
  with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "super admin deletes products" on public.products
  for delete
  using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));
