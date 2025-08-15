type Configuration = {
  id: string;
  title: string;
  image: string;
};

type ProductStandardConfigurationsProps = {
  productType?: "box" | "curved";
  items?: Configuration[];
  heading?: string;
  description?: string;
};

const ProductStandardConfigurations = ({ productType = "box", items, heading = "STANDARD CONFIGURATIONS", description = "Choose from our range of pre-designed configurations, each engineered for specific architectural requirements and aesthetic preferences." }: ProductStandardConfigurationsProps) => {
  const configurations = Array.isArray(items) ? items : [];
  const gridCols = productType === "curved" ? "md:grid-cols-2" : "md:grid-cols-3";

  if (configurations.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold tracking-tight mb-4">{heading}</h2>
            {description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
            )}
          </div>

          {/* Configuration Grid */}
          <div className={`grid grid-cols-1 ${gridCols} gap-8 mb-12 ${productType === "curved" ? "max-w-4xl mx-auto" : ""}`}>
            {configurations.map((config) => (
              <div key={config.id} className="group">
                <div className="aspect-[5/4] bg-muted rounded-lg mb-6 overflow-hidden p-4">
                  <img
                    src={config.image}
                    alt={config.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-xl">{config.title}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Note */}
          <div className="text-center">
            <p className="text-muted-foreground">
              Not the right combination? Contact us for a custom request.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductStandardConfigurations;