import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';

export async function addAdminLog({ adminEmail, action, entityType, entityId, details = {} }) {
  if (!isSupabaseConfigured) return null;
  const { error } = await supabase.from('admin_logs').insert({
    admin_email: adminEmail,
    action,
    entity_type: entityType,
    entity_id: entityId ? String(entityId) : null,
    details,
  });
  if (error) {
    return false;
  }
  return true;
}

export async function listAdminLogs({ ownOnly = false, email } = {}) {
  if (!isSupabaseConfigured) return [];
  let query = supabase
    .from('admin_logs')
    .select('id, admin_email, action, entity_type, entity_id, details, created_at')
    .order('created_at', { ascending: false })
    .limit(500);
  if (ownOnly && email) query = query.eq('admin_email', email);
  const { data, error } = await query;
  if (error) throw new Error(`Impossible de charger admin_logs: ${error.message}`);
  return data || [];
}

export const fetchLogs = listAdminLogs;
export const createLog = addAdminLog;

export async function addStockLog({ productId, adminEmail, oldStock, newStock, oldQuantity, newQuantity, note = '' }) {
  if (!isSupabaseConfigured) return null;
  const { error } = await supabase.from('stock_logs').insert({
    product_id: productId,
    admin_email: adminEmail,
    old_stock: oldStock,
    new_stock: newStock,
    old_quantity: oldQuantity,
    new_quantity: newQuantity,
    note,
  });
  if (error) {
    return false;
  }
  return true;
}

export async function listStockLogs({ ownOnly = false, email } = {}) {
  if (!isSupabaseConfigured) return [];
  let query = supabase.from('stock_logs').select('*').order('created_at', { ascending: false }).limit(100);
  if (ownOnly && email) query = query.eq('admin_email', email);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
