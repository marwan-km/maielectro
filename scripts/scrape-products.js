import { access, copyFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_URL = 'https://www.maielectro.com';
const STORE_ID = 'store_01JY2E5E0077V2R1PB8A0J0K8C';
const API_BASE = `https://api-ecommerce.hostinger.com/store/${STORE_ID}`;
const USE_SOURCE_IMAGES = process.env.USE_SOURCE_IMAGES === 'true';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = join(root, 'public');
const failed = [];

const categoryFolders = ['laptops', 'macbook', 'lenovo', 'dell', 'hp', 'iphone', 'accessoires', 'pieces-detachees', 'repair'];
const seedMap = {
  lenovo: ['/images/products/lenovo/__seed-1.jpg', '/images/products/lenovo/__seed-2.jpg'],
  dell: ['/images/products/dell/__seed-1.jpg', '/images/products/dell/__seed-2.jpg'],
  hp: ['/images/products/hp/__seed-1.jpg', '/images/products/hp/__seed-2.jpg'],
  macbook: ['/images/products/macbook/__seed-1.jpg', '/images/products/macbook/__seed-2.jpg'],
  iphone: ['/images/products/iphone/__seed-1.jpg', '/images/products/iphone/__seed-2.jpg'],
  accessoires: ['/images/products/accessoires/__seed-1.jpg', '/images/products/accessoires/__seed-2.jpg'],
  'pieces-detachees': ['/images/products/pieces-detachees/__seed-1.jpg', '/images/products/pieces-detachees/__seed-2.jpg'],
  repair: ['/images/products/pieces-detachees/__seed-1.jpg', '/images/products/pieces-detachees/__seed-2.jpg'],
  laptops: ['/images/products/lenovo/__seed-1.jpg', '/images/products/lenovo/__seed-2.jpg'],
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const localPath = (publicPath) => join(publicRoot, publicPath.replace(/^\//, ''));
const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const slugify = (value) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const stripHtml = (html = '') => (html || '')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/(p|li|ul|ol|div|h[1-6])>/gi, '\n')
  .replace(/<[^>]*>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/\s+\n/g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const specsFromHtml = (html = '') => {
  html = html || '';
  const specs = [];
  const strongPattern = /<strong>(.*?)<\/strong>\s*([^<\n]+)/gi;
  let match;
  while ((match = strongPattern.exec(html))) {
    const key = stripHtml(match[1]).replace(/:$/, '').trim();
    const value = stripHtml(match[2]).replace(/^[:\s]+/, '').trim();
    if (key && value) specs.push([key, value]);
  }

  if (!specs.length) {
    const text = stripHtml(html);
    text.split('\n').forEach((line) => {
      const [key, ...value] = line.split(':');
      if (key && value.length) specs.push([key.trim(), value.join(':').trim()]);
    });
  }

  return specs.slice(0, 10);
};

const amountToDh = (amount) => {
  if (typeof amount !== 'number') return null;
  return Math.round(amount / 100);
};

const fetchJson = async (url) => {
  const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'TechProCatalogScraper/1.0' } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.json();
};

const fetchAllProducts = async () => {
  const all = [];
  let offset = 0;
  const limit = 100;
  let count = Infinity;

  while (offset < count) {
    const url = `${API_BASE}/products?limit=${limit}&offset=${offset}`;
    const data = await fetchJson(url);
    all.push(...(data.products || []));
    count = data.count || all.length;
    offset += limit;
    await sleep(350);
  }

  return all;
};

const collectionTitleMap = (collections) => Object.fromEntries(collections.map((collection) => [collection.id, collection.title]));

const getCollectionTitles = (product, collectionMap) => product.product_collections
  ?.map((item) => collectionMap[item.collection_id])
  .filter(Boolean) || [];

const inferBrand = (product, collectionTitles) => {
  const haystack = `${product.title} ${collectionTitles.join(' ')}`.toLowerCase();
  if (haystack.includes('lenovo') || haystack.includes('thinkpad') || haystack.includes('ideapad') || haystack.includes('yoga')) return 'Lenovo';
  if (haystack.includes('dell') || haystack.includes('latitude') || haystack.includes('xps') || haystack.includes('precision')) return 'Dell';
  if (haystack.includes('hp') || haystack.includes('elitebook') || haystack.includes('probook') || haystack.includes('pavilion') || haystack.includes('zbook')) return 'HP';
  if (haystack.includes('iphone') || haystack.includes('macbook') || haystack.includes('apple')) return 'Apple';
  if (haystack.includes('samsung')) return 'Samsung';
  if (haystack.includes('kingston')) return 'Kingston';
  return 'MaiElectro';
};

const inferCategory = (product, brand, collectionTitles) => {
  const haystack = `${product.title} ${collectionTitles.join(' ')}`.toLowerCase();
  if (haystack.includes('iphone')) return { category: 'iphone', subCategory: 'iphone' };
  if (haystack.includes('pièces') || haystack.includes('قطع') || haystack.includes('rechange') || haystack.includes('batterie') || haystack.includes('écran') || haystack.includes('clavier') || haystack.includes('carte mère')) {
    return { category: 'pieces-detachees', subCategory: 'pieces-detachees' };
  }
  if (haystack.includes('accessoire') || haystack.includes('اكسسوارات') || haystack.includes('chargeur') || haystack.includes('film de protection') || haystack.includes('souris') || haystack.includes('hub') || haystack.includes('sacoche')) {
    return { category: 'accessoires', subCategory: 'accessoires' };
  }
  if (brand === 'Apple' && haystack.includes('macbook')) return { category: 'laptops', subCategory: 'macbook' };
  if (['Lenovo', 'Dell', 'HP', 'Apple'].includes(brand)) return { category: 'laptops', subCategory: brand === 'Apple' ? 'macbook' : brand.toLowerCase() };
  return { category: 'accessoires', subCategory: 'accessoires' };
};

const folderFor = (product) => {
  if (product.category === 'iphone') return 'iphone';
  if (product.category === 'accessoires') return 'accessoires';
  if (product.category === 'pieces-detachees') return 'pieces-detachees';
  if (product.subCategory === 'macbook') return 'macbook';
  if (['lenovo', 'dell', 'hp'].includes(product.subCategory)) return product.subCategory;
  return 'laptops';
};

const imagePathsFor = (product, galleryCount) => {
  const folder = folderFor(product);
  const base = `/images/products/${folder}/${product.slug}`;
  const count = Math.max(3, galleryCount || 3);
  return Array.from({ length: count }, (_, index) => `${base}${index === 0 ? '' : `-${index + 1}`}.jpg`);
};

const normalizeProduct = (product, collectionMap, index) => {
  const collectionTitles = getCollectionTitles(product, collectionMap);
  const brand = inferBrand(product, collectionTitles);
  const { category, subCategory } = inferCategory(product, brand, collectionTitles);
  const variant = product.variants?.[0] || {};
  const priceInfo = variant.prices?.[0] || {};
  const rawPrice = priceInfo.sale_amount ?? priceInfo.amount;
  const rawOldPrice = priceInfo.sale_amount ? priceInfo.amount : null;
  const slug = product.slug || product.url_handle || slugify(product.title);
  const sourceImages = [
    ...(product.images || []).map((image) => image.url),
    product.thumbnail,
    ...((product.variants || []).map((item) => item.image_url).filter(Boolean)),
  ].filter(Boolean);
  const uniqueSourceImages = [...new Set(sourceImages)];
  const imagePaths = imagePathsFor({ category, subCategory, slug }, uniqueSourceImages.length);
  const textDescription = stripHtml(product.description || product.seo_settings?.description || '');

  return {
    id: index + 1,
    sourceId: product.id,
    slug,
    name: product.title,
    brand,
    category,
    subCategory,
    price: amountToDh(rawPrice) || 0,
    oldPrice: amountToDh(rawOldPrice),
    image: imagePaths[0],
    gallery: imagePaths.slice(0, Math.max(2, Math.min(6, imagePaths.length))),
    rating: 4.7,
    warranty: category === 'laptops' ? '6 mois' : '3 mois',
    stock: product.is_available ? 'En stock' : 'Sur commande',
    description: textDescription || `${product.title} disponible chez MaiElectro Casablanca.`,
    specs: specsFromHtml(product.description).length ? specsFromHtml(product.description) : [['État', product.subtitle || 'Disponible'], ['Garantie', category === 'laptops' ? '6 mois' : '3 mois']],
    badge: product.ribbon_text || product.subtitle || (category === 'laptops' ? 'Garantie 6 mois' : 'Disponible'),
    featured: Boolean(product.site_product_selection) || index < 16,
    sourceUrl: `${BASE_URL}/products/${slug}`,
    sourceImageUrls: uniqueSourceImages,
    collectionTitles,
  };
};

const downloadSourceImage = async (url, destination) => {
  const response = await fetch(url, { headers: { 'User-Agent': 'TechProCatalogScraper/1.0' } });
  if (!response.ok) throw new Error(`image ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 5000) throw new Error('image too small');
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
};

const ensureImageFiles = async (products) => {
  for (const folder of categoryFolders) {
    await mkdir(join(publicRoot, 'images/products', folder), { recursive: true });
  }

  for (const product of products) {
    const folder = folderFor(product);
    const seed = seedMap[folder] || seedMap.laptops;

    for (let index = 0; index < product.gallery.length; index += 1) {
      const destination = localPath(product.gallery[index]);
      const sourceUrl = product.sourceImageUrls[index] || product.sourceImageUrls[0];
      let wrote = false;

      if (USE_SOURCE_IMAGES && sourceUrl) {
        try {
          await downloadSourceImage(sourceUrl, destination);
          wrote = true;
        } catch (error) {
          failed.push(`Image download failed for ${product.name}: ${sourceUrl} (${error.message})`);
        }
      }

      if (!wrote) {
        const seedPath = localPath(seed[index % seed.length]);
        if (await exists(seedPath)) {
          await mkdir(dirname(destination), { recursive: true });
          await copyFile(seedPath, destination);
          wrote = true;
        }
      }

      if (!wrote) failed.push(`No image available for ${product.name}: ${product.gallery[index]}`);
    }
  }
};

const productModule = (products) => `export const products = ${JSON.stringify(products.map(({ sourceImageUrls, collectionTitles, ...product }) => product), null, 2)};

export const getProductBySlug = (slug) => products.find((product) => product.slug === slug);

export const categoryMatchers = {
  laptops: (product) => product.category === 'laptops',
  macbook: (product) => product.subCategory === 'macbook',
  lenovo: (product) => product.category === 'laptops' && product.brand === 'Lenovo',
  dell: (product) => product.category === 'laptops' && product.brand === 'Dell',
  hp: (product) => product.category === 'laptops' && product.brand === 'HP',
  accessoires: (product) => product.category === 'accessoires',
  iphone: (product) => product.category === 'iphone',
  'pieces-detachees': (product) => product.category === 'pieces-detachees',
  reparation: (product) => product.category === 'pieces-detachees',
};

export const getProductsByCategory = (categoryId) => {
  const matcher = categoryMatchers[categoryId];
  return matcher ? products.filter(matcher) : [];
};
`;

const main = async () => {
  const [productsResponse, collectionsResponse] = await Promise.all([
    fetchAllProducts(),
    fetchJson(`${API_BASE}/collections`),
  ]);

  const collections = collectionsResponse.collections || [];
  const collectionMap = collectionTitleMap(collections);
  const normalized = productsResponse
    .map((product, index) => normalizeProduct(product, collectionMap, index))
    .filter((product, index, list) => list.findIndex((item) => item.slug === product.slug) === index);

  await writeFile(join(root, 'src/data/products.raw.json'), JSON.stringify({
    scrapedAt: new Date().toISOString(),
    source: BASE_URL,
    storeId: STORE_ID,
    useSourceImages: USE_SOURCE_IMAGES,
    collections,
    products: productsResponse,
    normalizedProducts: normalized,
  }, null, 2));

  await ensureImageFiles(normalized);
  await writeFile(join(root, 'src/data/products.js'), productModule(normalized));

  if (failed.length) {
    await writeFile(join(root, 'PRODUCT_SCRAPE_TODO.md'), `# Product Scrape TODO\n\nThe scraper completed with ${failed.length} warnings.\n\n${failed.map((item) => `- ${item}`).join('\n')}\n\nRun with source images only when authorized:\n\n\`\`\`bash\nUSE_SOURCE_IMAGES=true node scripts/scrape-products.js\n\`\`\`\n`);
  } else {
    await writeFile(join(root, 'PRODUCT_SCRAPE_TODO.md'), `# Product Scrape TODO\n\nScrape completed successfully.\n\nProducts extracted: ${normalized.length}\n\nSource images were ${USE_SOURCE_IMAGES ? 'downloaded from the reference store because USE_SOURCE_IMAGES=true was set' : 'not copied; safe local category photos were used'}.\n`);
  }

  console.log(`collections: ${collections.length}`);
  console.log(`products: ${normalized.length}`);
  console.log(`source images: ${USE_SOURCE_IMAGES ? 'enabled' : 'disabled'}`);
  console.log(`warnings: ${failed.length}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
