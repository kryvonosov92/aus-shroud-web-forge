import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Eye, Sun, Wind, Wrench, Star } from "lucide-react";
import siteContent from "@/config/site-content.json";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { createSlug } from "@/lib/slugify";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      
      if (!error && data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const slugToURL = (value: string) => encodeURIComponent(value);
  const itemListSchema = products && products.length ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p: any, idx: number) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${origin}/products/${slugToURL((p as any).slug || createSlug(p.name))}`,
      name: p.name
    }))
  } : undefined;

  const iconMap = { Shield, Eye, Sun, Wind, Wrench, Star } as const;
  const features = (siteContent as any).productFeatures?.map((f: any) => ({
    icon: iconMap[f.icon as keyof typeof iconMap] || Shield,
    title: f.title,
    description: f.description,
  })) || [];

  return (
    <div className="min-h-screen">
      <SEO
        title="Window Shrouds & Screens | Product Range"
        description="Explore our range of aluminium window shrouds, screens and awnings designed for Australian conditions."
        canonicalPath="/products"
        structuredData={itemListSchema}
      />
      <Header />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-primary-glow/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              <span className="text-primary">Product Range</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover our comprehensive range of window shrouds and screening solutions designed for Australian homes and commercial properties.
            </p>
          </div>
        </div>
      </section>
      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center text-lg">Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover-scale">
                  <Link to={`/products/${slugToURL((product as any).slug || createSlug(product.name))}`} className="block">
                     <div className="relative h-64 bg-muted/30 flex items-center justify-center overflow-hidden">
                        <img
                          src={
                            ((product as any).images && (product as any).images.length > 0)
                              ? (product as any).images[0]
                              : "/placeholder.svg"
                          }
                          alt={`${product.name} - product image`}
                          className={`w-full h-full object-contain ${product.name?.toLowerCase().includes('curved shroud') || product.name?.toLowerCase().includes('tapered shroud') ? 'scale-125' : ''}`}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            console.error(`Failed to load image for ${product.name}`);
                            (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                          }}
                          onLoad={() => {
                            console.log(`Successfully loaded image for ${product.name}`);
                          }}
                        />
                      </div>
                    <CardHeader>
                      <CardTitle className="text-xl">{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Features and popular fields are omitted as they are not in the DB */}
                      <div className="flex items-center justify-end">
                        <Button variant="outline">View System</Button>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Features Grid */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Products?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need something custom?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Contact us today to discuss your project.
          </p>
          <div className="flex justify-center">
            <Button size="lg" className="px-8" asChild>
              <Link to="/#contact">Get In Touch</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Products;