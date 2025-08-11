import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  canonicalPath?: string; // e.g., "/products"
  image?: string; // public path or absolute URL
  noindex?: boolean;
  structuredData?: any | any[]; // JSON-LD object(s)
}

const buildUrl = (path?: string) => {
  const origin = typeof window !== 'undefined' && window.location ? window.location.origin : '';
  if (!origin) return path || '';
  if (!path) return origin;
  if (path.startsWith('http')) return path;
  return `${origin}${path}`;
};

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalPath,
  image,
  noindex,
  structuredData,
}) => {
  const url = buildUrl(canonicalPath || (typeof window !== 'undefined' ? window.location.pathname : undefined));
  const ogImage = buildUrl(image || "/products/tapered-shroud-1.png");
  const siteName = "AusWindowShrouds";

  const jsonLdArray = structuredData
    ? (Array.isArray(structuredData) ? structuredData : [structuredData])
    : [];

  return (
    <>
      <Helmet prioritizeSeoTags>
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
        <link rel="canonical" href={url} />

        {/* Open Graph */}
        <meta property="og:site_name" content={siteName} />
        <meta property="og:title" content={title} />
        {description && <meta property="og:description" content={description} />}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        {ogImage && <meta property="og:image" content={ogImage} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        {description && <meta name="twitter:description" content={description} />}
        {ogImage && <meta name="twitter:image" content={ogImage} />}

        <meta name="author" content="AusWindowShrouds" />
        {noindex && <meta name="robots" content="noindex,nofollow" />}
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
