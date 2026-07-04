create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null default 'super_admin',
  active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint admin_users_role_check check (role in ('super_admin'))
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

alter table public.admin_users enable row level security;

drop policy if exists "Admins can select themselves" on public.admin_users;
drop policy if exists "Super admins can select all admins" on public.admin_users;
drop policy if exists "Super admins can insert admins" on public.admin_users;
drop policy if exists "Super admins can update admins" on public.admin_users;
drop policy if exists "Super admins can delete admins" on public.admin_users;
drop policy if exists "super admin can read own row" on public.admin_users;

create policy "super admin can read own row"
on public.admin_users
for select
to authenticated
using (
  lower(email) = lower(auth.jwt() ->> 'email')
  and lower(email) = lower('kirammarwan@gmail.com')
  and role = 'super_admin'
  and active = true
);
