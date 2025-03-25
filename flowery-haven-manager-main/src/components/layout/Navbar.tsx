// src/components/layout/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, Heart, User } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSelector from '@/components/shared/LanguageSelector';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { cartItems, cartTotal, cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { currentUser, logout } = useAuth();

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
          className="font-serif text-2xl font-medium tracking-tight"
        >
          ChezFlora
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
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
          <Link 
            to={currentUser ? "/account" : "/auth/login"} 
            className="p-2 hover:text-primary transition-colors"
          >
            <User size={20} />
          </Link>
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
            
            {currentUser ? (
              <>
                <Link 
                  to="/account" 
                  className="text-lg font-medium hover:text-primary transition-colors animate-underline"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Mon compte
                </Link>
                <button
                  className="text-lg font-medium hover:text-primary transition-colors animate-underline"
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