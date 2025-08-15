import { Card, CardContent } from "@/components/ui/card";

type Configuration = {
  id: string;
  title: string;
  image: string;
};

type ProductStandardConfigurationsProps = {
  productType?: "box" | "curved";
};

const boxConfigurations: Configuration[] = [
  {
    id: "4-sided",
    title: "THERMACORE© Box Shroud 4-sided",
    image: "https://nlxdrbqstjodlkrsisbd.supabase.co/storage/v1/object/public/aws-media/e96318a6-ab01-49c0-9e67-bf5092788161.png"
  },
  {
    id: "3-sided",
    title: "THERMACORE© Box Shroud 3-sided",
    image: "https://nlxdrbqstjodlkrsisbd.supabase.co/storage/v1/object/public/aws-media/768020d3-4afb-4044-ad5e-f1a1487a00c0.png"
  },
  {
    id: "2-sided",
    title: "THERMACORE© Box Shroud 2-sided",
    image: "https://nlxdrbqstjodlkrsisbd.supabase.co/storage/v1/object/public/aws-media/16fba105-5a55-4b35-baf4-715f4d5c09c4.png"
  }
];

const curvedConfigurations: Configuration[] = [
  {
    id: "curved-half",
    title: "THERMACORE© Curved Half",
    image: "https://nlxdrbqstjodlkrsisbd.supabase.co/storage/v1/object/public/aws-media/48d299ce-0ca2-4cd6-98d0-717c56bd5559.png"
  },
  {
    id: "curved-full",
    title: "THERMACORE© Curved Full",
    image: "https://nlxdrbqstjodlkrsisbd.supabase.co/storage/v1/object/public/aws-media/c86ee74d-7166-4406-aaed-74a622328222.png"
  }
];

const ProductStandardConfigurations = ({ productType = "box" }: ProductStandardConfigurationsProps) => {
  const configurations = productType === "curved" ? curvedConfigurations : boxConfigurations;
  const gridCols = productType === "curved" ? "md:grid-cols-2" : "md:grid-cols-3";

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