// src/pages/OrderConfirmation.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, ChevronRight, Calendar, Package, Truck, MapPin, Phone, User, Mail } from 'lucide-react';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        
        // Dans une application réelle, vous feriez un appel API pour récupérer les détails de la commande
        // Pour cette démonstration, nous utilisons des données fictives
        // // const mockOrder = {
        // //   id: orderId,
        // //   orderNumber: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        // //   status: 'pending',
        // //   items: [
        // //     { id: '1', name: 'Bouquet Élégance Rose', price: 59.99, quantity: 1, total: 59.99 },
        // //     { id: '2', name: 'Orchidée Zen', price: 69.99, quantity: 2, total: 139.98 }
        // //   ],
        // //   subtotal: 199.97,
        // //   shippingFee: 7.90,
        // //   taxAmount: 39.99,
        // //   total: 247.86,
        // //   createdAt: new Date().toISOString(),
        // //   customerName: 'Jean Dupont',
        // //   customerEmail: 'jean.dupont@example.com',
        // //   shippingAddress: {
        // //     address1: '123 Rue de Paris',
        // //     address2: 'Apt 4B',
        // //     city: 'Paris',
        // //     postalCode: '75001',
        // //     country: 'France'
        // //   },
        // //   paymentMethod: 'credit_card',
        // //   shippingMethod: 'standard',
        // //   estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        // // };
        
        // setOrder(mockOrder);
      } catch (error) {
        console.error("Error fetching order:", error);
        setError("Impossible de récupérer les détails de la commande");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-16 min-h-screen">
          <div className="container mx-auto px-4 max-w-3xl">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p>Chargement des détails de la commande...</p>
                </div>
              </CardContent>
            </Card>
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
          <div className="container mx-auto px-4 max-w-3xl">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <h2 className="text-2xl font-serif mb-4">Commande introuvable</h2>
                  <p className="text-muted-foreground mb-8">{error || "Les détails de cette commande ne sont pas disponibles."}</p>
                  <Button asChild>
                    <Link to="/account/orders">Voir mes commandes</Link>
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
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Success header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
              <CheckCircle size={32} />
            </div>
            <h1 className="text-3xl font-serif mb-2">Commande confirmée !</h1>
            <p className="text-muted-foreground">
              Merci pour votre achat. Votre commande a été enregistrée avec succès.
            </p>
          </div>

          {/* Order details card */}
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif de la commande</CardTitle>
              <CardDescription>
                Commande #{order.orderNumber} • Passée le {new Date(order.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order status */}
              <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Package size={18} />
                  </div>
                  <div>
                    <p className="font-medium">Statut de la commande</p>
                    <p className="text-sm text-muted-foreground">En attente</p>
                  </div>
                </div>
                <Link to={`/account/orders/${order.id}`} className="text-primary text-sm font-medium flex items-center">
                  Suivi de commande <ChevronRight size={16} />
                </Link>
              </div>

              {/* Expected delivery */}
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="font-medium">Livraison prévue</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Shipping details */}
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Truck size={18} />
                </div>
                <div>
                  <p className="font-medium">Mode de livraison</p>
                  <p className="text-sm text-muted-foreground">
                    {order.shippingMethod === 'standard' ? 'Livraison standard (3-5 jours)' : 'Livraison express (1-2 jours)'}
                  </p>
                </div>
              </div>

              {/* Shipping address */}
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mt-0.5">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="font-medium">Adresse de livraison</p>
                  <address className="text-sm text-muted-foreground not-italic">
                    {order.shippingAddress.address1}
                    {order.shippingAddress.address2 && <span>, {order.shippingAddress.address2}</span>}
                    <br />
                    {order.shippingAddress.postalCode} {order.shippingAddress.city}
                    <br />
                    {order.shippingAddress.country}
                  </address>
                </div>
              </div>

              {/* Customer info */}
              <div className="flex flex-col md:flex-row md:gap-8">
                <div className="flex items-center gap-3 mb-3 md:mb-0">
                  <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="font-medium">Client</p>
                    <p className="text-sm text-muted-foreground">{order.customerName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mb-3 md:mb-0">
                  <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Order items */}
              <div>
                <h3 className="font-medium mb-4">Articles commandés</h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{item.quantity}x</span>
                        <span>{item.name}</span>
                      </div>
                      <span>{item.total.toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Order summary */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{order.subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frais de livraison</span>
                  <span>{order.shippingFee.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TVA</span>
                  <span>{order.taxAmount.toFixed(2)} €</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{order.total.toFixed(2)} €</span>
               </div>
             </div>

             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
               <Button asChild variant="outline">
                 <Link to="/catalog">Continuer vos achats</Link>
               </Button>
               <Button asChild>
                 <Link to="/account/orders">Voir mes commandes</Link>
               </Button>
             </div>
           </CardContent>
         </Card>
       </div>
     </main>
     <Footer />
   </>
 );
};

export default OrderConfirmation;