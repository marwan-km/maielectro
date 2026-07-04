import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const reportFile = path.join(__dirname, '../MIGRATION_REPORT.md');
let report = '# Migration Report\n\n';

function appendReport(text) {
  console.log(text);
  report += text + '\n';
  fs.writeFileSync(reportFile, report);
}

// Ensure the bucket exists
async function ensureBucket() {
  const { data, error } = await supabase.storage.getBucket('product-images');
  if (error && error.message.includes('not found')) {
    const { error: createError } = await supabase.storage.createBucket('product-images', { public: true });
    if (createError) {
      appendReport(`Failed to create bucket: ${createError.message}`);
    } else {
      appendReport(`Created product-images bucket.`);
    }
  } else if (!error) {
    if (!data.public) {
       await supabase.storage.updateBucket('product-images', { public: true });
    }
  }
}

async function uploadFile(localPath, bucketPath) {
  if (!localPath) return null;
  const fullPath = path.join(__dirname, '../public', localPath);
  if (!fs.existsSync(fullPath)) {
    appendReport(`File not found: ${fullPath}`);
    return null;
  }
  const fileContent = fs.readFileSync(fullPath);
  const ext = path.extname(localPath).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  
  const { data, error } = await supabase.storage.from('product-images').upload(bucketPath, fileContent, {
    contentType: mimeType,
    upsert: true
  });
  
  if (error) {
    appendReport(`Failed to upload ${localPath}: ${error.message}`);
    return null;
  }
  
  const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(bucketPath);
  return publicUrlData.publicUrl;
}

async function migrate() {
  appendReport(`Starting migration...`);
  await ensureBucket();
  
  const productsPath = path.join(__dirname, '../src/data/products.js');
  // Dynamic import of the products data
  const { products } = await import('file://' + productsPath.replace(/\\/g, '/'));

  const categories = [
    { slug: 'laptops', name: 'PC Portable', description: 'Tous les laptops Lenovo, Dell, HP et MacBook disponibles chez MaiElectro.', image: '/images/categories/laptops-real.jpg' },
    { slug: 'lenovo', name: 'Lenovo', description: 'ThinkPad, ThinkBook, Yoga, IdeaPad et Legion disponibles à Casablanca.', image: null },
    { slug: 'dell', name: 'Dell', description: 'Latitude, XPS, Precision, Vostro et Inspiron avec garantie.', image: null },
    { slug: 'hp', name: 'HP', description: 'EliteBook, ProBook, ZBook, Spectre et Pavilion prêts à utiliser.', image: null },
    { slug: 'macbook', name: 'MacBook', description: 'MacBook Air et MacBook Pro préparés avec garantie boutique.', image: null },
    { slug: 'iphone', name: 'iPhone', description: 'iPhones contrôlés, accessoires compatibles et demande de disponibilité.', image: '/images/categories/iphone-real.jpg' },
    { slug: 'accessoires', name: 'Accessoires', description: 'Chargeurs, souris, claviers, casques, sacoches et hubs USB-C.', image: '/images/categories/accessories-real.jpg' },
    { slug: 'pieces-detachees', name: 'Pièces détachées', description: 'SSD, RAM, écrans, batteries, claviers, cartes mères et composants compatibles.', image: '/images/categories/spare-parts-real.jpg' }
  ];

  // 1. Migrate Categories
  for (const cat of categories) {
    let imageUrl = null;
    if (cat.image) {
       imageUrl = await uploadFile(cat.image, `categories/${path.basename(cat.image)}`);
    }
    const { error } = await supabase.from('categories').upsert({
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      image: imageUrl
    }, { onConflict: 'slug' });
    if (error) {
      appendReport(`Failed to upsert category ${cat.slug}: ${error.message}`);
    } else {
      appendReport(`Upserted category ${cat.slug}`);
    }
  }

  // 2. Migrate Products
  for (const product of products) {
    let newImage = null;
    let newGallery = [];
    
    if (product.image) {
      const categoryDir = product.category || 'misc';
      const bucketPath = `products/${categoryDir}/${path.basename(product.image)}`;
      newImage = await uploadFile(product.image, bucketPath);
      if (!newImage) {
        appendReport(`Missing main image for ${product.slug}, falling back to null.`);
      }
    }
    
    if (product.gallery && Array.isArray(product.gallery)) {
      for (const gal of product.gallery) {
        const categoryDir = product.category || 'misc';
        const bucketPath = `products/${categoryDir}/${path.basename(gal)}`;
        const galUrl = await uploadFile(gal, bucketPath);
        if (galUrl) {
          newGallery.push(galUrl);
        }
      }
    }
    
    let stockStatus = 'in_stock';
    if (product.stock === 'Rupture de stock' || product.stock === 'out_of_stock') {
      stockStatus = 'out_of_stock';
    }

    const productData = {
      slug: product.slug,
      name: product.name,
      brand: product.brand || null,
      category: product.category || 'misc',
      sub_category: product.subCategory || null,
      price: product.price || 0,
      old_price: product.oldPrice || null,
      image: newImage,
      gallery: newGallery,
      rating: product.rating || 4.7,
      warranty: product.warranty || null,
      stock: stockStatus,
      stock_quantity: product.stockQuantity || 1,
      description: product.description || null,
      specs: product.specs || [],
      badge: product.badge || null,
      featured: product.featured || false
    };
    
    const { error } = await supabase.from('products').upsert(productData, { onConflict: 'slug' });
    if (error) {
      appendReport(`Failed to upsert product ${product.slug}: ${error.message}`);
    } else {
      appendReport(`Upserted product ${product.slug}`);
    }
  }
  
  appendReport(`Migration finished.`);
}

migrate().catch(err => {
  appendReport(`Error during migration: ${err.message}`);
});
