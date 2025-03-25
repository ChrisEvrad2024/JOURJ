import { ReactNode } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  FileText, 
  Settings,
  ChevronRight
} from 'lucide-react';

const AccountLayout = () => {
  const { currentUser, isAdmin } = useAuth();
  const location = useLocation();
  
  // Options de navigation dans le compte
  const navItems = [
    {
      label: "Mon compte",
      href: "/account",
      icon: <User className="h-5 w-5" />,
      exact: true
    },
    {
      label: "Mes commandes",
      href: "/account/orders",
      icon: <ShoppingBag className="h-5 w-5" />
    },
    {
      label: "Mes devis",
      href: "/account/quotes",
      icon: <FileText className="h-5 w-5" />
    },
    {
      label: "Mes adresses",
      href: "/account/addresses",
      icon: <MapPin className="h-5 w-5" />
    },
    {
      label: "Paramètres",
      href: "/account/profile",
      icon: <Settings className="h-5 w-5" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="mb-6">
                <h2 className="text-2xl font-serif mb-1">Mon compte</h2>
                <p className="text-muted-foreground">
                  Bienvenue, {currentUser?.firstName || 'utilisateur'}
                </p>
              </div>
              
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.exact}
                    className={({ isActive }) => `
                      flex items-center gap-3 p-3 rounded-md transition-colors
                      ${isActive 
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted text-foreground"
                      }
                    `}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
                
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 p-3 rounded-md transition-colors text-red-600 hover:bg-red-50 mt-4"
                  >
                    <span className="w-5 h-5 bg-red-100 rounded-md flex items-center justify-center text-red-600 font-semibold text-xs">A</span>
                    <span>Administration</span>
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Link>
                )}
              </nav>
            </aside>
            
            {/* Content */}
            <div className="flex-1">
              <div className="lg:hidden mb-6">
                <nav className="flex flex-wrap gap-2">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      end={item.exact}
                      className={({ isActive }) => `
                        px-3 py-1.5 rounded-full text-sm transition-colors
                        ${isActive 
                          ? "bg-primary text-white font-medium"
                          : "bg-muted/60 hover:bg-muted"
                        }
                      `}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
                <Separator className="my-6" />
              </div>
              
              <Outlet />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AccountLayout;