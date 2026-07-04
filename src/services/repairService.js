import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';

export const FALLBACK_REPAIR_IMAGE = '/images/fallback-product.svg';

const REPAIR_SERVICE_FALLBACKS = {
  'changement-ecran-laptop': 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JY2E5E0077V2R1PB8A0J0K8C/assets/e1f533f8-4292-4aef-b884-749505a41d8f.jpg',
  'remplacement-batterie': 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JY2E5E0077V2R1PB8A0J0K8C/assets/faab1dc3-30aa-455f-a2ee-4a86e967f5fc.jpg',
  'reparation-clavier': 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JY2E5E0077V2R1PB8A0J0K8C/assets/93ad5365-c360-4d78-9795-de73d423d02a.jpg',
  'upgrade-ssd-ram': 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JY2E5E0077V2R1PB8A0J0K8C/assets/f8ad6d46-24f6-4a3d-be4d-bb92c0b5987e.jpg',
  'nettoyage-interne': '/images/repair/hero-repair.jpg',
  'reparation-carte-mere': 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JY2E5E0077V2R1PB8A0J0K8C/assets/1752435739901-cartmermacprom114pouce2020-01.jpg',
  'diagnostic-complet': '/images/repair/system-install.jpg',
  'reparation-macbook': 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JY2E5E0077V2R1PB8A0J0K8C/assets/5dc83baf-74b2-4228-a4c2-995f24811e9a.png',
  'reparation-iphone': 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JY2E5E0077V2R1PB8A0J0K8C/assets/ea63ed8c-53b2-46a7-bce9-568e009853dc.jpg',
};

const REPAIR_IMAGE_FIT = {
  'changement-ecran-laptop': 'cover',
  'remplacement-batterie': 'cover',
  'reparation-clavier': 'cover',
  'upgrade-ssd-ram': 'cover',
  'nettoyage-interne': 'cover',
  'reparation-carte-mere': 'cover',
  'diagnostic-complet': 'cover',
  'reparation-macbook': 'cover',
  'reparation-iphone': 'cover',
};

const IMAGE_FIELDS = ['image_url', 'image', 'cover_url', 'thumbnail_url', 'coverUrl', 'thumbnailUrl'];

const isBadImage = (value) => {
  const text = String(value || '').trim();
  if (!text) return true;
  if (text === FALLBACK_REPAIR_IMAGE) return true;
  if (text === 'null' || text === 'undefined') return true;
  if (text.includes('source.unsplash.com')) return true;
  if (text.includes('placeholder')) return true;
  return false;
};

const pickRepairImage = (row) => {
  for (const field of IMAGE_FIELDS) {
    const candidate = row?.[field];
    if (!isBadImage(candidate)) return candidate;
  }
  return '';
};

export const getRepairImageForSlug = (slug) => REPAIR_SERVICE_FALLBACKS[slug] || FALLBACK_REPAIR_IMAGE;

export const getRepairImageFitForSlug = (slug) => REPAIR_IMAGE_FIT[slug] || 'cover';

export const resolveRepairImage = (row) => pickRepairImage(row) || getRepairImageForSlug(row?.slug);

export const mapDbRepairServiceToUi = (row) => ({
  id: row.id || row.slug,
  slug: row.slug,
  title: row.title,
  description: row.description || '',
  priceLabel: row.price_label || row.priceLabel || '',
  image: resolveRepairImage(row),
  imageFit: getRepairImageFitForSlug(row?.slug),
  whatsappMessage: row.whatsapp_message || row.whatsappMessage || `Bonjour MaiElectro, je veux des informations sur: ${row.title}`,
  sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
  isActive: row.is_active ?? row.isActive ?? true,
});

export async function getRepairServices() {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('repair_services')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Impossible de charger repair_services: ${error.message}`);
  }

  const rows = (data || []).map(mapDbRepairServiceToUi).filter((item) => item.isActive !== false);
  return rows;
}
