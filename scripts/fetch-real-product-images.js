import { access, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { products } from '../src/data/products.js';

const execFileAsync = promisify(execFile);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = join(root, 'public');
const webLimit = Number(process.env.WEB_IMAGE_LIMIT || 0);
const report = [];
const todos = [];
const usedUrls = new Set();

const folderMap = {
  lenovo: 'lenovo',
  dell: 'dell',
  hp: 'hp',
  macbook: 'macbook',
  iphone: 'iphone',
  accessoires: 'accessoires',
  'pieces-detachees': 'pieces-detachees',
};

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

const slugify = (value) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const folderFor = (product) => {
  if (product.category === 'iphone') return 'iphone';
  if (product.category === 'accessoires') return 'accessoires';
  if (product.category === 'pieces-detachees') return 'pieces-detachees';
  if (product.subCategory === 'macbook') return 'macbook';
  return folderMap[product.subCategory] || folderMap[product.brand?.toLowerCase()] || 'laptops';
};

const imagePaths = (product) => {
  const folder = folderFor(product);
  const cleanSlug = slugify(product.slug || product.name);
  const base = `/images/products/${folder}/${cleanSlug}`;
  return {
    image: `${base}-main.jpg`,
    gallery: [`${base}-main.jpg`, `${base}-2.jpg`, `${base}-3.jpg`],
  };
};

const exactQueries = (product) => [
  `${product.name} official product image`,
  `${product.name} white background`,
  `${product.name} product photo`,
  `${product.name} ecommerce image`,
  `${product.name} front view`,
  `${product.name} gallery images`,
];

const forbidden = [
  'person', 'people', 'human', 'man ', 'woman', 'girl', 'boy', 'hand', 'hands',
  'holding', 'using', 'office', 'desk', 'workplace', 'student', 'lifestyle',
  'unsplash', 'selfie', 'portrait', 'room', 'coffee',
];

const meaningfulTokens = (product) => product.name
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .split(/[^a-z0-9]+/)
  .filter((token) => token.length >= 3 && !['avec', 'pour', 'occasion', 'original', 'pouces', 'generation', 'ram', 'ssd', 'usb'].includes(token));

const isRelevantCommonsResult = (candidate, product) => {
  const title = candidate.title.toLowerCase();
  if (forbidden.some((word) => title.includes(word))) return false;
  const tokens = meaningfulTokens(product);
  const required = tokens.slice(0, Math.min(3, tokens.length));
  return required.every((token) => title.includes(token)) || tokens.filter((token) => title.includes(token)).length >= 3;
};

const searchCommons = async (query, product) => {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');
  url.searchParams.set('generator', 'search');
  url.searchParams.set('gsrnamespace', '6');
  url.searchParams.set('gsrlimit', '8');
  url.searchParams.set('gsrsearch', `${query} filetype:bitmap`);
  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url|mime|size|extmetadata');
  url.searchParams.set('iiurlwidth', '1200');

  const response = await fetch(url, {
    headers: { 'User-Agent': 'TechProExactProductImageFixer/1.0' },
    signal: AbortSignal.timeout(9000),
  });
  if (!response.ok) throw new Error(`Commons ${response.status}`);
  const data = await response.json();
  return Object.values(data.query?.pages || [])
    .map((page) => {
      const info = page.imageinfo?.[0];
      return {
        title: page.title,
        url: info?.thumburl || info?.url,
        mime: info?.mime || '',
        size: info?.size || 0,
        license: info?.extmetadata?.LicenseShortName?.value || 'open license',
      };
    })
    .filter((candidate) => candidate.url && /^image\/(jpeg|png|webp)$/i.test(candidate.mime) && candidate.size > 12000)
    .filter((candidate) => isRelevantCommonsResult(candidate, product));
};

const download = async (url, destination) => {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'TechProExactProductImageFixer/1.0' },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`image ${response.status}`);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) throw new Error(`not image ${contentType}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 5000) throw new Error('image too small');
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
};

const tryOpenLicenseImages = async (product, paths) => {
  const found = [];
  for (const query of exactQueries(product)) {
    if (found.length >= 3) break;
    try {
      await sleep(500);
      const candidates = await searchCommons(query, product);
      for (const candidate of candidates) {
        if (found.length >= 3) break;
        if (usedUrls.has(candidate.url)) continue;
        usedUrls.add(candidate.url);
        const destination = localPath(paths.gallery[found.length]);
        await download(candidate.url, destination);
        found.push(candidate);
      }
    } catch {
      // Keep going; failed exact searches are reported as manual TODOs below.
    }
  }
  return found;
};

const productKind = (product) => {
  const text = product.name.toLowerCase();
  if (product.category === 'iphone' || text.includes('iphone')) return 'phone';
  if (text.includes('chargeur') || text.includes('charger')) return 'charger';
  if (text.includes('batterie') || text.includes('battery')) return 'battery';
  if (text.includes('clavier') || text.includes('keyboard')) return 'keyboard';
  if (text.includes('ecran') || text.includes('écran') || text.includes('screen')) return 'screen';
  if (text.includes('ssd')) return 'ssd';
  if (text.includes('ram')) return 'ram';
  if (text.includes('souris') || text.includes('mouse')) return 'mouse';
  if (text.includes('airpods') || text.includes('casque')) return 'audio';
  if (text.includes('sac') || text.includes('sacoche')) return 'bag';
  if (text.includes('hub') || text.includes('adaptateur')) return 'hub';
  if (text.includes('carte mere') || text.includes('carte mère')) return 'board';
  if (text.includes('cable') || text.includes('câble') || text.includes('nappe')) return 'cable';
  return 'laptop';
};

const paletteFor = (product) => {
  if (product.brand === 'Lenovo') return ['#111827', '#ef4444'];
  if (product.brand === 'Dell') return ['#0f172a', '#2563eb'];
  if (product.brand === 'HP') return ['#1f2937', '#0ea5e9'];
  if (product.brand === 'Apple') return ['#475569', '#e5e7eb'];
  return ['#111827', '#f59e0b'];
};

const svgForProduct = (product, view = 0) => {
  const [dark, accent] = paletteFor(product);
  const kind = productKind(product);
  const title = product.name.replace(/&/g, '&amp;').slice(0, 58);
  const subtitle = `${product.brand} • ${product.subCategory}`.replace(/&/g, '&amp;');
  const angle = view === 1 ? 'rotate(-3 600 360)' : view === 2 ? 'rotate(3 600 360)' : '';

  const drawings = {
    laptop: `<g transform="${angle}"><rect x="240" y="125" width="720" height="430" rx="28" fill="${dark}"/><rect x="292" y="177" width="616" height="326" rx="18" fill="#f8fafc"/><path d="M195 570h810l-80 82H275z" fill="#334155"/><rect x="450" y="596" width="300" height="22" rx="11" fill="${accent}"/></g>`,
    phone: `<g transform="${angle}"><rect x="455" y="85" width="290" height="610" rx="62" fill="${dark}"/><rect x="485" y="136" width="230" height="500" rx="38" fill="#f8fafc"/><rect x="555" y="103" width="90" height="20" rx="10" fill="#020617"/><circle cx="600" cy="664" r="14" fill="${accent}"/></g>`,
    charger: `<g><rect x="415" y="210" width="310" height="260" rx="38" fill="${dark}"/><rect x="465" y="145" width="38" height="80" rx="10" fill="#94a3b8"/><rect x="635" y="145" width="38" height="80" rx="10" fill="#94a3b8"/><path d="M725 335c150 0 150 185 0 185" fill="none" stroke="${accent}" stroke-width="24"/></g>`,
    battery: `<g><rect x="330" y="265" width="510" height="210" rx="34" fill="${dark}"/><rect x="840" y="330" width="70" height="80" rx="14" fill="${dark}"/><rect x="385" y="315" width="170" height="110" rx="18" fill="${accent}"/></g>`,
    keyboard: `<g><rect x="230" y="260" width="740" height="260" rx="32" fill="${dark}"/><g fill="#f8fafc"><rect x="280" y="310" width="80" height="42" rx="8"/><rect x="385" y="310" width="80" height="42" rx="8"/><rect x="490" y="310" width="80" height="42" rx="8"/><rect x="595" y="310" width="80" height="42" rx="8"/><rect x="700" y="310" width="80" height="42" rx="8"/><rect x="805" y="310" width="80" height="42" rx="8"/><rect x="330" y="395" width="420" height="50" rx="10"/><rect x="775" y="395" width="120" height="50" rx="10"/></g></g>`,
    screen: `<g><rect x="255" y="120" width="690" height="455" rx="26" fill="${dark}"/><rect x="310" y="175" width="580" height="345" rx="16" fill="#e0f2fe"/></g>`,
    ssd: `<g><rect x="390" y="170" width="420" height="360" rx="38" fill="${accent}"/><circle cx="475" cy="255" r="30" fill="#fef3c7"/><rect x="545" y="235" width="170" height="35" rx="10" fill="#f8fafc"/><rect x="485" y="355" width="250" height="55" rx="14" fill="#f8fafc"/></g>`,
    ram: `<g><rect x="240" y="300" width="720" height="165" rx="24" fill="#166534"/><g fill="#bbf7d0"><rect x="300" y="345" width="85" height="58" rx="8"/><rect x="425" y="345" width="85" height="58" rx="8"/><rect x="550" y="345" width="85" height="58" rx="8"/><rect x="675" y="345" width="85" height="58" rx="8"/></g></g>`,
    mouse: `<g><rect x="510" y="125" width="230" height="450" rx="115" fill="${dark}"/><path d="M625 145v155" stroke="${accent}" stroke-width="14"/><circle cx="625" cy="292" r="24" fill="#f8fafc"/></g>`,
    audio: `<g><path d="M350 420c0-150 100-260 250-260s250 110 250 260" fill="none" stroke="${dark}" stroke-width="45" stroke-linecap="round"/><rect x="285" y="390" width="120" height="180" rx="38" fill="${accent}"/><rect x="795" y="390" width="120" height="180" rx="38" fill="${accent}"/></g>`,
    bag: `<g><rect x="270" y="245" width="660" height="330" rx="42" fill="${dark}"/><path d="M440 245v-70h320v70" fill="none" stroke="${accent}" stroke-width="34" stroke-linecap="round"/><rect x="340" y="315" width="520" height="115" rx="22" fill="#1f2937"/></g>`,
    hub: `<g><rect x="260" y="285" width="680" height="190" rx="38" fill="${dark}"/><g fill="#f8fafc"><rect x="335" y="350" width="95" height="55" rx="12"/><rect x="465" y="350" width="95" height="55" rx="12"/><rect x="595" y="350" width="95" height="55" rx="12"/><rect x="725" y="350" width="95" height="55" rx="12"/></g></g>`,
    board: `<g><rect x="330" y="160" width="540" height="420" rx="36" fill="#166534"/><rect x="430" y="270" width="180" height="140" rx="18" fill="#bbf7d0"/><rect x="650" y="230" width="120" height="85" rx="14" fill="#dbeafe"/><rect x="650" y="360" width="140" height="45" rx="10" fill="${accent}"/></g>`,
    cable: `<g><path d="M285 420c125-210 420 160 600-120" fill="none" stroke="${dark}" stroke-width="42" stroke-linecap="round"/><rect x="220" y="380" width="130" height="95" rx="18" fill="${accent}"/><rect x="820" y="245" width="130" height="95" rx="18" fill="${accent}"/></g>`,
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
<rect width="1200" height="900" fill="#ffffff"/>
<rect x="70" y="70" width="1060" height="760" rx="42" fill="#f8fafc" stroke="#e5e7eb"/>
<ellipse cx="600" cy="705" rx="310" ry="36" fill="#e2e8f0"/>
${drawings[kind] || drawings.laptop}
<text x="600" y="790" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="800" fill="#0f172a">${title}</text>
<text x="600" y="835" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#64748b">${subtitle}</text>
</svg>`;
};

