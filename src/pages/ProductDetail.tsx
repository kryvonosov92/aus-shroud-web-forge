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
    const list: string[] = [];
    if (product?.image_url) list.push(product.image_url);
    if (Array.isArray(product?.additional_images) && product!.additional_images.length > 0) {
      list.push(...product!.additional_images.filter(Boolean));
    }
    return list;
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
    category: product.category || undefined
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
        image={product?.image_url}
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

          {/* Standard Configurations */}
          {((product.name.toLowerCase().includes('box') && !product.name.toLowerCase().includes('boxed')) || product.name.toLowerCase().includes('curved')) && (
            <ProductStandardConfigurations 
              productType={product.name.toLowerCase().includes('curved') ? 'curved' : 'box'} 
            />
          )}

          {/* Specification Details & Colour Options Tabs */}
          <section id="specification-details" className="py-8 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-7xl mx-auto">
                <Tabs defaultValue="specifications" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="specifications">Specification Details</TabsTrigger>
                    <TabsTrigger value="colours">Colour Options</TabsTrigger>
                  </TabsList>
                  
                   <TabsContent value="specifications">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold border-b pb-1">Overview</h3>
                          <div className="space-y-1">
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Product</span>
                              <span className="text-muted-foreground text-xs">{product.name}</span>
                            </div>
                             <div className="flex justify-between py-1 border-b border-muted/30">
                               <span className="font-medium text-xs">Category</span>
                               <span className="text-muted-foreground text-xs">{product.specifications?.overview?.category || product.category || 'Window Shroud'}</span>
                             </div>
                             <div className="flex justify-between py-1 border-b border-muted/30">
                               <span className="font-medium text-xs">Profile</span>
                               <span className="text-muted-foreground text-xs">{product.specifications?.overview?.profile || '6.0mm'}</span>
                             </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Wind Rating</span>
                              <span className="text-muted-foreground text-xs">{product.specifications?.overview?.windRating || '15m'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Material</span>
                              <span className="text-muted-foreground text-xs">{product.specifications?.overview?.material || 'Aluminium 5083 H32 Marine-Grade'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Profile Depth</span>
                              <span className="text-muted-foreground text-xs">{product.specifications?.overview?.profileDepth || '50mm - 850mm*'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Standard Profile Depth</span>
                              <span className="text-muted-foreground text-xs">{product.specifications?.overview?.standardProfileDepth || '300mm / 450mm / 600mm'}</span>
                            </div>
                             {product.specifications?.overview?.profileSlope && (
                              <div className="flex justify-between py-1 border-b border-muted/30">
                                <span className="font-medium text-xs">Profile Slope</span>
                                <span className="text-muted-foreground text-xs">{product.specifications.overview.profileSlope}</span>
                              </div>
                             )}
                             <div className="flex justify-between py-1">
                               <span className="font-medium text-xs">Fixing Flange</span>
                                <span className="text-muted-foreground text-xs">{product.specifications?.overview?.fixingFlange || 'Typ. 50mm / 100mm'}</span>
                             </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold border-b pb-1">Product Applications</h3>
                          <div className="space-y-1">
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Usage</span>
                                <span className="text-muted-foreground text-xs">{product.specifications?.applications?.usage || 'Commercial & Residential'}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="font-medium text-xs">Exterior</span>
                                <span className="text-muted-foreground text-xs">{product.specifications?.applications?.exterior || 'Window Dressing, Solar Shading'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold border-b pb-1">Dimensions & Performance</h3>
                          <div className="space-y-1">
                              {product.specifications?.dimensions?.maxHeight && (
                                <div className="flex justify-between py-1 border-b border-muted/30">
                                  <span className="font-medium text-xs">Max Height</span>
                                  <span className="text-muted-foreground text-xs">{product.specifications.dimensions.maxHeight}</span>
                                </div>
                              )}
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Max Width</span>
                                <span className="text-muted-foreground text-xs">{product.specifications?.dimensions?.maxWidth || '6000mm*'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Density</span>
                                <span className="text-muted-foreground text-xs">{product.specifications?.dimensions?.density || '2650 kg/m³'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Material Weight</span>
                                <span className="text-muted-foreground text-xs">{product.specifications?.dimensions?.materialWeight || '15.9 kg/m²'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">AS 1530.3</span>
                                <span className="text-muted-foreground text-xs">{product.specifications?.dimensions?.AS1530_3 || 'Yes'}</span>
                            </div>
                              <div className="flex justify-between py-1">
                                <span className="font-medium text-xs">Curved Profiles</span>
                                <span className="text-muted-foreground text-xs">{product.specifications?.dimensions?.curvedProfiles || 'Yes'}</span>
                              </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold border-b pb-1">Product Warranty</h3>
                          <div className="space-y-1">
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Term</span>
                                <span className="text-muted-foreground text-xs">{product.specifications?.warranty?.term || '7 Years'}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="font-medium text-xs">Coverage</span>
                                <span className="text-muted-foreground text-xs">{product.specifications?.warranty?.coverage || 'Workmanship & Materials'}</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground bg-muted/20 p-2 rounded text-[10px] leading-tight">
                            To ensure you meet the eligibility requirements, make sure to disclose your project's location and the intended application at the time of placing your order.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                   <TabsContent value="colours">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold border-b pb-1">Powder Coating Systems</h3>
                          <div className="space-y-1">
                              {(product.colour_options?.systems || []).map((sys: string) => (
                                <div key={sys} className="flex justify-between py-1 border-b border-muted/30">
                                  <span className="font-medium text-xs">{sys}</span>
                                  <span className="text-muted-foreground text-xs">Available</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold border-b pb-1">Coating Properties</h3>
                          <div className="space-y-1">
                              {product.colour_options?.properties && (
                                <>
                                  {Object.entries(product.colour_options.properties).map(([key, val]: any) => (
                                    <div key={key} className="flex justify-between py-1 border-b border-muted/30">
                                      <span className="font-medium text-xs">{key.replace(/([A-Z])/g,' $1').replace(/^./, (c)=>c.toUpperCase())}</span>
                                      <span className="text-muted-foreground text-xs">{String(val)}</span>
                                    </div>
                                  ))}
                                </>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
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
