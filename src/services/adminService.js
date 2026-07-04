import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';
import { isAllowedSuperAdminEmail, SUPER_ADMIN_EMAIL } from '../config/admin.js';
import { addAdminLog } from './logService.js';

export async function getCurrentAdminProfile() {
  if (!isSupabaseConfigured) return null;
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const email = sessionData.session?.user?.email;
  if (!email) return null;

  return getAdminProfileByEmail(email);
}

export async function getAdminProfileByEmail(email) {
  if (!isSupabaseConfigured || !email) return null;
  if (!isAllowedSuperAdminEmail(email)) return null;

  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .ilike('email', SUPER_ADMIN_EMAIL)
    .eq('role', 'super_admin')
    .eq('active', true)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.role !== 'super_admin' || !isAllowedSuperAdminEmail(data.email)) return null;
  return data;
}

export async function listAdminUsers() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .ilike('email', SUPER_ADMIN_EMAIL)
    .eq('role', 'super_admin')
    .eq('active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveAdminUser(admin, actorEmail) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  if (!isAllowedSuperAdminEmail(admin.email)) {
    throw new Error(`Only ${SUPER_ADMIN_EMAIL} can be configured as the super admin.`);
  }
  const row = {
    email: SUPER_ADMIN_EMAIL,
    role: 'super_admin',
    active: true,
  };

  if (admin.id) {
    const { data, error } = await supabase.from('admin_users').update(row).eq('id', admin.id).select().single();
    if (error) throw error;
    await addAdminLog({ adminEmail: actorEmail, action: 'admin role changed', entityType: 'admin_user', entityId: data.id, details: row });
    return data;
  }

  const { data, error } = await supabase.from('admin_users').insert(row).select().single();
  if (error) throw error;
  await addAdminLog({ adminEmail: actorEmail, action: 'admin added', entityType: 'admin_user', entityId: data.id, details: row });
  return data;
}

export async function deleteAdminUser(admin, actorEmail) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('admin_users').delete().eq('id', admin.id);
  if (error) throw error;
  await addAdminLog({ adminEmail: actorEmail, action: 'admin removed', entityType: 'admin_user', entityId: admin.id, details: { email: admin.email } });
}

export async function deactivateAdminUser(admin, actorEmail) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.from('admin_users').update({ active: false }).eq('id', admin.id).select().single();
  if (error) throw error;
  await addAdminLog({ adminEmail: actorEmail, action: 'admin deactivated', entityType: 'admin_user', entityId: admin.id, details: { email: admin.email } });
  return data;
}
