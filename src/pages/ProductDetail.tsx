import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

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

  // Compose all images (main + additional)
  const images = product ? [product.image_url, ...(product.additional_images || [])].filter(Boolean) : [];

  // Reset carousel index if images change
  useEffect(() => {
    setActiveIdx(0);
    setImgError(false);
    setImgLoading(true);
  }, [images.length, product]);

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
                        Curved Options
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="relative bg-muted rounded-lg aspect-square max-w-md mx-auto cursor-zoom-in hover:scale-105 transition-transform duration-300">
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
                              className={`object-cover w-full h-full rounded-lg transition-opacity duration-300 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
                              onLoad={handleImgLoad}
                              onError={handleImgError}
                            />
                            {imgLoading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse rounded-lg">
                                <span className="text-muted-foreground">Loading image...</span>
                              </div>
                            )}
                            {images.length > 1 && (
                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                {images.map((_, idx) => (
                                  <button
                                    key={idx}
                                    className={`w-3 h-3 rounded-full border-2 ${activeIdx === idx ? 'bg-primary border-primary' : 'bg-white/70 border-white'}`}
                                    aria-label={`Show image ${idx + 1}`}
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      setActiveIdx(idx); 
                                      setImgError(false); 
                                      setImgLoading(true); 
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                            {/* Zoom indicator */}
                            <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-sm">🔍</span>
                            </div>
                          </>
                        )}
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl w-full p-0 bg-black/95">
                      <div className="relative w-full h-[80vh] flex items-center justify-center">
                        {images.length === 0 || imgError ? (
                          <img
                            src={PLACEHOLDER}
                            alt="No product image"
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <img
                            src={images[activeIdx]}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        )}
                        {images.length > 1 && (
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                            {images.map((_, idx) => (
                              <button
                                key={idx}
                                className={`w-3 h-3 rounded-full border-2 ${activeIdx === idx ? 'bg-white border-white' : 'bg-white/50 border-white/50'}`}
                                aria-label={`Show image ${idx + 1}`}
                                onClick={() => { setActiveIdx(idx); setImgError(false); setImgLoading(true); }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
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
                    <div className="w-12 h-12 mx-auto bg-foreground rounded-sm flex items-center justify-center">
                      <span className="text-background font-bold text-xl">⭐</span>
                    </div>
                    <h3 className="font-semibold">Commercial Grade</h3>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 mx-auto bg-foreground rounded-sm flex items-center justify-center">
                      <span className="text-background font-bold text-xl">⚙️</span>
                    </div>
                    <h3 className="font-semibold">Made to Order</h3>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 mx-auto bg-foreground rounded-sm flex items-center justify-center">
                      <span className="text-background font-bold text-xl">🇦🇺</span>
                    </div>
                    <h3 className="font-semibold">Australian Product</h3>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 mx-auto bg-foreground rounded-sm flex items-center justify-center">
                      <span className="text-background font-bold text-xl">✓</span>
                    </div>
                    <h3 className="font-semibold">Specification Ready</h3>
                  </div>
                </div>
              </div>
            </div>
          </section>

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