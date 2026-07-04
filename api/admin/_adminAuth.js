import { createClient } from '@supabase/supabase-js';

const json = (res, status, body) => {
  res.status(status).json(body);
};

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) throw new Error('Missing env variable: SUPABASE_URL.');
  if (!serviceRoleKey) throw new Error('Service role missing: SUPABASE_SERVICE_ROLE_KEY.');

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) return JSON.parse(req.body);
  return {};
}

export function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  return match?.[1] || '';
}

export function isMissingColumnError(error) {
  return /column|schema cache|PGRST204/i.test(error?.message || error?.details || '');
}

export function adminIsActive(adminRow) {
  if (!adminRow || !Object.prototype.hasOwnProperty.call(adminRow, 'is_active')) return true;
  return adminRow.is_active === true;
}

async function getAdminByFilter(supabaseAdmin, column, value) {
  let { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('id,email,role,is_active')
    .eq(column, value)
    .limit(1);

  if (error && isMissingColumnError(error) && /is_active/i.test(error.message || '')) {
    ({ data, error } = await supabaseAdmin
      .from('admin_users')
      .select('id,email,role')
      .eq(column, value)
      .limit(1));
  }

  if (error) throw error;
  return data?.[0] || null;
}

export async function findAdminForAuthUser(supabaseAdmin, authUser) {
  if (!authUser?.id && !authUser?.email) return null;
  const byId = authUser.id ? await getAdminByFilter(supabaseAdmin, 'id', authUser.id) : null;
  if (byId) return byId;
  return authUser.email ? getAdminByFilter(supabaseAdmin, 'email', normalizeEmail(authUser.email)) : null;
}

export async function requireSuperAdmin(req, res, supabaseAdmin) {
  const token = getBearerToken(req);
  if (!token) {
    json(res, 401, { error: 'Missing Authorization bearer token.' });
    return null;
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  const requester = userData?.user;
  if (userError || !requester?.email) {
    json(res, 401, { error: 'Invalid or expired session.' });
    return null;
  }

  let adminRow;
  try {
    adminRow = await findAdminForAuthUser(supabaseAdmin, requester);
  } catch (adminError) {
    json(res, 500, { error: `Table column mismatch: ${adminError.message}` });
    return null;
  }

  if (!adminRow) {
    json(res, 403, { error: `Current user not found in admin_users by id (${requester.id}) or email (${requester.email}).` });
    return null;
  }

  if (adminRow.role !== 'super_admin') {
    json(res, 403, { error: `Current user role is not super_admin. Actual role: ${adminRow.role || 'missing'}.` });
    return null;
  }

  if (!adminIsActive(adminRow)) {
    json(res, 403, { error: 'Current admin user is not active: is_active is false.' });
    return null;
  }

  return { ...requester, adminRow };
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') return 'Password is required.';
  if (password.length < 8) return 'Password must contain at least 8 characters.';
  return '';
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function handleApiError(res, error) {
  const message = error?.message || 'Unexpected server error.';
  const status = /already registered|already exists|duplicate/i.test(message) ? 409 : 500;
  json(res, status, { error: message });
}
