import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import siteContent from "@/config/site-content.json";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Window Shrouds Australia | AusWindowShrouds"
        description="Premium aluminium window shrouds and screens. Design appeal, privacy and thermal efficiency. Request a fast quote."
        canonicalPath="/"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "AusWindowShrouds",
            "url": typeof window !== 'undefined' ? window.location.origin : undefined,
            "logo": (() => {
              const logoPath = (siteContent as any).brand?.logoUrl as string | undefined;
              if (typeof window === 'undefined' || !logoPath) return undefined;
              try {
                return new URL(logoPath, window.location.origin).toString();
              } catch {
                return undefined;
              }
            })(),
            "sameAs": ["https://www.instagram.com/auswindowshrouds/"]
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "AusWindowShrouds",
            "url": typeof window !== 'undefined' ? window.location.origin : undefined
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
