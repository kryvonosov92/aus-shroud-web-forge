import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronRight, Star, Wrench, Globe, CheckCircle, Ruler } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StandardConfigurations from "@/components/StandardConfigurations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  // Use the new configuration images for slideshow - 4-sided first
  const images = [
    "/lovable-uploads/0882f186-7330-4efd-8a76-f642ee62118e.png", // 4-sided frame
    "/lovable-uploads/848c1e08-584c-4e0c-ab39-002356c37ed9.png", // Corner frame
    "/lovable-uploads/4cb0234c-1d34-4fb7-a15e-924eed836004.png"  // 3-sided frame
  ];

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
                      <Button variant="outline" className="font-medium">
                        Order Forms →
                      </Button>
                      <Button variant="outline" className="font-medium">
                        Project Enquiry →
                      </Button>
                      <Button variant="outline" className="font-medium">
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
                          className={`object-cover w-full h-full rounded-lg transition-opacity duration-300 scale-125 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
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
                    <div className="bg-primary/10 p-3 rounded-lg w-fit mx-auto">
                      <Star className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Commercial Grade</h3>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="bg-primary/10 p-3 rounded-lg w-fit mx-auto">
                      <Ruler className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Made to Order</h3>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="bg-primary/10 p-3 rounded-lg w-fit mx-auto">
                      <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Australian Product</h3>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="bg-primary/10 p-3 rounded-lg w-fit mx-auto">
                      <Wrench className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Easy Installation</h3>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Standard Configurations Section */}
          <StandardConfigurations />

          {/* CTA Section */}
          <section className="py-16 bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <div className="max-w-3xl mx-auto space-y-6">
                <h2 className="text-4xl font-bold">ADAPTABLE THIN PROFILE</h2>
                <p className="text-xl opacity-90">
                  Design with confidence. Empowering Architects with multiple solutions.
                </p>
                <div className="pt-4">
                  <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-white/90">
                    {product.price ? `Get Quote - From $${parseFloat(product.price as any).toLocaleString()}` : 'Get Quote'}
                  </Button>
                </div>
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