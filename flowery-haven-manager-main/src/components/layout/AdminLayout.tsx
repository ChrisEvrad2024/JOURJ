import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  PackageOpen, 
  Users, 
  ShoppingBag, 
  Settings, 
  FileText, 
  BarChart3,
  LogOut,
  Menu,
  AlertTriangle,
  Home,
  ArrowLeft,
  Tag,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(true); // Always set to true to bypass auth check
  const [isLoading, setIsLoading] = useState(false); // Set to false to skip loading state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  // Check if current route is in products section
  useEffect(() => {
    if (location.pathname.startsWith('/admin/products')) {
      setIsProductsOpen(true);
    }
  }, [location.pathname]);

  // Authentication check is now disabled
  useEffect(() => {
    console.log("Admin authentication check bypassed");
    // No authentication check - always considered authenticated
  }, []);

  // Logout handler
  const handleLogout = () => {
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  // Back to site handler
  const handleBackToSite = () => {
    navigate("/");
  };

  // Navigation items for the sidebar
  const navigationItems = [
    { 
      label: "Tableau de bord", 
      href: "/admin", 
      icon: <LayoutDashboard size={18} /> 
    },
    { 
      label: "Produits",
      icon: <PackageOpen size={18} />,
      isCollapsible: true,
      children: [
        { 
          label: "Tous les produits", 
          href: "/admin/products",
          icon: <PackageOpen size={16} /> 
        },
        { 
          label: "Catégories", 
          href: "/admin/products/categories",
          icon: <Tag size={16} /> 
        },
        { 
          label: "Réapprovisionnement", 
          href: "/admin/products/restock",
          icon: <RefreshCw size={16} /> 
        }
      ]
    },
    { 
      label: "Commandes", 
      href: "/admin/orders", 
      icon: <ShoppingBag size={18} /> 
    },
    { 
      label: "Clients", 
      href: "/admin/customers", 
      icon: <Users size={18} /> 
    },
    { 
      label: "Blog", 
      href: "/admin/blog", 
      icon: <FileText size={18} /> 
    },
    { 
      label: "Statistiques", 
      href: "/admin/analytics", 
      icon: <BarChart3 size={18} /> 
    },
    { 
      label: "Paramètres", 
      href: "/admin/settings", 
      icon: <Settings size={18} /> 
    },
  ];

  const Sidebar = () => (
    <div className="space-y-1">
      <div className="px-3 py-4">
        <h2 className="text-lg font-semibold mb-1">Admin ChezFlora</h2>
        <p className="text-sm text-muted-foreground">Gérez votre boutique</p>
      </div>
      
      <Separator />
      
      <nav className="space-y-1 px-3 py-2">
        {navigationItems.map((item) => 
          item.isCollapsible ? (
            <Collapsible 
              key={item.label}
              open={isProductsOpen}
              onOpenChange={setIsProductsOpen}
              className="w-full"
            >
              <CollapsibleTrigger className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted w-full transition-colors text-left">
                {item.icon}
                <span>{item.label}</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-9 space-y-1 mt-1">
                {item.children?.map((child) => (
                  <Link 
                    key={child.href} 
                    to={child.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted w-full transition-colors ${
                      location.pathname === child.href ? "bg-muted/80 font-medium" : ""
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {child.icon}
                    <span>{child.label}</span>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <Link 
              key={item.href} 
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted w-full transition-colors ${
                location.pathname === item.href ? "bg-muted font-medium" : ""
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        )}
        <Separator className="my-2" />
        
        {/* Bouton Retour au site */}
        <Button 
          variant="outline" 
          className="flex items-center gap-3 px-3 py-2 rounded-md w-full transition-colors justify-start font-normal"
          onClick={handleBackToSite}
        >
          <Home size={18} />
          <span>Retour au site</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 w-full transition-colors text-destructive justify-start font-normal mt-2"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Déconnexion</span>
        </Button>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r h-screen overflow-y-auto sticky top-0">
        <Sidebar />
      </aside>
      
      {/* Mobile sidebar (sheet) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-10 bg-background border-b flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={20} />
          </Button>
          <h1 className="font-semibold">Admin ChezFlora</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBackToSite}
            title="Retour au site"
          >
            <Home size={20} />
          </Button>
        </header>
        
        {/* Content */}
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              {/* Le titre sera ajouté par chaque page */}
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleBackToSite}
            >
              <ArrowLeft size={16} />
              Retour au site
            </Button>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;