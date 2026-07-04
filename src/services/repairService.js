import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';

export const FALLBACK_REPAIR_IMAGE = '/images/fallback-product.svg';

const REPAIR_IMAGE_MAP = {
  'changement-ecran-laptop': FALLBACK_REPAIR_IMAGE,
  'remplacement-batterie': FALLBACK_REPAIR_IMAGE,
  'reparation-clavier': FALLBACK_REPAIR_IMAGE,
  'upgrade-ssd-ram': FALLBACK_REPAIR_IMAGE,
  'nettoyage-interne': FALLBACK_REPAIR_IMAGE,
  'reparation-carte-mere': FALLBACK_REPAIR_IMAGE,
  'diagnostic-complet': FALLBACK_REPAIR_IMAGE,
  'reparation-macbook': FALLBACK_REPAIR_IMAGE,
  'reparation-iphone': FALLBACK_REPAIR_IMAGE,
};

const REPAIR_IMAGE_FIT = {
  'changement-ecran-laptop': 'contain',
  'remplacement-batterie': 'contain',
  'reparation-clavier': 'contain',
  'upgrade-ssd-ram': 'contain',
  'nettoyage-interne': 'cover',
  'reparation-carte-mere': 'contain',
  'diagnostic-complet': 'cover',
  'reparation-macbook': 'cover',
  'reparation-iphone': 'cover',
};

const isBadImage = (value) => {
  const text = String(value || '').trim();
  if (!text) return true;
  if (text === FALLBACK_REPAIR_IMAGE) return true;
  if (text.includes('source.unsplash.com')) return true;
  if (text.includes('placeholder')) return true;
  return false;
};

export const getRepairImageForSlug = (slug) => REPAIR_IMAGE_MAP[slug] || FALLBACK_REPAIR_IMAGE;

export const getRepairImageFitForSlug = (slug) => REPAIR_IMAGE_FIT[slug] || 'cover';

export const resolveRepairImage = (row) => {
  const mapped = getRepairImageForSlug(row?.slug);
  if (mapped) return mapped;
  if (row?.image && !isBadImage(row.image)) return row.image;
  return FALLBACK_REPAIR_IMAGE;
};

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
