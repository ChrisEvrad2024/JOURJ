import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  User, Settings, ShoppingBag, MapPin, CreditCard, 
  Heart, Clock, Bell, Gift 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCartItemCount } from "@/lib/cart";

// Define type for Wishlist items based on existing code
type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image: string;
};

const MyAccount = () => {
  const [userData, setUserData] = useState<any>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get user data from localStorage
        const user = localStorage.getItem("user");
        if (user) {
          try {
            setUserData(JSON.parse(user));
          } catch (error) {
            console.error("Failed to parse user data:", error);
          }
        }
        
        // Get wishlist and cart counts synchronously
        // Using our own function to get wishlist items since the export is missing
        const getWishlistItems = (): WishlistItem[] => {
          try {
            const items = localStorage.getItem("wishlist");
            return items ? JSON.parse(items) : [];
          } catch (error) {
            console.error("Failed to parse wishlist items:", error);
            return [];
          }
        };
        
        // Make sure getCartItemCount() is not returning a promise
        // If it is, you need to await it and handle accordingly
        const currentCartCount = getCartItemCount();
        
        setWishlistCount(getWishlistItems().length);
        setCartCount(typeof currentCartCount === 'number' ? currentCartCount : 0);
      } catch (error) {
        console.error("Error loading account data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Update counts when localStorage changes
    const handleStorageChange = () => {
      try {
        const getWishlistItems = (): WishlistItem[] => {
          try {
            const items = localStorage.getItem("wishlist");
            return items ? JSON.parse(items) : [];
          } catch (error) {
            console.error("Failed to parse wishlist items:", error);
            return [];
          }
        };
        
        const currentCartCount = getCartItemCount();
        
        setWishlistCount(getWishlistItems().length);
        setCartCount(typeof currentCartCount === 'number' ? currentCartCount : 0);
      } catch (error) {
        console.error("Error updating counts:", error);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("wishlistUpdated", handleStorageChange);
    window.addEventListener("cartUpdated", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("wishlistUpdated", handleStorageChange);
      window.removeEventListener("cartUpdated", handleStorageChange);
    };
  }, []);

  // Account sections
  const accountCards = [
    {
      title: "Informations personnelles",
      description: "Gérez vos informations de profil et de connexion",
      icon: <User className="h-5 w-5" />,
      href: "/account/profile",
      color: "bg-blue-50"
    },
    {
      title: "Mes commandes",
      description: "Suivez vos commandes et l'historique d'achats",
      icon: <ShoppingBag className="h-5 w-5" />,
      href: "/account/orders",
      color: "bg-green-50"
    },
    {
      title: "Mes adresses",
      description: "Gérez vos adresses de livraison et de facturation",
      icon: <MapPin className="h-5 w-5" />,
      href: "/account/addresses",
      color: "bg-purple-50"
    },
    {
      title: "Méthodes de paiement",
      description: "Gérez vos cartes bancaires et autres méthodes de paiement",
      icon: <CreditCard className="h-5 w-5" />,
      href: "/account/payment",
      color: "bg-yellow-50"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-serif">Bonjour, {userData?.firstName || 'utilisateur'} 👋</h1>
        <p className="text-muted-foreground">
          Bienvenue dans votre espace personnel. Gérez vos informations, commandes et préférences.
        </p>
      </div>
      
      {/* Dashboard summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Panier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{cartCount}</div>
              <Link to="/cart">
                <Button variant="outline" size="sm">Voir le panier</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Liste de souhaits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{wishlistCount}</div>
              <Link to="/wishlist">
                <Button variant="outline" size="sm">Voir les favoris</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">0</div>
              <Link to="/account/orders">
                <Button variant="outline" size="sm">Historique</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main account sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accountCards.map((card, index) => (
          <Link key={index} to={card.href}>
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <div className={`w-10 h-10 rounded-full ${card.color} flex items-center justify-center mb-2`}>
                  {card.icon}
                </div>
                <CardTitle className="text-xl">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="text-primary">
                  Gérer &rarr;
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyAccount;