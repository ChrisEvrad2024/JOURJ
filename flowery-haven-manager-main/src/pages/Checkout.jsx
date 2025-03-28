// src/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from "@/components/ui/button";
import { useCart } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Importation des composants modulaires
import ShippingAddressForm from '@/components/checkout/ShippingAddressForm';
import BillingAddressForm from '@/components/checkout/BillingAddressForm';
import ShippingMethodForm, { SHIPPING_OPTIONS } from '@/components/checkout/ShippingMethodForm';
import PaymentMethodForm, { PAYMENT_METHODS } from '@/components/checkout/PaymentMethodForm';
import OrderNotes from '@/components/checkout/OrderNotes';
import OrderSummary from '@/components/checkout/OrderSummary';

const Checkout = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cartItems, cartTotal = 0, clearCart } = useCart();
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
  const subtotal = typeof cartTotal === 'number' ? cartTotal : 0;
  const shippingCost = SHIPPING_OPTIONS.find(opt => opt.id === selectedShipping)?.price || 0;
  const taxRate = 0.20; // TVA à 20%
  const taxAmount = subtotal * taxRate;
  const orderTotal = subtotal + shippingCost + taxAmount;

  // Vérifier si le panier est vide et rediriger vers le panier
  useEffect(() => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
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
          description: `Le champ ${field} de l'adresse de livraison est requis.`
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
            description: `Le champ ${field} de l'adresse de facturation est requis.`
          });
          return false;
        }
      }
    }

    // Vérifier si les conditions générales sont acceptées
    if (!termsAccepted) {
      toast.error('Conditions générales', {
        description: 'Veuillez accepter les conditions générales de vente pour continuer.'
      });
      return false;
    }

    // Valider le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingAddress.email)) {
      toast.error('Email invalide', {
        description: 'Veuillez fournir une adresse email valide pour la livraison.'
      });
      return false;
    }

    if (!sameAsBilling && !emailRegex.test(billingAddress.email)) {
      toast.error('Email invalide', {
        description: 'Veuillez fournir une adresse email valide pour la facturation.'
      });
      return false;
    }

    // Valider le format du code postal (pour la France)
    if (shippingAddress.country === 'France' && !/^\d{5}$/.test(shippingAddress.postalCode)) {
      toast.error('Code postal invalide', {
        description: 'Le code postal doit contenir 5 chiffres pour la France.'
      });
      return false;
    }

    if (!sameAsBilling && billingAddress.country === 'France' && !/^\d{5}$/.test(billingAddress.postalCode)) {
      toast.error('Code postal invalide', {
        description: 'Le code postal doit contenir 5 chiffres pour la France.'
      });
      return false;
    }

    return true;
  };

  // Soumettre la commande
  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparer les données de la commande
      const orderData = {
        customer: {
          id: currentUser?.id,
          email: shippingAddress.email,
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName
        },
        shipping: {
          method: selectedShipping,
          cost: shippingCost,
          address: shippingAddress
        },
        billing: {
          method: selectedPayment,
          address: sameAsBilling ? shippingAddress : billingAddress
        },
        items: cartItems.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity
        })),
        totals: {
          subtotal,
          shipping: shippingCost,
          tax: taxAmount,
          total: orderTotal
        },
        notes,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Créer la commande
      const orderId = await createOrder(orderData);

      // Vider le panier après commande réussie
      clearCart();

      // Rediriger vers la page de confirmation
      navigate(`/order-confirmation/${orderId}`);
      
      toast.success('Commande passée avec succès', {
        description: `Votre commande #${orderId} a été confirmée.`
      });
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      toast.error('Erreur de paiement', {
        description: 'Une erreur est survenue lors du traitement de votre commande. Veuillez réessayer.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Naviguer vers le panier
  const navigateToCart = () => {
    navigate('/cart');
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Finaliser la commande</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale - formulaires */}
          <div className="lg:col-span-2 space-y-6">
            <ShippingAddressForm 
              shippingAddress={shippingAddress} 
              handleShippingChange={handleShippingChange} 
            />
            
            <BillingAddressForm 
              billingAddress={billingAddress} 
              handleBillingChange={handleBillingChange} 
              sameAsBilling={sameAsBilling} 
              setSameAsBilling={setSameAsBilling} 
            />
            
            <ShippingMethodForm 
              selectedShipping={selectedShipping} 
              setSelectedShipping={setSelectedShipping} 
            />
            
            <PaymentMethodForm 
              selectedPayment={selectedPayment} 
              setSelectedPayment={setSelectedPayment} 
            />
            
            <OrderNotes 
              notes={notes} 
              setNotes={setNotes} 
            />
          </div>

          {/* Colonne de droite - récapitulatif */}
          <div className="lg:col-span-1">
            <OrderSummary 
              cartItems={cartItems}
              subtotal={subtotal}
              shippingCost={shippingCost}
              taxAmount={taxAmount}
              orderTotal={orderTotal}
              termsAccepted={termsAccepted}
              setTermsAccepted={setTermsAccepted}
              handleSubmitOrder={handleSubmitOrder}
              isSubmitting={isSubmitting}
              navigateToCart={navigateToCart}
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;