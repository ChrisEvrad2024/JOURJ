// src/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle,
  Truck,
  MapPin,
  ShoppingBag,
  Home,
  User,
  Mail,
  Phone,
  Building,
  LockKeyhole
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Options de livraison fictives
const SHIPPING_OPTIONS = [
  {
    id: 'standard',
    name: 'Livraison standard',
    price: 7.90,
    description: 'Livraison en 3-5 jours ouvrés',
    icon: <Truck className="w-4 h-4" />
  },
  {
    id: 'express',
    name: 'Livraison express',
    price: 14.90,
    description: 'Livraison en 1-2 jours ouvrés',
    icon: <Truck className="w-4 h-4" />
  }
];

// Options de paiement
const PAYMENT_METHODS = [
  {
    id: 'card',
    name: 'Carte bancaire',
    icon: <CreditCard className="w-4 h-4" />
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: <CreditCard className="w-4 h-4" />
  }
];

const Checkout = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { createOrder } = useOrders();
  
  // États pour les informations de commande
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    postalCode: '',
    country: 'France'
  });
  
  const [billingAddress, setBillingAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    postalCode: '',
    country: 'France'
  });
  
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_OPTIONS[0].id);
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].id);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [notes, setNotes] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculs des totaux
  const subtotal = cartTotal;
  const shippingCost = SHIPPING_OPTIONS.find(opt => opt.id === selectedShipping)?.price || 0;
  const taxRate = 0.20; // TVA à 20%
  const taxAmount = subtotal * taxRate;
  const orderTotal = subtotal + shippingCost + taxAmount;
  
  // Vérifier si le panier est vide et rediriger vers le panier
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
      toast.error('Votre panier est vide', {
        description: 'Veuillez ajouter des produits à votre panier pour passer une commande.'
      });
    }
  }, [cartItems, navigate]);
  
  // Pré-remplir les informations de l'utilisateur connecté
  useEffect(() => {
    if (currentUser) {
      setShippingAddress(prev => ({
        ...prev,
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || ''
      }));
      
      setBillingAddress(prev => ({
        ...prev,
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || ''
      }));
    }
  }, [currentUser]);
  
  // Mettre à jour l'adresse de facturation si elle est identique à l'adresse de livraison
  useEffect(() => {
    if (sameAsBilling) {
      setBillingAddress(shippingAddress);
    }
  }, [sameAsBilling, shippingAddress]);
  
  // Gérer les modifications d'adresse de livraison
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Gérer les modifications d'adresse de facturation
  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Valider le formulaire
  const validateForm = () => {
    // Vérifier les champs obligatoires pour l'adresse de livraison
    const requiredShippingFields = ['firstName', 'lastName', 'email', 'address1', 'city', 'postalCode', 'country'];
    for (const field of requiredShippingFields) {
      if (!shippingAddress[field]) {
        toast.error('Formulaire incomplet', {
          description: `Le champ "${field}" de l'adresse de livraison est obligatoire.`
        });
        return false;
      }
    }
    
    // Vérifier les champs obligatoires pour l'adresse de facturation si différente
    if (!sameAsBilling) {
      const requiredBillingFields = ['firstName', 'lastName', 'email', 'address1', 'city', 'postalCode', 'country'];
      for (const field of requiredBillingFields) {
        if (!billingAddress[field]) {
          toast.error('Formulaire incomplet', {
            description: `Le champ "${field}" de l'adresse de facturation est obligatoire.`
          });
          return false;
        }
      }
    }
    
    // Vérifier que l'utilisateur a accepté les conditions générales
    if (!termsAccepted) {
      toast.error('Conditions non acceptées', {
        description: 'Vous devez accepter les conditions générales pour continuer.'
      });
      return false;
    }
    
    return true;
  };
  
  // Soumettre la commande
  const handleSubmitOrder = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      // Préparer les données de la commande
      const orderData = {
        shippingAddress,
        billingAddress: sameAsBilling ? shippingAddress : billingAddress,
        shippingMethod: SHIPPING_OPTIONS.find(opt => opt.id === selectedShipping),
        paymentMethod: selectedPayment,
        notes: notes,
        subtotal,
        shippingCost,
        taxAmount,
        total: orderTotal
      };
      
      // Créer la commande
      const newOrder = await createOrder(orderData);
      
      // Vider le panier après une commande réussie
      await clearCart();
      
      // Rediriger vers la page de confirmation
      navigate(`/checkout/success?orderId=${newOrder.id}`);
      
      toast.success('Commande validée', {
        description: 'Votre commande a été passée avec succès!'
      });
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      toast.error('Erreur de paiement', {
        description: error.message || 'Une erreur est survenue lors du traitement de votre commande.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-16">
        <div className="container max-w-7xl mx-auto px-4">
          <Button 
            variant="ghost" 
            className="mb-6 flex items-center gap-2"
            onClick={() => navigate('/cart')}
          >
            <ArrowLeft size={16} />
            Retour au panier
          </Button>
          
          <h1 className="text-3xl font-serif mb-8">Finaliser votre commande</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informations de commande */}
            <div className="lg:col-span-2 space-y-8">
              {/* Section adresse de livraison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Adresse de livraison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shipping-firstName">Prénom</Label>
                      <Input 
                        id="shipping-firstName" 
                        name="firstName"
                        value={shippingAddress.firstName}
                        onChange={handleShippingChange}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="shipping-lastName">Nom</Label>
                      <Input 
                        id="shipping-lastName" 
                        name="lastName"
                        value={shippingAddress.lastName}
                        onChange={handleShippingChange}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="shipping-email">Email</Label>
                      <Input 
                        id="shipping-email" 
                        name="email"
                        type="email"
                        value={shippingAddress.email}
                        onChange={handleShippingChange}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="shipping-phone">Téléphone</Label>
                      <Input 
                        id="shipping-phone" 
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleShippingChange}
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="shipping-address1">Adresse</Label>
                      <Input 
                        id="shipping-address1" 
                        name="address1"
                        value={shippingAddress.address1}
                        onChange={handleShippingChange}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="shipping-address2">Complément d'adresse (optionnel)</Label>
                      <Input 
                        id="shipping-address2" 
                        name="address2"
                        value={shippingAddress.address2}
                        onChange={handleShippingChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="shipping-city">Ville</Label>
                      <Input 
                        id="shipping-city" 
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleShippingChange}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="shipping-postalCode">Code postal</Label>
                      <Input 
                        id="shipping-postalCode" 
                        name="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={handleShippingChange}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="shipping-country">Pays</Label>
                      <Select 
                        value={shippingAddress.country} 
                        onValueChange={(value) => setShippingAddress(prev => ({ ...prev, country: value }))}
                      >
                        <SelectTrigger id="shipping-country" className="mt-1">
                          <SelectValue placeholder="Sélectionner un pays" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="Belgique">Belgique</SelectItem>
                          <SelectItem value="Suisse">Suisse</SelectItem>
                          <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Section adresse de facturation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Adresse de facturation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox 
                      id="same-address"
                      checked={sameAsBilling}
                      onCheckedChange={setSameAsBilling}
                    />
                    <label
                      htmlFor="same-address"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Identique à l'adresse de livraison
                    </label>
                  </div>
                  
                  {!sameAsBilling && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="billing-firstName">Prénom</Label>
                        <Input 
                          id="billing-firstName" 
                          name="firstName"
                          value={billingAddress.firstName}
                          onChange={handleBillingChange}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="billing-lastName">Nom</Label>
                        <Input 
                          id="billing-lastName" 
                          name="lastName"
                          value={billingAddress.lastName}
                          onChange={handleBillingChange}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="billing-email">Email</Label>
                        <Input 
                          id="billing-email" 
                          name="email"
                          type="email"
                          value={billingAddress.email}
                          onChange={handleBillingChange}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="billing-phone">Téléphone</Label>
                        <Input 
                          id="billing-phone" 
                          name="phone"
                          value={billingAddress.phone}
                          onChange={handleBillingChange}
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="billing-address1">Adresse</Label>
                        <Input 
                          id="billing-address1" 
                          name="address1"
                          value={billingAddress.address1}
                          onChange={handleBillingChange}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="billing-address2">Complément d'adresse (optionnel)</Label>
                        <Input 
                          id="billing-address2" 
                          name="address2"
                          value={billingAddress.address2}
                          onChange={handleBillingChange}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="billing-city">Ville</Label>
                        <Input 
                          id="billing-city" 
                          name="city"
                          value={billingAddress.city}
                          onChange={handleBillingChange}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="billing-postalCode">Code postal</Label>
                        <Input 
                          id="billing-postalCode" 
                          name="postalCode"
                          value={billingAddress.postalCode}
                          onChange={handleBillingChange}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="billing-country">Pays</Label>
                        <Select 
                          value={billingAddress.country} 
                          onValueChange={(value) => setBillingAddress(prev => ({ ...prev, country: value }))}
                        >
                          <SelectTrigger id="billing-country" className="mt-1">
                            <SelectValue placeholder="Sélectionner un pays" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="France">France</SelectItem>
                            <SelectItem value="Belgique">Belgique</SelectItem>
                            <SelectItem value="Suisse">Suisse</SelectItem>
                            <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Section mode de livraison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Mode de livraison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={selectedShipping}
                    onValueChange={setSelectedShipping}
                    className="space-y-4"
                  >
                    {SHIPPING_OPTIONS.map((option) => (
                      <div
                        key={option.id}
                        className={`flex items-center justify-between rounded-lg border p-4 transition-all ${
                          selectedShipping === option.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value={option.id} id={`shipping-${option.id}`} />
                          <Label
                            htmlFor={`shipping-${option.id}`}
                            className="flex flex-col cursor-pointer"
                          >
                            <span className="font-medium">{option.name}</span>
                            <span className="text-muted-foreground text-sm">{option.description}</span>
                          </Label>
                        </div>
                        <div className="font-medium">{option.price.toFixed(2)} XAF</div>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
              
              {/* Section mode de paiement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Mode de paiement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={selectedPayment}
                    onValueChange={setSelectedPayment}
                    className="space-y-4"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <div
                        key={method.id}
                        className={`flex items-center justify-between rounded-lg border p-4 transition-all ${
                          selectedPayment === method.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value={method.id} id={`payment-${method.id}`} />
                          <Label
                            htmlFor={`payment-${method.id}`}
                            className="cursor-pointer"
                          >
                            {method.name}
                          </Label>
                        </div>
                        {method.icon}
                      </div>
                    ))}
                  </RadioGroup>
                  
                  {selectedPayment === 'card' && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <Label htmlFor="card-number">Numéro de carte</Label>
                        <Input 
                          id="card-number" 
                          placeholder="1234 5678 9012 3456"
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="card-expiry">Date d'expiration</Label>
                          <Input 
                            id="card-expiry" 
                            placeholder="MM/AA"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="card-cvc">Code de sécurité (CVC)</Label>
                          <Input 
                            id="card-cvc" 
                            placeholder="123"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="card-name">Nom sur la carte</Label>
                        <Input 
                          id="card-name" 
                          placeholder="Jean Dupont"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Notes de commande */}
              <Card>
                <CardHeader>
                  <CardTitle>Notes de commande (optionnel)</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    rows={3}
                    className="w-full p-2 border rounded-md"
                    placeholder="Instructions spéciales pour la livraison, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </CardContent>
              </Card>
            </div>
            
            {/* Résumé de la commande */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Récapitulatif de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Articles du panier */}
                  <div className="space-y-4 mb-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            {item.product.images && item.product.images[0] ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-muted">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">Qté: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-medium">{(item.product.price * item.quantity).toFixed(2)} XAF</p>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  {/* Calculs des montants */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>{subtotal.toFixed(2)} XAF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Livraison</span>
                      <span>{shippingCost.toFixed(2)} XAF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TVA (20%)</span>
                      <span>{taxAmount.toFixed(2)} XAF</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Total */}
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{orderTotal.toFixed(2)} XAF</span>
                  </div>
                </CardContent>
                <CardFooter className="flex-col items-start space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={termsAccepted}
                      onCheckedChange={setTermsAccepted}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      J'accepte les{" "}
                      <Link to="/terms" className="text-primary hover:underline" target="_blank">
                        conditions générales de vente
                      </Link>
                    </label>
                  </div>
                  
                  <Button 
                    className="w-full mt-2"
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <LockKeyhole className="mr-2 h-4 w-4" />
                        Payer {orderTotal.toFixed(2)} XAF
                      </>
                    )}
                  </Button>
                  
                  <div className="text-sm text-muted-foreground flex items-center justify-center w-full mt-2">
                    <LockKeyhole className="h-3 w-3 mr-1" />
                    Paiement 100% sécurisé
                  </div>
                </CardFooter>
              </Card>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/cart')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour au panier
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Checkout;