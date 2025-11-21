import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import delinexLogo from "@/assets/delinex-logo2.jpg";

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {/* <div className="bg-primary rounded-lg p-1.5">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div> */}
              <img
                src={delinexLogo}
                alt="Delinex Logo"
                className="h-12 w-auto object-contain mx-auto drop-shadow"
              />
              <span className="text-lg font-bold">Delinex</span>
            </div>
            <p className="text-sm text-muted-foreground">
              اتوماسیون لجستیک برای حمل‌ونقل سریع‌تر، هوشمندتر و کارآمدتر.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">حقوقی</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-primary transition-colors">حریم خصوصی</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">شرایط استفاده</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">راهنما</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-primary transition-colors">درباره ما</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">راهنمای سفارش</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">شرکت</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-primary transition-colors">تماس با ما</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">همکاری با ما</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Delinex. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
