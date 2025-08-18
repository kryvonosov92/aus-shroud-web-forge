## AUS Window Shrouds – UX/Tech Audit and SSR Readiness

Date: 2025-08-18

### Scope

- Local dev audited at `http://localhost:8080/` across: `/`, `/products`, `/products/:slug`, `/latest`, `/latest/:slug` (where available), `/admin`, and anchor routes like `/#contact`.
- Intended production target: Vercel deployment (SSR migration to Next.js planned). Current `vercel.json` indicates SPA rewrites.

### Summary of Key Findings

- Global: Some accessibility gaps (unlabeled buttons/dots, some images lacking clear alt). Hash-link navigation to sections may not reliably scroll from non-root routes.
- Data: Product list/detail show loading states, suggesting missing data or env configuration; ensure clear empty/errored states.
- Routing: Legacy `/blog` returns 404; canonical route appears to be `/latest`. Add redirects.
- SEO: Client-only URL building uses `window`, which will break on SSR. Replace with server-safe URL construction.
- SSR migration: Replace React Router + `react-helmet-async` with Next.js file-based routing + `next/head`; move data fetching into `getServerSideProps`/`getStaticProps` or Server Components/Actions, and adopt `next/image`, `next/link`.

---

### Page-by-Page Notes

#### Home (`/`)

- Hero carousel:
  - Next/Prev buttons have labels; good. The six slide indicator buttons appear visually (multiple unlabeled `button`s). Add `aria-label` like "Go to slide n" and `aria-current="true"` for active.
  - Large hero images should be optimized and, post-SSR, served via `next/image` with proper `priority`, `sizes`, and responsive `srcset`.
- Section links in header: `Link to="/#services"`, `Link to="/#about"`.
  - From non-root routes, hash navigation may not scroll to sections after route change. Add hash-scroll handling or use standard anchor links on the same page. In Next.js, `next/link` with `href="/#about"` handles scroll by default.
- Contact form:
  - Add client and server-side validation, inline error states, and success/failure banners.
  - Add spam protection (hidden honeypot, time-based trap, reCAPTCHA/Turnstile if needed).
  - File upload: enforce file type and size on client and server; show upload progress and constraints.
- Content icons/images in “Why use our products?” sections appear as decorative `img` without alt text in some cases. Add empty `alt=""` for purely decorative images or meaningful alt otherwise.

#### Products List (`/products`)

- Displays "Loading products..."; likely awaiting Supabase env or data.
  - Add empty state ("No products yet" with CTA to contact or view examples).
  - Add error state with retry if fetch fails.
- SEO: ensure list view sets a descriptive `title`, `description`, canonical, and `og` tags. When SSR, render critical content server-side for crawlability.

#### Product Detail (`/products/:slug`)

- Shows "Loading product..." for non-existent slug.
  - Add not-found UI with related links and return to products.
  - For SSR, implement `getStaticPaths`/`getStaticProps` for popular products or `getServerSideProps` for dynamic inventory. Return 404 for missing.
- Add structured data `Product` schema (name, image, description, brand, offers where applicable).

#### Latest (`/latest`) and Blog Post (`/latest/:slug`)

- `/latest` renders heading and intro; confirm posts list rendering when data present.
- Legacy route `/blog` currently 404 (observed). Add redirect `/blog -> /latest` (client and server). In Next.js, use `next.config.js` `redirects()` or Middleware.
- Add structured data (`Blog`, `BlogPosting`) per post.

#### Admin (`/admin`)

- Admin UI visible; ensure route guard is effective. Confirm Supabase Auth session checks and RLS policies in database.
- Image uploads: confirm Storage bucket CORS and size limits; display thumbnails and allow reordering (UI suggests it exists). Validate before upload.
- JSON schema/tabbed content editor: validate JSON before save and provide preview.

---

### Global Technical Notes

- Routing:
  - Current SPA rewrite in `vercel.json` is appropriate for Vite SPA. Remove once migrating to Next.js SSR; Next handles routing.
  - Add redirects: `/blog -> /latest`, optional `/news -> /latest` if used in marketing.
