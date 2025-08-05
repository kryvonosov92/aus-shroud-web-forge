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
    id: "standard-frame",
    title: "THERMACORE© Box Shroud 4-sided",
    modelCode: "TC-SF",
    image: "/lovable-uploads/389db33d-03a1-4b44-ba6f-943a0600e477.png",
    description: "Complete four-sided frame for maximum coverage"
  },
  {
    id: "three-sided",
    title: "THERMACORE© Box Shroud 3-sided",
    modelCode: "TC-3S",
    image: "/lovable-uploads/826fdb26-c44d-42b8-bed5-3c37320feb97.png",
    description: "U-shaped three-sided shroud for enhanced protection"
  },
  {
    id: "corner-frame",
    title: "THERMACORE© Box Shroud 2-sided",
    modelCode: "TC-CF",
    image: "/lovable-uploads/461cad04-cd76-4184-ba29-563a2948784c.png",
    description: "L-shaped corner configuration for optimal corner installation"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 justify-items-center">
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
          <div className="flex items-center justify-center py-16">
            <p className="text-muted-foreground text-lg max-w-2xl text-center leading-relaxed">
              Can't find the perfect configuration? We offer custom solutions tailored to your specific requirements.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StandardConfigurations;