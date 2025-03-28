// src/components/layout/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, Heart, User, LogOut, Settings } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSelector from '@/components/shared/LanguageSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";


// ChezFlora Logo Component
const ChezFloraLogo = ({ className = "h-12" }) => {
  return (
    <svg 
      viewBox="0 0 400 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* CHEZ text in pink */}
      <text x="25" y="60" fontFamily="serif" fontSize="45" fill="#E5848A">CHEZ</text>
      
      {/* FLORA text in black */}
      <text x="140" y="60" fontFamily="serif" fontSize="65" fontWeight="500" fill="#000000">FLORA</text>
      
      {/* Rose illustration */}
      <g transform="translate(240, 45) scale(0.8)">
        <path d="M30,0 C40,10 50,20 40,30 C30,40 20,30 10,20 C0,10 10,0 30,0" fill="#FFB6C1" />
        <path d="M25,5 C35,15 40,20 35,30 C30,35 20,30 15,20 C10,15 15,5 25,5" fill="#FF9AA2" />
        <path d="M25,10 C30,15 35,25 30,30 C25,35 15,25 20,15 C22,12 23,10 25,10" fill="#E5848A" />
        <path d="M30,0 C40,10 50,20 40,30 C30,40 20,30 10,20 C0,10 10,0 30,0" fill="none" stroke="#000000" strokeWidth="1.5" />
      </g>
    </svg>
  );
};

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { cartItems, cartTotal, cartCount } = useCart();
  const wishlist = useWishlist();
  // Utilisation sécurisée de la valeur wishlistCount
  const wishlistCount = wishlist?.wishlistCount || wishlist?.items?.length || 0;
  const { currentUser, logout, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'navbar-scrolled py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/"
          className="font-serif tracking-tight flex items-center"
        >
          <ChezFloraLogo className="h-10 md:h-12" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className="text-sm font-medium hover:text-primary transition-colors animate-underline"
          >
            Accueil
          </Link>
          <Link 
            to="/catalog" 
            className="text-sm font-medium hover:text-primary transition-colors animate-underline"
          >
            Boutique
          </Link>
          <Link 
            to="/wishlist" 
            className="text-sm font-medium hover:text-primary transition-colors animate-underline"
          >
            Wishlist
          </Link>
          <Link 
            to="/about" 
            className="text-sm font-medium hover:text-primary transition-colors animate-underline"
          >
            À Propos
          </Link>
          <Link 
            to="/blog" 
            className="text-sm font-medium hover:text-primary transition-colors animate-underline"
          >
            Blog
          </Link>
          <Link 
            to="/contact" 
            className="text-sm font-medium hover:text-primary transition-colors animate-underline"
          >
            Contact
          </Link>
          {/* Ajout d'un lien pour les devis */}
          <Link 
            to="/quote" 
            className="text-sm font-medium hover:text-primary transition-colors animate-underline"
          >
            Devis
          </Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-2">
          <LanguageSelector />
          <button className="p-2 hover:text-primary transition-colors">
            <Search size={20} />
          </button>
          <Link to="/wishlist" className="p-2 hover:text-primary transition-colors relative">
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="p-2 hover:text-primary transition-colors relative">
            <ShoppingBag size={20} />
            {cartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems > 99 ? '99+' : cartItems}
              </span>
            )}
          </Link>
          
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:text-primary transition-colors relative">
                  <Avatar className="h-8 w-8 border-2 border-primary cursor-pointer">
                    <AvatarFallback>
                      {getInitials(currentUser.firstName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Profil utilisateur</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{currentUser.firstName} {currentUser.lastName}</span>
                    <span className="text-xs text-muted-foreground">{currentUser.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account" className="w-full cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Mon compte
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/orders" className="w-full cursor-pointer">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Mes commandes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/profile" className="w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </Link>
                </DropdownMenuItem>
                
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="w-full cursor-pointer">
                        <Badge variant="outline" className="mr-2 bg-primary/10 text-primary">Admin</Badge>
                        Dashboard administration
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link 
              to="/auth/login" 
              className="p-2 hover:text-primary transition-colors"
            >
              <User size={20} />
            </Link>
          )}
          
          <button 
            className="md:hidden p-2 hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 pt-20 px-4">
          <nav className="flex flex-col space-y-6 items-center">
            <Link 
              to="/" 
              className="text-lg font-medium hover:text-primary transition-colors animate-underline"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link 
              to="/catalog" 
              className="text-lg font-medium hover:text-primary transition-colors animate-underline"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Boutique
            </Link>
            <Link 
              to="/wishlist" 
              className="text-lg font-medium hover:text-primary transition-colors animate-underline"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Wishlist
            </Link>
            <Link 
              to="/about" 
              className="text-lg font-medium hover:text-primary transition-colors animate-underline"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              À Propos
            </Link>
            <Link 
              to="/blog" 
              className="text-lg font-medium hover:text-primary transition-colors animate-underline"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link 
              to="/contact" 
              className="text-lg font-medium hover:text-primary transition-colors animate-underline"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link 
              to="/quote" 
              className="text-lg font-medium hover:text-primary transition-colors animate-underline"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Devis
            </Link>
            
            {currentUser ? (
              <>
                <Link 
                  to="/account" 
                  className="text-lg font-medium hover:text-primary transition-colors animate-underline"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Mon compte
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-lg font-medium text-primary font-semibold hover:text-primary/80 transition-colors animate-underline flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Badge variant="outline" className="bg-primary/10 text-primary">Admin</Badge>
                    Dashboard
                  </Link>
                )}
                <button
                  className="text-lg font-medium hover:text-red-500 transition-colors animate-underline"
                  onClick={handleLogout}
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link 
                to="/auth/login"
                className="text-lg font-medium hover:text-primary transition-colors animate-underline"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Connexion
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;