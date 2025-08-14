import { Button } from "@/components/ui/button";
import { Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/df654ff6-def4-4349-8292-8713634579f4.png" 
              alt="AusWindowShrouds Logo" 
              className="h-28 w-auto"
              style={{ clipPath: 'inset(15% 0 15% 0)' }}
            />
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-foreground hover:text-primary transition-colors">
              Products
            </Link>
            <Link to="/#services" className="text-foreground hover:text-primary transition-colors">
              Why AWS
            </Link>
            <Link to="/#about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/latest" className="text-foreground hover:text-primary transition-colors">
              Latest
            </Link>
            <Link to="/#contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Button variant="outline-hero" size="sm" className="hidden sm:flex" asChild>
              <a href="mailto:info@auswindowshrouds.com.au">
                <Mail className="w-4 h-4" />
                Email Us
              </a>
            </Button>
            <Button variant="outline-hero" size="sm" className="hidden sm:flex" asChild>
              <a href="tel:0390201422">
                <Phone className="w-4 h-4" />
                Call Now
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;