import { Button } from "@/components/ui/button";
import { ArrowRight, Link, Shield, Star, Users } from "lucide-react";
import HeroSlideshow from "./HeroSlideshow";
import myRenoRulesLogo from "@/assets/my-reno-rules.webp";
import channel7Logo from "@/assets/channel-7.png";
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
          
          <div className="mb-10 lg:mb-14 flex flex-col items-center gap-4">
            <p className="text-sm md:text-base uppercase tracking-[0.2em] text-primary-foreground/80 font-sans">As Featured On</p>
            <div className="flex items-center justify-center gap-8 md:gap-12">
              <img src={myRenoRulesLogo} alt="My Reno Rules" className="h-12 md:h-16 lg:h-20 w-auto object-contain drop-shadow-lg" loading="lazy" />
              <img src={channel7Logo} alt="Channel 7" className="h-12 md:h-16 lg:h-20 w-auto object-contain drop-shadow-lg" loading="lazy" />
            </div>
          </div>

          
          
          <div className="flex flex-col sm:flex-row gap-6 lg:gap-8 justify-center">
            <a href="#contact">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6 h-14">
                Request Quote
                <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
            <a href="https://www.instagram.com/auswindowshrouds_/" target="_blank" rel="noopener noreferrer">
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