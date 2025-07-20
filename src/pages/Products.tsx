import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Sun, Wind, Wrench, Star } from "lucide-react";

const Products = () => {
  const products = [
    {
      id: 1,
      name: "Fixed Window Shrouds",
      description: "Permanent architectural screening solutions for enhanced privacy and style",
      features: ["Weather resistant materials", "Custom sizing available", "Multiple finishes", "UV protection"],
      price: "From $299",
      image: "/lovable-uploads/e9471843-6a3a-4c47-a0f4-28ed932348a4.png",
      popular: false
    },
    {
      id: 2,
      name: "Adjustable Louvre Shrouds",
      description: "Versatile screening with adjustable slats for optimal light and airflow control",
      features: ["Adjustable slat angles", "Easy operation", "Premium aluminum", "10-year warranty"],
      price: "From $599",
      image: "/lovable-uploads/3ce8917c-cb8f-4f4d-a942-4c3f850d1c47.png",
      popular: true
    },
    {
      id: 3,
      name: "Motorized Screen Systems",
      description: "Smart automated window screening with remote control operation",
      features: ["Remote control", "Weather sensors", "Smart home integration", "Quiet operation"],
      price: "From $1,299",
      image: "/lovable-uploads/ac7d710d-dfad-4ca8-862e-faca579d2447.png",
      popular: false
    },
    {
      id: 4,
      name: "Decorative Panel Shrouds",
      description: "Architectural feature panels that combine style with function",
      features: ["Custom patterns", "Laser-cut designs", "Premium materials", "Architectural grade"],
      price: "From $799",
      image: "/lovable-uploads/a296ce98-9e42-4bd8-ad52-b5c23e16640d.png",
      popular: false
    }
  ];

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
      description: "Professional installation with minimal disruption"
    },
    {
      icon: Star,
      title: "Premium Quality",
      description: "High-grade materials with extended warranties"
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
              Our Window Shroud
              <span className="block text-primary">Products</span>
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
          <h2 className="text-3xl font-bold text-center mb-12">Product Range</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover-scale">
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />
                  {product.popular && (
                    <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  )}
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">{product.price}</span>
                    <Button variant="outline">Get Quote</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Property?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Contact us today for a free consultation and custom quote for your window shroud project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8">
              Get Free Quote
            </Button>
            <Button variant="outline" size="lg" className="px-8">
              Download Brochure
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Products;