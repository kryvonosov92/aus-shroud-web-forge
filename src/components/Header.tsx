import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Phone, Mail, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import siteContent from "@/config/site-content.json";

const Header = () => {
  const logoUrl = (siteContent as any).brand?.logoUrl as string | undefined;
  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50" style={{ height: 'var(--nav-height)' }}>
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-2">
            <Link to="/" aria-label="Go to home">
              <img 
                src={logoUrl || "/favicon.ico"}
                alt="AusWindowShrouds Logo" 
                width={800}
                height={600}
                decoding="async"
                loading="eager"
                fetchPriority="high"
                className="w-auto"
                style={{ height: 'var(--nav-height)', clipPath: 'inset(15% 0 15% 0)' }}
              />
            </Link>
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

            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="px-0">
                  <SheetHeader className="px-6">
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 flex flex-col">
                    <nav className="flex flex-col divide-y">
                      <SheetClose asChild>
                        <Link to="/" className="px-6 py-4 text-base hover:bg-accent">Home</Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/products" className="px-6 py-4 text-base hover:bg-accent">Products</Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/#services" className="px-6 py-4 text-base hover:bg-accent">Why AWS</Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/#about" className="px-6 py-4 text-base hover:bg-accent">About</Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/latest" className="px-6 py-4 text-base hover:bg-accent">Latest</Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/#contact" className="px-6 py-4 text-base hover:bg-accent">Contact</Link>
                      </SheetClose>
                    </nav>
                    <div className="mt-6 px-6 space-y-3">
                      <SheetClose asChild>
                        <Button className="w-full" asChild>
                          <a href="/#enquiry" aria-label="Request a quote">Request Quote</a>
                        </Button>
                      </SheetClose>
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" asChild>
                          <a href="mailto:info@auswindowshrouds.com.au" aria-label="Email us">
                            <Mail className="w-4 h-4 mr-2" /> Email
                          </a>
                        </Button>
                        <Button variant="outline" asChild>
                          <a href="tel:0390201422" aria-label="Call now">
                            <Phone className="w-4 h-4 mr-2" /> Call
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;