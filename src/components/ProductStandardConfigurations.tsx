import { Card, CardContent } from "@/components/ui/card";

type Configuration = {
  id: string;
  title: string;
  modelCode: string;
  image: string;
  description: string;
  features: string[];
};

const configurations: Configuration[] = [
  {
    id: "4-sided",
    title: "THERMACORE© Box Shroud 4-sided",
    modelCode: "TC-4S",
    image: "/lovable-uploads/e96318a6-ab01-49c0-9e67-bf5092788161.png",
    description: "Complete four-sided frame for maximum coverage and protection",
    features: ["Complete enclosure", "Maximum weather protection", "Optimal thermal performance", "Architectural symmetry"]
  },
  {
    id: "3-sided",
    title: "THERMACORE© Box Shroud 3-sided",
    modelCode: "TC-3S",
    image: "/lovable-uploads/768020d3-4afb-4044-ad5e-f1a1487a00c0.png",
    description: "U-shaped three-sided shroud for enhanced protection without full enclosure",
    features: ["Partial enclosure", "Enhanced ventilation", "Reduced material cost", "Easy maintenance access"]
  },
  {
    id: "2-sided",
    title: "THERMACORE© Box Shroud 2-sided",
    modelCode: "TC-2S",
    image: "/lovable-uploads/16fba105-5a55-4b35-baf4-715f4d5c09c4.png",
    description: "L-shaped corner configuration for optimal corner installations",
    features: ["Corner protection", "Minimal footprint", "Cost effective", "Flexible installation"]
  }
];

const ProductStandardConfigurations = () => {
  return (
    <section className="py-16 bg-muted/20">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {configurations.map((config) => (
              <Card key={config.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="aspect-square bg-background rounded-lg mb-6 overflow-hidden border">
                    <img
                      src={config.image}
                      alt={config.title}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-xl mb-2">{config.title}</h3>
                      <p className="text-sm text-muted-foreground font-medium mb-2">
                        Model: {config.modelCode}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {config.description}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Key Features:</h4>
                      <ul className="space-y-1">
                        {config.features.map((feature, index) => (
                          <li key={index} className="text-xs text-muted-foreground flex items-center">
                            <span className="w-1 h-1 bg-primary rounded-full mr-2 flex-shrink-0"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Custom Note */}
          <div className="text-center">
            <p className="text-muted-foreground mb-2">
              All configurations available in custom dimensions up to 6000mm x 6000mm*
            </p>
            <p className="text-xs text-muted-foreground">
              *Subject to engineering requirements and structural limitations
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductStandardConfigurations;