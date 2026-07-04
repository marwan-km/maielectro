import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';
import { addAdminLog } from './logService.js';
import { mapDbRepairServiceToUi } from './repairService.js';

export async function listRepairServicesForAdmin() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('repair_services')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(`${error.message}. Appliquez la migration 007_final_admin_repair_blog_fix.sql.`);
  return (data || []).map(mapDbRepairServiceToUi);
}

export async function updateRepairService(id, values, adminEmail) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const row = {
    title: values.title,
    description: values.description,
    price_label: values.priceLabel,
    image: values.image,
    whatsapp_message: values.whatsappMessage,
    sort_order: Number(values.sortOrder || 0),
    is_active: values.isActive,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('repair_services')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  await addAdminLog({
    adminEmail,
    action: 'repair service updated',
    entityType: 'repair_service',
    entityId: id,
    details: { slug: data.slug, title: data.title },
  }).catch(() => null);
  return mapDbRepairServiceToUi(data);
}
