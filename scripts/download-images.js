import { mkdir, writeFile, copyFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { products } from '../src/data/products.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = join(root, 'public');
const todo = [];
const usedUrls = new Set();

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

const seedTargets = [
  {
    key: 'lenovo',
    files: ['/images/products/lenovo/__seed-1.jpg', '/images/products/lenovo/__seed-2.jpg'],
    queries: ['Lenovo ThinkPad laptop photo', 'ThinkPad laptop computer photo', 'Lenovo notebook computer photo'],
  },
  {
    key: 'dell',
    files: ['/images/products/dell/__seed-1.jpg', '/images/products/dell/__seed-2.jpg'],
    queries: ['Dell Latitude laptop photo', 'Dell laptop computer photo', 'Dell XPS laptop photo'],
  },
  {
    key: 'hp',
    files: ['/images/products/hp/__seed-1.jpg', '/images/products/hp/__seed-2.jpg'],
    queries: ['HP EliteBook laptop photo', 'HP laptop computer photo', 'HP Pavilion laptop photo'],
  },
  {
    key: 'macbook',
    files: ['/images/products/macbook/__seed-1.jpg', '/images/products/macbook/__seed-2.jpg'],
    queries: ['MacBook laptop photo', 'MacBook Air computer photo', 'MacBook Pro laptop photo'],
  },
  {
    key: 'iphone',
    files: ['/images/products/iphone/__seed-1.jpg', '/images/products/iphone/__seed-2.jpg'],
    queries: ['iPhone smartphone photo', 'Apple iPhone product photo', 'iPhone mobile phone photo'],
  },
  {
    key: 'accessoires',
    files: ['/images/products/accessoires/__seed-1.jpg', '/images/products/accessoires/__seed-2.jpg'],
    queries: ['computer accessories photo', 'computer mouse keyboard headphones photo', 'USB-C charger product photo'],
  },
  {
    key: 'pieces-detachees',
    files: ['/images/products/pieces-detachees/__seed-1.jpg', '/images/products/pieces-detachees/__seed-2.jpg'],
    queries: ['computer hardware parts photo', 'SSD RAM computer hardware photo', 'laptop battery replacement photo'],
  },
];

const staticTargets = [
  { path: '/images/hero/hero-electronics.jpg', from: 'lenovo', queries: ['laptop computer electronics desk photo', 'computer store laptops photo'] },
  { path: '/images/categories/laptops-real.jpg', from: 'lenovo' },
  { path: '/images/categories/macbook-real.jpg', from: 'macbook' },
  { path: '/images/categories/lenovo-real.jpg', from: 'lenovo' },
  { path: '/images/categories/dell-real.jpg', from: 'dell' },
  { path: '/images/categories/hp-real.jpg', from: 'hp' },
  { path: '/images/categories/iphone-real.jpg', from: 'iphone' },
  { path: '/images/categories/accessories-real.jpg', from: 'accessoires' },
  { path: '/images/categories/spare-parts-real.jpg', from: 'pieces-detachees' },
];

const folderKeyForProduct = (product) => {
  const parts = product.image.split('/');
  return parts[3];
};

const searchCommons = async (query) => {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');
  url.searchParams.set('generator', 'search');
  url.searchParams.set('gsrnamespace', '6');
  url.searchParams.set('gsrlimit', '10');
  url.searchParams.set('gsrsearch', `${query} filetype:bitmap`);
  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url|mime|size|extmetadata');
  url.searchParams.set('iiurlwidth', '1200');

  const response = await fetch(url, { headers: { 'User-Agent': 'TechProImageDownloader/1.0 (local project)' } });
  if (response.status === 429) {
    await sleep(20000);
    throw new Error('Commons rate limited this query');
  }
  if (!response.ok) throw new Error(`Commons search failed ${response.status}`);

  const data = await response.json();
  return Object.values(data.query?.pages || {})
    .map((page) => {
      const info = page.imageinfo?.[0];
      return {
        title: page.title,
        url: info?.thumburl || info?.url,
        mime: info?.mime,
        size: info?.size || 0,
        license: info?.extmetadata?.LicenseShortName?.value || 'open license',
      };
    })
    .filter((item) => item.url && /^image\/(jpeg|png|webp)$/i.test(item.mime || '') && item.size > 15000);
};

const downloadUrl = async (url, destination) => {
  const response = await fetch(url, { headers: { 'User-Agent': 'TechProImageDownloader/1.0 (local project)' } });
  if (response.status === 429) {
    await sleep(20000);
    throw new Error('Commons rate limited image download');
  }
  if (!response.ok) throw new Error(`Download failed ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 8000) throw new Error('Downloaded file too small');
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
};

const downloadSeed = async (target, fileIndex) => {
  const destination = localPath(target.files[fileIndex]);
  if (await exists(destination)) return true;

  for (const query of target.queries) {
    try {
      await sleep(2500);
      const candidates = await searchCommons(query);
      const candidate = candidates.find((item) => !usedUrls.has(item.url)) || candidates[0];
      if (!candidate) continue;
      usedUrls.add(candidate.url);
      await sleep(1000);
      await downloadUrl(candidate.url, destination);
      console.log(`downloaded ${target.key} seed ${fileIndex + 1}: ${candidate.title} (${candidate.license})`);
      return true;
    } catch (error) {
      console.log(`failed "${query}" for ${target.key}: ${error.message}`);
    }
  }

  return false;
};

const ensureSeeds = async () => {
  const availableSeeds = new Map();
  for (const target of seedTargets) {
    await mkdir(dirname(localPath(target.files[0])), { recursive: true });
    const first = await downloadSeed(target, 0);
    const second = await downloadSeed(target, 1);
    if (!second && first) await copyFile(localPath(target.files[0]), localPath(target.files[1]));

    if (await exists(localPath(target.files[0]))) {
      availableSeeds.set(target.key, target.files.map(localPath));
    } else {
      todo.push(`- Need seed photo for ${target.key}: ${target.files.join(', ')}`);
    }
  }
  return availableSeeds;
};

const copySeedsToProducts = async (seeds) => {
  for (const product of products) {
    const key = folderKeyForProduct(product);
    const seed = seeds.get(key) || seeds.get('lenovo');
    if (!seed) {
      todo.push(`- Missing product image seed for ${product.name}: ${product.image}`);
      continue;
    }

    await mkdir(dirname(localPath(product.image)), { recursive: true });
    await copyFile(seed[0], localPath(product.image));
    await copyFile(seed[1] || seed[0], localPath(product.gallery[1]));
  }
};

const ensureStaticImages = async (seeds) => {
  for (const target of staticTargets) {
    const destination = localPath(target.path);
    if (target.queries) {
      const downloaded = await downloadSeed({ key: target.path, files: [target.path, target.path], queries: target.queries }, 0);
      if (downloaded) continue;
    }

    const seed = seeds.get(target.from);
    if (seed) {
      await mkdir(dirname(destination), { recursive: true });
      await copyFile(seed[0], destination);
    } else {
      todo.push(`- Missing static image: ${target.path}`);
    }
  }
};

for (const folder of ['laptops', 'macbook', 'lenovo', 'dell', 'hp', 'iphone', 'accessoires', 'pieces-detachees']) {
  await mkdir(join(publicRoot, 'images/products', folder), { recursive: true });
}

const seeds = await ensureSeeds();
await copySeedsToProducts(seeds);
await ensureStaticImages(seeds);

if (todo.length) {
  await writeFile(join(root, 'IMAGE_TODO.md'), `# Image TODO\n\nThe site still runs, but these image tasks need manual review:\n\n${todo.join('\n')}\n`);
  console.log(`completed with ${todo.length} todo items`);
} else {
  await writeFile(join(root, 'IMAGE_TODO.md'), '# Image TODO\n\nAll product image files exist. Review downloaded photos before production use.\n');
  console.log('completed with no todo items');
}
