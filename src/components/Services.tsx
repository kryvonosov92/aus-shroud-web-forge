import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Building2, Eye, Sun, Wrench, Palette } from "lucide-react";
const Services = () => {
  const services = [{
    icon: Palette,
    title: "Design Appeal",
    description: "Window shrouds are fast becoming a staple in contemporary architectural design. Enhance your project's visual appeal with our Aluminium Shrouds.",
    features: ["Contemporary Feature", "Clean lines", "Reduce visual bulk", "Add depth and articulation"]
  }, {
    icon: Sun,
    title: "Thermal Efficiency",
    description: "Increase your home's thermal performance with our window shading products.",
    features: ["Assist NatHERS 7-Star", "Assist BASIX", "Reduce solar heat gain", "Reduce cooling load"]
  }, {
    icon: Eye,
    title: "Privacy Control",
    description: "Enhance privacy of your home without compromising on natural light or architectural appeal.",
    features: ["Variable opacity", "Strategic placement", "Elegant design"]
  }];
  return <section id="services" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Why use our products?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Comprehensive range of window shading and privacy systems designed to cater to any project, big or small. </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => <Card key={index} className="border-border hover:shadow-elegant transition-all duration-300 group">
              <CardHeader>
                <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">{service.title}</CardTitle>
                <CardDescription className="text-base">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                      {feature}
                    </li>)}
                </ul>
              </CardContent>
            </Card>)}
        </div>

        <div className="text-center">
          <Button variant="hero" size="lg" className="px-8">
            Request Service Quote
          </Button>
        </div>
      </div>
    </section>;
};
export default Services;