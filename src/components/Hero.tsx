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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-glow/20 p-4 rounded-full mb-4">
                <Shield className="w-8 h-8 text-primary-glow" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Premium Quality</h3>
              <p className="text-primary-foreground/70">Australian-made materials built to last</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-glow/20 p-4 rounded-full mb-4">
                <Star className="w-8 h-8 text-primary-glow" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Expert Installation</h3>
              <p className="text-primary-foreground/70">Professional fitting by certified technicians</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-glow/20 p-4 rounded-full mb-4">
                <Users className="w-8 h-8 text-primary-glow" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Trusted by 1000+</h3>
              <p className="text-primary-foreground/70">Satisfied customers across Australia</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;