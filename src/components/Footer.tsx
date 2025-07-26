import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";
const Footer = () => {
  return <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-bold mb-4">AusWindowShrouds</div>
            <p className="text-primary-foreground/80 mb-4">
              Australia's premier window shroud specialists, delivering quality 
              architectural solutions since 2008.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-primary-foreground/60 hover:text-primary-foreground cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-primary-foreground/60 hover:text-primary-foreground cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 text-primary-foreground/60 hover:text-primary-foreground cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Residential Shrouds</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Commercial Projects</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Custom Installation</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Design Consultation</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Maintenance</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Service Areas</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>Brisbane & South East QLD</li>
              <li>Sydney & Greater NSW</li>
              <li>Melbourne & Victoria</li>
              <li>Perth & Western Australia</li>
              <li>Regional Queensland</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-primary-foreground/80">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>(03) 9020 1422</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="break-all">info@auswindowshrouds.com.au</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Servicing All Major Australian Cities</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
          <p>© 2025 AusWindowShrouds.com.au. All rights reserved. | ABN: 22 665 547 375</p>
        </div>
      </div>
    </footer>;
};
export default Footer;