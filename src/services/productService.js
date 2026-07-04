import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';
import { uploadProductImage as uploadProductImageToStorage } from './storageService.js';
import { addAdminLog, addStockLog } from './logService.js';
import { matchesProductQuery, resolveProductCategory, resolveProductSubCategory } from '../utils/productClassification.js';

export const FALLBACK_PRODUCT_IMAGE = '/images/fallback-product.svg';

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value.split('\n').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
};

const firstImage = (row) => {
  const gallery = toArray(row.gallery).filter(isUsableProductImage);
  return isUsableProductImage(row.image) ? row.image : gallery.find(Boolean) || FALLBACK_PRODUCT_IMAGE;
};

const isSupabaseProductImage = (value) => String(value || '').includes('/storage/v1/object/public/product-images/');
const isRemoteImage = (value) => /^https?:\/\//i.test(String(value || ''));
const isUsableProductImage = (value) => {
  const text = String(value || '');
  if (!text) return false;
  if (text.startsWith('/images/products/')) return false;
  return isRemoteImage(text) || isSupabaseProductImage(text);
};

export const mapDbProductToUiProduct = (row) => {
  const resolvedCategory = resolveProductCategory(row);
  const resolvedSubCategory = resolveProductSubCategory(row, resolvedCategory);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand || '',
    category: resolvedCategory || '',
    subCategory: resolvedSubCategory || '',
    price: Number(row.price || 0),
    oldPrice: row.old_price ?? row.oldPrice ?? null,
    image: firstImage(row),
    gallery: toArray(row.gallery).filter(isUsableProductImage),
    rating: Number(row.rating || 4.7),
    warranty: row.warranty || '',
    stock: row.stock || 'in_stock',
    stockQuantity: Number(row.stock_quantity ?? row.stockQuantity ?? 1),
    description: row.description || '',
    shortDescription: row.short_description || row.shortDescription || '',
    specs: toArray(row.specs),
    badge: row.badge || '',
    featured: Boolean(row.featured),
    condition: row.condition || '',
    processor: row.processor || '',
    ram: row.ram || '',
    storage: row.storage || '',
    screenSize: row.screen_size || row.screenSize || '',
    graphics: row.graphics || '',
    color: row.color || '',
    model: row.model || '',
    year: row.year ?? '',
    deliveryAvailable: row.delivery_available ?? row.deliveryAvailable ?? true,
    freeDelivery: row.free_delivery ?? row.freeDelivery ?? true,
    softwareIncluded: row.software_included || row.softwareIncluded || '',
    views: Number(row.views || 0),
    isActive: row.is_active ?? row.isActive ?? true,
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
    createdAt: row.created_at || row.createdAt || '',
    updatedAt: row.updated_at || row.updatedAt || '',
  };
};

export const mapUiProductToDbProduct = (product) => ({
  slug: product.slug,
  name: product.name,
  brand: product.brand,
  category: product.category,
  sub_category: product.subCategory,
  price: Number(product.price || 0),
  old_price: product.oldPrice === '' || product.oldPrice == null ? null : Number(product.oldPrice),
  image: product.image,
  gallery: product.gallery || [],
  rating: Number(product.rating || 4.7),
  warranty: product.warranty,
  stock: product.stock,
  stock_quantity: Number(product.stockQuantity ?? product.stock_quantity ?? 1),
  description: product.description,
  short_description: product.shortDescription || null,
  specs: product.specs || [],
  badge: product.badge,
  featured: Boolean(product.featured),
  condition: product.condition || null,
  processor: product.processor || null,
  ram: product.ram || null,
  storage: product.storage || null,
  screen_size: product.screenSize || null,
  graphics: product.graphics || null,
  color: product.color || null,
  model: product.model || null,
  year: product.year === '' || product.year == null ? null : Number(product.year),
  delivery_available: product.deliveryAvailable ?? true,
  free_delivery: product.freeDelivery ?? true,
  software_included: product.softwareIncluded || null,
  views: Number(product.views || 0),
  is_active: product.isActive ?? true,
  sort_order: Number(product.sortOrder || 0),
  updated_at: new Date().toISOString(),
});

const normalizeProduct = mapDbProductToUiProduct;
const toProductRow = mapUiProductToDbProduct;
let localFallbackProductsPromise = null;

const getLocalFallbackProducts = async () => {
  if (!localFallbackProductsPromise) {
    localFallbackProductsPromise = import('../data/products.js').then(({ products }) => products.map((product) => normalizeProduct({
      ...product,
      image: isSupabaseProductImage(product.image) ? product.image : FALLBACK_PRODUCT_IMAGE,
      gallery: toArray(product.gallery).filter(isSupabaseProductImage),
    })));
  }
  return localFallbackProductsPromise;
};

let productsCache = null;
let productsCachePromise = null;

export function clearProductsCache() {
  productsCache = null;
  productsCachePromise = null;
}

