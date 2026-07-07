-- Allow active non-super admins to manage catalog content without granting admin-user management.

alter table public.admin_users add column if not exists active boolean default true;

create or replace function public.has_active_admin_role(allowed_roles text[], permission_keys text[] default array[]::text[])
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
      and active is true
      and (
        role = any(allowed_roles)
        or exists (
          select 1
          from unnest(permission_keys) as key
          where permissions ->> key = 'true'
        )
      )
  );
$$;

grant execute on function public.has_active_admin_role(text[], text[]) to authenticated;

alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.repair_services enable row level security;
alter table public.admin_users enable row level security;

-- Remove older broad or super-admin-only catalog write policies so the policy set is both secure and usable.
drop policy if exists "Admins can insert products" on public.products;
drop policy if exists "Admins can update products" on public.products;
drop policy if exists "Admins can delete products" on public.products;
drop policy if exists "authenticated can insert products" on public.products;
drop policy if exists "authenticated can update products" on public.products;
drop policy if exists "authenticated can delete products" on public.products;
drop policy if exists "006 products super admin all" on public.products;
drop policy if exists "010 products admin insert" on public.products;
drop policy if exists "010 products admin update" on public.products;
drop policy if exists "010 products admin delete" on public.products;

create policy "010 products admin insert"
on public.products for insert
to authenticated
with check (public.has_active_admin_role(array['super_admin','admin','manager','editor'], array['PRODUCTS_CREATE','products.create']));

create policy "010 products admin update"
on public.products for update
to authenticated
using (public.has_active_admin_role(array['super_admin','admin','manager','editor'], array['PRODUCTS_UPDATE','products.update']))
with check (public.has_active_admin_role(array['super_admin','admin','manager','editor'], array['PRODUCTS_UPDATE','products.update']));

create policy "010 products admin delete"
on public.products for delete
to authenticated
using (public.has_active_admin_role(array['super_admin','admin','manager','editor'], array['PRODUCTS_DELETE','products.delete']));

drop policy if exists "Admins can insert categories" on public.categories;
drop policy if exists "Admins can update categories" on public.categories;
drop policy if exists "Admins can delete categories" on public.categories;
drop policy if exists "authenticated can insert categories" on public.categories;
drop policy if exists "authenticated can update categories" on public.categories;
drop policy if exists "authenticated can delete categories" on public.categories;
drop policy if exists "006 categories super admin all" on public.categories;
drop policy if exists "010 categories admin insert" on public.categories;
drop policy if exists "010 categories admin update" on public.categories;
drop policy if exists "010 categories admin delete" on public.categories;

create policy "010 categories admin insert"
on public.categories for insert
to authenticated
with check (public.has_active_admin_role(array['super_admin','admin','manager','editor']));

create policy "010 categories admin update"
on public.categories for update
to authenticated
using (public.has_active_admin_role(array['super_admin','admin','manager','editor']))
with check (public.has_active_admin_role(array['super_admin','admin','manager','editor']));

create policy "010 categories admin delete"
on public.categories for delete
to authenticated
using (public.has_active_admin_role(array['super_admin','admin','manager','editor']));

drop policy if exists "007 repair super admin all" on public.repair_services;
drop policy if exists "006 repair super admin all" on public.repair_services;
drop policy if exists "010 repair services admin update" on public.repair_services;
drop policy if exists "010 repair services admin insert" on public.repair_services;
drop policy if exists "010 repair services admin delete" on public.repair_services;

create policy "010 repair services admin insert"
on public.repair_services for insert
to authenticated
with check (public.has_active_admin_role(array['super_admin','admin','manager','editor']));

create policy "010 repair services admin update"
on public.repair_services for update
to authenticated
using (public.has_active_admin_role(array['super_admin','admin','manager','editor']))
with check (public.has_active_admin_role(array['super_admin','admin','manager','editor']));

create policy "010 repair services admin delete"
on public.repair_services for delete
to authenticated
using (public.has_active_admin_role(array['super_admin','admin','manager','editor']));

-- Admin-user management remains super-admin only. Normal admins can only read their own row.
drop policy if exists "010 admin users super admin all" on public.admin_users;
drop policy if exists "010 admin users own row select" on public.admin_users;

create policy "010 admin users super admin all"
on public.admin_users for all
to authenticated
using (public.has_active_admin_role(array['super_admin']))
with check (public.has_active_admin_role(array['super_admin']));

create policy "010 admin users own row select"
on public.admin_users for select
to authenticated
using (lower(email) = lower(auth.jwt() ->> 'email'));

-- Product/category/repair image management uses the same active admin role check.
drop policy if exists "authenticated can insert product-images" on storage.objects;
drop policy if exists "authenticated can update product-images" on storage.objects;
drop policy if exists "authenticated can delete product-images" on storage.objects;
drop policy if exists "only super admin can insert into product-images" on storage.objects;
drop policy if exists "only super admin can update product-images" on storage.objects;
drop policy if exists "only super admin can delete from product-images" on storage.objects;
drop policy if exists "010 admin insert product-images" on storage.objects;
drop policy if exists "010 admin update product-images" on storage.objects;
drop policy if exists "010 admin delete product-images" on storage.objects;

create policy "010 admin insert product-images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and public.has_active_admin_role(array['super_admin','admin','manager','editor']));

create policy "010 admin update product-images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and public.has_active_admin_role(array['super_admin','admin','manager','editor']))
with check (bucket_id = 'product-images' and public.has_active_admin_role(array['super_admin','admin','manager','editor']));

create policy "010 admin delete product-images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and public.has_active_admin_role(array['super_admin','admin','manager','editor']));

notify pgrst, 'reload schema';
