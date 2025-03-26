// src/pages/Cart.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { toast } from "sonner";
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const { currentUser } = useAuth();
  const { 
    cartItems = [], // Valeur par défaut si undefined
    cartTotal = 0,  // Valeur par défaut si undefined
    updateItemQuantity = () => {}, // Fonction par défaut
    removeFromCart = () => {}, // Fonction par défaut
    clearCart = () => {}, // Fonction par défaut
    createOrder = async () => {} // Fonction par défaut
  } = useCart() || {}; // Ajouter || {} pour éviter l'erreur si useCart() renvoie undefined
  
  
  const proceedToCheckout = async () => {
    if (!currentUser) {
      toast.error("Vous devez être connecté", {
        description: "Veuillez vous connecter pour finaliser votre commande",
        duration: 5000,
      });
      navigate('/auth/login');
      return;
    }
    
    setIsProcessingOrder(true);
    
    try {
      // Créer une commande à partir du panier
      const order = await createOrder({
        shippingMethod: "standard",
        shippingCost: 7.90,
        paymentMethod: "credit_card"
      });
      
      toast.success("Commande créée avec succès", {
        description: `Votre commande #${order.orderNumber} a été créée.`,
        duration: 5000,
      });
      
      // Rediriger vers la page de confirmation
      // Dans une application réelle, vous pourriez rediriger vers une page de paiement
      setTimeout(() => {
        window.location.href = `/account/orders?highlight=${order.id}`;
      }, 1500);
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error("Échec de la commande", {
        description: error.message || "Une erreur est survenue. Veuillez réessayer.",
        duration: 5000,
      });
    } finally {
      setIsProcessingOrder(false);
    }
    navigate('/checkout');
  };
  
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-16 min-h-screen">
        <div className="section-container">
          <h1 className="text-3xl font-serif mb-8">Votre Panier</h1>
          
          {!cartItems || cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex justify-center items-center p-6 bg-muted rounded-full mb-6">
                <ShoppingBag size={32} className="text-muted-foreground" />
              </div>
              <h2 className="text-xl font-serif mb-4">Votre panier est vide</h2>
              <p className="text-muted-foreground mb-8">Ajoutez des produits à votre panier pour continuer vos achats.</p>
              <Link to="/catalog" className="btn-primary inline-flex">
                Continuer mes achats
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-background rounded-lg border border-border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left py-4 px-6">Produit</th>
                        <th className="text-center py-4 px-2">Quantité</th>
                        <th className="text-right py-4 px-6">Prix</th>
                        <th className="text-right py-4 px-6"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.product.id} className="border-t border-border">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <Link to={`/product/${item.product.id}`} className="w-20 h-20 rounded-md overflow-hidden bg-muted">
                                <img 
                                  src={item.product.images[0]} 
                                  alt={item.product.name} 
                                  className="w-full h-full object-cover" 
                                />
                              </Link>
                              <div>
                                <Link to={`/product/${item.product.id}`} className="font-medium hover:text-primary transition-colors">
                                  {item.product.name}
                                </Link>
                                <p className="text-muted-foreground text-sm mt-1">{item.product.price.toFixed(2)} XAF / unité</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex items-center justify-center">
                              <button 
                                className="border border-border rounded-l-md p-2 hover:bg-muted transition-colors"
                                onClick={() => updateItemQuantity(item.product.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={14} />
                              </button>
                              <div className="border-t border-b border-border px-4 py-1.5 flex items-center justify-center min-w-[40px]">
                                {item.quantity}
                              </div>
                              <button 
                                className="border border-border rounded-r-md p-2 hover:bg-muted transition-colors"
                                onClick={() => updateItemQuantity(item.product.id, item.quantity + 1)}
                                disabled={item.product.stock !== undefined && item.quantity >= item.product.stock}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right font-medium">
                            {(item.product.price * item.quantity).toFixed(2)} XAF
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button 
                              className="text-muted-foreground hover:text-destructive p-2 transition-colors rounded-full hover:bg-muted"
                              onClick={() => removeFromCart(item.product.id)}
                              aria-label="Retirer du panier"
                            >
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-background rounded-lg border border-border p-6">
                  <h2 className="text-xl font-serif mb-6">Récapitulatif</h2>
                  
                  <div className="space-y-4 border-b border-border pb-6 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span className="font-medium">{cartTotal.toFixed(2)} XAF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Livraison</span>
                      <span className="font-medium">7.90 XAF</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mb-8">
                    <span className="text-lg">Total</span>
                    <span className="text-lg font-medium">{(cartTotal + 7.9).toFixed(2)} XAF</span>
                  </div>
                  
                  <button 
                    className="btn-primary w-full flex items-center justify-center gap-2"
                    onClick={proceedToCheckout}
                    disabled={isProcessingOrder}
                  >
                    {isProcessingOrder ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                        Traitement...
                      </>
                    ) : (
                      "Passer au paiement"
                    )}
                  </button>
                  
                  <div className="mt-6">
                    <Link 
                      to="/catalog" 
                      className="text-primary hover:underline text-sm flex justify-center"
                    >
                      Continuer vos achats
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Cart;