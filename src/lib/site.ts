import siteContent from "@/config/site-content.json";
import { readEnvKey } from "@/lib/env";

// Core constants and sane defaults
export const DEFAULT_SITE_NAME = (siteContent as any)?.seo?.siteName || "AusWindowShrouds";
export const DEFAULT_LOGO_PATH = (siteContent as any)?.brand?.logoUrl || "/AWS-Logo.svg";
export const DEFAULT_OG_IMAGE_PATH = (siteContent as any)?.seo?.defaultOgImage || DEFAULT_LOGO_PATH;
export const DEFAULT_TWITTER_HANDLE = (siteContent as any)?.seo?.twitterHandle || undefined;

// Choose a robust fallback image if JSON paths are missing
// Prefer a stable local asset; otherwise fallback to a known good Supabase URL
export const FALLBACK_IMAGE: string = DEFAULT_OG_IMAGE_PATH || 
  "https://nlxdrbqstjodlkrsisbd.supabase.co/storage/v1/object/public/aws-media/a3dfe94a-179a-4c2c-b164-a5875b958caa.png";

// Determine site base URL from env with sensible fallbacks
export function getSiteOrigin(): string | undefined {
  const fromEnv = readEnvKey('NEXT_PUBLIC_SITE_URL') || readEnvKey('SITE_URL');
  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      // ignore malformed env
    }
  }
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  return undefined;
}

// Build absolute URL when possible; accept absolute input; fall back to input
export function buildAbsoluteUrl(path?: string): string | undefined {
  if (!path) return getSiteOrigin();
  if (/^https?:\/\//i.test(path)) return path;
  const origin = getSiteOrigin();
  if (!origin) return path;
  try {
    return new URL(path, origin).toString();
  } catch {
    return path;
  }
}

export function resolveLogoUrlAbsolute(): string | undefined {
  const logoPath = (siteContent as any)?.brand?.logoUrl as string | undefined;
  return buildAbsoluteUrl(logoPath || DEFAULT_LOGO_PATH);
}

export function resolveOgImageAbsolute(imageOverride?: string): string | undefined {
  const candidate = imageOverride || (siteContent as any)?.seo?.defaultOgImage || DEFAULT_OG_IMAGE_PATH || FALLBACK_IMAGE;
  return buildAbsoluteUrl(candidate);
}

