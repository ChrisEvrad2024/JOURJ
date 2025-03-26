// src/pages/OrderConfirmation.jsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  ShoppingBag, 
  ChevronRight, 
  Home, 
  Package, 
  ClipboardCheck
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useOrders } from '@/hooks/useOrders';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { getOrderById } = useOrders();
  
  // Récupérer les détails de la commande
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        // Rediriger vers la page d'accueil si aucun ID de commande n'est fourni
        navigate('/');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const orderDetails = await getOrderById(orderId);
        
        if (!orderDetails) {
          throw new Error('Commande introuvable');
        }
        
        setOrder(orderDetails);
      } catch (err) {
        console.error('Erreur lors de la récupération de la commande:', err);
        setError('Impossible de récupérer les détails de votre commande. Veuillez vérifier votre historique de commandes.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId, navigate, getOrderById]);
  
  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Formater la date de livraison estimée (date commande + 3-5 jours ouvrés)
  const getEstimatedDelivery = () => {
    if (!order?.createdAt) return '';
    
    const orderDate = new Date(order.createdAt);
    const deliveryDate = new Date(orderDate);
    
    // Ajouter 3-5 jours ouvrés (on prend 5 jours pour être prudent)
    deliveryDate.setDate(orderDate.getDate() + 5);
    
    return formatDate(deliveryDate);
  };
  
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-16 min-h-screen">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  if (error || !order) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-16 min-h-screen">
          <div className="container max-w-4xl mx-auto px-4">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-red-100 w-16 h-16 flex items-center justify-center mb-4">
                  <Package className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-medium mb-2">Commande introuvable</h2>
                <p className="text-muted-foreground text-center mb-6">
                  {error || "Nous n'avons pas pu trouver les détails de votre commande."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild variant="outline">
                    <Link to="/">
                      <Home className="mr-2 h-4 w-4" />
                      Retour à l'accueil
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/account/orders">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Voir mes commandes
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-16 min-h-screen">
        <div className="container max-w-4xl mx-auto px-4">
          <Card className="border-green-200">
            <CardHeader className="pb-4 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-serif">Merci pour votre commande!</CardTitle>
              <CardDescription className="text-base">
                Votre commande a été confirmée et sera traitée rapidement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 text-center">
                <p className="text-lg mb-1">Numéro de commande: <span className="font-medium">{order.orderNumber || order.id}</span></p>
                <p className="text-muted-foreground">Un email de confirmation a été envoyé à {order.shippingAddress?.email}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Récapitulatif de la commande */}
                <div className="space-y-4">
                  <h3 className="font-medium mb-2">Détails de la commande</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date de commande:</span>
                      <span className="font-medium">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Livraison estimée:</span>
                      <span className="font-medium">{getEstimatedDelivery()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mode de paiement:</span>
                      <span className="font-medium">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mode de livraison:</span>
                      <span className="font-medium">{order.shippingMethod?.name || "Standard"}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-medium mb-2 pt-2">Adresse de livraison</h3>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                    <p>{order.shippingAddress?.address1}</p>
                    {order.shippingAddress?.address2 && <p>{order.shippingAddress.address2}</p>}
                    <p>{order.shippingAddress?.postalCode} {order.shippingAddress?.city}</p>
                    <p>{order.shippingAddress?.country}</p>
                  </div>
                </div>
                
                {/* Récapitulatif des prix */}
                <div className="space-y-4">
                  <h3 className="font-medium mb-2">Récapitulatif</h3>
                  
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>{order.subtotal?.toFixed(2) || '0.00'} XAF</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Frais de livraison</span>
                      <span>{order.shippingCost?.toFixed(2) || '0.00'} XAF</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">TVA</span>
                      <span>{order.taxAmount?.toFixed(2) || '0.00'} XAF</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{order.total?.toFixed(2) || '0.00'} XAF</span>
                    </div>
                  </div>
                  
                  <h3 className="font-medium mb-2 pt-2">Articles commandés</h3>
                  
                  <div className="space-y-3">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm items-start">
                        <div>
                          <span className="font-medium">{item.name || item.productName}</span>
                          <span className="text-muted-foreground"> × {item.quantity}</span>
                        </div>
                        <span>{(item.price * item.quantity).toFixed(2)} XAF</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button asChild variant="outline">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Continuer vos achats
                </Link>
              </Button>
              <Button asChild>
                <Link to="/account/orders">
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Suivre ma commande
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Section aide supplémentaire */}
          <div className="mt-12">
            <h2 className="text-lg font-medium mb-6 text-center">Besoin d'aide ?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-3">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">Suivre ma commande</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Consultez votre espace client pour suivre l'état de votre commande.
                    </p>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link to="/account/orders">
                        Mes commandes
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-3">
                      <ShoppingBag className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">Découvrir nos produits</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Explorez notre sélection de fleurs et plantes pour votre prochain achat.
                    </p>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link to="/catalog">
                        Parcourir le catalogue
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-3">
                      <ClipboardCheck className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">Besoin d'assistance ?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Notre équipe est disponible pour répondre à toutes vos questions.
                    </p>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link to="/contact">
                        Contacter le support
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default OrderConfirmation;