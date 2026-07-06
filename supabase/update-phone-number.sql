-- Update MaiElectro contact numbers in site_settings
-- Visible phone: 0725952161
-- WhatsApp / wa.me: 212725952161

insert into public.site_settings (key, value, updated_at)
values
  ('phone', to_jsonb('0725952161'::text), now()),
  ('whatsapp', to_jsonb('212725952161'::text), now())
on conflict (key) do update
set value = excluded.value,
    updated_at = excluded.updated_at;
