# MaiElectro

MaiElectro is a modern ecommerce website for laptops, phones, accessories, spare parts, and repair services.

## Features

- Public storefront with homepage, shop, categories, product detail pages, repair services, contact page, and WhatsApp ordering.
- Product catalog backed by Supabase, with local product data as a development fallback when Supabase is not configured.
- Admin dashboard at `/admin` for products, categories, stock, admin users, logs, settings, repair service content, and image uploads.
- Supabase Auth for admin login and password reset.
- Supabase Database for catalog, admin, settings, logs, and service data.
- Supabase Storage bucket `product-images` for product, category, and service images.
- Light-mode public/admin UI with a dark admin sidebar.

## Stack

- React
- Vite
- HeroUI / Tailwind CSS
- Supabase Auth
- Supabase Database
- Supabase Storage

## Public Website Pages

| Route | Purpose |
| --- | --- |
| `/` | Homepage |
| `/shop` | Full product listing |
| `/category/:categoryId` | Category and brand pages such as iPhone, Lenovo, MacBook, accessories, and spare parts |
| `/product/:slug` | Product details |
| `/reparation` | Repair services |
| `/repair` | Repair services alias |
| `/contact` | Contact information and WhatsApp actions |
| `/blog` | Redirects to `/`; blog content is not displayed publicly |

## Admin Dashboard

Admin is intentionally hidden from the public navbar.

| Route | Purpose |
| --- | --- |
| `/admin` | Dashboard |
| `/admin/products` | Product management |
| `/admin/products/new` | Add product |
| `/admin/products/edit/:id` | Edit product |
| `/admin/categories` | Category management |
| `/admin/stock` | Stock management |
| `/admin/repair-services` | Repair service content and photos |
| `/admin/admins` | Admin user management |
| `/admin/logs` | Activity logs |
| `/admin/settings` | Store settings |
| `/admin/help` | Admin help |
| `/admin/reset-password` | Supabase password recovery landing page |

Admin users authenticate through Supabase Auth. The current super admin is managed in the Supabase `admin_users` table and must be active with role `super_admin`.

## Project Structure

```text
src/
├── components/
│   ├── admin/       Admin layout, sidebar, guards, tables, upload widgets
│   ├── home/        Homepage sections
│   ├── layout/      Public header, navbar, mobile menu, footer
│   ├── product/     Product cards, details, filters, grids
│   └── ui/          Shared UI primitives
├── config/          Admin email and permission constants
├── context/         React context providers
├── data/            Local fallback catalog, categories, store info
├── i18n/            FR/AR/EN translations
├── pages/           Public pages and admin pages
├── services/        Supabase API services
├── lib/             Supabase client
└── utils/           Shared utilities

supabase/
├── migrations/      Database, RLS, storage, admin, and category-image migrations
└── functions/       Supabase Edge Functions

public/images/       Logo, fallback images, local fallback product images, repair images
scripts/             Maintenance/import/check scripts
```

## Installation

```bash
npm install
```

## Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Required frontend variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Server-side maintenance scripts may use these variables, but they must never be exposed to frontend code:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPER_ADMIN_EMAIL=
SUPER_ADMIN_PASSWORD=
ADMIN_PASSWORD=
```

Important security warning:

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code.
- Never prefix a service-role key with `VITE_`.
- Never commit `.env` files.
- `.env.example` must contain empty placeholder values only.

## GitHub Hosting

For a GitHub-hosted frontend, keep the app pointed at Supabase and audit images before deployment:

1. Run `npm install`.
2. Create `.env.local` from `.env.example`.
3. Fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Run `npm run audit:images` and review `image-audit-report.json`.
5. Run `npm run build`.
6. Deploy the `dist/` output to Vercel or Netlify.

The image audit keeps local media usage visible and gives you a safe cleanup path through `npm run cleanup:images`.

## Run Locally

```bash
npm run dev
```

Vite usually serves the app at `http://127.0.0.1:5173/`. If that port is busy, Vite will choose the next available port.

## Build

```bash
npm run build
```

Optional local preview after a build:

```bash
npm run preview
```

## Supabase Setup Summary

Apply the migrations in `supabase/migrations/` in order. They define products, categories, admin users, roles, logs, settings, repair services, storage bucket policies, and category image updates.

Required tables:

- `products`
- `categories`
- `admin_users`
- `admin_logs`
- `stock_logs`
- `site_settings`
- `repair_services`
- `blog_posts` if the table still exists in Supabase; the public blog UI is currently removed and `/blog` redirects home.

Required Storage bucket:

- `product-images`

Storage notes:

- Public image reads are allowed for `product-images`.
- Upload/update/delete operations must be protected by RLS/storage policies and admin checks.
- Product image URLs are stored in `products.image` and `products.gallery`.
- Category shortcut images use real product or service photos, mostly from Supabase public Storage URLs.
- Repair service image fallbacks are resolved in the frontend if old placeholder service image values still exist.

## Admin Authentication

