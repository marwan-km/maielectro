const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || 'kirammarwan@gmail.com').toLowerCase();
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Error: Missing SUPABASE_URL.');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error('Error: Missing SUPABASE_SERVICE_ROLE_KEY. Never prefix this key with VITE_ and never commit it.');
  process.exit(1);
}

if (!SUPER_ADMIN_PASSWORD || SUPER_ADMIN_PASSWORD.length < 8) {
  console.error('Error: Missing SUPER_ADMIN_PASSWORD or ADMIN_PASSWORD with at least 8 characters.');
  process.exit(1);
}

const baseUrl = supabaseUrl.replace(/\/$/, '');
const headers = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  'Content-Type': 'application/json',
};

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || data?.msg || data?.error_description || data?.error || `Request failed: ${response.status}`);
  }

  return data;
}

async function findAuthUserByEmail(email) {
  let page = 1;
  const perPage = 1000;

  while (true) {
    const data = await request(`/auth/v1/admin/users?page=${page}&per_page=${perPage}`);
    const users = data?.users || [];
    const user = users.find((item) => item.email?.toLowerCase() === email);
    if (user) return user;
    if (users.length < perPage) return null;

    page += 1;
  }
}

try {
  const normalizedEmail = SUPER_ADMIN_EMAIL;
  console.log(`Setting up single super admin: ${normalizedEmail}`);

  const existingUser = await findAuthUserByEmail(normalizedEmail);
  let authUser = existingUser;

  if (existingUser) {
    await request(`/auth/v1/admin/users/${existingUser.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        password: SUPER_ADMIN_PASSWORD,
        email_confirm: true,
      }),
    });
    authUser = { ...existingUser };
    console.log(`Updated Supabase Auth user: ${normalizedEmail}`);
  } else {
    authUser = await request('/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email: normalizedEmail,
        password: SUPER_ADMIN_PASSWORD,
        email_confirm: true,
      }),
    });
    console.log(`Created Supabase Auth user: ${normalizedEmail}`);
  }

  const authUserId = authUser?.id || authUser?.user?.id;
  if (!authUserId) throw new Error('Supabase Auth user id was not returned.');

  try {
    await request('/rest/v1/admin_users?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({
        id: authUserId,
        email: normalizedEmail,
        role: 'super_admin',
        is_active: true,
      }),
    });
  } catch (error) {
    if (!/is_active|schema cache|column/i.test(error.message || '')) throw error;
    await request('/rest/v1/admin_users?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({
        id: authUserId,
        email: normalizedEmail,
        role: 'super_admin',
      }),
    });
  }
  console.log('Upserted public.admin_users super_admin row.');

  try {
    await request(`/rest/v1/admin_users?email=neq.${encodeURIComponent(normalizedEmail)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        role: 'super_admin',
        is_active: false,
        updated_at: new Date().toISOString(),
      }),
    });
    console.log('Deactivated all other public.admin_users rows.');
  } catch (error) {
    if (!/is_active|updated_at|schema cache|column/i.test(error.message || '')) throw error;
    console.log('Skipped deactivating other admin rows because optional status columns are missing.');
  }

  console.log('Success: kirammarwan@gmail.com is configured as super_admin using admin_users.id = Auth user id.');
} catch (error) {
  console.error(`Error: ${error.message || 'Super admin setup failed.'}`);
  process.exit(1);
}
