import { Phone, Mail, MapPin, Instagram } from "lucide-react";
const Footer = () => {
  return <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Service Areas</h3>
            <p className="text-primary-foreground/80 mb-3">We offer Australia-wide delivery, including all states and territories:</p>
            
            <p className="text-primary-foreground/80 text-sm mb-3">
              New South Wales (Sydney, Newcastle, Wollongong) • Victoria (Melbourne, Geelong, Ballarat) • Queensland (Brisbane, Gold Coast, Sunshine Coast) • Western Australia (Perth, Bunbury)
            </p>
            
            <p className="text-primary-foreground/80 text-sm">
              South Australia (Adelaide) • Tasmania (Hobart, Launceston) • Australian Capital Territory (Canberra) • Northern Territory (Darwin, Alice Springs)
            </p>
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
          <p>© 2025 Aus Window Shrouds Pty Ltd all rights reserved | ABN: 22 665 547 375</p>
        </div>
      </div>
    </footer>;
};
export default Footer;