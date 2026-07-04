import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL || 'kirammarwan@gmail.com';
const password = process.env.ADMIN_PASSWORD;
const role = 'super_admin';

if (!supabaseUrl) throw new Error('Missing SUPABASE_URL.');
if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY.');
if (!password) throw new Error('Missing ADMIN_PASSWORD.');
if (email.toLowerCase() !== 'kirammarwan@gmail.com') throw new Error('Only kirammarwan@gmail.com can be configured as admin.');

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const normalizedEmail = email.toLowerCase();

const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
if (listError) throw listError;

const existingUser = usersData.users.find((user) => user.email?.toLowerCase() === normalizedEmail);

if (existingUser) {
  const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
    password,
    email_confirm: true,
  });
  if (error) throw error;
  console.log(`Updated Auth password for ${normalizedEmail}.`);
} else {
  const { error } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  console.log(`Created Auth user ${normalizedEmail}.`);
}

const { error: upsertError } = await supabase
  .from('admin_users')
  .upsert({ email: normalizedEmail, role, active: true }, { onConflict: 'email' });

if (upsertError) throw upsertError;

console.log(`Upserted admin_users row for ${normalizedEmail} as ${role}.`);
