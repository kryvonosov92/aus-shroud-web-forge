import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronRight, Star, Wrench, Globe, CheckCircle, Ruler } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  additional_images?: string[];
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
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });
      if (!error && data) {
        const found = data.find((p: Product) => slugify(p.name) === slug);
        setProduct(found || null);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [slug]);

  // Hood product slideshow images
  const getProductImages = () => {
    if (product?.name.toLowerCase().includes('hood')) {
      return [
        product?.image_url,
        '/lovable-uploads/374f902e-c5f0-4b98-a587-4bd95ced4b1e.png'
      ].filter(Boolean);
    }
    // For other products, use their own image
    return [product?.image_url].filter(Boolean);
  };
  
  const images = getProductImages();

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
                      THERMACORE©<br />
                      <span className="text-primary">{product.name.replace(/ThermaCore©?\s*/i, '').toUpperCase()}</span>
                    </h1>
                    
                    {/* Feature Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="bg-foreground text-background px-3 py-1 text-sm font-medium">
                        Thin Profile
                      </span>
                      <span className="bg-foreground text-background px-3 py-1 text-sm font-medium">
                        Various Depths
                      </span>
                      <span className="bg-foreground text-background px-3 py-1 text-sm font-medium">
                        Highly Customisable
                      </span>
                    </div>

                    <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                      {product.description || "The ThermaCore© Shroud boasts a highly adaptable and meticulously engineered design, intentionally developed to support the broadest range of architectural projects. This series is tailor-made for architects who require a full array of customisation."}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4">
                      <Button 
                        variant="outline" 
                        className="font-medium"
                        onClick={() => {
                          window.location.href = '/#contact';
                          setTimeout(() => {
                            const element = document.getElementById('contact');
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                          }, 100);
                        }}
                      >
                        Get Quote →
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
                          className={`object-cover w-full h-full rounded-lg transition-opacity duration-300 scale-110 object-left ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
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
                              <span className="text-muted-foreground text-xs">Window Shroud</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Profile</span>
                              <span className="text-muted-foreground text-xs">6.0mm</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Wind Rating</span>
                              <span className="text-muted-foreground text-xs">15m</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Material</span>
                              <span className="text-muted-foreground text-xs">Aluminium 5083 H32 Marine-Grade</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Profile Depth</span>
                              <span className="text-muted-foreground text-xs">50mm - 850mm*</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Standard Profile Depth</span>
                              <span className="text-muted-foreground text-xs">300mm / 450mm / 600mm</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="font-medium text-xs">Fixing Flange</span>
                              <span className="text-muted-foreground text-xs">Typ. 50mm / 100mm</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold border-b pb-1">Product Applications</h3>
                          <div className="space-y-1">
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Usage</span>
                              <span className="text-muted-foreground text-xs">Commercial & Residential</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="font-medium text-xs">Exterior</span>
                              <span className="text-muted-foreground text-xs">Window Dressing, Solar Shading</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold border-b pb-1">Dimensions & Performance</h3>
                          <div className="space-y-1">
                            {!product?.name.toLowerCase().includes('hood') && (
                              <div className="flex justify-between py-1 border-b border-muted/30">
                                <span className="font-medium text-xs">Max Height</span>
                                <span className="text-muted-foreground text-xs">6000mm*</span>
                              </div>
                            )}
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Max Width</span>
                              <span className="text-muted-foreground text-xs">6000mm*</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Density</span>
                              <span className="text-muted-foreground text-xs">2.65g/m³</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Material Weight</span>
                              <span className="text-muted-foreground text-xs">15.9 kg/m²</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">AS 1530.3</span>
                              <span className="text-muted-foreground text-xs">Yes</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="font-medium text-xs">Curved Profiles</span>
                              <span className="text-muted-foreground text-xs">Yes</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold border-b pb-1">Product Warranty</h3>
                          <div className="space-y-1">
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Term</span>
                              <span className="text-muted-foreground text-xs">7 Years</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="font-medium text-xs">Coverage</span>
                              <span className="text-muted-foreground text-xs">Workmanship & Materials</span>
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
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Dulux - Charisma</span>
                              <span className="text-muted-foreground text-xs">Available</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Dulux - Duralloy</span>
                              <span className="text-muted-foreground text-xs">Available</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Dulux - Duratec</span>
                              <span className="text-muted-foreground text-xs">Available</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Dulux - Fluroset</span>
                              <span className="text-muted-foreground text-xs">Available</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Electro - Standard Range</span>
                              <span className="text-muted-foreground text-xs">Available</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Electro - Premium Range</span>
                              <span className="text-muted-foreground text-xs">Available</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Interpon - D1000</span>
                              <span className="text-muted-foreground text-xs">Available</span>
                            </div>
                             <div className="flex justify-between py-1 border-b border-muted/30">
                               <span className="font-medium text-xs">Interpon - D2525</span>
                               <span className="text-muted-foreground text-xs">Available</span>
                             </div>
                             <div className="flex justify-between py-1">
                               <span className="font-medium text-xs">Interpon - Textura</span>
                               <span className="text-muted-foreground text-xs">Available</span>
                             </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold border-b pb-1">Coating Properties</h3>
                          <div className="space-y-1">
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">VOC Emissions</span>
                              <span className="text-muted-foreground text-xs">Negligible</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Material Utilisation</span>
                              <span className="text-muted-foreground text-xs">Nearly 100%</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Eco-Friendly</span>
                              <span className="text-muted-foreground text-xs">Yes</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Residential Use</span>
                              <span className="text-muted-foreground text-xs">Yes</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Commercial Use</span>
                              <span className="text-muted-foreground text-xs">Yes</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-muted/30">
                              <span className="font-medium text-xs">Colour Range</span>
                              <span className="text-muted-foreground text-xs">Wide Selection</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="font-medium text-xs">Custom Finishes</span>
                              <span className="text-muted-foreground text-xs">Available</span>
                            </div>
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