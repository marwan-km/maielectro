-- Full admin/public schema, RLS, seed, and PostgREST schema-cache reload.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  role text not null default 'viewer',
  active boolean not null default true,
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
  add column if not exists active boolean not null default true,
  add column if not exists permissions jsonb default '{}'::jsonb,
  add column if not exists created_by text,
  add column if not exists last_login_at timestamptz,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'admin_users_role_check') then
    alter table public.admin_users add constraint admin_users_role_check
      check (role in ('super_admin','manager','editor','stock_manager','viewer'));
  end if;
end $$;

create unique index if not exists admin_users_email_key on public.admin_users (email);

insert into public.admin_users (email, full_name, role, active, permissions)
values ('kirammarwan@gmail.com', 'Super Admin', 'super_admin', true, '{}'::jsonb)
on conflict (email) do update set role = 'super_admin', active = true, updated_at = now();

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

create table if not exists public.stock_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid,
  admin_email text,
  old_stock text,
  new_stock text,
  old_quantity integer,
  new_quantity integer,
  note text,
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

insert into public.site_settings (key, value)
values
  ('store_name', '"MaiElectro"'::jsonb),
  ('phone', '"0725952161"'::jsonb),
  ('whatsapp', '"212725952161"'::jsonb),
  ('address', '"Boutique Derb Ghallef, Marché Salam, Rue 1, N°86 Casablanca – Maarif"'::jsonb),
  ('hours', '"10h00 - 20h30"'::jsonb),
  ('promo_bar_text', '"عروض خصم على خدمات إصلاح الحواسيب مع شحن مجاني"'::jsonb),
  ('delivery_message', '"Livraison gratuite"'::jsonb),
  ('warranty_message', '"Garantie 6 mois"'::jsonb),
  ('social_links', '{"facebook":"","instagram":"","youtube":""}'::jsonb)
on conflict (key) do nothing;

create table if not exists public.repair_services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  price_label text,
  image text,
  whatsapp_message text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

insert into public.repair_services (slug, title, description, price_label, whatsapp_message, sort_order)
values
  ('changement-ecran-laptop','Changement écran laptop','Remplacement écran laptop avec diagnostic compatibilité.','À partir de 450 DH','Bonjour MaiElectro, je veux réparer/remplacer un écran laptop.',10),
  ('remplacement-batterie','Remplacement batterie','Batterie gonflée, faible autonomie ou coupures.','À partir de 350 DH','Bonjour MaiElectro, je veux remplacer une batterie.',20),
  ('reparation-clavier','Réparation clavier','Clavier bloqué, touches cassées ou remplacement complet.','À partir de 250 DH','Bonjour MaiElectro, je veux réparer un clavier.',30),
  ('upgrade-ssd-ram','Upgrade SSD/RAM','Installation SSD, RAM et optimisation système.','À partir de 250 DH','Bonjour MaiElectro, je veux upgrader SSD/RAM.',40),
  ('nettoyage-interne','Nettoyage interne','Dépoussiérage, pâte thermique et refroidissement.','À partir de 150 DH','Bonjour MaiElectro, je veux un nettoyage interne.',50),
  ('reparation-carte-mere','Réparation carte mère','Diagnostic et intervention sur panne électronique.','Sur diagnostic','Bonjour MaiElectro, je veux diagnostiquer une carte mère.',60),
  ('diagnostic-complet','Diagnostic complet','Contrôle matériel et logiciel avec devis clair.','À partir de 100 DH','Bonjour MaiElectro, je veux un diagnostic complet.',70),
  ('reparation-macbook','Réparation MacBook','Écran, batterie, clavier, carte mère et macOS.','Sur devis','Bonjour MaiElectro, je veux réparer un MacBook.',80),
  ('reparation-iphone','Réparation iPhone','Diagnostic iPhone, écran, batterie et accessoires.','Sur devis','Bonjour MaiElectro, je veux réparer un iPhone.',90)
on conflict (slug) do nothing;

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,
  category text,
  image text,
  read_time text,
  published_at timestamptz default now(),
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

