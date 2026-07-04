-- Standardize pieces-detachees sub_category values to the supported spare-part buckets.
-- This keeps the frontend buttons and the database in sync.

update public.products
set sub_category = case
  when lower(name) like '%chargeur%' or lower(coalesce(description, '')) like '%chargeur%' or lower(coalesce(description, '')) like '%adaptateur%' or lower(coalesce(description, '')) like '%adapter%' then 'chargeurs'
  when lower(name) like '%batterie%' or lower(coalesce(description, '')) like '%batterie%' or lower(coalesce(description, '')) like '%battery%' then 'batteries'
  when lower(name) like '%clavier%' or lower(coalesce(description, '')) like '%clavier%' or lower(coalesce(description, '')) like '%keyboard%' then 'claviers'
  when lower(name) like '%ecran%' or lower(name) like '%écran%' or lower(coalesce(description, '')) like '%ecran%' or lower(coalesce(description, '')) like '%écran%' or lower(coalesce(description, '')) like '%screen%' or lower(coalesce(description, '')) like '%display%' then 'ecrans'
  when lower(name) like '%ssd%' or lower(name) like '%ram%' or lower(coalesce(description, '')) like '%ssd%' or lower(coalesce(description, '')) like '%ram%' or lower(coalesce(description, '')) like '%memoire%' or lower(coalesce(description, '')) like '%mémoire%' or lower(coalesce(description, '')) like '%memory%' then 'ssd-ram'
  else sub_category
end,
updated_at = now()
where category = 'pieces-detachees';
