-- Final admin, logs, repair, blog, and schema-cache fix.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  role text default 'viewer',
  active boolean default true,
  permissions jsonb default '{}'::jsonb,
  created_by text,
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.admin_users
  add column if not exists full_name text,
  add column if not exists role text default 'viewer',
  add column if not exists active boolean default true,
  add column if not exists permissions jsonb default '{}'::jsonb,
  add column if not exists created_by text,
  add column if not exists last_login_at timestamptz,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.admin_users drop constraint if exists admin_users_role_check;
alter table public.admin_users
  add constraint admin_users_role_check
  check (role in ('super_admin', 'admin', 'manager', 'editor', 'stock_manager', 'viewer'));

insert into public.admin_users (email, full_name, role, active, permissions, updated_at)
values ('kirammarwan@gmail.com', 'Super Admin', 'super_admin', true, '{"all": true}'::jsonb, now())
on conflict (email) do update set
  full_name = 'Super Admin',
  role = 'super_admin',
  active = true,
  permissions = coalesce(public.admin_users.permissions, '{"all": true}'::jsonb),
  updated_at = now();

update public.admin_users
set active = false, updated_at = now()
where lower(email) in ('mkiram@gmail.com', 'anas123@gmail.com', 'ilas123@gmail.com')
  and lower(email) <> 'kirammarwan@gmail.com';

create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_email text,
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.admin_logs
  add column if not exists admin_email text,
  add column if not exists action text,
  add column if not exists entity_type text,
  add column if not exists entity_id text,
  add column if not exists details jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz default now();

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

alter table public.repair_services
  add column if not exists slug text,
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists price_label text,
  add column if not exists image text,
  add column if not exists whatsapp_message text,
  add column if not exists sort_order integer default 0,
  add column if not exists is_active boolean default true,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

insert into public.repair_services (slug, title, description, price_label, image, whatsapp_message, sort_order, is_active)
values
  ('changement-ecran-laptop', 'Changement écran laptop', 'Remplacement écran cassé, noir, tactile ou avec lignes.', 'Selon modèle', '/images/repair/screen-replacement.jpg', 'Bonjour MaiElectro, je veux remplacer un écran laptop.', 10, true),
  ('remplacement-batterie', 'Remplacement batterie', 'Batterie gonflée, faible autonomie ou charge instable.', 'Selon modèle', '/images/repair/battery-replacement.jpg', 'Bonjour MaiElectro, je veux remplacer une batterie.', 20, true),
  ('reparation-clavier', 'Réparation clavier', 'Touches bloquées, clavier liquide ou remplacement complet.', 'Selon modèle', '/images/repair/keyboard-replacement.jpg', 'Bonjour MaiElectro, je veux réparer un clavier.', 30, true),
  ('upgrade-ssd-ram', 'Upgrade SSD / RAM', 'Accélération du PC avec SSD, RAM et clonage possible.', 'Selon capacité', '/images/repair/ssd-ram-upgrade.jpg', 'Bonjour MaiElectro, je veux upgrader SSD/RAM.', 40, true),
  ('nettoyage-interne', 'Nettoyage interne', 'Dépoussiérage, pâte thermique et contrôle ventilation.', 'À partir de 150 DH', '/images/repair/internal-cleaning.jpg', 'Bonjour MaiElectro, je veux nettoyer mon ordinateur.', 50, true),
  ('reparation-carte-mere', 'Réparation carte mère', 'Diagnostic alimentation, composants et pannes complexes.', 'Sur devis', '/images/repair/motherboard-repair.jpg', 'Bonjour MaiElectro, je veux diagnostiquer une carte mère.', 60, true),
  ('diagnostic-complet', 'Diagnostic complet', 'Test matériel, panne précise et conseil réparation.', 'À partir de 100 DH', '/images/repair/diagnostic.jpg', 'Bonjour MaiElectro, je veux un diagnostic complet.', 70, true),
  ('reparation-macbook', 'Réparation MacBook', 'Écran, batterie, clavier, carte mère et macOS.', 'Selon modèle', '/images/repair/macbook-repair.jpg', 'Bonjour MaiElectro, je veux réparer un MacBook.', 80, true),
  ('reparation-iphone', 'Réparation iPhone', 'Diagnostic iPhone, écran, batterie et connectique.', 'Selon modèle', '/images/repair/iphone-repair.jpg', 'Bonjour MaiElectro, je veux réparer un iPhone.', 90, true)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  price_label = excluded.price_label,
  image = excluded.image,
  whatsapp_message = excluded.whatsapp_message,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

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

