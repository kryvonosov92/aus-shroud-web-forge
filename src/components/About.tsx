import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Award, MapPin, Clock } from "lucide-react";
const About = () => {
  const stats = [{
    icon: Globe,
    label: "",
    value: "Australian Product"
  }, {
    icon: Award,
    label: "Years Experience",
    value: "15+"
  }, {
    icon: MapPin,
    label: "",
    value: "Nation-wide Delivery"
  }, {
    icon: Clock,
    label: "Customer Satisfaction",
    value: "98%"
  }];
  const values = [{
    title: "Australian Made",
    description: "All our window shrouds are manufactured right here in Australia using premium local materials."
  }, {
    title: "Expert Craftsmanship",
    description: "Our team of skilled professionals brings over 15 years of experience in architectural solutions."
  }, {
    title: "Quality Guarantee",
    description: "We stand behind our work with comprehensive warranties and ongoing support for all installations."
  }, {
    title: "Custom Solutions",
    description: "Every project is unique. We create bespoke window shroud solutions tailored to your specific requirements."
  }];
  return <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Who we are</h2>
          <p className="text-xl text-muted-foreground mb-8">Australia's leading provider of premium window shading products, combining exceptional craftsmanship with innovative design to suit any client's needs</p>
          <p className="text-lg text-foreground">Founded in 2022, we've fast grown from a small Melbourne-based operation to Australia's most trusted window shroud specialists. Our commitment to quality, innovation, and a focus on strong partner relationships has made us the preferred choice for builders, architects and homeowners. All our products are proudly Australian-owned, designed and manufactured. </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => <div key={index} className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((value, index) => <Card key={index} className="border-border">
              <CardHeader>
                <CardTitle className="text-xl">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>)}
        </div>
      </div>
    </section>;
};
export default About;