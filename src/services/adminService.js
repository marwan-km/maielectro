import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';
import { SUPER_ADMIN_EMAIL } from '../config/admin.js';
import { addAdminLog } from './logService.js';

const ADMIN_ACCESS_ROLES = ['super_admin', 'admin', 'manager', 'editor', 'stock_manager'];

const adminIsActive = (admin) => {
  if (!admin) return false;
  if (Object.prototype.hasOwnProperty.call(admin, 'is_active')) return admin.is_active === true;
  if (Object.prototype.hasOwnProperty.call(admin, 'active')) return admin.active === true;
  return true;
};

const canAccessAdmin = (admin) => adminIsActive(admin) && ADMIN_ACCESS_ROLES.includes(admin.role);

async function getAdminBy(column, value) {
  const query = supabase
    .from('admin_users')
    .select('*')
    .limit(1);

  const { data, error } = column === 'email'
    ? await query.ilike(column, String(value || '').trim().toLowerCase())
    : await query.eq(column, value);
  if (error) throw error;
  return data?.[0] || null;
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

  const byId = session.user.id ? await getAdminBy('id', session.user.id) : null;
  const data = byId || (sessionEmail ? await getAdminBy('email', sessionEmail) : null);

  if (!canAccessAdmin(data)) return null;
  return data;
}

export async function getAdminProfileByEmail(email) {
  if (!isSupabaseConfigured || !email) return null;
  const data = await getAdminBy('email', email);
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
    is_active: true,
  };

  if (admin.id) {
    let { data, error } = await supabase.from('admin_users').update(row).eq('id', admin.id).select().single();
    if (error && /is_active|schema cache|column/i.test(error.message || '')) {
      ({ data, error } = await supabase.from('admin_users').update({ email: SUPER_ADMIN_EMAIL, role: 'super_admin' }).eq('id', admin.id).select().single());
    }
    if (error) throw error;
    await addAdminLog({ adminEmail: actorEmail, action: 'admin role changed', entityType: 'admin_user', entityId: data.id, details: row });
    return data;
  }

  let { data, error } = await supabase.from('admin_users').insert(row).select().single();
  if (error && /is_active|schema cache|column/i.test(error.message || '')) {
    ({ data, error } = await supabase.from('admin_users').insert({ email: SUPER_ADMIN_EMAIL, role: 'super_admin' }).select().single());
  }
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
  let { data, error } = await supabase.from('admin_users').update({ is_active: false }).eq('id', admin.id).select().single();
  if (error && /is_active|schema cache|column/i.test(error.message || '')) {
    ({ data, error } = await supabase.from('admin_users').select('*').eq('id', admin.id).single());
  }
  if (error) throw error;
  await addAdminLog({ adminEmail: actorEmail, action: 'admin deactivated', entityType: 'admin_user', entityId: admin.id, details: { email: admin.email } });
  return data;
}
