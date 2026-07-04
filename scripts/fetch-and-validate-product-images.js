import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const productsPath = path.join(root, 'src/data/products.js');
const rawPath = path.join(root, 'src/data/products.raw.json');
const reportPath = path.join(root, 'IMAGE_FIX_REPORT.md');
const todoPath = path.join(root, 'IMAGE_TODO.md');

const maxGalleryImages = Number(process.env.MAX_GALLERY_IMAGES || 4);
const throttleMs = Number(process.env.IMAGE_FETCH_DELAY_MS || 120);
const requestTimeoutMs = Number(process.env.IMAGE_REQUEST_TIMEOUT_MS || 12000);
const concurrency = Number(process.env.IMAGE_FETCH_CONCURRENCY || 8);

const folderByCategory = {
  iphone: 'iphone',
  laptops: 'laptops',
  macbook: 'macbook',
  accessoires: 'accessoires',
  'pieces-detachees': 'pieces-detachees',
  reparation: 'repair',
};

const manualImageOverrides = {
  'apple-pencil-pro-stylet-professionnel-haute-precision-pour-ipad': [
    '/images/products/accessoires/apple-pencil-pro-clean-main.jpg',
    '/images/products/accessoires/apple-pencil-pro-clean-2.jpg',
  ],
  'apple-pencil-2nd-generation-precision-et-fluidite-pour-ipad': [
    '/images/products/accessoires/apple-pencil-2nd-generation-clean-main.jpg',
    '/images/products/accessoires/apple-pencil-2nd-generation-clean-2.jpg',
  ],
  'apple-airpods-max-2': [
    '/images/products/accessoires/apple-airpods-max-2-2.jpg',
    '/images/products/accessoires/apple-airpods-max-2-3.jpg',
    '/images/products/accessoires/apple-airpods-max-2-4.jpg',
  ],
};

const brandFolder = (product) => {
  const brand = String(product.brand || '').toLowerCase();
  const name = String(product.name || '').toLowerCase();
  if (product.category === 'iphone' || name.includes('iphone')) return 'iphone';
  if (product.category === 'accessoires') return 'accessoires';
  if (product.category === 'pieces-detachees') return 'pieces-detachees';
  if (name.includes('macbook') || name.includes('ipad')) return 'macbook';
  if (brand.includes('lenovo') || name.includes('lenovo') || name.includes('thinkpad') || name.includes('ideapad')) return 'lenovo';
  if (brand.includes('dell') || name.includes('dell') || name.includes('latitude') || name.includes('xps')) return 'dell';
  if (brand.includes('hp') || name.includes('hp') || name.includes('elitebook') || name.includes('zbook')) return 'hp';
  return folderByCategory[product.category] || product.category || 'laptops';
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const slugify = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 110);

const imageExt = (contentType, url) => {
  const fromType = String(contentType || '').toLowerCase();
  if (fromType.includes('png')) return 'png';
  if (fromType.includes('webp')) return 'webp';
  if (fromType.includes('jpeg') || fromType.includes('jpg')) return 'jpg';
  const cleanUrl = decodeURIComponent(url).split('?')[0];
  const ext = path.extname(cleanUrl).replace('.', '').toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? (ext === 'jpeg' ? 'jpg' : ext) : 'jpg';
};

const imageSize = (filePath) => {
  try {
    const output = execFileSync('identify', ['-format', '%w %h', filePath], { encoding: 'utf8' }).trim();
    const [width, height] = output.split(/\s+/).map(Number);
    return { width, height };
  } catch {
    return { width: 0, height: 0 };
  }
};

const isGeneratedFallback = (filePath) => {
  const { width, height } = imageSize(filePath);
  return width === 1000 && height === 750;
};

const downloadImage = async (url, targetPath) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      'user-agent': 'Mozilla/5.0 TechProImageValidator/1.0',
      accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    },
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 1500) {
    throw new Error('downloaded image is too small');
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, buffer);
};

const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
const rawProducts = new Map((rawData.products || []).map((item) => [item.slug || item.url_handle, item]));
const { products } = await import(`${pathToFileURL(productsPath).href}?v=${Date.now()}`);

const report = [];
const todos = [];
const missing = [];

