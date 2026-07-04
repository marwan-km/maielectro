import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const slugifyPathPart = (value) => String(value || 'general')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '') || 'general';

export function validateImageFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Format invalide. Utilisez JPG, PNG ou WebP.');
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image trop lourde. Taille maximale: 5MB.');
  }
}

export function getPublicUrl(path) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadImage(file, folder = 'products') {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  validateImageFile(file);
  const safeName = `${Date.now()}-${file.name}`.replace(/[^a-zA-Z0-9.-]/g, '-');
  const path = `${folder}/${safeName}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  return getPublicUrl(path);
}

async function uploadProductFile(file, product = {}, kind = 'main') {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  validateImageFile(file);
  const category = slugifyPathPart(product.category || product.subCategory || 'products');
  const slug = slugifyPathPart(product.slug || product.name || 'new-product');
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `products/${category}/${slug}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  return getPublicUrl(path);
}

export async function uploadProductImage(file, product = {}) {
  return uploadProductFile(file, product, 'main');
}

export async function uploadGalleryImages(files, product = {}, onProgress) {
  const list = Array.from(files || []);
  const urls = [];
  for (let index = 0; index < list.length; index += 1) {
    const url = await uploadProductFile(list[index], product, `gallery-${index + 1}`);
    urls.push(url);
    onProgress?.({ completed: index + 1, total: list.length, url });
  }
  return urls;
}

export async function deleteStorageFile(pathOrUrl) {
  if (!isSupabaseConfigured || !pathOrUrl) return false;
  const marker = '/storage/v1/object/public/product-images/';
  const path = String(pathOrUrl).includes(marker)
    ? String(pathOrUrl).split(marker)[1]
    : pathOrUrl;
  const { error } = await supabase.storage.from('product-images').remove([path]);
  if (error) throw error;
  return true;
}
