import { Button } from "@/components/ui/button";
import { ArrowRight, Link, Shield, Star, Users } from "lucide-react";
import HeroSlideshow from "./HeroSlideshow";
const Hero = () => {
  return <section id="home" className="relative min-h-[calc(100svh-var(--nav-height))] max-h-[80vh] md:max-h-none flex items-center overflow-hidden">
      <HeroSlideshow />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center text-primary-foreground">
          <h1 className="text-4xl md:text-6xl lg:text-7xl mb-8 lg:mb-12 leading-tight font-bold uppercase">
            Window Shading
            <span className="block text-sandstone">Designed</span>
            for Australian Homes
          </h1>
          
          <p className="text-xl md:text-2xl lg:text-3xl mb-12 lg:mb-16 text-primary-foreground/90 max-w-4xl mx-auto leading-relaxed">Talk to us today about your project's custom window shroud and screen needs</p>
          
          <div className="flex flex-col sm:flex-row gap-6 lg:gap-8 justify-center">
            <a href="#contact">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6 h-14">
                Request Quote
                <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
            <a href="/latest">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6 h-14">
                Latest Projects
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;