- Admin login uses Supabase Auth at `/admin`.
- `AdminRoute` blocks dashboard content until the user has an authenticated session and an active admin profile.
- Super-admin-only pages such as `/admin/admins` and `/admin/repair-services` require `super_admin`.
- The public site does not expose an admin link.
- Admin UX permission checks are for interface behavior only. Database writes must still be protected by Supabase RLS and Storage policies.

### Add Or Change Admins Safely

Preferred workflow:

1. Sign in as the active super admin.
2. Use `/admin/admins` to create or update admin users.
3. Send password reset emails through Supabase Auth or the admin UI.
4. Confirm the `admin_users` row has the correct `email`, `role`, and `active` state.

Maintenance scripts that need `SUPABASE_SERVICE_ROLE_KEY` must run only on a trusted machine or CI secret store. Do not place service-role keys in `src/`, `public/`, `.env.example`, or any committed frontend file.

## Image Uploads

Admin product image uploads use `src/services/storageService.js`.

Current validation:

- Allowed file types: JPG, JPEG, PNG, WebP.
- SVG uploads are blocked.
- Maximum size: 5 MB.
- File names and storage path segments are sanitized.
- Images are uploaded to `product-images`.
- Public URLs are saved to database fields.
- Base64 image blobs should not be stored in the database.

## Security Checklist

- Secrets not exposed in frontend source.
- Frontend Supabase client uses only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- `SUPABASE_SERVICE_ROLE_KEY` is not used in `src/` or `public/`.
- `.env`, `.env.local`, `.env.*.local`, `*.pem`, and `*.key` are ignored by git.
- `.env.example` contains empty values only.
- Admin route is protected by Supabase session and `admin_users` role checks.
- Public navbar has no admin link.
- RLS is required for database writes and Storage writes; frontend permission checks are not security boundaries.
- Upload validation blocks SVG, limits size, and sanitizes file names.
- No `dangerouslySetInnerHTML` or direct `innerHTML` rendering is used in application source.
- Supabase text fields such as product descriptions, specs, settings, repair descriptions, and legacy blog content are rendered as React text by default.
- Supabase Edge Function `admin-user-actions` verifies the requester is the active super admin before using service-role operations.
- Build tested after cleanup.

## Common Troubleshooting

### Invalid login credentials

Confirm the user exists in Supabase Auth and that the email also exists in `admin_users` with `active = true`.

### Admin access denied

Check the admin email, `admin_users.role`, `admin_users.active`, RLS policies, and the configured super admin email in `src/config/admin.js`.

### Missing table or column schema cache

Run all migrations in order, then refresh Supabase schema cache by waiting briefly or reloading the dashboard/API.

### Broken product or category images

Confirm the URL exists, the file is in the `product-images` bucket or a valid local fallback path, and Storage public read policy is active.

### Supabase env missing

Create `.env` and fill:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Restart the dev server after editing env values.

### RLS access denied

Check the authenticated user email, the `admin_users` row, role permissions, table policies, and Storage policies. Frontend role checks do not replace RLS.

### Admin page blank

Run `npm run build`, check for missing imports, verify Supabase env values, and open `/admin` again after clearing stale browser sessions.

## Deployment Notes

- Configure only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as frontend build variables.
- Store service-role keys only in Supabase Edge Function secrets or trusted CI/server environments.
- Do not deploy `.env`.
- Run `npm run build` before deployment.
- Run `npm run audit:images` before deployment if you want a current image inventory.
- Ensure Supabase migrations and Storage policies are applied before publishing admin features.

## Cleanup Summary

- Docs merged: `FIX_REPORT.md`, `IMAGE_MEANING_REPORT.md`, and `CATEGORY_IMAGE_REPORT.md` were merged into this README.
- Files removed: unused blog page/component/service, unused blog image assets, old theme toggle component, unused theme hook, and duplicate report markdown files.
- Security checks performed: secret scan, env file check, Supabase client review, admin route review, upload validation review, dangerous HTML scan, and maintenance script review.
- Security fixes: removed hardcoded Supabase secret from `scripts/test-db.mjs`, removed hardcoded admin password from `scripts/create-super-admin.mjs`, added `.gitignore`, and tightened the admin Edge Function super-admin check.
- Install result: `npm install` completed successfully.
- Build result: `npm run build` completed successfully.
- Dev result: `npm run dev -- --host 127.0.0.1` started successfully at `http://127.0.0.1:5174/` during verification because port 5173 was already in use.
- Route checks: `/`, `/shop`, `/category/iphone`, `/category/lenovo`, `/category/macbook`, `/category/accessoires`, `/category/pieces-detachees`, `/reparation`, `/contact`, `/admin`, `/admin/products`, `/admin/products/new`, `/admin/categories`, `/admin/stock`, `/admin/admins`, `/admin/logs`, `/admin/settings`, and `/admin/help` all returned `200`.
- Audit result: `npm audit` completed successfully with `0 vulnerabilities`.
- Lint result: no `npm run lint` script is currently defined in `package.json`.
- Remaining manual steps: rotate any Supabase secret or admin password that was previously present in local files, confirm RLS/storage policies are applied in Supabase, and keep service-role keys only in trusted server-side environments.