insert into public.blog_posts (slug, title, excerpt, category, read_time, sort_order)
values
  ('comment-choisir-pc-portable-maroc','Comment choisir un PC portable au Maroc','Les critères essentiels pour choisir un laptop adapté au travail, aux études et au budget.','Guide achat','5 min',10),
  ('dell-vs-hp-vs-lenovo','Dell vs HP vs Lenovo','Comparatif pratique entre les marques les plus demandées en boutique.','Comparatif','6 min',20),
  ('remplacer-batterie-laptop','Quand remplacer la batterie de son laptop','Autonomie faible, gonflement, coupures: les signes à surveiller avant la panne.','Réparation','4 min',30),
  ('ssd-ou-hdd','SSD ou HDD : lequel choisir ?','Performance, fiabilité et prix: comment choisir le bon stockage pour votre PC.','Upgrade','4 min',40),
  ('entretenir-macbook','Comment entretenir son MacBook','Nettoyage, batterie, stockage et bonnes habitudes pour prolonger la durée de vie.','MacBook','5 min',50),
  ('iphone-occasion-maroc','Acheter un iPhone occasion au Maroc','Les points à vérifier avant achat: batterie, écran, iCloud, état et garantie.','iPhone','5 min',60)
on conflict (slug) do nothing;

alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.repair_services enable row level security;
alter table public.blog_posts enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_logs enable row level security;

drop policy if exists "006 admin users super admin all" on public.admin_users;
drop policy if exists "006 admin users own row select" on public.admin_users;
drop policy if exists "006 products public active select" on public.products;
drop policy if exists "006 products super admin all" on public.products;
drop policy if exists "006 categories public active select" on public.categories;
drop policy if exists "006 categories super admin all" on public.categories;
drop policy if exists "006 repair public active select" on public.repair_services;
drop policy if exists "006 repair super admin all" on public.repair_services;
drop policy if exists "006 blog public active select" on public.blog_posts;
drop policy if exists "006 blog super admin all" on public.blog_posts;
drop policy if exists "006 settings public select" on public.site_settings;
drop policy if exists "006 settings super admin all" on public.site_settings;
drop policy if exists "006 logs super admin all" on public.admin_logs;
drop policy if exists "products are viewable by everyone" on public.products;
drop policy if exists "only super admin can insert products" on public.products;
drop policy if exists "only super admin can update products" on public.products;
drop policy if exists "only super admin can delete products" on public.products;
drop policy if exists "products active are public" on public.products;
drop policy if exists "super admin selects all products" on public.products;
drop policy if exists "super admin inserts products" on public.products;
drop policy if exists "super admin updates products" on public.products;
drop policy if exists "super admin deletes products" on public.products;
drop policy if exists "categories are viewable by everyone" on public.categories;
drop policy if exists "only super admin can insert categories" on public.categories;
drop policy if exists "only super admin can update categories" on public.categories;
drop policy if exists "only super admin can delete categories" on public.categories;
drop policy if exists "categories active are public" on public.categories;
drop policy if exists "super admin selects all categories" on public.categories;
drop policy if exists "super admin inserts categories" on public.categories;
drop policy if exists "super admin updates categories" on public.categories;
drop policy if exists "super admin deletes categories" on public.categories;
drop policy if exists "only super admin can select admin_logs" on public.admin_logs;
drop policy if exists "only super admin can insert admin_logs" on public.admin_logs;
drop policy if exists "super admin selects all admin logs" on public.admin_logs;
drop policy if exists "authenticated admins insert admin logs" on public.admin_logs;
drop policy if exists "settings are public" on public.site_settings;
drop policy if exists "only super admin can select settings" on public.site_settings;
drop policy if exists "only super admin can write settings" on public.site_settings;
drop policy if exists "super admin writes settings" on public.site_settings;
drop policy if exists "super admin manages admin_users" on public.admin_users;
drop policy if exists "admins can read own admin_user row" on public.admin_users;

create policy "006 admin users super admin all" on public.admin_users
  for all using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'))
  with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "006 admin users own row select" on public.admin_users
  for select using (lower(email) = lower(auth.jwt() ->> 'email'));

create policy "006 products public active select" on public.products for select using (coalesce(is_active, true) is true);
create policy "006 products super admin all" on public.products for all using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com')) with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "006 categories public active select" on public.categories for select using (coalesce(is_active, true) is true);
create policy "006 categories super admin all" on public.categories for all using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com')) with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "006 repair public active select" on public.repair_services for select using (coalesce(is_active, true) is true);
create policy "006 repair super admin all" on public.repair_services for all using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com')) with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "006 blog public active select" on public.blog_posts for select using (coalesce(is_active, true) is true);
create policy "006 blog super admin all" on public.blog_posts for all using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com')) with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "006 settings public select" on public.site_settings for select using (true);
create policy "006 settings super admin all" on public.site_settings for all using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com')) with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "006 logs super admin all" on public.admin_logs for all using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com')) with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

notify pgrst, 'reload schema';
