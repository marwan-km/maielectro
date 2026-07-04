-- Populate repair_services image fields with service-specific related images.
-- Safe to run multiple times. Does not delete rows.

update public.repair_services as rs
set image = src.image,
    updated_at = now()
from (
  values
    ('changement-ecran-laptop', 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JY2E5E0077V2R1PB8A0J0K8C/assets/e1f533f8-4292-4aef-b884-749505a41d8f.jpg'),
    ('remplacement-batterie', 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JY2E5E0077V2R1PB8A0J0K8C/assets/faab1dc3-30aa-455f-a2ee-4a86e967f5fc.jpg'),
    ('reparation-clavier', 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JY2E5E0077V2R1PB8A0J0K8C/assets/93ad5365-c360-4d78-9795-de73d423d02a.jpg'),
    ('upgrade-ssd-ram', 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JY2E5E0077V2R1PB8A0J0K8C/assets/f8ad6d46-24f6-4a3d-be4d-bb92c0b5987e.jpg'),
    ('nettoyage-interne', '/images/repair/hero-repair.jpg'),
    ('reparation-carte-mere', 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JY2E5E0077V2R1PB8A0J0K8C/assets/1752435739901-cartmermacprom114pouce2020-01.jpg'),
    ('diagnostic-complet', '/images/repair/system-install.jpg'),
    ('reparation-macbook', 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JY2E5E0077V2R1PB8A0J0K8C/assets/5dc83baf-74b2-4228-a4c2-995f24811e9a.png'),
    ('reparation-iphone', 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JY2E5E0077V2R1PB8A0J0K8C/assets/ea63ed8c-53b2-46a7-bce9-568e009853dc.jpg')
) as src(slug, image)
where rs.slug = src.slug;
