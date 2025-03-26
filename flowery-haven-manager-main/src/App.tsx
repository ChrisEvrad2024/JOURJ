// src/App.tsx (mise à jour avec lazy loading)
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { I18nProvider } from './contexts/I18nContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AppInitializationService } from './services';
import OfflineIndicator from './components/common/OfflineIndicator';
import { Progress } from "@/components/ui/progress";
import CartMergeDialog from '@/components/cart/CartMergeDialog';
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";

// Import des composants principaux (non lazy-loaded)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";

// Loading Fallback Component with better error handling
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
      <p>Chargement...</p>
    </div>
  </div>
);

// Error Fallback Component
const ErrorFallback = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center max-w-md mx-auto p-6 bg-red-50 rounded-lg border border-red-200">
      <h2 className="text-xl font-semibold text-red-700 mb-2">
        Une erreur est survenue
      </h2>
      <p className="text-red-600 mb-4">
        Nous n'avons pas pu charger cette page. Veuillez réessayer.
      </p>
      <pre className="text-sm bg-white p-3 rounded border text-left overflow-auto max-h-32">
        {error?.message || "Erreur inconnue"}
      </pre>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
      >
        Recharger la page
      </button>
    </div>
  </div>
);

// Wrapper pour gérer les erreurs
class ErrorBoundaryWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by error boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Lazy-load des composants avec gestion d'erreur
const lazyWithErrorHandling = (importFunc) => {
  const LazyComponent = lazy(importFunc);
  return (props) => (
    <Suspense fallback={<LoadingFallback />}>
      <ErrorBoundaryWrapper>
        <LazyComponent {...props} />
      </ErrorBoundaryWrapper>
    </Suspense>
  );
};

