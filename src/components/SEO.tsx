import React from "react";
import { Helmet } from "react-helmet-async";
import siteContent from "@/config/site-content.json";
import { buildAbsoluteUrl, resolveOgImageAbsolute } from "@/lib/site";

interface SEOProps {
  title: string;
  description?: string;
  canonicalPath?: string; // e.g., "/products"
  image?: string; // public path or absolute URL
  noindex?: boolean;
  structuredData?: any | any[]; // JSON-LD object(s)
  ogType?: string; // e.g., 'product', defaults to 'website'
  keywords?: string[]; // optional meta keywords
}

// Deprecated: use buildAbsoluteUrl from lib/site instead
const buildUrl = buildAbsoluteUrl;

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalPath,
  image,
  noindex,
  structuredData,
  ogType,
  keywords,
}) => {
  const url = buildAbsoluteUrl(canonicalPath || (typeof window !== 'undefined' ? window.location.pathname : undefined));
  const ogImage = resolveOgImageAbsolute(image);
  const siteName = ((siteContent as any)?.seo?.siteName as string) || "AusWindowShrouds";
  const twitterHandle = (siteContent as any)?.seo?.twitterHandle as string | undefined;
  const mergedKeywords = keywords || ((siteContent as any)?.seo?.keywords as string[] | undefined);

  const jsonLdArray = structuredData
    ? (Array.isArray(structuredData) ? structuredData : [structuredData])
    : [];

  return (
    <>
      <Helmet prioritizeSeoTags>
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
        {mergedKeywords && mergedKeywords.length > 0 && (
          <meta name="keywords" content={mergedKeywords.join(", ")} />
        )}
        <link rel="canonical" href={url} />

        {/* Open Graph */}
        <meta property="og:site_name" content={siteName} />
        <meta property="og:title" content={title} />
        {description && <meta property="og:description" content={description} />}
        <meta property="og:type" content={ogType || 'website'} />
        <meta property="og:url" content={url} />
        {ogImage && <meta property="og:image" content={ogImage} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        {description && <meta name="twitter:description" content={description} />}
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}

        <meta name="author" content="AusWindowShrouds" />
        {/* Robots policy */}
        {!noindex && <meta name="robots" content="max-image-preview:large" />}
        {noindex && <meta name="robots" content="noindex,nofollow,max-image-preview:large" />}
      </Helmet>

      {jsonLdArray.map((data, i) => (
        <Helmet key={i}>
          <script type="application/ld+json">{JSON.stringify(data)}</script>
        </Helmet>
      ))}
    </>
  );
};

export default SEO;
