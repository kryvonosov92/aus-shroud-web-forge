import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronRight, Star, Wrench, Globe, Ruler } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProductStandardConfigurations from "@/components/ProductStandardConfigurations";

type Product = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  slug: string;
  additional_images: string[];
  feature_tags: string[];
  specifications: any | null;
  colour_options: any | null;
  category?: string;
  created_at?: string;
  updated_at?: string;
};

const PLACEHOLDER = "/placeholder.svg";

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const targetSlug = decodeURIComponent(slug || '');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', targetSlug)
        .maybeSingle();
      if (!error) {
        setProduct((data as any) || null);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [slug]);

  // Product-specific slideshow images
  const getProductImages = () => {
    const dbImages = (product as any)?.images as string[] | undefined;
    if (Array.isArray(dbImages) && dbImages.length > 0) return dbImages.filter(Boolean);
    return [];
  };
  
  const images = getProductImages();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const productSchema = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images && images.length ? images.map((src) => (src?.startsWith('http') ? src : `${origin}${src}`)) : undefined,
    description: product.description || undefined,
    brand: { "@type": "Organization", name: "AusWindowShrouds" },
    url: origin && slug ? `${origin}/products/${slug}` : undefined,
    category: product.category || undefined,
    additionalProperty: (product as any)?.tabbed_content?.tabs?.flatMap((tab: any) =>
      (tab.columns||[]).flatMap((col: any) =>
        (col.sections||[]).flatMap((sec: any) =>
          (sec.rows||[]).map((row: any) => ({
            "@type": "PropertyValue",
            name: `${tab.title} - ${sec.heading} - ${row.label}`,
            value: row.value
          }))
        )
      )
    )
  } : undefined;

  // Reset carousel index if images change
  useEffect(() => {
    setActiveIdx(0);
    setImgError(false);
    setImgLoading(true);
  }, [product]);

  // Auto-advance slideshow
  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % images.length);
      setImgError(false);
      setImgLoading(true);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const handleImgError = () => setImgError(true);
  const handleImgLoad = () => setImgLoading(false);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${product?.name || 'Product'} | AusWindowShrouds`}
        description={product?.description || 'Premium window shrouds, screens and awnings engineered for Australian conditions.'}
        canonicalPath={`/products/${slug}`}
        image={images && images.length ? images[0] : product?.image_url}
        ogType="product"
        structuredData={productSchema}
      />
      <Header />
      {loading ? (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center text-lg">Loading product...</div>
        </div>
      ) : !product ? (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center text-lg">Product not found.</div>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
                {/* Left Content */}
                <div className="space-y-8">
                  <div>
                    <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                      {product.name.toLowerCase().includes('battenshield') || product.name.toLowerCase().includes('louvreshield') || product.name.toLowerCase().includes('perfashield') ? (
                        <>
                          <span className="text-black">
                            {product.name.toLowerCase().includes('battenshield') ? 'BATTENSHIELD©' :
                             product.name.toLowerCase().includes('louvreshield') ? 'LOUVRESHIELD©' :
                             product.name.toLowerCase().includes('perfashield') ? 'PERFASHIELD©' : product.name.toUpperCase()}
                          </span>
                          <br />
                          <span className="text-primary">
                            {product.name.toLowerCase().includes('screen') ? 'SCREEN' :
                             product.name.toLowerCase().includes('awning') ? 'AWNING' : ''}
                          </span>
                        </>
                      ) : (
                        <>
                          THERMACORE©<br />
                          <span className="text-primary">{product.name.replace(/ThermaCore©?\s*/i, '').toUpperCase()}</span>
                        </>
                      )}
                    </h1>
                    
                    {/* Feature Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(product.feature_tags || []).map((tag) => (
                        <span key={tag} className="bg-foreground text-background px-3 py-1 text-sm font-medium">{tag}</span>
                      ))}
                    </div>

                    <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                      {product.description || "The ThermaCore© Shroud boasts a highly adaptable and meticulously engineered design, intentionally developed to support the broadest range of architectural projects. This series is tailor-made for architects who require a full array of customisation."}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4">
                      <Button 
                        variant="outline" 
                        className="font-medium"
                        asChild
                      >
                        <Link to="/#contact">Get Quote →</Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="font-medium"
                        onClick={() => {
                          const element = document.getElementById('specification-details');
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        Specification Guide →
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Content - Product Image */}
                <div className="lg:order-last">
                  <div className="relative bg-muted rounded-lg aspect-square max-w-md mx-auto">
                    {images.length === 0 || imgError ? (
                      <img
                        src={PLACEHOLDER}
                        alt="No product image"
                        className="object-cover w-full h-full rounded-lg"
                      />
                    ) : (
                      <>
                        <img
                          src={images[activeIdx]}
                          alt={product.name}
                          className={`object-cover w-full h-full rounded-lg transition-opacity duration-300 ${
                            product.name.toLowerCase().includes('battenshield') || product.name.toLowerCase().includes('louvreshield') || product.name.toLowerCase().includes('perfashield')
                              ? 'object-center scale-100' 
                              : 'scale-125 object-left'
                          } ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
                          onLoad={handleImgLoad}
                          onError={handleImgError}
                        />
                        {imgLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse rounded-lg">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        {images.length > 1 && (
                          <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 z-10"
                            onClick={() => {
                              const nextIdx = (activeIdx + 1) % images.length;
                              setActiveIdx(nextIdx);
                              setImgError(false);
                              setImgLoading(true);
                            }}
                            aria-label="Next image"
                          >
                            <ChevronRight className="h-5 w-5 text-foreground" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="text-center space-y-3">
                    <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto">
                      <Star className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Commercial Grade</h3>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto">
                      <Ruler className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Made to Order</h3>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto">
                      <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Australian Product</h3>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto">
                      <Wrench className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Easy Installation</h3>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Standard Configurations (DB-driven) */}
          {((product as any).show_standard_configs || false) && (
            <ProductStandardConfigurations
              productType={product.name.toLowerCase().includes('curved') ? 'curved' : 'box'}
              items={((product as any).standard_configurations as any[]) || []}
            />
          )}

          {/* Specification / Tabbed Content */}
          <section id="specification-details" className="py-8 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-7xl mx-auto">
                {((product as any)?.tabbed_content?.tabs?.length || 0) > 0 ? (
                  <Tabs defaultValue={(product as any).tabbed_content.tabs[0]?.id || 'tab-0'} className="w-full">
                    <TabsList className="w-full flex flex-wrap gap-2 mb-8">
                      {((product as any).tabbed_content.tabs || []).map((t: any) => (
                        <TabsTrigger className="flex-1" key={t.id} value={t.id}>{t.title}</TabsTrigger>
                      ))}
                    </TabsList>
                    {((product as any).tabbed_content.tabs || []).map((t: any) => (
                      <TabsContent key={t.id} value={t.id}>
                        <div className={`grid grid-cols-1 ${((t.columns||[]).length||1) > 1 ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6`}>
                          {(t.columns || []).map((col: any, cIdx: number) => (
                            <div key={cIdx} className="space-y-4">
                              {(col.sections || []).map((sec: any, sIdx: number) => (
                                <div key={sIdx} className="space-y-2">
                                  {sec.heading ? (<h3 className="text-lg font-semibold border-b pb-1">{sec.heading}</h3>) : null}
                                  <div className="space-y-1">
                                    {(sec.rows || []).map((row: any, rIdx: number) => (
                                      <div key={rIdx} className="flex justify-between py-1 border-b border-muted/30">
                                        <span className="font-medium text-xs">{row.label}</span>
                                        <span className="text-muted-foreground text-xs">{row.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  // Fallback to older specific tabs if tabbed_content not present
                  <Tabs defaultValue="specifications" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                      <TabsTrigger value="specifications">Specification Details</TabsTrigger>
                      <TabsTrigger value="colours">Colour Options</TabsTrigger>
                    </TabsList>
                    <TabsContent value="specifications">
                      <div className="text-sm text-muted-foreground">No tabbed content available.</div>
                    </TabsContent>
                    <TabsContent value="colours">
                      <div className="text-sm text-muted-foreground">No tabbed content available.</div>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </div>
          </section>

        </>
      )}
      <Footer />
    </div>
  );
};

export default ProductDetail;