alter table public.blog_posts
  add column if not exists slug text,
  add column if not exists title text,
  add column if not exists excerpt text,
  add column if not exists content text,
  add column if not exists category text,
  add column if not exists image text,
  add column if not exists read_time text,
  add column if not exists published_at timestamptz default now(),
  add column if not exists is_active boolean default true,
  add column if not exists sort_order integer default 0,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

insert into public.blog_posts (slug, title, excerpt, content, category, image, read_time, sort_order, is_active)
values
  ('choisir-pc-portable-occasion', 'Comment choisir un PC portable d’occasion ?', 'Les points à vérifier avant d’acheter un laptop reconditionné.', '', 'Guide achat', '/images/categories/laptops-real.jpg', '5 min', 10, true),
  ('dell-vs-hp-vs-lenovo', 'Dell vs HP vs Lenovo : quelle marque choisir ?', 'Comparatif simple pour choisir une machine adaptée à votre usage.', '', 'Comparatif', '/images/categories/dell-real.jpg', '6 min', 20, true),
  ('remplacer-batterie-laptop', 'Quand remplacer la batterie de son laptop ?', 'Autonomie faible, batterie gonflée et signes à surveiller.', '', 'Réparation', '/images/repair/battery-replacement.jpg', '4 min', 30, true),
  ('ssd-vs-hdd', 'SSD vs HDD : pourquoi upgrader ?', 'Les bénéfices d’un SSD pour accélérer un ordinateur.', '', 'Upgrade', '/images/repair/ssd-ram-upgrade.jpg', '4 min', 40, true),
  ('entretien-macbook', 'Entretien MacBook : les bonnes pratiques', 'Nettoyage, batterie, ventilation et stockage.', '', 'MacBook', '/images/repair/internal-cleaning.jpg', '5 min', 50, true),
  ('acheter-iphone-occasion', 'Acheter un iPhone d’occasion : checklist', 'Écran, batterie, iCloud, Face ID et état général.', '', 'iPhone', '/images/categories/iphone-real.jpg', '5 min', 60, true)
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  category = excluded.category,
  image = excluded.image,
  read_time = excluded.read_time,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

alter table public.admin_users enable row level security;
alter table public.admin_logs enable row level security;
alter table public.repair_services enable row level security;
alter table public.blog_posts enable row level security;

create or replace function public.is_active_admin_email(check_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(check_email)
      and coalesce(active, true) is true
  );
$$;

grant execute on function public.is_active_admin_email(text) to authenticated;

drop policy if exists "007 admin users super admin all" on public.admin_users;
drop policy if exists "007 admin users own row select" on public.admin_users;
drop policy if exists "007 logs super admin select" on public.admin_logs;
drop policy if exists "007 logs authenticated admin insert" on public.admin_logs;
drop policy if exists "007 repair public active select" on public.repair_services;
drop policy if exists "007 repair super admin all" on public.repair_services;
drop policy if exists "007 blog public active select" on public.blog_posts;
drop policy if exists "007 blog super admin all" on public.blog_posts;

create policy "007 admin users super admin all" on public.admin_users
  for all
  using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'))
  with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "007 admin users own row select" on public.admin_users
  for select
  using (lower(email) = lower(auth.jwt() ->> 'email'));

create policy "007 logs super admin select" on public.admin_logs
  for select
  using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "007 logs authenticated admin insert" on public.admin_logs
  for insert
  with check (
    auth.role() = 'authenticated'
    and lower(admin_email) = lower(auth.jwt() ->> 'email')
    and public.is_active_admin_email(auth.jwt() ->> 'email')
  );

create policy "007 repair public active select" on public.repair_services
  for select
  using (coalesce(is_active, true) is true);

create policy "007 repair super admin all" on public.repair_services
  for all
  using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'))
  with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

create policy "007 blog public active select" on public.blog_posts
  for select
  using (coalesce(is_active, true) is true);

create policy "007 blog super admin all" on public.blog_posts
  for all
  using (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'))
  with check (lower(auth.jwt() ->> 'email') = lower('kirammarwan@gmail.com'));

notify pgrst, 'reload schema';
