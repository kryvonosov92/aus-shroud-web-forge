import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Configuration = {
  id: string;
  title: string;
  modelCode: string;
  image: string;
  description?: string;
};

const configurations: Configuration[] = [
  {
    id: "single-blade",
    title: "SINGLE BLADE",
    modelCode: "TC-1T",
    image: "/lovable-uploads/343f3cb9-d1c4-4136-96d5-13942a24619d.png",
    description: "Clean, minimalist single blade design"
  },
  {
    id: "top-bottom",
    title: "TOP & BOTTOM",
    modelCode: "TC-2TB",
    image: "/lovable-uploads/3ce8917c-cb8f-4f4d-a942-4c3f850d1c47.png",
    description: "Dual blade configuration for enhanced coverage"
  },
  {
    id: "angle-left",
    title: "ANGLE LEFT",
    modelCode: "TC-2AL",
    image: "/lovable-uploads/492e0bbf-6590-4f46-b1ac-2e1d032d1224.png",
    description: "Angled configuration for optimal left-side shading"
  },
  {
    id: "angle-right",
    title: "ANGLE RIGHT",
    modelCode: "TC-2AR",
    image: "/lovable-uploads/4d301aec-a0b4-475c-8de9-dbb4fa42adf0.png",
    description: "Angled configuration for optimal right-side shading"
  },
  {
    id: "open-side-right",
    title: "OPEN SIDE RIGHT",
    modelCode: "TC-3OSR",
    image: "/lovable-uploads/6e9df5ed-0dcb-49b9-87b2-7ff3d65c9a3c.png",
    description: "Three-sided coverage with right side open"
  },
  {
    id: "open-side-left",
    title: "OPEN SIDE LEFT",
    modelCode: "TC-3OSL",
    image: "/lovable-uploads/70ed9857-9c7c-463c-a206-4b2cd32c8fbf.png",
    description: "Three-sided coverage with left side open"
  },
  {
    id: "open-base",
    title: "OPEN BASE",
    modelCode: "TC-3OB",
    image: "/lovable-uploads/9593b4b6-fe53-493a-9ed2-125e78f06c67.png",
    description: "Three-sided coverage with base open"
  },
  {
    id: "standard",
    title: "STANDARD",
    modelCode: "TC-4S",
    image: "/lovable-uploads/a296ce98-9e42-4bd8-ad52-b5c23e16640d.png",
    description: "Complete four-sided shroud coverage"
  }
];

const StandardConfigurations = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage] = useState(4);

  const totalPages = Math.ceil(configurations.length / itemsPerPage);
  const currentConfigs = configurations.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              STANDARD CONFIGURATIONS
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from our range of pre-designed configurations, each engineered for specific architectural requirements and aesthetic preferences.
            </p>
          </div>

          {/* Configuration Grid */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {currentConfigs.map((config) => (
                <Card key={config.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
                      <img
                        src={config.image}
                        alt={`ThermaCore© ${config.title}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="font-bold text-lg">{config.title}</h3>
                      <p className="text-sm font-mono text-primary">{config.modelCode}</p>
                      {config.description && (
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Navigation */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevSlide}
                  disabled={currentIndex === 0}
                  className="h-10 w-10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                {/* Page Indicators */}
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentIndex
                          ? "bg-primary"
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                      aria-label={`Go to page ${index + 1}`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextSlide}
                  disabled={currentIndex === totalPages - 1}
                  className="h-10 w-10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Can't find the perfect configuration? We offer custom solutions tailored to your specific requirements.
            </p>
            <Button variant="outline" size="lg">
              Request Custom Configuration
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StandardConfigurations;