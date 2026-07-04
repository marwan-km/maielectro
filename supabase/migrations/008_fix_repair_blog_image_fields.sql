-- Populate meaningful image paths for existing repair and blog rows.
-- These are public assets shipped with the app. If you later move them to
-- Supabase Storage, replace the paths in this migration and the DB rows.

update public.repair_services as rs
set image = src.image,
    updated_at = now()
from (
  values
    ('changement-ecran-laptop', '/images/repair/screen-replacement.jpg'),
    ('remplacement-batterie', '/images/repair/battery-replacement.jpg'),
    ('reparation-clavier', '/images/repair/keyboard-replacement.jpg'),
    ('upgrade-ssd-ram', '/images/repair/ssd-ram-upgrade.jpg'),
    ('nettoyage-interne', '/images/repair/internal-cleaning.jpg'),
    ('reparation-carte-mere', '/images/repair/motherboard-repair.jpg'),
    ('diagnostic-complet', '/images/repair/diagnostic.jpg'),
    ('reparation-macbook', '/images/repair/macbook-repair.jpg'),
    ('reparation-iphone', '/images/repair/iphone-repair.jpg')
) as src(slug, image)
where rs.slug = src.slug;

update public.blog_posts as bp
set image = src.image,
    updated_at = now()
from (
  values
    ('comment-choisir-pc-portable-maroc', '/images/categories/laptops-real.jpg'),
    ('choisir-pc-portable-occasion', '/images/categories/laptops-real.jpg'),
    ('dell-vs-hp-vs-lenovo', '/images/categories/dell-real.jpg'),
    ('remplacer-batterie-laptop', '/images/repair/battery-replacement.jpg'),
    ('quand-remplacer-batterie-laptop', '/images/repair/battery-replacement.jpg'),
    ('ssd-ou-hdd', '/images/repair/ssd-ram-upgrade.jpg'),
    ('ssd-vs-hdd', '/images/repair/ssd-ram-upgrade.jpg'),
    ('entretenir-macbook', '/images/repair/internal-cleaning.jpg'),
    ('entretien-macbook', '/images/repair/internal-cleaning.jpg'),
    ('acheter-iphone-occasion', '/images/categories/iphone-real.jpg'),
    ('acheter-iphone-occasion-maroc', '/images/categories/iphone-real.jpg'),
    ('iphone-occasion-maroc', '/images/categories/iphone-real.jpg')
) as src(slug, image)
where bp.slug = src.slug;

notify pgrst, 'reload schema';
