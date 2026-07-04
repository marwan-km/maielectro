-- Move laptop products that were accidentally stored inside pieces-detachees.
-- Keep real spare parts in pieces-detachees.

-- HP EliteBook / ProBook laptops currently mislabeled as spare parts.
update public.products
set category = 'laptops',
    sub_category = 'hp',
    updated_at = now()
where category = 'pieces-detachees'
  and brand = 'HP'
  and (
    lower(name) like '%hp elitebook%'
    or lower(name) like '%hp probook%'
    or lower(name) like '%hp pavilion%'
    or lower(name) like '%hp zbook%'
    or lower(name) like '%hp spectre%'
    or lower(name) like '%pc portable%'
    or lower(name) like '%laptop%'
  )
  and not (
    lower(name) like '%ecran%'
    or lower(name) like '%screen%'
    or lower(name) like '%display%'
    or lower(name) like '%batterie%'
    or lower(name) like '%battery%'
    or lower(name) like '%clavier%'
    or lower(name) like '%keyboard%'
    or lower(name) like '%chargeur%'
    or lower(name) like '%charger%'
    or lower(name) like '%adaptateur%'
    or lower(name) like '%ssd%'
    or lower(name) like '%ram%'
    or lower(name) like '%motherboard%'
    or lower(name) like '%carte mere%'
  );

-- Dell Latitude laptops currently mislabeled as spare parts.
update public.products
set category = 'laptops',
    sub_category = 'dell',
    updated_at = now()
where category = 'pieces-detachees'
  and brand = 'Dell'
  and lower(name) like '%dell latitude%'
  and not (
    lower(name) like '%ecran%'
    or lower(name) like '%screen%'
    or lower(name) like '%display%'
    or lower(name) like '%batterie%'
    or lower(name) like '%battery%'
    or lower(name) like '%clavier%'
    or lower(name) like '%keyboard%'
    or lower(name) like '%chargeur%'
    or lower(name) like '%charger%'
    or lower(name) like '%adaptateur%'
    or lower(name) like '%ssd%'
    or lower(name) like '%ram%'
    or lower(name) like '%motherboard%'
    or lower(name) like '%carte mere%'
  );

-- Lenovo ThinkPad laptops currently mislabeled as spare parts.
update public.products
set category = 'laptops',
    sub_category = 'lenovo',
    updated_at = now()
where category = 'pieces-detachees'
  and brand = 'Lenovo'
  and lower(name) like '%lenovo thinkpad%'
  and not (
    lower(name) like '%ecran%'
    or lower(name) like '%screen%'
    or lower(name) like '%display%'
    or lower(name) like '%batterie%'
    or lower(name) like '%battery%'
    or lower(name) like '%clavier%'
    or lower(name) like '%keyboard%'
    or lower(name) like '%chargeur%'
    or lower(name) like '%charger%'
    or lower(name) like '%adaptateur%'
    or lower(name) like '%ssd%'
    or lower(name) like '%ram%'
    or lower(name) like '%motherboard%'
    or lower(name) like '%carte mere%'
  );

-- MacBook laptops that were placed in pieces-detachees.
update public.products
set category = 'laptops',
    sub_category = 'macbook',
    updated_at = now()
where category = 'pieces-detachees'
  and lower(name) like '%macbook%'
  and not (
    lower(name) like '%ecran%'
    or lower(name) like '%screen%'
    or lower(name) like '%display%'
    or lower(name) like '%batterie%'
    or lower(name) like '%battery%'
    or lower(name) like '%clavier%'
    or lower(name) like '%keyboard%'
    or lower(name) like '%chargeur%'
    or lower(name) like '%charger%'
    or lower(name) like '%adaptateur%'
    or lower(name) like '%ssd%'
    or lower(name) like '%ram%'
    or lower(name) like '%motherboard%'
    or lower(name) like '%carte mere%'
  );

-- Generic laptop/PC Portable listings that are still inside pieces-detachees.
update public.products
set category = 'laptops',
    sub_category = coalesce(sub_category, 'laptops'),
    updated_at = now()
where category = 'pieces-detachees'
  and (
    lower(name) like '%pc portable%'
    or lower(name) like '%ordinateur portable%'
    or lower(name) like '%laptop%'
    or lower(name) like '%notebook%'
  )
  and not (
    lower(name) like '%ecran%'
    or lower(name) like '%screen%'
    or lower(name) like '%display%'
    or lower(name) like '%batterie%'
    or lower(name) like '%battery%'
    or lower(name) like '%clavier%'
    or lower(name) like '%keyboard%'
    or lower(name) like '%chargeur%'
    or lower(name) like '%charger%'
    or lower(name) like '%adaptateur%'
    or lower(name) like '%ssd%'
    or lower(name) like '%ram%'
    or lower(name) like '%motherboard%'
    or lower(name) like '%carte mere%'
  );
