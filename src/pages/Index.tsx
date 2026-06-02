import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import siteContent from "@/config/site-content.json";
import { resolveLogoUrlAbsolute } from "@/lib/site";

const Index = () => {
  const seo = (siteContent as any).seo || {};
  const homeTitle = seo.homeTitle || "Window Shrouds Australia | AusWindowShrouds";
  const homeDescription = seo.homeDescription || "Premium aluminium window shrouds and screens. Design appeal, privacy and thermal efficiency. Request a fast quote.";
  return (
    <div className="min-h-screen">
      <SEO
        title={homeTitle}
        description={homeDescription}
        keywords={seo.keywords}
        canonicalPath="/"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": seo.siteName || "AusWindowShrouds",
            "url": typeof window !== 'undefined' ? window.location.origin : undefined,
            "logo": resolveLogoUrlAbsolute(),
            "sameAs": ["https://www.instagram.com/auswindowshrouds/"]
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": seo.siteName || "AusWindowShrouds",
            "url": typeof window !== 'undefined' ? window.location.origin : undefined
          },
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "AusWindowShrouds",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "1/10 Clarissa St",
              "addressLocality": "Campbellfield",
              "addressRegion": "VIC",
              "postalCode": "3061",
              "addressCountry": "AU"
            },
            "telephone": "(03) 9020 1422",
            "openingHours": "Mo-Fr 08:00-17:30"
          }
        ]}
      />
      <Header />
      <Hero />
      <Services />
      <About />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
