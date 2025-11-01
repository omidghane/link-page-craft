import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { Button } from "./ui/button";

export const Header = () => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-primary rounded-lg p-1.5">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Delinex</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              خانه
            </Link>
            <Link to="#about" className="text-sm font-medium hover:text-primary transition-colors">
              درباره
            </Link>
            <Link to="#features" className="text-sm font-medium hover:text-primary transition-colors">
              صفحات
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              ورود
            </Button>
          </Link>
          <Link to="/login">
            <Button size="sm" className="bg-primary hover:bg-primary-hover">
              ثبت نام
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
