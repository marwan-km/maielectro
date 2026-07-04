create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand text,
  category text not null,
  sub_category text,
  price numeric not null default 0,
  old_price numeric,
  image text,
  gallery jsonb default '[]'::jsonb,
  rating numeric default 4.7,
  warranty text,
  stock text default 'in_stock' check (stock in ('in_stock', 'out_of_stock')),
  stock_quantity integer default 1,
  description text,
  specs jsonb default '[]'::jsonb,
  badge text,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null default 'super_admin',
  active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint admin_users_role_check check (role in ('super_admin'))
);

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

update public.admin_users
set role = 'super_admin',
    active = false,
    updated_at = now()
where lower(email) <> lower('kirammarwan@gmail.com');

insert into public.admin_users (email, role, active)
values ('kirammarwan@gmail.com', 'super_admin', true)
on conflict (email)
do update set role = 'super_admin', active = true, updated_at = now();

update public.admin_users
set active = false, updated_at = now()
where lower(email) <> lower('kirammarwan@gmail.com');

alter table public.admin_users alter column role set default 'super_admin';
alter table public.admin_users alter column role set not null;
alter table public.admin_users alter column active set default true;
alter table public.admin_users alter column active set not null;
alter table public.admin_users drop constraint if exists admin_users_role_check;
alter table public.admin_users
  add constraint admin_users_role_check check (role in ('super_admin'));

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
before update on public.products
for each row execute function public.touch_updated_at();

drop trigger if exists categories_touch_updated_at on public.categories;
create trigger categories_touch_updated_at
before update on public.categories
for each row execute function public.touch_updated_at();

drop trigger if exists admin_users_touch_updated_at on public.admin_users;
create trigger admin_users_touch_updated_at
before update on public.admin_users
for each row execute function public.touch_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and lower(email) = lower('kirammarwan@gmail.com')
      and active = true
      and role = 'super_admin'
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and lower(email) = lower('kirammarwan@gmail.com')
      and active = true
      and role = 'super_admin'
  );
$$;

alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.admin_users enable row level security;
alter table public.admin_logs enable row level security;
alter table public.stock_logs enable row level security;

drop policy if exists "Public can select products" on public.products;
create policy "Public can select products"
on public.products for select
to anon, authenticated
using (true);

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
on public.products for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
on public.products for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
on public.products for delete
to authenticated
using (public.is_admin());

drop policy if exists "Public can select categories" on public.categories;
create policy "Public can select categories"
on public.categories for select
to anon, authenticated
using (true);

drop policy if exists "Admins can insert categories" on public.categories;
create policy "Admins can insert categories"
on public.categories for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories"
on public.categories for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories"
on public.categories for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can select themselves" on public.admin_users;
drop policy if exists "Super admins can select all admins" on public.admin_users;
drop policy if exists "super admin can read own row" on public.admin_users;
create policy "super admin can read own row"
on public.admin_users for select
to authenticated
using (
  lower(email) = lower(auth.jwt() ->> 'email')
  and lower(email) = lower('kirammarwan@gmail.com')
  and role = 'super_admin'
  and active = true
);

drop policy if exists "Super admins can insert admins" on public.admin_users;
drop policy if exists "Super admins can update admins" on public.admin_users;
drop policy if exists "Super admins can delete admins" on public.admin_users;

drop policy if exists "Admins can insert logs" on public.admin_logs;
create policy "Admins can insert logs"
on public.admin_logs for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Super admins can select all logs" on public.admin_logs;
create policy "Super admins can select all logs"
on public.admin_logs for select
to authenticated
using (public.is_super_admin());

drop policy if exists "Admins can select own logs" on public.admin_logs;
create policy "Admins can select own logs"
on public.admin_logs for select
to authenticated
using (lower(admin_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "Admins can insert stock logs" on public.stock_logs;
create policy "Admins can insert stock logs"
on public.stock_logs for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Super admins can select all stock logs" on public.stock_logs;
create policy "Super admins can select all stock logs"
on public.stock_logs for select
to authenticated
using (public.is_super_admin());

drop policy if exists "Admins can select own stock logs" on public.stock_logs;
create policy "Admins can select own stock logs"
on public.stock_logs for select
to authenticated
using (lower(admin_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Storage bucket policy setup. Create bucket `product-images` in Supabase Storage first.
drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and public.is_admin());
