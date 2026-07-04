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

  if (existingUser) {
    await request(`/auth/v1/admin/users/${existingUser.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        password: SUPER_ADMIN_PASSWORD,
        email_confirm: true,
      }),
    });
    console.log(`Updated Supabase Auth user: ${normalizedEmail}`);
  } else {
    await request('/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email: normalizedEmail,
        password: SUPER_ADMIN_PASSWORD,
        email_confirm: true,
      }),
    });
    console.log(`Created Supabase Auth user: ${normalizedEmail}`);
  }

  await request('/rest/v1/admin_users?on_conflict=email', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({
      email: normalizedEmail,
      role: 'super_admin',
      active: true,
    }),
  });
  console.log('Upserted public.admin_users super_admin row.');

  await request(`/rest/v1/admin_users?email=neq.${encodeURIComponent(normalizedEmail)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      role: 'super_admin',
      active: false,
      updated_at: new Date().toISOString(),
    }),
  });
  console.log('Deactivated all other public.admin_users rows.');

  console.log('Success: only kirammarwan@gmail.com is active as super_admin.');
} catch (error) {
  console.error(`Error: ${error.message || 'Super admin setup failed.'}`);
  process.exit(1);
}
