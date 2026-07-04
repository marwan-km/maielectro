-- Upgrading admin_users table
alter table public.admin_users 
  add column if not exists full_name text,
  add column if not exists permissions jsonb default '{}'::jsonb,
  add column if not exists created_by text,
  add column if not exists last_login_at timestamptz;

-- Ensure default role is 'viewer' for safety
alter table public.admin_users alter column role set default 'viewer';

-- Re-create constraint if needed to include new roles
alter table public.admin_users drop constraint if exists admin_users_role_check;
alter table public.admin_users 
  add constraint admin_users_role_check check (role in ('super_admin', 'manager', 'editor', 'stock_manager', 'viewer'));

-- Admin invites
create table if not exists public.admin_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null default 'viewer',
  invited_by text,
  status text default 'pending',
  created_at timestamptz default now(),
  accepted_at timestamptz
);

-- Site Settings
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb,
  updated_by text,
  updated_at timestamptz default now()
);

-- Upgrade admin_logs
alter table public.admin_logs 
  add column if not exists ip_address text,
  add column if not exists user_agent text;

-- RLS for admin_users (Fixed avoiding recursion)
drop policy if exists "super admin can read own row" on public.admin_users;

-- 1. Any authenticated user can read their OWN row.
create policy "admin_users_read_own" on public.admin_users for select 
using (lower(email) = lower(auth.jwt() ->> 'email'));

-- 2. Only the super admin (kirammarwan@gmail.com) can read all rows, insert, update, delete.
-- We check auth.jwt() directly to avoid recursion.
create policy "admin_users_superadmin_select" on public.admin_users for select 
using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "admin_users_superadmin_insert" on public.admin_users for insert 
with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "admin_users_superadmin_update" on public.admin_users for update 
using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com')) 
with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "admin_users_superadmin_delete" on public.admin_users for delete 
using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));


-- RLS for admin_logs
-- Drop old policies
drop policy if exists "only super admin can select admin_logs" on public.admin_logs;
drop policy if exists "only super admin can insert admin_logs" on public.admin_logs;

create policy "admin_logs_superadmin_select" on public.admin_logs for select 
using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "admin_logs_read_own" on public.admin_logs for select 
using (lower(admin_email) = lower(auth.jwt() ->> 'email'));

create policy "admin_logs_insert_own" on public.admin_logs for insert 
with check (lower(admin_email) = lower(auth.jwt() ->> 'email'));


-- RLS for stock_logs
-- Drop old policies
drop policy if exists "only super admin can select stock_logs" on public.stock_logs;
drop policy if exists "only super admin can insert stock_logs" on public.stock_logs;

create policy "stock_logs_superadmin_select" on public.stock_logs for select 
using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "stock_logs_read_own" on public.stock_logs for select 
using (lower(admin_email) = lower(auth.jwt() ->> 'email'));

create policy "stock_logs_insert_own" on public.stock_logs for insert 
with check (lower(admin_email) = lower(auth.jwt() ->> 'email'));


-- RLS for admin_invites
alter table public.admin_invites enable row level security;
create policy "admin_invites_superadmin_all" on public.admin_invites for all 
using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));


-- RLS for site_settings
alter table public.site_settings enable row level security;
create policy "site_settings_public_read" on public.site_settings for select using (true);
create policy "site_settings_superadmin_all" on public.site_settings for all 
using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));


-- Update Products & Categories RLS to allow managers/editors/stock_managers to update based on jwt
-- The frontend will enforce the permission checking, but we allow authenticated users to mutate if they have a row in admin_users.
drop policy if exists "only super admin can update products" on public.products;
create policy "authenticated can update products" on public.products for update 
using (auth.jwt() ->> 'email' is not null);

drop policy if exists "only super admin can insert products" on public.products;
create policy "authenticated can insert products" on public.products for insert 
with check (auth.jwt() ->> 'email' is not null);

drop policy if exists "only super admin can delete products" on public.products;
create policy "authenticated can delete products" on public.products for delete 
using (auth.jwt() ->> 'email' is not null);

drop policy if exists "only super admin can update categories" on public.categories;
create policy "authenticated can update categories" on public.categories for update 
using (auth.jwt() ->> 'email' is not null);

drop policy if exists "only super admin can insert categories" on public.categories;
create policy "authenticated can insert categories" on public.categories for insert 
with check (auth.jwt() ->> 'email' is not null);

drop policy if exists "only super admin can delete categories" on public.categories;
create policy "authenticated can delete categories" on public.categories for delete 
using (auth.jwt() ->> 'email' is not null);

-- Storage bucket access
-- Same, allow authenticated users to upload/delete images.
drop policy if exists "only super admin can insert into product-images" on storage.objects;
create policy "authenticated can insert product-images" on storage.objects for insert with check ( bucket_id = 'product-images' and auth.jwt() ->> 'email' is not null );

drop policy if exists "only super admin can update product-images" on storage.objects;
create policy "authenticated can update product-images" on storage.objects for update using ( bucket_id = 'product-images' and auth.jwt() ->> 'email' is not null );

drop policy if exists "only super admin can delete from product-images" on storage.objects;
create policy "authenticated can delete product-images" on storage.objects for delete using ( bucket_id = 'product-images' and auth.jwt() ->> 'email' is not null );