const generateProductOnlyImage = async (product, destination, view) => {
  const svg = svgForProduct(product, view);
  await mkdir(dirname(destination), { recursive: true });
  const tempSvg = join(root, `.tmp-product-image-${process.pid}-${Math.random().toString(16).slice(2)}.svg`);
  await writeFile(tempSvg, svg);
  try {
    await execFileAsync('convert', [tempSvg, '-resize', '1000x750', '-quality', '92', destination], { timeout: 15000, maxBuffer: 1024 * 1024 });
  } finally {
    await rm(tempSvg, { force: true });
  }
};

const updateProductsFile = async (updatedProducts) => {
  const file = join(root, 'src/data/products.js');
  const existing = await readFile(file, 'utf8');
  const replacement = JSON.stringify(updatedProducts, null, 2);
  const next = existing.replace(/export const products = [\s\S]*?;\n\nexport const getProductBySlug/, `export const products = ${replacement};\n\nexport const getProductBySlug`);
  await writeFile(file, next);
};

const updatedProducts = [];
let webAttempts = 0;

for (const product of products) {
  const paths = imagePaths(product);
  const nextProduct = { ...product, image: paths.image, gallery: paths.gallery };
  updatedProducts.push(nextProduct);
  let exactSources = [];

  if (webAttempts < webLimit) {
    webAttempts += 1;
    exactSources = await tryOpenLicenseImages(nextProduct, paths);
  }

  for (let index = 0; index < paths.gallery.length; index += 1) {
    const destination = localPath(paths.gallery[index]);
    if (!(await exists(destination))) {
      await generateProductOnlyImage(nextProduct, destination, index);
    }
  }

  const sourceNote = exactSources.length
    ? `Exact/close open-license result(s): ${exactSources.map((item) => `${item.title} (${item.license})`).join('; ')}`
    : 'Temporary product-only catalog image generated. Exact open-license image not found or web search not enabled for this run.';

  report.push({
    name: nextProduct.name,
    main: nextProduct.image,
    gallery: nextProduct.gallery,
    sourceNote,
    match: exactSources.length >= 1 ? 'exact-or-close-open-license' : 'manual-needed',
  });

  if (!exactSources.length) {
    todos.push({
      product: nextProduct.name,
      filename: nextProduct.image,
      queries: exactQueries(nextProduct),
      note: 'Replace temporary product-only catalog image with an exact legal product-only photo.',
    });
  }
}

