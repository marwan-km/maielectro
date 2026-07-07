import {
  createSupabaseAdminClient,
  handleApiError,
  isMissingColumnError,
  normalizeEmail,
  readJsonBody,
  requireSuperAdmin,
  validatePassword,
} from './_adminAuth.js';

const optionalColumns = ['full_name', 'name', 'active', 'permissions', 'created_by', 'updated_at'];

function removeMissingColumn(row, error) {
  const message = String(error?.message || '') + ' ' + String(error?.details || '');
  const column = optionalColumns.find((key) => new RegExp('[\'\"]?' + key + '[\'\"]?', 'i').test(message));
  if (!column) return false;
  delete row[column];
  return true;
}

async function upsertAdminUser(supabaseAdmin, row) {
  const nextRow = { ...row };

  while (true) {
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .upsert(nextRow, { onConflict: 'id' })
      .select()
      .single();

    if (!error) return data;

    if (isMissingColumnError(error) && removeMissingColumn(nextRow, error)) {
      continue;
    }

    throw new Error('Table column mismatch: ' + error.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  let supabaseAdmin;
  try {
    supabaseAdmin = createSupabaseAdminClient();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

  const requester = await requireSuperAdmin(req, res, supabaseAdmin);
  if (!requester) return;

  try {
    const body = await readJsonBody(req);
    const email = normalizeEmail(body.email);
    const password = body.password;
    const fullName = String(body.full_name || body.fullName || body.name || '').trim();
    const role = String(body.role || '').trim();

    if (!email) return res.status(400).json({ error: 'Email is required.' });
    if (!role) return res.status(400).json({ error: 'Role is required.' });
    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ error: passwordError });

    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, name: fullName, role },
    });

    if (createError) {
      const message = /already registered|already been registered|already exists/i.test(createError.message || '')
        ? 'API error: a Supabase Auth user already exists with this email.'
        : 'API error: ' + createError.message;
      return res.status(409).json({ error: message });
    }

    const user = authData?.user;
    if (!user?.id) return res.status(500).json({ error: 'API error: Supabase did not return the created user id.' });

    const adminUser = await upsertAdminUser(supabaseAdmin, {
      id: user.id,
      email,
      role,
      full_name: fullName,
      name: fullName,
      active: true,
      permissions: {},
      created_by: requester.email,
      updated_at: new Date().toISOString(),
    });

    return res.status(200).json({ success: true, auth_user_id: user.id, admin_user: adminUser });
  } catch (error) {
    return handleApiError(res, error);
  }
}
