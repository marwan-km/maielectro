const normalizeText = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/['’]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');

const toSearchableText = (value) => {
  if (Array.isArray(value)) return value.map((item) => toSearchableText(item)).filter(Boolean).join(' ');
  if (value && typeof value === 'object') return Object.values(value).map((item) => toSearchableText(item)).filter(Boolean).join(' ');
  return normalizeText(value);
};

export const getProductSearchText = (product) => toSearchableText([
  product?.name,
  product?.description,
  product?.category,
  product?.subCategory,
  product?.sub_category,
  product?.product_type,
  product?.type,
  product?.tags,
  product?.brand,
  product?.model,
]);

export const matchesAnyTerm = (text, terms = []) => {
  const normalizedText = normalizeText(text);
  if (!normalizedText) return false;
  return terms.some((term) => normalizedText.includes(normalizeText(term)));
};

const LAPTOP_TERMS = [
  'hp elitebook',
  'hp probook',
  'dell latitude',
  'lenovo thinkpad',
  'macbook',
  'pc portable',
  'ordinateur portable',
  'laptop',
  'notebook',
];

const SPARE_PART_ORDERED_RULES = [
  { value: 'chargeurs', terms: ['chargeur', 'charger', 'adapter', 'adaptateur'] },
  { value: 'batteries', terms: ['batterie', 'battery'] },
  { value: 'claviers', terms: ['clavier', 'keyboard'] },
  { value: 'ecrans', terms: ['ecran', 'écran', 'screen', 'display'] },
  { value: 'ssd-ram', terms: ['ssd', 'ram', 'mémoire', 'memoire', 'memory'] },
];

export const SPARE_PART_FILTERS = [
  { value: '', label: 'Toutes les pièces' },
  { value: 'ecrans', label: 'Écrans' },
  { value: 'batteries', label: 'Batteries' },
  { value: 'claviers', label: 'Claviers' },
  { value: 'chargeurs', label: 'Chargeurs' },
  { value: 'ssd-ram', label: 'SSD / RAM' },
];

export const SPARE_PART_FILTER_BY_VALUE = Object.fromEntries(SPARE_PART_FILTERS.map((item) => [item.value, item]));

export const isLaptopLikeProduct = (product) => {
  const text = getProductSearchText(product);
  return matchesAnyTerm(text, LAPTOP_TERMS);
};

export const resolveSparePartSubCategory = (product) => {
  const text = getProductSearchText(product);
  for (const rule of SPARE_PART_ORDERED_RULES) {
    if (matchesAnyTerm(text, rule.terms)) return rule.value;
  }
  return '';
};

export const isSparePartLikeProduct = (product) => Boolean(resolveSparePartSubCategory(product));

export const resolveProductCategory = (product) => {
  const category = normalizeText(product?.category);
  if (!category || category === 'shop') return category;
  if (category === 'pieces detachees' && isLaptopLikeProduct(product) && !isSparePartLikeProduct(product)) {
    return 'laptops';
  }
  return category.replace(/\s+/g, '-');
};

export const resolveProductSubCategory = (product, resolvedCategory = resolveProductCategory(product)) => {
  const rawSubCategory = normalizeText(product?.subCategory || product?.sub_category);
  if (resolvedCategory === 'pieces-detachees') {
    return resolveSparePartSubCategory(product) || rawSubCategory.replace(/\s+/g, '-') || 'pieces-detachees';
  }

  if (resolvedCategory !== 'laptops') {
    return rawSubCategory.replace(/\s+/g, '-');
  }

  if (matchesAnyTerm(getProductSearchText(product), ['macbook'])) return 'macbook';
  if (matchesAnyTerm(getProductSearchText(product), ['lenovo thinkpad', 'lenovo'])) return 'lenovo';
  if (matchesAnyTerm(getProductSearchText(product), ['dell latitude', 'dell'])) return 'dell';
  if (matchesAnyTerm(getProductSearchText(product), ['hp elitebook', 'hp probook', 'hp pavilion', 'hp zbook', 'hp spectre', 'hp'])) return 'hp';

  if (!rawSubCategory || rawSubCategory === 'pieces-detachees') return 'laptops';
  return rawSubCategory;
};

export const filterProductsForSparePartSubcategory = (items, sub) => {
  const value = normalizeText(sub).replace(/\s+/g, '-');
  if (!value) {
    return items.filter((product) => resolveProductCategory(product) === 'pieces-detachees');
  }
  if (!SPARE_PART_FILTER_BY_VALUE[value]) return [];
  return items.filter((product) => resolveProductCategory(product) === 'pieces-detachees' && resolveSparePartSubCategory(product) === value);
};

export const getSparePartCounts = (items) => SPARE_PART_FILTERS.reduce((acc, filter) => {
  if (!filter.value) return acc;
  acc[filter.value] = items.filter((product) => resolveProductCategory(product) === 'pieces-detachees' && resolveSparePartSubCategory(product) === filter.value).length;
  return acc;
}, {});

export const getSparePartFilter = (value) => SPARE_PART_FILTER_BY_VALUE[normalizeText(value).replace(/\s+/g, '-')] || SPARE_PART_FILTERS[0];

export const matchesProductQuery = (product, query) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return true;
  return getProductSearchText(product).includes(normalizedQuery);
};
