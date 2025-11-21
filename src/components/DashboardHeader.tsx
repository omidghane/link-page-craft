import { Package, Home, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import delinexLogo from "@/assets/delinex-logo2.jpg";

export const DashboardHeader = () => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img
                src={delinexLogo}
                alt="Delinex Logo"
                className="h-12 w-auto object-contain mx-auto"
              />
            <span className="text-xl font-bold">Delinex</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-sm font-medium text-primary transition-colors">
              پنل
            </Link>
            <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              مسیریابی
            </Link>
            <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              گزارشات
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Settings className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Home className="h-5 w-5" />
          </button>
          <Avatar className="cursor-pointer">
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};
