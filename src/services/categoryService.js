import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';
import { categories as localCategories } from '../data/categories.js';
import { addAdminLog } from './logService.js';

export const mapDbCategoryToUiCategory = (row) => ({
  id: row.id,
  slug: row.slug || row.id,
  name: row.name || '',
  description: row.description || '',
  image: row.image || '',
  parentSlug: row.parent_slug || row.parentSlug || '',
  sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
  isActive: row.is_active ?? row.isActive ?? true,
  createdAt: row.created_at || '',
  updatedAt: row.updated_at || '',
});

export const mapUiCategoryToDbCategory = (category, includeExtended = true) => {
  const row = {
    slug: category.slug,
    name: category.name,
    description: category.description,
    image: category.image,
    updated_at: new Date().toISOString(),
  };
  if (includeExtended) {
    row.parent_slug = category.parentSlug || null;
    row.sort_order = Number(category.sortOrder || 0);
    row.is_active = category.isActive ?? true;
  }
  return row;
};

const normalizeCategory = mapDbCategoryToUiCategory;
let categoriesCache = null;
let categoriesCachePromise = null;

export function clearCategoriesCache() {
  categoriesCache = null;
  categoriesCachePromise = null;
}

export async function listAdminCategories() {
  if (!isSupabaseConfigured) {
    return localCategories.map((category) => ({
      id: category.id,
      slug: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
    }));
  }

  if (categoriesCache) return categoriesCache;
  if (categoriesCachePromise) return categoriesCachePromise;

  categoriesCachePromise = supabase
    .from('categories')
    .select('id, slug, name, description, image, parent_slug, sort_order, is_active, created_at, updated_at')
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (error) throw error;
      categoriesCache = (data || [])
        .map(normalizeCategory)
        .filter((category) => category.isActive !== false)
        .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
      return categoriesCache;
    })
    .finally(() => {
      categoriesCachePromise = null;
    });

  return categoriesCachePromise;
}

export async function saveCategory(category, adminEmail) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const write = async (row) => {
    if (category.id) {
      return supabase.from('categories').update(row).eq('id', category.id).select().single();
    }
    return supabase.from('categories').insert(row).select().single();
  };

  let row = mapUiCategoryToDbCategory(category, true);
  let { data, error } = await write(row);
  if (error && /is_active|parent_slug|sort_order|schema cache/i.test(error.message || '')) {
    row = mapUiCategoryToDbCategory(category, false);
    ({ data, error } = await write(row));
  }
  if (error) throw error;
  await addAdminLog({ adminEmail, action: category.id ? 'category updated' : 'category created', entityType: 'category', entityId: data.id, details: row }).catch(() => null);
  clearCategoriesCache();
  return normalizeCategory(data);
}

export async function deleteCategory(id, adminEmail) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
  await addAdminLog({ adminEmail, action: 'category deleted', entityType: 'category', entityId: id }).catch(() => null);
  clearCategoriesCache();
}
