-- Sync Supabase schema with the public UI and admin product form.
-- Safe to re-run: all column additions use IF NOT EXISTS.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null,
  price numeric not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.products
  add column if not exists brand text,
  add column if not exists sub_category text,
  add column if not exists old_price numeric,
  add column if not exists image text,
  add column if not exists gallery jsonb default '[]'::jsonb,
  add column if not exists rating numeric default 4.7,
  add column if not exists warranty text,
  add column if not exists stock text default 'in_stock',
  add column if not exists stock_quantity integer default 1,
  add column if not exists description text,
  add column if not exists short_description text,
  add column if not exists specs jsonb default '[]'::jsonb,
  add column if not exists badge text,
  add column if not exists featured boolean default false,
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
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.products
set image = gallery->>0
where (image is null or image = '')
  and jsonb_typeof(gallery) = 'array'
  and jsonb_array_length(gallery) > 0;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
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

create table if not exists public.stock_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  admin_email text,
  old_stock text,
  new_stock text,
  old_quantity integer,
  new_quantity integer,
  note text,
  created_at timestamptz default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by text,
  updated_at timestamptz default now()
);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.admin_logs enable row level security;
alter table public.stock_logs enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "products are viewable by everyone" on public.products;
drop policy if exists "categories are viewable by everyone" on public.categories;
drop policy if exists "only super admin can insert products" on public.products;
drop policy if exists "only super admin can update products" on public.products;
drop policy if exists "only super admin can delete products" on public.products;
drop policy if exists "only super admin can insert categories" on public.categories;
drop policy if exists "only super admin can update categories" on public.categories;
drop policy if exists "only super admin can delete categories" on public.categories;

create policy "products are viewable by everyone" on public.products for select using (true);
create policy "categories are viewable by everyone" on public.categories for select using (true);
create policy "only super admin can insert products" on public.products for insert with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));
create policy "only super admin can update products" on public.products for update using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com')) with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));
create policy "only super admin can delete products" on public.products for delete using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));
create policy "only super admin can insert categories" on public.categories for insert with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));
create policy "only super admin can update categories" on public.categories for update using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com')) with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));
create policy "only super admin can delete categories" on public.categories for delete using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

drop policy if exists "only super admin can select admin_logs" on public.admin_logs;
drop policy if exists "only super admin can insert admin_logs" on public.admin_logs;
drop policy if exists "only super admin can select stock_logs" on public.stock_logs;
drop policy if exists "only super admin can insert stock_logs" on public.stock_logs;
drop policy if exists "only super admin can select settings" on public.site_settings;
drop policy if exists "only super admin can write settings" on public.site_settings;

create policy "only super admin can select admin_logs" on public.admin_logs for select using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));
create policy "only super admin can insert admin_logs" on public.admin_logs for insert with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));
create policy "only super admin can select stock_logs" on public.stock_logs for select using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));
create policy "only super admin can insert stock_logs" on public.stock_logs for insert with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));
create policy "only super admin can select settings" on public.site_settings for select using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));
create policy "only super admin can write settings" on public.site_settings for all using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com')) with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

drop policy if exists "product-images are viewable by everyone" on storage.objects;
drop policy if exists "only super admin can insert into product-images" on storage.objects;
drop policy if exists "only super admin can update product-images" on storage.objects;
drop policy if exists "only super admin can delete from product-images" on storage.objects;

create policy "product-images are viewable by everyone" on storage.objects for select using (bucket_id = 'product-images');
create policy "only super admin can insert into product-images" on storage.objects for insert with check (bucket_id = 'product-images' and lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));
create policy "only super admin can update product-images" on storage.objects for update using (bucket_id = 'product-images' and lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com')) with check (bucket_id = 'product-images' and lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));
create policy "only super admin can delete from product-images" on storage.objects for delete using (bucket_id = 'product-images' and lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));
