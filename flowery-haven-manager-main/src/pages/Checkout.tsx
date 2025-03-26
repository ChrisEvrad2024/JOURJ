// src/pages/Checkout.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, ChevronLeft, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Checkout = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cartItems, cartTotal, createOrder } = useCart();
  const [loading, setLoading] = useState(false);
  
  // Shipping information state
 const [shippingInfo, setShippingInfo] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    postalCode: '',
    country: 'France',
  });
 
  // Payment information state
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'credit_card'
  });
 
  // Shipping method state
  const [shippingMethod, setShippingMethod] = useState('standard');
 
  // Calculate additional fees
  const shippingFee = 7.90;
  const taxRate = 0.20; // 20% TVA
  const taxAmount = cartTotal * taxRate;
  const orderTotal = cartTotal + shippingFee + taxAmount;
 
  // Handle shipping form changes
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };
 
  // Handle payment form changes
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({ ...prev, [name]: value }));
  };
 
  // Handle form submission
  const handleSubmitOrder = async () => {
    if (!currentUser) {
      toast.error("Veuillez vous connecter d'abord", {
        description: "Vous devez être connecté pour finaliser votre commande."
      });
      navigate('/auth/login');
      return;
    }
 
    // Validate shipping information
    if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.email || 
        !shippingInfo.address1 || !shippingInfo.city || !shippingInfo.postalCode) {
      toast.error("Informations incomplètes", {
        description: "Veuillez remplir tous les champs obligatoires de livraison."
      });
      return;
    }
 
    // Validate payment information
    if (paymentInfo.paymentMethod === 'credit_card') {
      if (!paymentInfo.cardNumber || !paymentInfo.cardHolder || !paymentInfo.expiryDate || !paymentInfo.cvv) {
        toast.error("Informations de paiement incomplètes", {
          description: "Veuillez remplir tous les champs de paiement."
        });
        return;
      }
    }
 
    try {
      setLoading(true);
 
      // Create order object
      const orderDetails = {
        userId: currentUser.id,
        shippingAddress: { ...shippingInfo },
        billingAddress: { ...shippingInfo }, // Same as shipping for simplicity
        shippingMethod,
        shippingFee,
        paymentMethod: paymentInfo.paymentMethod,
        taxAmount,
        customerEmail: shippingInfo.email,
        customerName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customerPhone: shippingInfo.phone
      };
 
      // Create order
      const order = await createOrder(orderDetails);
 
      // Show success toast
      toast.success("Commande confirmée !", {
        description: `Votre commande #${order.orderNumber} a été enregistrée avec succès.`
      });
 
      // Redirect to confirmation page
      navigate(`/order-confirmation/${order.id}`);
 
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Erreur lors de la création de la commande", {
        description: error instanceof Error ? error.message : "Une erreur est survenue"
      });
    } finally {
      setLoading(false);
    }
  };
 
  // If cart is empty, redirect to cart page
  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-16 min-h-screen">
          <div className="container mx-auto px-4 max-w-4xl">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <h2 className="text-2xl font-serif mb-4">Votre panier est vide</h2>
                  <p className="text-muted-foreground mb-8">Ajoutez des produits à votre panier avant de procéder au paiement.</p>
                  <Button onClick={() => navigate('/catalog')}>
                    Continuer mes achats
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
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate('/cart')} className="flex items-center gap-2">
              <ChevronLeft size={16} />
              Retour au panier
            </Button>
          </div>
 
          <h1 className="text-3xl font-serif mb-8">Finaliser votre commande</h1>
 
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Checkout forms section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations de livraison</CardTitle>
                  <CardDescription>Entrez votre adresse de livraison</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input 
                        id="firstName" 
                        name="firstName" 
                        value={shippingInfo.firstName} 
                        onChange={handleShippingChange} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input 
                        id="lastName" 
                        name="lastName" 
                        value={shippingInfo.lastName} 
                        onChange={handleShippingChange} 
                        required 
                      />
                    </div>
                  </div>
 
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={shippingInfo.email} 
                        onChange={handleShippingChange} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        value={shippingInfo.phone} 
                        onChange={handleShippingChange} 
                      />
                    </div>
                  </div>
 
                  <div className="space-y-2">
                    <Label htmlFor="address1">Adresse *</Label>
                    <Input 
                      id="address1" 
                      name="address1" 
                      value={shippingInfo.address1} 
                      onChange={handleShippingChange} 
                      required 
                    />
                  </div>
 
                  <div className="space-y-2">
                    <Label htmlFor="address2">Complément d'adresse</Label>
                    <Input 
                      id="address2" 
                      name="address2" 
                      value={shippingInfo.address2} 
                      onChange={handleShippingChange} 
                    />
                  </div>
 
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville *</Label>
                      <Input 
                        id="city" 
                        name="city" 
                        value={shippingInfo.city} 
                        onChange={handleShippingChange} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Code postal *</Label>
                      <Input 
                        id="postalCode" 
                        name="postalCode" 
                        value={shippingInfo.postalCode} 
                        onChange={handleShippingChange} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Pays *</Label>
                      <Select 
                        value={shippingInfo.country} 
                        onValueChange={(value) => setShippingInfo(prev => ({ ...prev, country: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un pays" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="Belgique">Belgique</SelectItem>
                          <SelectItem value="Suisse">Suisse</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
 
              {/* Shipping method */}
              <Card>
                <CardHeader>
                  <CardTitle>Mode de livraison</CardTitle>
                  <CardDescription>Choisissez votre méthode de livraison préférée</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="standard" 
                        name="shippingMethod" 
                        value="standard" 
                        checked={shippingMethod === 'standard'} 
                        onChange={() => setShippingMethod('standard')} 
                        className="h-4 w-4 text-primary"
                      />
                      <Label htmlFor="standard" className="flex justify-between items-center w-full">
                        <div>
                          <span className="font-medium">Livraison standard</span>
                          <p className="text-sm text-muted-foreground">Livraison en 3-5 jours ouvrés</p>
                        </div>
                        <span>7.90 €</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="express" 
                        name="shippingMethod" 
                        value="express" 
                        checked={shippingMethod === 'express'} 
                        onChange={() => setShippingMethod('express')} 
                        className="h-4 w-4 text-primary"
                      />
                      <Label htmlFor="express" className="flex justify-between items-center w-full">
                        <div>
                          <span className="font-medium">Livraison express</span>
                          <p className="text-sm text-muted-foreground">Livraison en 1-2 jours ouvrés</p>
                        </div>
                        <span>12.90 €</span>
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
 
              {/* Payment information */}
              <Card>
                <CardHeader>
                  <CardTitle>Méthode de paiement</CardTitle>
                  <CardDescription>Entrez vos informations de paiement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2 pb-4">
                    <input 
                      type="radio" 
                      id="credit_card" 
                      name="paymentMethod" 
                      value="credit_card" 
                      checked={paymentInfo.paymentMethod === 'credit_card'} 
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, paymentMethod: e.target.value }))} 
                      className="h-4 w-4 text-primary"
                    />
                    <Label htmlFor="credit_card" className="font-medium">Carte bancaire</Label>
                  </div>
 
                  {paymentInfo.paymentMethod === 'credit_card' && (
                    <div className="space-y-4 border p-4 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Numéro de carte</Label>
                        <Input 
                          id="cardNumber" 
                          name="cardNumber" 
                          placeholder="1234 5678 9012 3456" 
                          value={paymentInfo.cardNumber} 
                          onChange={handlePaymentChange} 
                        />
                      </div>
 
                      <div className="space-y-2">
                        <Label htmlFor="cardHolder">Titulaire de la carte</Label>
                        <Input 
                          id="cardHolder" 
                          name="cardHolder" 
                          placeholder="John Doe" 
                          value={paymentInfo.cardHolder} 
                          onChange={handlePaymentChange} 
                        />
                      </div>
 
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Date d'expiration</Label>
                          <Input 
                            id="expiryDate" 
                            name="expiryDate" 
                            placeholder="MM/AA" 
                            value={paymentInfo.expiryDate} 
                            onChange={handlePaymentChange} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input 
                            id="cvv" 
                            name="cvv" 
                            placeholder="123" 
                            value={paymentInfo.cvv} 
                            onChange={handlePaymentChange} 
                          />
                        </div>
                      </div>
                    </div>
                  )}
 
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="paypal" 
                      name="paymentMethod" 
                      value="paypal" 
                      checked={paymentInfo.paymentMethod === 'paypal'} 
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, paymentMethod: e.target.value }))} 
                      className="h-4 w-4 text-primary"
                    />
                    <Label htmlFor="paypal" className="font-medium">PayPal</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
 
            {/* Order summary section */}
           <div className="lg:col-span-1">
             <Card className="sticky top-28">
               <CardHeader>
                 <CardTitle>Récapitulatif de commande</CardTitle>
                 <CardDescription>
                   {cartItems.length} {cartItems.length > 1 ? 'articles' : 'article'} dans votre panier
                 </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 {/* Order items */}
                 <div className="space-y-4 max-h-64 overflow-y-auto">
                   {cartItems.map((item) => (
                     <div key={item.product.id} className="flex items-center gap-3">
                       <div className="h-16 w-16 rounded-md overflow-hidden border">
                         <img 
                           src={item.product.images?.[0] || '/placeholder.png'} 
                           alt={item.product.name} 
                           className="h-full w-full object-cover"
                         />
                       </div>
                       <div className="flex-1">
                         <p className="font-medium truncate">{item.product.name}</p>
                         <p className="text-sm text-muted-foreground">Qté: {item.quantity}</p>
                       </div>
                       <div className="text-right">
                         <p className="font-medium">{(item.product.price * item.quantity).toFixed(2)} €</p>
                       </div>
                     </div>
                   ))}
                 </div>

                 <Separator />
                 
                 {/* Order totals */}
                 <div className="space-y-2">
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Sous-total</span>
                     <span>{cartTotal.toFixed(2)} €</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Frais de livraison</span>
                     <span>{shippingFee.toFixed(2)} €</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">TVA (20%)</span>
                     <span>{taxAmount.toFixed(2)} €</span>
                   </div>
                 </div>

                 <Separator />
                 
                 {/* Order total */}
                 <div className="flex justify-between text-lg font-semibold">
                   <span>Total</span>
                   <span>{orderTotal.toFixed(2)} €</span>
                 </div>

                 {/* Submit order button */}
                 <Button 
                   className="w-full mt-6" 
                   size="lg"
                   onClick={handleSubmitOrder}
                   disabled={loading}
                 >
                   {loading ? (
                     <span className="flex items-center gap-2">
                       <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                       Traitement...
                     </span>
                   ) : (
                     <span className="flex items-center gap-2">
                       <CreditCard size={16} />
                       Confirmer et payer
                     </span>
                   )}
                 </Button>

                 {/* Secure payment notice */}
                 <p className="text-xs text-center text-muted-foreground">
                   <span className="flex items-center justify-center gap-1">
                     <Check size={12} />
                     Paiement sécurisé
                   </span>
                   Toutes vos données sont sécurisées et encryptées
                 </p>
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

export default Checkout;