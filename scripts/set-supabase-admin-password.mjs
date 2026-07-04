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

let authUser = existingUser;

if (existingUser) {
  const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
    password,
    email_confirm: true,
  });
  if (error) throw error;
  authUser = data.user || existingUser;
  console.log(`Updated Auth password for ${normalizedEmail}.`);
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  authUser = data.user;
  console.log(`Created Auth user ${normalizedEmail}.`);
}

if (!authUser?.id) throw new Error('Supabase Auth user id was not returned.');

let row = { id: authUser.id, email: normalizedEmail, role, is_active: true };
let { error: upsertError } = await supabase
  .from('admin_users')
  .upsert(row, { onConflict: 'id' });

if (upsertError && /is_active|schema cache|column/i.test(upsertError.message || '')) {
  row = { id: authUser.id, email: normalizedEmail, role };
  ({ error: upsertError } = await supabase
    .from('admin_users')
    .upsert(row, { onConflict: 'id' }));
}

if (upsertError) throw upsertError;

console.log(`Upserted admin_users row id=${authUser.id} for ${normalizedEmail} as ${role}.`);
