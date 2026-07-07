-- Allow authenticated active admins to update products.
-- Public visitors remain unable to update products.

drop policy if exists "admins_can_update_products" on public.products;

create policy "admins_can_update_products"
on public.products
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where lower(au.email) = lower(auth.jwt() ->> 'email')
      and au.active = true
      and (
        au.role in ('super_admin', 'admin', 'manager', 'editor')
        or coalesce((au.permissions ->> 'PRODUCTS_UPDATE')::boolean, false) = true
      )
  )
)
with check (
  exists (
    select 1
    from public.admin_users au
    where lower(au.email) = lower(auth.jwt() ->> 'email')
      and au.active = true
      and (
        au.role in ('super_admin', 'admin', 'manager', 'editor')
        or coalesce((au.permissions ->> 'PRODUCTS_UPDATE')::boolean, false) = true
      )
  )
);

notify pgrst, 'reload schema';
