import { mkdir, readFile, writeFile, copyFile, access, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { products } from '../src/data/products.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = join(root, 'public');
const report = [];
const failures = [];

const localPath = (publicPath) => join(publicRoot, publicPath.replace(/^\//, ''));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const validImageFile = async (path) => {
  try {
    const details = await stat(path);
    return details.size > 3000;
  } catch {
    return false;
  }
};

const sourceRaw = JSON.parse(await readFile(join(root, 'src/data/products.raw.json'), 'utf8'));
const rawBySlug = new Map((sourceRaw.normalizedProducts || []).map((product) => [product.slug, product]));

const downloadImage = async (url, destination) => {
  if (await validImageFile(destination)) return 'skipped';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'User-Agent': 'TechProImageFixer/1.0',
    },
  });
  clearTimeout(timeout);

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) throw new Error(`not an image: ${contentType}`);

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 3000) throw new Error('image too small');

  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  return 'downloaded';
};

const ensureAtLeastThreeGalleryFiles = async (product) => {
  const gallery = product.gallery?.length ? product.gallery : [product.image];
  const firstExisting = gallery.find((item) => item && item.endsWith('.jpg') && item !== product.image) || product.image;
  const sourcePath = localPath(firstExisting);
  const fallbackPath = localPath(product.image);
  const copySource = await exists(sourcePath) ? sourcePath : fallbackPath;

  for (const item of gallery.slice(0, 3)) {
    const destination = localPath(item);
    if (!(await exists(destination)) && await exists(copySource)) {
      await mkdir(dirname(destination), { recursive: true });
      await copyFile(copySource, destination);
    }
  }
};

for (const product of products) {
  const raw = rawBySlug.get(product.slug);
  const sourceImages = [...new Set(raw?.sourceImageUrls || [])].filter(Boolean);
  const gallery = product.gallery?.length ? product.gallery : [product.image];

  if (!sourceImages.length) {
    report.push(`- ${product.name}: No exact source image URL found. Manual image required for ${product.image}.`);
    await ensureAtLeastThreeGalleryFiles(product);
    continue;
  }

  const targetCount = Math.min(Math.max(3, Math.min(gallery.length, sourceImages.length)), gallery.length);
  let downloaded = 0;

  for (let index = 0; index < targetCount; index += 1) {
    const sourceUrl = sourceImages[index] || sourceImages[0];
    const destination = localPath(gallery[index]);

    try {
      await sleep(120);
      await downloadImage(sourceUrl, destination);
      downloaded += 1;
    } catch (error) {
      failures.push(`${product.name}: ${sourceUrl} -> ${error.message}`);
    }
  }

  if (downloaded < 3) {
    await ensureAtLeastThreeGalleryFiles(product);
    report.push(`- ${product.name}: ${downloaded} exact source image(s) downloaded. Add more exact gallery photos if needed.`);
  }
}

const missing = [];
for (const product of products) {
  const required = [product.image, ...(product.gallery || []).slice(0, 3)];
  for (const image of required) {
    if (!(await exists(localPath(image)))) missing.push(`${product.name}: ${image}`);
  }
}

await writeFile(join(root, 'IMAGE_FIX_REPORT.md'), `# Image Fix Report

Source used: MaiElectro Hostinger ecommerce API backup in \`src/data/products.raw.json\`.

The downloaded images are exact source product images from the reference catalog. Confirm permission/ownership before production use. If permission is not available, replace listed images with open-license exact model photos.

Products checked: ${products.length}
Missing required images: ${missing.length}
Download failures: ${failures.length}

## Products Needing Manual Review

${report.length ? report.join('\n') : '- None'}

## Missing Files

${missing.length ? missing.map((item) => `- ${item}`).join('\n') : '- None'}

## Failed Downloads

${failures.length ? failures.map((item) => `- ${item}`).join('\n') : '- None'}
`);

console.log(`products checked: ${products.length}`);
console.log(`manual review: ${report.length}`);
console.log(`missing: ${missing.length}`);
console.log(`failed downloads: ${failures.length}`);

if (missing.length) process.exit(1);
