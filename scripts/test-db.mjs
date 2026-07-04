import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('Missing SUPABASE_URL or VITE_SUPABASE_URL.');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('products').select('id').limit(1);
  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
  console.log('Success! Table exists.');
}
check();
