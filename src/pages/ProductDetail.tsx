import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
    <div className="min-h-screen">
      <Header />
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center text-lg">Loading product...</div>
          ) : !product ? (
            <div className="text-center text-lg">Product not found.</div>
          ) : (
            <Card className="max-w-2xl mx-auto overflow-hidden">
              <div className="relative w-full aspect-[4/3] bg-muted flex items-center justify-center">
                {/* Image Carousel or Fallback */}
                {images.length === 0 || imgError ? (
                  <img
                    src={PLACEHOLDER}
                    alt="No product image"
                    className="object-contain w-full h-full"
                    style={{ minHeight: 200 }}
                  />
                ) : (
                  <>
                    <img
                      src={images[activeIdx]}
                      alt={product.name}
                      className={`object-contain w-full h-full transition-opacity duration-300 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
                      onLoad={handleImgLoad}
                      onError={handleImgError}
                      style={{ minHeight: 200 }}
                    />
                    {imgLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
                        <span className="text-muted-foreground">Loading image...</span>
                      </div>
                    )}
                    {images.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            className={`w-3 h-3 rounded-full border ${activeIdx === idx ? 'bg-primary' : 'bg-white/70'}`}
                            style={{ borderColor: activeIdx === idx ? '#1e293b' : '#e5e7eb' }}
                            aria-label={`Show image ${idx + 1}`}
                            onClick={() => { setActiveIdx(idx); setImgError(false); setImgLoading(true); }}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-3xl">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-2xl font-bold text-primary">
                    {product.price ? `From $${parseFloat(product.price as any).toLocaleString()}` : ''}
                  </span>
                  <Button variant="outline">Get Quote</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ProductDetail; 