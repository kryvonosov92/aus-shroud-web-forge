import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Star, Users } from "lucide-react";
import HeroSlideshow from "./HeroSlideshow";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center">
      <HeroSlideshow />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-primary-foreground">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Premium Window
            <span className="block text-primary-glow">Shrouds</span>
            for Australian Homes
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-primary-foreground/80 max-w-3xl mx-auto">
            Transform your property with our expertly crafted window shrouds. 
            Enhance privacy, control light, and add architectural elegance to any building.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="lg" className="text-lg px-8 py-6">
              Get Free Quote
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline-hero" size="lg" className="text-lg px-8 py-6">
              View Gallery
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;