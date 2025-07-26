import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Star, Users } from "lucide-react";
import HeroSlideshow from "./HeroSlideshow";
const Hero = () => {
  return <section id="home" className="relative h-screen flex items-center overflow-hidden">
      <HeroSlideshow />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-primary-foreground">
          <h1 className="text-3xl md:text-5xl mb-6 leading-tight">
            Window Shading
            <span className="block text-sandstone">Designed</span>
            for Australian Homes
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-primary-foreground/80 max-w-3xl mx-auto">Talk to us today about your project's custom window shroud and screen needs</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="lg" className="text-lg px-8 py-6 w-full sm:w-48">
              Request Quote
              <ArrowRight className="w-5 h-5" />
            </Button>
            <a href="https://www.instagram.com/auswindowshrouds/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline-hero" size="lg" className="text-lg px-8 py-6 w-full sm:w-48">
                Latest Projects
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;