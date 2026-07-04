import {
  createSupabaseAdminClient,
  handleApiError,
  normalizeEmail,
  readJsonBody,
  requireSuperAdmin,
  validatePassword,
} from './_adminAuth.js';

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
    const requestedId = String(body.id || '').trim();
    const email = normalizeEmail(body.email);
    const password = body.password;

    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ error: passwordError });
    if (!requestedId && !email) return res.status(400).json({ error: 'Admin user id or email is required.' });

    let query = supabaseAdmin.from('admin_users').select('id,email,role').limit(1);
    query = requestedId ? query.eq('id', requestedId) : query.eq('email', email);

    const { data: adminRows, error: adminError } = await query;
    if (adminError) return res.status(500).json({ error: 'Table column mismatch: ' + adminError.message });

    const adminUser = adminRows?.[0];
    if (!adminUser) {
      return res.status(404).json({ error: 'Current user not found: target admin_users row was not found by id/email.' });
    }

    const authUserId = adminUser.id;
    if (!authUserId) return res.status(500).json({ error: 'Table column mismatch: admin_users.id is missing.' });

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
      password,
    });

    if (updateError) return res.status(500).json({ error: 'API error: ' + updateError.message });

    return res.status(200).json({ success: true });
  } catch (error) {
    return handleApiError(res, error);
  }
}
