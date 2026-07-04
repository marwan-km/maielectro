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

async function getAccessToken() {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data.session?.access_token;
  if (!token) throw new Error('Session admin expirée. Reconnectez-vous.');
  return token;
}

async function postAdminApi(path, body) {
  const token = await getAccessToken();
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Action admin impossible.');
  }
  return payload;
}

const adminIsActive = (admin) => admin?.is_active ?? admin?.active ?? true;

export async function getAdmins({ includeInactive = false } = {}) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('admin_users').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message + '. Vérifiez public.admin_users et les politiques RLS.');
  const rows = data || [];
  return includeInactive ? rows : rows.filter(adminIsActive);
}

export async function createAdminWithPassword({ email, fullName, role, password }, adminEmail) {
  const data = await postAdminApi('/api/admin/create-user', {
    email,
    password,
    full_name: fullName,
    role,
  });

  await addAdminLog({
    adminEmail,
    action: 'admin auth user created',
    entityType: 'admin_user',
    entityId: data.admin_user?.id || data.auth_user_id,
    details: { email, role },
  }).catch(() => null);

  return data;
}

export async function updateAdmin(id, { fullName, role, active, permissions }, adminEmail) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const row = {
    full_name: fullName,
    role,
    is_active: active,
    permissions: permissions || {},
    updated_at: new Date().toISOString(),
  };
  let { data, error } = await supabase.from('admin_users').update(row).eq('id', id).select().single();

  if (error && /is_active|full_name|permissions|updated_at|schema cache|column/i.test(error.message || '')) {
    const fallbackRow = { role };
    if (!/is_active/i.test(error.message || '')) fallbackRow.is_active = active;
    ({ data, error } = await supabase.from('admin_users').update(fallbackRow).eq('id', id).select().single());
  }

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
  let { data, error } = await supabase.from('admin_users').update({
    is_active: false,
    updated_at: new Date().toISOString(),
  }).eq('id', id).select().single();
  if (error && /is_active|updated_at|schema cache|column/i.test(error.message || '')) {
    ({ data, error } = await supabase.from('admin_users').update({ active: false }).eq('id', id).select().single());
  }
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

export async function updateAdminPassword(targetAdmin, newPassword, adminEmail) {
  const data = await postAdminApi('/api/admin/update-password', {
    id: targetAdmin.id,
    email: targetAdmin.email,
    password: newPassword,
  });

  await addAdminLog({
    adminEmail,
    action: 'admin password updated',
    entityType: 'admin_user',
    entityId: targetAdmin.id,
    details: { targetEmail: targetAdmin.email },
  }).catch(() => null);

  return data;
}
