update public.categories
set image = case slug
  when 'lenovo' then 'https://yvlnjsttvnsyrgtsarvy.supabase.co/storage/v1/object/public/product-images/products/laptops/lenovo-thinkpad-l14-i711eme-16512-occasion-main.jpg'
  when 'macbook' then 'https://yvlnjsttvnsyrgtsarvy.supabase.co/storage/v1/object/public/product-images/products/laptops/macbook-air-m2-15-pouce-8gb-ram-256-ssd-main.jpg'
  when 'hp' then 'https://yvlnjsttvnsyrgtsarvy.supabase.co/storage/v1/object/public/product-images/products/laptops/hp-envy-x360-i512eme-8512-occasion-main.jpg'
  when 'dell' then 'https://yvlnjsttvnsyrgtsarvy.supabase.co/storage/v1/object/public/product-images/products/laptops/dell-latitude-5430-i5-14-pouce-12th-generation-8gb-ram-256-ssd-main.jpg'
  when 'accessoires' then 'https://yvlnjsttvnsyrgtsarvy.supabase.co/storage/v1/object/public/product-images/products/accessoires/sac-a-dos-ordinateur-portable-main.jpg'
  when 'pieces-detachees' then 'https://yvlnjsttvnsyrgtsarvy.supabase.co/storage/v1/object/public/product-images/products/pieces-detachees/clavier-macbook-air-m2-15-pouces-2023-main.jpg'
  else image
end,
updated_at = now()
where slug in ('lenovo', 'macbook', 'hp', 'dell', 'accessoires', 'pieces-detachees');
