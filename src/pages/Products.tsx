import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Sun, Wind, Wrench, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('name', ['ThermaCore© Box Shroud', 'ThermaCore© Corner Shroud', 'ThermaCore© Hood', 'ThermaCore© Tapered Shroud', 'ThermaCore© Louvered Shroud', 'ThermaCore© Modular Shroud', 'ThermaCore© Curved Shroud', 'ThermaCore© Boxed Shroud', 'LouvreShield© Awning', 'BattenShield© Screen', 'PerfaShield© Screen', 'LouvreShield© Screen']);
      
      if (!error && data) {
        // Sort products according to our desired order
        const desiredOrder = ['ThermaCore© Box Shroud', 'ThermaCore© Corner Shroud', 'ThermaCore© Hood', 'ThermaCore© Tapered Shroud', 'ThermaCore© Louvered Shroud', 'ThermaCore© Modular Shroud', 'ThermaCore© Curved Shroud', 'ThermaCore© Boxed Shroud', 'LouvreShield© Awning', 'BattenShield© Screen', 'PerfaShield© Screen', 'LouvreShield© Screen'];
        const sortedProducts = desiredOrder.map(name => data.find(product => product.name === name)).filter(Boolean);
        setProducts(sortedProducts);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Weather Protection",
      description: "Built to withstand Australian weather conditions"
    },
    {
      icon: Eye,
      title: "Privacy Control",
      description: "Enhance privacy without sacrificing natural light"
    },
    {
      icon: Sun,
      title: "UV Protection",
      description: "Block harmful UV rays while maintaining visibility"
    },
    {
      icon: Wind,
      title: "Ventilation",
      description: "Maintain airflow while providing screening"
    },
    {
      icon: Wrench,
      title: "Easy Installation",
      description: "User-friendly installation that most carpenters handle with ease"
    },
    {
      icon: Star,
      title: "Premium Quality",
      description: "High-grade materials from Australian suppliers with extended warranties"
    }
  ];

  return (
    <div className="min-h-screen">
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
                  <Link to={`/products/${encodeURIComponent(product.name.toLowerCase().replace(/\s+/g, '-'))}`} className="block">
                     <div className="relative">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-64 object-contain bg-muted/30"
                         onError={(e) => {
                           console.error(`Failed to load image for ${product.name}:`, product.image_url);
                           e.currentTarget.src = "/placeholder.svg";
                         }}
                         onLoad={() => {
                           console.log(`Successfully loaded image for ${product.name}:`, product.image_url);
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