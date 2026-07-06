import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';
import { addAdminLog } from './logService.js';

export const defaultSettings = {
  store_name: 'MaiElectro',
  phone: '0725952161',
  whatsapp: '212725952161',
  address: 'Casablanca, Maroc',
  hours: 'Lun-Sam 10:00-20:00',
  promo_bar_text: 'Livraison rapide et garantie boutique sur une sélection de produits.',
  delivery_message: 'Livraison disponible à Casablanca et partout au Maroc.',
  warranty_message: 'Garantie boutique selon produit.',
  social_links: {
    facebook: '',
    instagram: '',
    youtube: '',
  },
};

let settingsCache = null;

export function clearSettingsCache() {
  settingsCache = null;
}

export async function getSettings() {
  if (!isSupabaseConfigured) return { ...defaultSettings, rows: [] };
  if (settingsCache) return settingsCache;
  const { data, error } = await supabase.from('site_settings').select('*').order('key', { ascending: true });
  if (error) throw new Error(`Impossible de charger site_settings: ${error.message}`);
  
  const settings = { ...defaultSettings };
  for (const row of data || []) {
    settings[row.key] = row.value;
  }
  settings.rows = data || [];
  settingsCache = settings;
  return settings;
}

export async function updateSetting(key, value, adminEmail) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  
  const { data, error } = await supabase.from('site_settings')
    .upsert({ key, value, updated_by: adminEmail, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .select().single();
    
  if (error) throw new Error(`Impossible d'enregistrer ${key}: ${error.message}`);
  
  await addAdminLog({
    adminEmail,
    action: 'setting updated',
    entityType: 'setting',
    entityId: key,
  }).catch(() => null);
  
  clearSettingsCache();
  return data;
}

export async function updateSettings(settingsObject, adminEmail) {
  for (const [key, value] of Object.entries({ ...defaultSettings, ...settingsObject })) {
    await updateSetting(key, value, adminEmail);
  }
}
