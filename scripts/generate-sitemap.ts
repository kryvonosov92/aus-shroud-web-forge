// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
import { writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://aus-shroud-web-forge.lovable.app";

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
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/products", changefreq: "weekly", priority: "0.9" },
    { path: "/latest", changefreq: "weekly", priority: "0.8" },
  ];

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at");
    for (const p of products || []) {
      if (!p?.slug) continue;
      entries.push({
        path: `/products/${p.slug}`,
        lastmod: p.updated_at ? new Date(p.updated_at).toISOString().slice(0, 10) : undefined,
        changefreq: "monthly",
        priority: "0.7",
      });
    }

    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, published_at, published")
      .eq("published", true);
    for (const post of posts || []) {
      if (!post?.slug) continue;
      const ts = post.updated_at || post.published_at;
      entries.push({
        path: `/latest/${post.slug}`,
        lastmod: ts ? new Date(ts).toISOString().slice(0, 10) : undefined,
        changefreq: "monthly",
        priority: "0.6",
      });
    }
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
