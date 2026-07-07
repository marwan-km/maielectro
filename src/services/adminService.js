import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';
import { SUPER_ADMIN_EMAIL } from '../config/admin.js';
import { addAdminLog } from './logService.js';

const ADMIN_ACCESS_ROLES = ['super_admin', 'admin', 'manager', 'editor', 'stock_manager'];

const adminIsActive = (admin) => Boolean(admin) && admin.active === true;

const canAccessAdmin = (admin) => adminIsActive(admin) && ADMIN_ACCESS_ROLES.includes(String(admin.role || '').trim().toLowerCase());

async function getAdminByEmail(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) return null;

  let { data, error } = await supabase
    .from('admin_users')
    .select('id,email,role,active,permissions,full_name,created_at,updated_at')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (!data && !error) {
    ({ data, error } = await supabase
      .from('admin_users')
      .select('id,email,role,active,permissions,full_name,created_at,updated_at')
      .ilike('email', normalizedEmail)
      .maybeSingle());
  }

  if (error) throw error;
  return data || null;
}

export async function getCurrentAdminProfile() {
  if (!isSupabaseConfigured) return null;
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  return getAdminProfileBySession(sessionData.session);
}

export async function getAdminProfileBySession(session) {
  if (!isSupabaseConfigured || !session?.user) return null;
  const sessionEmail = session.user.email || '';
  const data = await getAdminByEmail(sessionEmail);

  if (!canAccessAdmin(data)) return null;
  return data;
}

export async function getAdminProfileByEmail(email) {
  if (!isSupabaseConfigured || !email) return null;
  const data = await getAdminByEmail(email);
  if (!canAccessAdmin(data)) return null;
  return data;
}

export async function listAdminUsers() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .ilike('email', SUPER_ADMIN_EMAIL)
    .eq('role', 'super_admin')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveAdminUser(admin, actorEmail) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  if (String(admin.email || '').trim().toLowerCase() !== SUPER_ADMIN_EMAIL) {
    throw new Error(`Only ${SUPER_ADMIN_EMAIL} can be configured as the super admin.`);
  }
  const row = {
    email: SUPER_ADMIN_EMAIL,
    role: 'super_admin',
    active: true,
  };

  if (admin.id) {
    let { data, error } = await supabase.from('admin_users').update(row).eq('id', admin.id).select().single();
    if (error) throw error;
    await addAdminLog({ adminEmail: actorEmail, action: 'admin role changed', entityType: 'admin_user', entityId: data.id, details: row });
    return data;
  }

  let { data, error } = await supabase.from('admin_users').insert(row).select().single();
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
  let { data, error } = await supabase.from('admin_users').update({ active: false }).eq('id', admin.id).select().single();
  if (error) throw error;
  await addAdminLog({ adminEmail: actorEmail, action: 'admin deactivated', entityType: 'admin_user', entityId: admin.id, details: { email: admin.email } });
  return data;
}
