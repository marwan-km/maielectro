import fs from 'node:fs/promises';
import fssync from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import dotenv from 'dotenv';

const ROOT_DIR = process.cwd();
const REPORT_FILE = path.join(ROOT_DIR, 'image-audit-report.json');
const TRASH_DIR = path.join(ROOT_DIR, '_trash_local_images');
const TABLES = ['products', 'categories', 'repair_services', 'blog_posts', 'site_settings'];
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico', '.avif']);
const IMAGE_NAME_PARTS = ['image', 'images', 'gallery', 'gallery_images', 'thumbnail', 'thumbnail_url', 'cover', 'cover_url', 'logo', 'logo_url', 'favicon', 'avatar', 'photo', 'photos', 'banner', 'banner_url'];
const CODE_TEXT_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json', '.html', '.md', '.css', '.scss', '.sql', '.txt', '.yml', '.yaml', '.webmanifest']);
const SUPABASE_URL_CHECK_CONCURRENCY = Math.max(1, Number.parseInt(process.env.IMAGE_URL_CHECK_CONCURRENCY || '4', 10) || 4);

dotenv.config({ path: path.join(ROOT_DIR, '.env') });
dotenv.config({ path: path.join(ROOT_DIR, '.env.local'), override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
const IMAGE_AUDIT_TIMEOUT_MS = Math.max(30000, Number.parseInt(process.env.IMAGE_AUDIT_TIMEOUT_MS || '30000', 10) || 30000);
const IMAGE_URL_TIMEOUT_MS = Math.max(10000, Number.parseInt(process.env.IMAGE_URL_TIMEOUT_MS || '20000', 10) || 20000);
const IMAGE_URL_RETRIES = Math.max(1, Number.parseInt(process.env.IMAGE_URL_RETRIES || '3', 10) || 3);

const args = new Set(process.argv.slice(2));
const moveUnused = args.has('--move-unused');
const deleteUnused = args.has('--delete-unused');

const warnings = [];

const isAbsoluteHttpUrl = (value) => /^https?:\/\//i.test(String(value || ''));
const isDataImage = (value) => /^data:image\//i.test(String(value || ''));

function normalizePosix(input) {
  return String(input || '').split(path.sep).join('/');
}

function hasImageExtension(value) {
  const clean = String(value || '').split('?')[0].split('#')[0];
  return IMAGE_EXTENSIONS.has(path.posix.extname(clean).toLowerCase());
}

function isImageLikeKey(keyPath) {
  const lower = String(keyPath || '').toLowerCase();
  return IMAGE_NAME_PARTS.some((part) => lower.split('.').some((segment) => segment.includes(part)) || lower.includes(part));
}

function looksLikeImageValue(value, keyPath = '') {
  const text = String(value || '').trim();
  if (!text) return false;
  if (isDataImage(text)) return true;
  if (isAbsoluteHttpUrl(text) || text.startsWith('/')) {
    if (hasImageExtension(text)) return true;
    if (text.includes('/storage/v1/object/public/')) return true;
    if (isImageLikeKey(keyPath)) return true;
  }
  return false;
}

function parseMaybeJson(text) {
  if (typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function walkImageValues(value, keyPath, sink, context) {
  if (value == null) return;

  if (typeof value === 'string') {
    const parsed = parseMaybeJson(value);
    if (parsed && parsed !== value) {
      walkImageValues(parsed, keyPath, sink, context);
      return;
    }

    if (looksLikeImageValue(value, keyPath)) {
      sink.push({
        table: context.table,
        rowIndex: context.rowIndex,
        columnPath: keyPath || context.column || '',
        rawValue: value,
        kind: context.kind,
      });
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      walkImageValues(item, keyPath ? `${keyPath}[${index}]` : `[${index}]`, sink, context);
    });
    return;
  }

  if (typeof value === 'object') {
    for (const [childKey, childValue] of Object.entries(value)) {
      const childPath = keyPath ? `${keyPath}.${childKey}` : childKey;
      walkImageValues(childValue, childPath, sink, context);
    }
  }
}

async function fetchJsonPage(table, from, to) {
  const timeoutMs = IMAGE_AUDIT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs);
  try {
    const url = new URL(`/rest/v1/${table}`, supabaseUrl);
    url.searchParams.set('select', '*');
    url.searchParams.set('limit', String(to - from + 1));
    url.searchParams.set('offset', String(from));

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: supabaseAnonKey,
        authorization: `Bearer ${supabaseAnonKey}`,
        accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
    }

    return (await response.json()) || [];
  } finally {
    clearTimeout(timer);
  }
}

async function loadSupabaseRows(table) {
  const rows = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const page = await fetchJsonPage(table, offset, offset + pageSize - 1);
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}

function uniqueByKey(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, item);
  }
  return [...map.values()];
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  });

  await Promise.all(workers);
  return results;
}