const processProduct = async (product, productIndex) => {
  if ((productIndex + 1) % 10 === 1 || productIndex === products.length - 1) {
    console.log(`Processing ${productIndex + 1}/${products.length}: ${product.name}`);
  }
  const raw = rawProducts.get(product.slug);
  const folder = brandFolder(product);
  const slug = slugify(product.slug || product.name);
  const outDir = path.join(root, 'public/images/products', folder);
  fs.mkdirSync(outDir, { recursive: true });

  const urls = [...new Set((raw?.images || [])
    .filter((item) => item?.url)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item) => item.url))]
    .slice(0, maxGalleryImages);

  const localImages = [];
  const notes = [];

  for (let index = 0; index < urls.length; index += 1) {
    const url = urls[index];
    const extensionGuess = imageExt('', url);
    const name = index === 0 ? `${slug}-main.${extensionGuess}` : `${slug}-${index + 1}.${extensionGuess}`;
    const target = path.join(outDir, name);

    try {
      await downloadImage(url, target);
      if (isGeneratedFallback(target)) {
        notes.push(`Rejected generated-looking fallback image: ${name}`);
        fs.unlinkSync(target);
      } else {
        localImages.push(`/images/products/${folder}/${name}`);
      }
      await sleep(throttleMs);
    } catch (error) {
      notes.push(`Failed ${url}: ${error.message}`);
    }
  }

  if (!localImages.length) {
    const existing = fs.existsSync(outDir)
      ? fs.readdirSync(outDir)
        .filter((file) => file.startsWith(slug) && /\.(jpe?g|png|webp)$/i.test(file))
        .map((file) => path.join(outDir, file))
        .filter((file) => !isGeneratedFallback(file))
        .slice(0, maxGalleryImages)
      : [];

    for (const file of existing) {
      localImages.push(`/images/products/${folder}/${path.basename(file)}`);
    }
  }

  const finalImages = manualImageOverrides[product.slug] || (localImages.length ? localImages : [product.image, ...(product.gallery || [])].filter(Boolean));
  const uniqueImages = [...new Set(finalImages)].slice(0, maxGalleryImages);

  const updated = {
    ...product,
    image: uniqueImages[0] || product.image,
    gallery: uniqueImages,
  };

  const imageStatus = localImages.length
    ? (localImages.length >= 2 ? 'exact-or-source-gallery' : 'source-single-image')
    : 'manual-needed';

  return {
    updated,
    todo: (!localImages.length || uniqueImages.length < 2)
      ? {
          product,
          folder,
          expected: `/images/products/${folder}/${slug}-main.jpg`,
          notes,
        }
      : null,
    reportItem: {
    name: product.name,
    main: updated.image,
    gallery: updated.gallery,
    match: imageStatus,
    notes,
    sourceUrl: product.sourceUrl,
    },
  };
};

const results = new Array(products.length);
let nextIndex = 0;

const worker = async () => {
  while (nextIndex < products.length) {
    const index = nextIndex;
    nextIndex += 1;
    results[index] = await processProduct(products[index], index);
  }
};

await Promise.all(Array.from({ length: Math.min(concurrency, products.length) }, () => worker()));

const updatedProducts = results.map((result) => result.updated);
for (const result of results) {
  report.push(result.reportItem);
  if (result.todo) todos.push(result.todo);
}

const helperExports = `
const normalizeText = (value) => String(value || '').toLowerCase();

export const getProductBySlug = (slug) => products.find((product) => product.slug === slug);

export const getProductsByCategory = (categoryId) => {
  const category = normalizeText(categoryId);
  if (!category || category === 'shop') return products;

  if (category === 'laptops') {
    return products.filter((product) => product.category === 'laptops');
  }

  if (category === 'macbook') {
    return products.filter((product) => {
      const name = normalizeText(product.name);
      const brand = normalizeText(product.brand);
      return product.category === 'laptops' && (/macbook|ipad/.test(name) || brand.includes('apple'));
    });
  }

  if (['lenovo', 'dell', 'hp'].includes(category)) {
    return products.filter((product) => {
      const brand = normalizeText(product.brand);
      const name = normalizeText(product.name);
      return product.category === 'laptops' && (brand.includes(category) || name.includes(category));
    });
  }

  return products.filter((product) => product.category === category || product.subCategory === category);
};
`;

const fileBody = `export const products = ${JSON.stringify(updatedProducts, null, 2)};\n${helperExports}`;
fs.writeFileSync(productsPath, fileBody);

for (const product of updatedProducts) {
  for (const image of [product.image, ...(product.gallery || [])]) {
    const local = path.join(root, 'public', image.replace(/^\//, ''));
    if (!fs.existsSync(local)) {
      missing.push({ product: product.name, image });
    }
  }
}

const reportLines = [
  '# Image Fix Report',
  '',
  `Generated fallback product images have been removed from active product data where source product photos were available.`,
  '',
  `Products checked: ${updatedProducts.length}`,
  `Missing referenced files: ${missing.length}`,
  `Products still needing manual legal image review: ${todos.length}`,
  '',
  'Source note: images are local files. The automatic fetch uses the original catalog image URLs from `src/data/products.raw.json`; confirm usage rights before production if the reference catalog is not yours.',
  '',
  '## Product Results',
  '',
];

for (const item of report) {
  reportLines.push(`- ${item.name}`);
  reportLines.push(`  - Main: ${item.main}`);
  reportLines.push(`  - Gallery: ${item.gallery.join(', ')}`);
  reportLines.push(`  - Match: ${item.match}`);
  if (item.notes.length) reportLines.push(`  - Notes: ${item.notes.join(' | ')}`);
  if (item.sourceUrl) reportLines.push(`  - Source page: ${item.sourceUrl}`);
}

if (missing.length) {
  reportLines.push('', '## Missing Files', '');
  for (const item of missing) {
    reportLines.push(`- ${item.product}: ${item.image}`);
  }
}

fs.writeFileSync(reportPath, `${reportLines.join('\n')}\n`);

const todoLines = [
  '# Image TODO',
  '',
  'These products need a manual legal-source image review or additional gallery images.',
  '',
];

for (const item of todos) {
  const queryName = item.product.name.replace(/\s+/g, ' ');
  todoLines.push(`## ${item.product.name}`);
  todoLines.push(`- Expected main filename: ${item.expected}`);
  todoLines.push(`- Search query: ${queryName} official product image white background`);
  todoLines.push(`- Search query: ${queryName} product photo ecommerce image`);
  if (item.notes.length) todoLines.push(`- Notes: ${item.notes.join(' | ')}`);
  todoLines.push('');
}

fs.writeFileSync(todoPath, `${todoLines.join('\n')}\n`);

console.log({
  products: updatedProducts.length,
  missing: missing.length,
  manualReview: todos.length,
});

if (missing.length) process.exit(1);
