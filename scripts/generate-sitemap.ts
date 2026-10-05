// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
import { writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { execSync } from "child_process";

// Last commit date (YYYY-MM-DD) touching the given source paths; falls back to undefined.
function gitDate(...paths: string[]): string | undefined {
  try {
    const out = execSync(`git log -1 --format=%cs -- ${paths.join(" ")}`, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : undefined;
  } catch {
    return undefined;
  }
}

const BASE_URL = "https://www.auswindowshrouds.com.au";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://nlxdrbqstjodlkrsisbd.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seGRyYnFzdGpvZGxrcnNpc2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTU4MzcsImV4cCI6MjA2ODY3MTgzN30.BRODsGG0ENL3vnEzWcP5_a-_-60FyJxkzZVVTdgDK2k";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

async function buildEntries(): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [
    { path: "/", lastmod: gitDate("src/pages/Index.tsx", "src/components/Hero.tsx", "src/components/Services.tsx", "src/components/About.tsx", "src/components/Contact.tsx", "src/config/site-content.json"), changefreq: "weekly", priority: "1.0" },
    { path: "/products", lastmod: gitDate("src/pages/Products.tsx"), changefreq: "weekly", priority: "0.9" },
    { path: "/shroud-builder", lastmod: gitDate("src/features/shroud-builder"), changefreq: "weekly", priority: "0.8" },
  ];
  const productsIdx = 1;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .order("sort_order", { ascending: true });
    for (const p of products || []) {
      if (!p?.slug) continue;
      entries.push({
        path: `/products/${p.slug}`,
        lastmod: p.updated_at ? new Date(p.updated_at).toISOString().slice(0, 10) : undefined,
        changefreq: "monthly",
        priority: "0.7",
      });
    }

    // Products listing changes whenever any product changes.
    const latest = entries.slice(3).map((e) => e.lastmod).filter(Boolean).sort().pop();
    const listing = entries[productsIdx];
    if (latest && (!listing.lastmod || latest > listing.lastmod)) listing.lastmod = latest;
  } catch (err) {
    console.warn("sitemap: failed to fetch dynamic routes:", err);
  }

  return entries;
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

(async () => {
  const entries = await buildEntries();
  writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
  console.log(`sitemap.xml written (${entries.length} entries)`);
})();