export async function getProducts({ fallback = true } = {}) {
  if (!isSupabaseConfigured) {
    return fallback ? getLocalFallbackProducts() : [];
  }

  if (productsCache) return productsCache;
  if (productsCachePromise) return productsCachePromise;

  productsCachePromise = supabase
    .from('products')
    .select('id, slug, name, brand, category, sub_category, price, old_price, image, gallery, rating, warranty, stock, stock_quantity, description, short_description, specs, badge, featured, condition, processor, ram, storage, screen_size, graphics, color, model, year, delivery_available, free_delivery, software_included, views, is_active, sort_order, created_at, updated_at')
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (error) {
        return fallback ? getLocalFallbackProducts() : [];
      }

      productsCache = (data || [])
        .map(normalizeProduct)
        .filter((product) => product.isActive !== false)
        .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
      return productsCache;
    })
    .finally(() => {
      productsCachePromise = null;
    });

  return productsCachePromise;
}

export async function getFeaturedProducts() {
  const products = await getProducts();
  return products.filter(p => p.featured);
}

export async function getProductBySlug(slug) {
  if (!isSupabaseConfigured) return (await getLocalFallbackProducts()).find((product) => product.slug === slug);

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) return (await getLocalFallbackProducts()).find((product) => product.slug === slug);
  return normalizeProduct(data);
}

export async function getProductsByCategory(category) {
  const products = await getProducts();
  const lowerCat = String(category || '').toLowerCase();
  if (!lowerCat || lowerCat === 'shop') return products;
  
  if (lowerCat === 'laptops') return products.filter((product) => product.category === 'laptops');
  if (lowerCat === 'macbook') {
    return products.filter((product) => {
      const name = String(product.name || '').toLowerCase();
      const brand = String(product.brand || '').toLowerCase();
      return product.category === 'laptops' && (/macbook|ipad/.test(name) || brand.includes('apple'));
    });
  }
  if (['lenovo', 'dell', 'hp'].includes(lowerCat)) {
    return products.filter((product) => {
      const brand = String(product.brand || '').toLowerCase();
      const name = String(product.name || '').toLowerCase();
      return product.category === 'laptops' && (brand.includes(lowerCat) || name.includes(lowerCat));
    });
  }
  
  return products.filter((product) => product.category === lowerCat || product.subCategory === lowerCat);
}

export async function getProductsByBrand(brand) {
  const products = await getProducts();
  const lowerBrand = String(brand || '').toLowerCase();
  return products.filter((product) => String(product.brand || '').toLowerCase() === lowerBrand);
}

export async function searchProducts(query) {
  const products = await getProducts();
  if (!String(query || '').trim()) return products;
  return products.filter((product) => matchesProductQuery(product, query));
}

export async function saveProduct(product, adminEmail) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const row = toProductRow(product);

  if (product.id) {
    const { data, error } = await supabase
      .from('products')
      .update(row)
      .eq('id', product.id)
      .select()
      .single();
    if (error) throw error;
    await addAdminLog({ adminEmail, action: 'product updated', entityType: 'product', entityId: data.id, details: { slug: data.slug, name: data.name } });
    clearProductsCache();
    return normalizeProduct(data);
  }

  const { data, error } = await supabase
    .from('products')
    .insert(row)
    .select()
    .single();
    
  if (error) throw error;
  await addAdminLog({ adminEmail, action: 'product created', entityType: 'product', entityId: data.id, details: { slug: data.slug, name: data.name } });
  clearProductsCache();
  return normalizeProduct(data);
}

export async function deleteProduct(id, adminEmail) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  await addAdminLog({ adminEmail, action: 'product deleted', entityType: 'product', entityId: id });
  clearProductsCache();
}

export async function uploadProductImage(file, folder = 'products') {
  return uploadProductImageToStorage(file, { category: folder });
}

export async function updateProductStock(id, nextStock, nextQuantity, adminEmail, note = '') {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  
  const { data: product, error: fetchErr } = await supabase.from('products').select('*').eq('id', id).single();
  if (fetchErr) throw fetchErr;

  const oldStock = product.stock;
  const oldQuantity = Number(product.stock_quantity ?? 0);
  const newQuantity = Number(nextQuantity ?? (nextStock === 'in_stock' ? Math.max(oldQuantity, 1) : 0));
  
  const { data, error } = await supabase
    .from('products')
    .update({ stock: nextStock, stock_quantity: newQuantity })
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  
  await addStockLog({
    productId: id,
    adminEmail,
    oldStock,
    newStock: nextStock,
    oldQuantity,
    newQuantity,
    note,
  });
  
  await addAdminLog({
    adminEmail,
    action: 'stock changed',
    entityType: 'product',
    entityId: id,
    details: { oldStock, newStock: nextStock, oldQuantity, newQuantity },
  });
  
  clearProductsCache();
  return normalizeProduct(data);
}

export const filterProductsByCategory = (items, categoryId) => {
  const category = String(categoryId || '').toLowerCase();
  if (!category || category === 'shop') return items;
  if (category === 'laptops') return items.filter((product) => product.category === 'laptops');
  if (category === 'macbook') {
    return items.filter((product) => {
      const name = String(product.name || '').toLowerCase();
      const brand = String(product.brand || '').toLowerCase();
      return product.category === 'laptops' && (/macbook|ipad/.test(name) || brand.includes('apple'));
    });
  }
  if (['lenovo', 'dell', 'hp'].includes(category)) {
    return items.filter((product) => {
      const brand = String(product.brand || '').toLowerCase();
      const name = String(product.name || '').toLowerCase();
      return product.category === 'laptops' && (brand.includes(category) || name.includes(category));
    });
  }
  return items.filter((product) => product.category === category || product.subCategory === category);
};
