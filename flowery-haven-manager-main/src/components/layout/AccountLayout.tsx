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
  Home,
  Menu,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "sonner";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(true); // Always set to true to bypass auth check
  const [isLoading, setIsLoading] = useState(false); // Set to false to skip loading state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Navigation items for the sidebar
  const navigationItems = [
    { 
      label: "Tableau de bord", 
      href: "/admin", 
      icon: <LayoutDashboard size={18} /> 
    },
    { 
      label: "Produits", 
      href: "/admin/products", 
      icon: <PackageOpen size={18} /> 
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
      <nav className="space-y-1 px-3 py-2">
        {navigationItems.map((item) => (
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
        ))}
        <Separator className="my-2" />
        <Button 
          variant="ghost" 
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 w-full transition-colors text-destructive justify-start font-normal"
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
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Admin ChezFLORA</h2>
            <p className="text-sm text-muted-foreground">Gestion de votre boutique</p>
          </div>
          <Link to="/" className="p-2 rounded-md hover:bg-muted transition-colors" title="Retour au site">
            <Home size={18} />
          </Link>
        </div>
        
        <Sidebar />
      </aside>
      
      {/* Mobile sidebar (sheet) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0">
          <div className="px-3 py-4">
            <h2 className="text-lg font-semibold mb-1">Admin ChezFLORA</h2>
            <p className="text-sm text-muted-foreground">Gérez votre boutique</p>
          </div>
          
          <Separator />
          
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
          <h1 className="font-semibold">Admin ChezFLORA</h1>
          <Link to="/" className="p-2 rounded-md hover:bg-muted transition-colors">
            <Home size={18} />
          </Link>
        </header>
        
        {/* Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;