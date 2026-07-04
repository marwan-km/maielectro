import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

async function checkImages() {
  console.log("Checking Supabase...");
  
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
  };

  try {
    const productsRes = await fetch(`${supabaseUrl}/rest/v1/products?select=id,image`, { headers });
    const products = await productsRes.json();
    console.log(`Total products in Supabase Database: ${products.length}`);
    
    if (products.length > 0) {
      console.log(`Sample image URL: ${products[0].image}`);
    }
    
  } catch (err) {
    console.error("Error:", err);
  }
}

checkImages();