// Lazy-load des composants non critiques avec gestion d'erreur
const Catalog = lazyWithErrorHandling(() => import('./pages/Catalog'));
const ProductDetail = lazyWithErrorHandling(() => import('./pages/ProductDetail'));
const Cart = lazyWithErrorHandling(() => import('./pages/Cart'));
const Wishlist = lazyWithErrorHandling(() => import('./pages/Wishlist'));
const Register = lazyWithErrorHandling(() => import('./pages/auth/Register'));
const ForgotPassword = lazyWithErrorHandling(() => import('./pages/auth/ForgotPassword'));
const AccountLayout = lazyWithErrorHandling(() => import('./components/layout/AccountLayout'));
const MyAccount = lazyWithErrorHandling(() => import('./pages/account/MyAccount'));
const ProfileSettings = lazyWithErrorHandling(() => import('./pages/account/ProfileSettings'));
const OrderHistory = lazyWithErrorHandling(() => import('./pages/account/OrderHistory'));
const Addresses = lazyWithErrorHandling(() => import('./pages/account/Addresses'));
const AdminLayout = lazyWithErrorHandling(() => import('./components/layout/AdminLayout'));
const AdminDashboard = lazyWithErrorHandling(() => import('./pages/admin/AdminDashboard'));
const ProductsManagement = lazyWithErrorHandling(() => import('./pages/admin/ProductsManagement'));
const BlogManagement = lazyWithErrorHandling(() => import('./pages/admin/BlogManagement'));
const CustomersManagement = lazyWithErrorHandling(() => import('./pages/admin/CustomersManagement'));
const Blog = lazyWithErrorHandling(() => import('./pages/Blog'));
const BlogPost = lazyWithErrorHandling(() => import('./pages/BlogPost'));
const Contact = lazyWithErrorHandling(() => import('./pages/Contact'));
const About = lazyWithErrorHandling(() => import('./pages/About'));
// Ajoutons l'import de la page de devis
const Quote = lazyWithErrorHandling(() => import('./pages/Quote'));
// Ajout du dashboard de devis pour les utilisateurs
const QuoteDashboard = lazyWithErrorHandling(() => import('./pages/account/QuoteDashboard'));
// Ajout des composants admin pour la gestion des devis et autres
const AdminOrdersManagement = lazyWithErrorHandling(() => import('./pages/admin/AdminOrdersManagement'));
const AdminQuotesManagement = lazyWithErrorHandling(() => import('./pages/admin/AdminQuotesManagement'));
const AdminAnalytics = lazyWithErrorHandling(() => import('./pages/admin/AdminAnalytics'));
const AdminSettings = lazyWithErrorHandling(() => import('./pages/admin/AdminSettings'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const LoadingScreen = ({ progress, status }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-8">
    <div className="w-full max-w-md space-y-6 text-center">
      <h1 className="text-3xl font-serif mb-2">ChezFlora</h1>
      <p className="text-muted-foreground mb-8">Préparation de votre expérience florale...</p>
      
      <Progress value={progress} className="w-full h-2" />
      
      <p className="text-sm text-muted-foreground mt-4">{status}</p>
      
      <div className="animate-pulse mt-8">
        <div className="h-16 w-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
);

const App = () => {
  const [loading, setLoading] = useState({
    isInitializing: true,
    progress: 0,
    status: "Initialisation..."
  });

  // Initialiser l'application avec des données de démo
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Étape 1: Initialisation de la base de données (25%)
        setLoading({
          isInitializing: true,
          progress: 0,
          status: "Préparation de la base de données..."
        });
        
        await AppInitializationService.initDb();
        
        setLoading({
          isInitializing: true,
          progress: 25,
          status: "Chargement des produits..."
        });
        
        // Étape 2: Chargement des produits essentiels (50%)
        await AppInitializationService.initEssentialData();
        
        setLoading({
          isInitializing: true,
          progress: 50,
          status: "Chargement des utilisateurs..."
        });
        
        // Étape 3: Chargement des données utilisateur (75%)
        await AppInitializationService.initUserData();
        
        setLoading({
          isInitializing: true,
          progress: 75,
          status: "Finalisation..."
        });
        
        // Étape 4: Finalisation (100%)
        // Charger les données non essentielles en arrière-plan
        setTimeout(() => {
          AppInitializationService.initNonEssentialData()
            .then(() => console.log("Données non essentielles chargées"))
            .catch(err => console.error("Erreur chargement données non essentielles:", err));
        }, 1000);
        
        setLoading({
          isInitializing: false,
          progress: 100,
          status: "Application prête!"
        });
        
        console.log('Application initialized successfully');
      } catch (err) {
        console.error('Error initializing app:', err);
        setLoading({
          isInitializing: true,
          progress: 100,
          status: "Erreur d'initialisation. Veuillez rafraîchir la page."
        });
      }
    };

    initializeApp();
  }, []);

  // Afficher un écran de chargement pendant l'initialisation
  if (loading.isInitializing) {
    return <LoadingScreen progress={loading.progress} status={loading.status} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/catalog" element={<Catalog />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:id" element={<BlogPost />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/quote" element={<Quote />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                    <CartMergeDialog />
                    {/* Auth Routes */}
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/register" element={<Register />} />
                    <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                    
                    {/* Account Routes - Protégées */}
                    <Route path="/account" element={
                      <ProtectedRoute>
                        <AccountLayout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<MyAccount />} />
                      <Route path="profile" element={<ProfileSettings />} />
                      <Route path="orders" element={<OrderHistory />} />
                      <Route path="quotes" element={<QuoteDashboard />} />
                      <Route path="addresses" element={<Addresses />} />
                    </Route>
                    
                    {/* Admin Routes - Protégées + exigence admin */}
                    <Route path="/admin" element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminLayout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<AdminDashboard />} />
                      <Route path="products" element={<ProductsManagement />} />
                      <Route path="blog" element={<BlogManagement />} />
                      <Route path="customers" element={<CustomersManagement />} />
                      <Route path="orders" element={<AdminOrdersManagement />} />
                      <Route path="quotes" element={<AdminQuotesManagement />} />
                      <Route path="analytics" element={<AdminAnalytics />} />
                      <Route path="settings" element={<AdminSettings />} />
                    </Route>
                    
                    {/* Route 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <OfflineIndicator />
                </BrowserRouter>
              </TooltipProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
};

export default App;