await updateProductsFile(updatedProducts);

const missing = [];
for (const product of updatedProducts) {
  for (const image of [product.image, ...product.gallery]) {
    if (!(await exists(localPath(image)))) missing.push(`${product.name}: ${image}`);
  }
}

await writeFile(join(root, 'IMAGE_FIX_REPORT.md'), `# Image Fix Report

Strict cleanup applied: no reference lifestyle/AI-looking images are used as active images by this script.

Products checked: ${updatedProducts.length}
Missing files: ${missing.length}
Open-license web search attempts: ${webAttempts}
Manual replacements needed: ${todos.length}

## Product Results

${report.map((item) => `- ${item.name}
  - Main: ${item.main}
  - Gallery: ${item.gallery.join(', ')}
  - Match: ${item.match}
  - Notes: ${item.sourceNote}`).join('\n')}

## Missing Files

${missing.length ? missing.map((item) => `- ${item}`).join('\n') : '- None'}
`);

await writeFile(join(root, 'IMAGE_TODO.md'), `# Image TODO

These products currently use clean temporary product-only catalog images because a legal exact product-only image was not found during the automated run.

Run a deeper search for a smaller batch with:

\`\`\`bash
WEB_IMAGE_LIMIT=25 node scripts/fetch-real-product-images.js
\`\`\`

Manual replacement rules:
- Use product-only photos only.
- No people, hands, faces, desks, offices, or lifestyle scenes.
- Use exact model where possible, otherwise same brand and same model family.

${todos.map((item) => `## ${item.product}
- Expected main filename: ${item.filename}
- Note: ${item.note}
- Search queries:
${item.queries.map((query) => `  - ${query}`).join('\n')}`).join('\n\n')}
`);

console.log(`products: ${updatedProducts.length}`);
console.log(`openLicenseMatches: ${report.filter((item) => item.match !== 'manual-needed').length}`);
console.log(`manualNeeded: ${todos.length}`);
console.log(`missing: ${missing.length}`);
if (missing.length) process.exit(1);
