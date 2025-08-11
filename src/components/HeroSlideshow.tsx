import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { type CarouselApi } from "@/components/ui/carousel";

const slides = [
  {
    id: 1,
    image: "/lovable-uploads/a3dfe94a-179a-4c2c-b164-a5875b958caa.png",
    alt: "Modern grey vertical cladding with dark window shrouds and trim details"
  },
  {
    id: 2,
    image: "/lovable-uploads/ac7d710d-dfad-4ca8-862e-faca579d2447.png",
    alt: "Curved modern architecture with timber screening and window shrouds"
  },
  {
    id: 3,
    image: "/lovable-uploads/e9471843-6a3a-4c47-a0f4-28ed932348a4.png",
    alt: "Modern brick and metal cladding house with stylish window features"
  },
  {
    id: 4,
    image: "/lovable-uploads/492e0bbf-6590-4f46-b1ac-2e1d032d1224.png",
    alt: "Contemporary home with angular window shroud projecting from vertical cladding"
  },
  {
    id: 5,
    image: "/lovable-uploads/3ce8917c-cb8f-4f4d-a942-4c3f850d1c47.png",
    alt: "Detailed view of modern window framing with stone accent wall"
  },
  {
    id: 6,
    image: "/lovable-uploads/343f3cb9-d1c4-4136-96d5-13942a24619d.png",
    alt: "Contemporary home with prominent upper window feature and vertical screening elements"
  }
];

const HeroSlideshow = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });

    // Auto-play functionality
    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <Carousel
        setApi={setApi}
        className="w-full h-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="w-full h-full ml-0">
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="w-full h-full pl-0">
              <div className="relative w-full h-full bg-gray-900 overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className={`w-full h-full object-cover ${
                    slide.id === 4 ? 'object-[center_30%]' : 
                    slide.id === 6 ? 'object-[center_25%]' : 
                    slide.id === 3 ? 'object-[center_40%]' : 
                    'object-center'
                  }`}
                  loading={slide.id === 1 ? 'eager' : 'lazy'}
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white/30" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white/30" />
      </Carousel>

      {/* Dots indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === current 
                ? "bg-white scale-110" 
                : "bg-white/50 hover:bg-white/70"
            }`}
            onClick={() => api?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlideshow;