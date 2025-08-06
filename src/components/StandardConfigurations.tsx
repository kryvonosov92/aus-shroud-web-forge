import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const StandardConfigurations = () => {
  const configurations = [
    {
      title: "ThermaCore© Box Shroud 4-Sided",
      description: "Complete perimeter shroud for maximum thermal efficiency and visual impact",
      image: "/lovable-uploads/1e8cf5e6-f82b-4128-849e-ec0679731b56.png",
      features: [
        "Complete window frame coverage",
        "Maximum thermal efficiency",
        "Enhanced privacy control",
        "Superior weather protection"
      ],
      specifications: [
        "Width: Custom to opening + 200mm",
        "Height: Custom to opening + 200mm", 
        "Depth: 100mm standard",
        "Material: 2mm Aluminium"
      ]
    },
    {
      title: "ThermaCore© Box Shroud 3-Sided", 
      description: "U-shaped configuration providing excellent shading while maintaining accessibility",
      image: "/lovable-uploads/bc739e8c-75f3-47e1-8df1-ee4f84ed92f2.png",
      features: [
        "Three-sided protection",
        "Maintains bottom access",
        "Optimal shading performance",
        "Cost-effective solution"
      ],
      specifications: [
        "Width: Custom to opening + 200mm",
        "Height: Custom to opening + 100mm",
        "Depth: 100mm standard", 
        "Material: 2mm Aluminium"
      ]
    },
    {
      title: "ThermaCore© Box Shroud 2-Sided",
      description: "Corner configuration ideal for architectural features and specific design requirements",
      image: "/lovable-uploads/cbabfa4e-a223-4c81-855a-868e11e1cacf.png", 
      features: [
        "L-shaped configuration",
        "Architectural accent feature",
        "Targeted shading control",
        "Flexible installation"
      ],
      specifications: [
        "Width: Custom to requirements",
        "Height: Custom to requirements",
        "Depth: 100mm standard",
        "Material: 2mm Aluminium"
      ]
    }
  ];

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-foreground">
            Standard Configurations
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Choose from our range of ThermaCore© Box Shroud configurations designed to meet various architectural and functional requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-16">
          {configurations.map((config, index) => (
            <Card key={index} className="border-border hover:shadow-elegant transition-all duration-300 group overflow-hidden">
              <div className="aspect-square overflow-hidden bg-secondary/20">
                <img 
                  src={config.image} 
                  alt={config.title}
                  className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader className="pb-6">
                <CardTitle className="text-xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                  {config.title}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {config.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Key Features</h4>
                  <ul className="space-y-2">
                    {config.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 mt-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Specifications</h4>
                  <ul className="space-y-2">
                    {config.specifications.map((spec, specIndex) => (
                      <li key={specIndex} className="flex items-start text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full mr-3 mt-2 flex-shrink-0" />
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <div className="bg-secondary/30 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Custom Dimensions Available</h3>
            <p className="text-muted-foreground leading-relaxed">
              All configurations can be manufactured to custom dimensions to suit your specific project requirements. 
              Contact our team for detailed specifications and pricing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StandardConfigurations;