function stripQueryAndHash(value) {
  return String(value || '').split('?')[0].split('#')[0];
}

function localCandidatesForFile(filePath) {
  const rel = normalizePosix(path.relative(ROOT_DIR, filePath));
  const base = path.posix.basename(rel);
  const candidates = new Set([rel, `/${rel}`, base, `/${base}`]);

  if (rel.startsWith('public/')) {
    const publicRel = rel.slice('public/'.length);
    candidates.add(`/${publicRel}`);
    candidates.add(publicRel);
  }

  if (rel.startsWith('logo/')) {
    candidates.add(`/logo/${base}`);
    candidates.add(`logo/${base}`);
  }

  return [...candidates];
}

async function collectFiles(dir) {
  const out = [];
  if (!fssync.existsSync(dir)) return out;

  const walk = async (current) => {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === '_trash_local_images') {
        continue;
      }
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      const ext = path.posix.extname(entry.name).toLowerCase();
      if (IMAGE_EXTENSIONS.has(ext)) out.push(full);
    }
  };

  await walk(dir);
  return out;
}

async function collectTextFiles(rootDir) {
  const out = [];
  const scanPaths = [
    'src',
    'public',
    'index.html',
    'package.json',
    'package-lock.json',
    'README.md',
    'vite.config.js',
    'tailwind.config.js',
    'postcss.config.js',
    '.env.example',
  ];

  const walk = async (current) => {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === '_trash_local_images') {
        continue;
      }
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      const ext = path.posix.extname(entry.name).toLowerCase();
      if (CODE_TEXT_EXTENSIONS.has(ext) || entry.name === 'package.json' || entry.name === 'package-lock.json' || entry.name === '.env.example') {
        out.push(full);
      }
    }
  };

  for (const rel of scanPaths) {
    const full = path.join(rootDir, rel);
    if (!fssync.existsSync(full)) continue;
    const stat = fssync.statSync(full);
    if (stat.isDirectory()) {
      await walk(full);
    } else {
      out.push(full);
    }
  }
  return out;
}

function extractReferencedPaths(fileContent) {
  const refs = new Set();
  const regex = /(?:\/|\.{1,2}\/|logo\/|public\/)[^"'`<>\s)]+?\.(?:png|jpe?g|webp|svg|gif|ico|avif)(?:\?[^"'`<>\s)]*)?/gi;
  for (const match of fileContent.matchAll(regex)) {
    refs.add(stripQueryAndHash(match[0].replace(/^\.?\//, '')));
    refs.add(match[0].replace(/^\.?\//, ''));
    if (match[0].startsWith('/')) refs.add(match[0]);
  }
  return refs;
}

function fileMatchesAnyCandidate(filePath, referencedPaths) {
  for (const candidate of localCandidatesForFile(filePath)) {
    if (referencedPaths.has(candidate) || referencedPaths.has(stripQueryAndHash(candidate))) {
      return true;
    }
  }
  return false;
}

async function fetchImageUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('timeout')), IMAGE_URL_TIMEOUT_MS);
  try {
    let response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
    if (!response.ok || response.status === 405 || response.status === 501) {
      response = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal });
    }
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function checkImageUrl(rawValue) {
  const raw = String(rawValue || '').trim();
  if (!raw) {
    return { ok: false, status: 'broken', checkedUrl: raw, method: 'none', note: 'empty value' };
  }

  if (isDataImage(raw)) {
    return { ok: true, status: 'ok', checkedUrl: raw, method: 'inline', note: 'data URI' };
  }

  let url = raw;
  if (raw.startsWith('/storage/v1/object/public/') && supabaseUrl) {
    url = new URL(raw, supabaseUrl).href;
  }

  if (!isAbsoluteHttpUrl(url)) {
    return { ok: false, status: 'broken', checkedUrl: url, method: 'none', note: 'non-public local path' };
  }

  let lastError = null;
  for (let attempt = 1; attempt <= IMAGE_URL_RETRIES; attempt += 1) {
    try {
      const response = await fetchImageUrl(url);
      const ok = response.ok;
      return {
        ok,
        status: ok ? 'ok' : 'broken',
        checkedUrl: url,
        method: response.status === 405 || response.status === 501 ? 'get' : 'head',
        httpStatus: response.status,
      };
    } catch (error) {
      lastError = error;
      if (attempt < IMAGE_URL_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
      }
    }
  }

  return {
    ok: false,
    status: 'warning',
    checkedUrl: url,
    method: 'head+get',
    note: `unverified after ${IMAGE_URL_RETRIES} attempt(s): ${lastError?.message || 'request failed'}`,
  };
}

async function moveFilePreservingStructure(sourcePath, targetRoot) {
  const rel = path.relative(ROOT_DIR, sourcePath);
  const targetPath = path.join(targetRoot, rel);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  let finalPath = targetPath;
  let counter = 1;
  while (fssync.existsSync(finalPath)) {
    const ext = path.extname(targetPath);
    const base = targetPath.slice(0, -ext.length);
    finalPath = `${base}-${counter}${ext}`;
    counter += 1;
  }
  await fs.rename(sourcePath, finalPath);
  return finalPath;
}

async function deleteFileSafe(sourcePath) {
  if (!fssync.existsSync(sourcePath)) return;
  await fs.rm(sourcePath);
}

function timeoutAfter(ms, label) {
  return new Promise((_, reject) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
  });
}

async function scanSupabaseTables() {
  const tables = [];
  const images = [];
  const checkedTables = [];
  const skippedTables = [];
  const timedOutTables = [];
  const urlCheckCache = new Map();

  const checkCachedImageUrl = (rawValue) => {
    const raw = String(rawValue || '').trim();
    const cacheKey = stripQueryAndHash(raw);
    if (!urlCheckCache.has(cacheKey)) {
      urlCheckCache.set(cacheKey, checkImageUrl(rawValue));
    }
    return urlCheckCache.get(cacheKey);
  };

  for (const table of TABLES) {
    try {
      checkedTables.push(table);
      const rows = await Promise.race([
        loadSupabaseRows(table),
        timeoutAfter(IMAGE_AUDIT_TIMEOUT_MS, `Table "${table}" scan`),
      ]);
      const tableImages = [];
      rows.forEach((row, rowIndex) => {
        walkImageValues(row, '', tableImages, { table, rowIndex, kind: 'supabase' });
      });
      const normalized = uniqueByKey(tableImages.map((item) => ({
        ...item,
        url: stripQueryAndHash(item.rawValue),
      })), (item) => `${item.table}|${item.columnPath}|${item.url}`);

      const checks = await mapWithConcurrency(normalized, SUPABASE_URL_CHECK_CONCURRENCY, async (item) => ({
        ...item,
        ...(await checkCachedImageUrl(item.rawValue)),
      }));

      const working = checks.filter((item) => item.status === 'ok');
      const broken = checks.filter((item) => item.status === 'broken');
      const unverified = checks.filter((item) => item.status === 'warning');

      tables.push({
        table,
        rowCount: rows.length,
        imageCount: checks.length,
        workingCount: working.length,
        brokenCount: broken.length,
        unverifiedCount: unverified.length,
      });

      images.push(...checks.map((item) => ({
        table: item.table,
        rowIndex: item.rowIndex,
        columnPath: item.columnPath,
        url: item.checkedUrl,
        status: item.status,
        method: item.method,
        httpStatus: item.httpStatus || null,
        note: item.note || '',
      })));
    } catch (error) {
      const message = `Table "${table}" could not be read: ${error?.message || error}`;
      warnings.push(message);
      tables.push({ table, rowCount: 0, imageCount: 0, workingCount: 0, brokenCount: 0, warning: message });
      skippedTables.push(table);
      if (/timed out/i.test(String(error?.message || ''))) {
        timedOutTables.push(table);
      }
    }
  }

  return { tables, images, checkedTables, skippedTables, timedOutTables };
}

async function confirmDelete(count) {
  if (count === 0) return false;
  if (!process.stdin.isTTY) {
    throw new Error('delete mode requires an interactive terminal');
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`Delete ${count} unused local image file(s)? Type "delete" to continue: `);
  rl.close();
  return answer.trim().toLowerCase() === 'delete';
}

async function main() {
  const report = {
    generatedAt: new Date().toISOString(),
    projectRoot: ROOT_DIR,
    supabaseConfigured,
    supabaseScanStatus: 'complete',
    supabaseScanWarning: '',
    checkedTables: [],
    skippedTables: [],
    timedOutTables: [],
    totalSupabaseImagesFound: 0,
    workingSupabaseImages: 0,
    brokenSupabaseImages: 0,
    unverifiedSupabaseImages: 0,
    localImagesFound: 0,
    localImagesUsedInCode: 0,
    localImagesUnused: 0,
    localImagesSafeToRemove: 0,
    warningList: warnings,
    supabaseTables: [],
    supabaseImages: [],
    localImages: [],
  };

  if (!supabaseConfigured) {
    warnings.push('Supabase env not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env or .env.local.');
  }

  if (supabaseConfigured) {
    console.log('Scanning Supabase tables...');
    const result = await scanSupabaseTables();
    report.supabaseTables.push(...result.tables);
    report.supabaseImages.push(...result.images);
    report.checkedTables = result.checkedTables;
    report.skippedTables = result.skippedTables;
    report.timedOutTables = result.timedOutTables;
    if (result.skippedTables.length || result.timedOutTables.length) {
      report.supabaseScanStatus = 'partial';
      report.supabaseScanWarning = 'Supabase scan was partial. Run again with internet/outbound access before deleting images permanently.';
      warnings.push(report.supabaseScanWarning);
    }
  }

  console.log('Scanning local image files...');
  const localFiles = await collectFiles(ROOT_DIR).then((files) => uniqueByKey(files, (file) => normalizePosix(file)));
  const textFiles = await collectTextFiles(ROOT_DIR);
  const referencedPaths = new Set();
  for (const file of textFiles) {
    try {
      const content = await fs.readFile(file, 'utf8');
      for (const ref of extractReferencedPaths(content)) referencedPaths.add(ref);
    } catch {
      // ignore binary or unreadable files
    }
  }

  const localImageRecords = [];
  for (const file of localFiles) {
    const rel = normalizePosix(path.relative(ROOT_DIR, file));
    const usedInCode = fileMatchesAnyCandidate(file, referencedPaths);
    const protectedByRule =
      rel.startsWith('logo/') ||
      rel.startsWith('public/logo/') ||
      /favicon|apple-touch-icon/i.test(rel) ||
      /fallback-product\.svg$/i.test(rel) ||
      /logo-placeholder\.svg$/i.test(rel) ||
      rel === 'public/images/fallback-product.svg';
    const referencedInReadme = (() => {
      if (!fssync.existsSync(path.join(ROOT_DIR, 'README.md'))) return false;
      return [...localCandidatesForFile(file)].some((candidate) => referencedPaths.has(candidate));
    })();

    localImageRecords.push({
      path: rel,
      usedInCode,
      protectedByRule,
      referencedInReadme,
      safeToRemove: !usedInCode && !protectedByRule,
    });
  }

  report.localImages = localImageRecords;
  report.localImagesFound = localImageRecords.length;
  report.localImagesUsedInCode = localImageRecords.filter((item) => item.usedInCode).length;
  report.localImagesUnused = localImageRecords.filter((item) => !item.usedInCode).length;
  report.localImagesSafeToRemove = localImageRecords.filter((item) => item.safeToRemove).length;

  const supabaseImageRecords = report.supabaseImages;
  report.totalSupabaseImagesFound = supabaseImageRecords.length;
  report.workingSupabaseImages = supabaseImageRecords.filter((item) => item.status === 'ok').length;
  report.brokenSupabaseImages = supabaseImageRecords.filter((item) => item.status === 'broken').length;
  report.unverifiedSupabaseImages = supabaseImageRecords.filter((item) => item.status === 'warning').length;

  const safeLocalImages = localImageRecords.filter((item) => item.safeToRemove);
  report.localImagesSafeToRemove = safeLocalImages.length;

  console.log('Writing report...');
  await fs.writeFile(REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`Wrote ${path.relative(ROOT_DIR, REPORT_FILE)}`);
  console.log(`Supabase images: ${report.workingSupabaseImages} working, ${report.brokenSupabaseImages} broken, ${report.unverifiedSupabaseImages} unverified, ${report.totalSupabaseImagesFound} total (${report.supabaseScanStatus})`);
  if (report.supabaseScanWarning) {
    console.log(report.supabaseScanWarning);
  }
  console.log(`Local images: ${report.localImagesFound} found, ${report.localImagesUsedInCode} used, ${report.localImagesSafeToRemove} safe to remove`);

  if (moveUnused && safeLocalImages.length) {
    await fs.mkdir(TRASH_DIR, { recursive: true });
    for (const item of safeLocalImages) {
      const sourcePath = path.join(ROOT_DIR, item.path);
      if (!fssync.existsSync(sourcePath)) continue;
      const movedTo = await moveFilePreservingStructure(sourcePath, TRASH_DIR);
      console.log(`Moved ${item.path} -> ${path.relative(ROOT_DIR, movedTo)}`);
    }
  }

  if (deleteUnused && safeLocalImages.length) {
    const confirmed = await confirmDelete(safeLocalImages.length);
    if (!confirmed) {
      console.log('Deletion cancelled.');
      return;
    }
    for (const item of safeLocalImages) {
      const sourcePath = path.join(ROOT_DIR, item.path);
      if (!fssync.existsSync(sourcePath)) continue;
      await deleteFileSafe(sourcePath);
      console.log(`Deleted ${item.path}`);
    }
  }

  if (warnings.length) {
    console.log('Warnings:');
    for (const warning of warnings) console.log(`- ${warning}`);
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
    process.exit(1);
  });
