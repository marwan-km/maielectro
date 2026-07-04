-- Create products table
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
  stock text default 'in_stock',
  stock_quantity integer default 1,
  description text,
  specs jsonb default '[]'::jsonb,
  badge text,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create admin_logs table
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_email text,
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Create stock_logs table
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

-- RLS policies for products
alter table public.products enable row level security;
create policy "products are viewable by everyone" on public.products for select using (true);
create policy "only super admin can insert products" on public.products for insert with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));
create policy "only super admin can update products" on public.products for update using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com')) with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));
create policy "only super admin can delete products" on public.products for delete using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

-- RLS policies for categories
alter table public.categories enable row level security;
create policy "categories are viewable by everyone" on public.categories for select using (true);
create policy "only super admin can insert categories" on public.categories for insert with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));
create policy "only super admin can update categories" on public.categories for update using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com')) with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));
create policy "only super admin can delete categories" on public.categories for delete using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

-- RLS policies for admin_logs
alter table public.admin_logs enable row level security;
create policy "only super admin can select admin_logs" on public.admin_logs for select using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));
create policy "only super admin can insert admin_logs" on public.admin_logs for insert with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

-- RLS policies for stock_logs
alter table public.stock_logs enable row level security;
create policy "only super admin can select stock_logs" on public.stock_logs for select using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));
create policy "only super admin can insert stock_logs" on public.stock_logs for insert with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

-- Supabase Storage Bucket setup for product-images (requires running via migration or dashboard manually)
insert into storage.buckets (id, name, public) 
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Storage policies
create policy "product-images are viewable by everyone" on storage.objects for select using ( bucket_id = 'product-images' );
create policy "only super admin can insert into product-images" on storage.objects for insert with check ( bucket_id = 'product-images' and lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com') );
create policy "only super admin can update product-images" on storage.objects for update using ( bucket_id = 'product-images' and lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com') );
create policy "only super admin can delete from product-images" on storage.objects for delete using ( bucket_id = 'product-images' and lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com') );
