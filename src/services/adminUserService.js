import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';
import { addAdminLog } from './logService.js';

const roleConstraintMessage = 'Le rôle sélectionné nécessite la migration Supabase 007_final_admin_repair_blog_fix.sql pour accepter admin, manager, editor, stock_manager, viewer et super_admin.';

const normalizeAdminError = (error) => {
  if (!error) return null;
  if (/admin_users_role_check|violates check constraint|constraint/i.test(error.message || '')) {
    return new Error(roleConstraintMessage);
  }
  return error;
};

export async function getAdmins({ includeInactive = false } = {}) {
  if (!isSupabaseConfigured) return [];
  let query = supabase.from('admin_users').select('*').order('created_at', { ascending: false });
  if (!includeInactive) query = query.eq('active', true);
  const { data, error } = await query;
  if (error) throw new Error(`${error.message}. Appliquez la migration 007_final_admin_repair_blog_fix.sql si admin_users est incomplet.`);
  return data || [];
}

export async function createAdmin({ email, fullName, role, active, permissions }, adminEmail) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const row = {
    email,
    full_name: fullName,
    role,
    active: active ?? true,
    permissions: permissions || {},
    updated_at: new Date().toISOString(),
  };
  const rowWithCreator = {
    ...row,
    created_by: adminEmail,
  };
  let { data, error } = await supabase.from('admin_users').insert(rowWithCreator).select().single();
  if (error && /created_by|schema cache/i.test(error.message || '')) {
    ({ data, error } = await supabase.from('admin_users').insert(row).select().single());
  }
  if (error) throw normalizeAdminError(error);
  
  await addAdminLog({
    adminEmail,
    action: 'admin created',
    entityType: 'admin_user',
    entityId: data.id,
    details: { email, role }
  }).catch(() => null);
  
  return data;
}

export async function updateAdmin(id, { fullName, role, active, permissions }, adminEmail) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.from('admin_users').update({
    full_name: fullName,
    role,
    active,
    permissions: permissions || {},
    updated_at: new Date().toISOString(),
  }).eq('id', id).select().single();
  
  if (error) throw normalizeAdminError(error);
  
  await addAdminLog({
    adminEmail,
    action: 'admin updated',
    entityType: 'admin_user',
    entityId: id,
    details: { role, active }
  }).catch(() => null);
  
  return data;
}

export async function deactivateAdmin(id, adminEmail) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.from('admin_users').update({
    active: false,
    updated_at: new Date().toISOString(),
  }).eq('id', id).select().single();
  if (error) throw error;
  await addAdminLog({ adminEmail, action: 'admin deactivated', entityType: 'admin_user', entityId: id }).catch(() => null);
  return data;
}

export async function deleteAdmin(id, adminEmail) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('admin_users').delete().eq('id', id);
  if (error) throw error;
  
  await addAdminLog({
    adminEmail,
    action: 'admin deleted',
    entityType: 'admin_user',
    entityId: id
  }).catch(() => null);
}

export async function sendPasswordReset(email, adminEmail) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/reset-password`
  }).catch(() => null);
  
  if (error) throw error;
  
  await addAdminLog({
    adminEmail,
    action: 'password reset sent',
    entityType: 'admin_user',
    details: { targetEmail: email }
  }).catch(() => null);
}

export async function updateAdminPasswordViaEdgeFunction(targetEmail, newPassword, adminEmail) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  
  const { data, error } = await supabase.functions.invoke('admin-user-actions', {
    body: {
      action: 'update_password',
      email: targetEmail,
      password: newPassword
    }
  });
  
  if (error) throw error;
  
  await addAdminLog({
    adminEmail,
    action: 'password changed securely',
    entityType: 'admin_user',
    details: { targetEmail }
  });
  
  return data;
}
