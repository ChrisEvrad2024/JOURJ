// src/App.tsx (mise à jour avec lazy loading)
import { Suspense, lazy, useEffect, useState } from 'react';
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
import PreloadService from './services/PreloadService';
import OfflineIndicator from './components/common/OfflineIndicator';
import { Progress } from "@/components/ui/progress";

// Import des composants principaux (non lazy-loaded)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";

// Loading Fallback Component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
      <p>Chargement...</p>
    </div>
  </div>
);

// Lazy-load des composants non critiques
const Catalog = lazy(() => import('./pages/Catalog'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const AccountLayout = lazy(() => import('./components/layout/AccountLayout'));
const MyAccount = lazy(() => import('./pages/account/MyAccount'));
const ProfileSettings = lazy(() => import('./pages/account/ProfileSettings'));
const OrderHistory = lazy(() => import('./pages/account/OrderHistory'));
const Addresses = lazy(() => import('./pages/account/Addresses'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ProductsManagement = lazy(() => import('./pages/admin/ProductsManagement'));
const BlogManagement = lazy(() => import('./pages/admin/BlogManagement'));
const CustomersManagement = lazy(() => import('./pages/admin/CustomersManagement'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));

const queryClient = new QueryClient();

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
                  <Suspense fallback={<LoadingFallback />}>
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
                        {/* Ces routes seront implémentées plus tard */}
                        <Route path="orders" element={<div className="p-4">Gestion des commandes (à implémenter)</div>} />
                        <Route path="analytics" element={<div className="p-4">Statistiques (à implémenter)</div>} />
                        <Route path="settings" element={<div className="p-4">Paramètres (à implémenter)</div>} />
                      </Route>
                      
                      {/* Route 404 */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
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