- SEO component (`src/components/SEO.tsx`):
  - Avoid `window` usage when computing canonical URLs on server; accept absolute canonical via props or compute on server in data fetching. Replace `react-helmet-async` with `next/head` in Next.js.
  - Consolidate Open Graph/Twitter tags and ensure images are absolute URLs.
- Performance:
  - Optimize hero and product images; when on Next.js, use `next/image` with properly sized variants.
  - Consider code splitting heavy admin/editor components.
- Accessibility:
  - Ensure all interactive elements (carousel dots, tabs) have `aria-label`s and roles.
  - Preserve focus states and keyboard navigation for carousels, tabs, and dialogs.
- Hash navigation:
  - Implement hash-based scrolling reliably across routes. In SSR, `next/link` can handle with default scroll; for programmatic navigation use `router.push('/#id', { scroll: true })`.
- Forms:
  - Server-side validation mirrors client; return 422 with field-level errors. Add success page/section with anchors.
- Analytics & logs:
  - If using Supabase Edge Function for emails (see `supabase/functions/send-quote-email`), log correlation IDs, handle rate limiting and retries, and surface meaningful toasts to users.

---

### SSR Migration Guidelines (actionable)

1. Replace React Router with Next.js App Router (file-based routing). Map routes:
   - `/` -> `app/page.tsx`
   - `/products` -> `app/products/page.tsx`
   - `/products/[slug]` -> `app/products/[slug]/page.tsx`
   - `/latest` -> `app/latest/page.tsx`
   - `/latest/[slug]` -> `app/latest/[slug]/page.tsx`
   - `/admin` -> protected route; use middleware to enforce auth.
2. Replace `react-helmet-async` with `next/head` or App Router `generateMetadata`.
3. Data fetching:
   - Prefer Server Components fetching where possible.
   - For dynamic pages, use Route Handlers or `getServerSideProps` (Pages Router) / `generateStaticParams` + revalidation (ISR) in App Router.
   - Use Supabase server client on the server; avoid exposing service keys on client.
4. Images: migrate to `next/image` with correct `alt`, `sizes`, `priority` for above-the-fold.
5. Links: replace `react-router-dom` `Link` with `next/link`. Remove `BrowserRouter`.
6. Environment variables: prefix client-exposed vars with `NEXT_PUBLIC_`. Server-only vars remain unprefixed.
7. Redirects/Rewrites: implement `/blog -> /latest` in `next.config.js` `redirects()`.
8. Canonicals: build absolute URLs on server; avoid `window` checks.
9. Hash scroll: rely on default Next scroll behavior; for programmatic, use `router.push` with `scroll: true`.
10. Remove `vercel.json` SPA rewrite once on Next. If needed, convert to Next `redirects()`/`rewrites()`.
11. Replace `react-helmet-async` JSON-LD injection with Next Metadata or inline `<script type="application/ld+json">` in server-rendered components.
12. Edge Functions: consider moving email handling to Next Route Handlers or continue Supabase Edge Function calls server-side to avoid CORS.

References:

- SSW: Do you know how to migrate React projects to Next.js? (`https://www.ssw.com.au/rules/migrate-react-to-nextjs/`)
- Vercel: Migrating a large, open-source React application to Next.js and Vercel (`https://vercel.com/blog/migrating-a-large-open-source-react-application-to-next-js-and-vercel`)

---

### Pre-Deploy Checklist (Next.js SSR)

- [ ] All routes mapped to file-based routing; legacy redirects configured.
- [ ] SEO metadata defined per route; canonical URLs correct.
- [ ] Images migrated to `next/image`; static assets under `public/`.
- [ ] Supabase server client used on server; RLS policies verified.
- [ ] Contact form posts handled server-side with validation and spam protection.
- [ ] Sitemap and robots generated dynamically where applicable.
- [ ] Accessibility pass: labeled controls, alt text, keyboard nav.
- [ ] Monitoring: error boundaries, logging for server actions/route handlers.
