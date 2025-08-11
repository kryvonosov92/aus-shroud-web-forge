import { Globe, HardHat, MapPin, Clock } from "lucide-react";

const About = () => {
  const stats = [{
    icon: Globe,
    label: "",
    value: "Australian Product"
  }, {
    icon: HardHat,
    label: "",
    value: "Residential and Commercial"
  }, {
    icon: MapPin,
    label: "",
    value: "Nation-wide Delivery"
  }, {
    icon: Clock,
    label: "",
    value: "Fast Turnaround"
  }];

  return <section id="about" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-foreground">Who we are</h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed">Australia's leading provider of premium window shading products, combining exceptional craftsmanship with innovative design to suit any client's needs</p>
          <p className="text-lg md:text-xl text-foreground leading-relaxed max-w-4xl mx-auto">Founded in 2021, we've fast grown from a small Melbourne-based operation to Australia's most trusted window shroud specialists. Our commitment to quality, innovation, and a focus on strong partner relationships has made us the preferred choice for builders, architects and homeowners. All our products are proudly Australian-owned, designed and manufactured. </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => <div key={index} className="text-center">
              <div className="bg-primary/10 p-4 lg:p-6 rounded-full w-fit mx-auto mb-6">
                <stat.icon className="w-8 h-8 lg:w-10 lg:h-10 text-primary" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-primary mb-3">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>)}
        </div>
      </div>
    </section>;
};

export default About;