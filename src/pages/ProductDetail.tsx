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
  category?: string;
  created_at?: string;
  updated_at?: string;
};

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

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
              <div className="relative">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
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