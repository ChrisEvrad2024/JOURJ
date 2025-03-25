import React, { createContext, useState, useEffect, useContext } from 'react';
import { CartService } from '../services';
import { toast } from 'sonner';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Charger le panier au démarrage
  useEffect(() => {
    const loadCart = async () => {
      try {
        const items = await CartService.getCart();
        setCartItems(items);
        updateCartSummary(items);
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();

    // Écouter les événements de mise à jour du panier
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Calculer le total et le nombre d'articles
  const updateCartSummary = (items) => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    setCartCount(count);
    setCartTotal(total);
  };

  // Ajouter un produit au panier
  const addToCart = async (product, quantity = 1) => {
    try {
      // Vérification que product est un objet avec un ID
      if (!product || !product.id) {
        throw new Error('Produit invalide');
      }
      
      // Utiliser directement l'ID du produit OU l'objet produit selon ce que CartService attend
      await CartService.addToCart(product.id || product, quantity);
      
      // Mettre à jour l'état local
      const updatedCart = await CartService.getCart();
      setCartItems(updatedCart);
      updateCartSummary(updatedCart);
      
      // Déclencher l'événement pour les autres composants
      window.dispatchEvent(new Event('cartUpdated'));
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Erreur lors de l\'ajout au panier');
      return false;
    }
  };

  // Mettre à jour la quantité d'un article
  const updateItemQuantity = async (productId, quantity) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }
      
      await CartService.updateCartItemQuantity(productId, quantity);
      
      // Mettre à jour l'état local
      const updatedCart = await CartService.getCart();
      setCartItems(updatedCart);
      updateCartSummary(updatedCart);
      
      return true;
    } catch (error) {
      console.error('Error updating cart item:', error);
      toast.error('Erreur lors de la mise à jour du panier');
      return false;
    }
  };

  // Supprimer un article du panier
  const removeFromCart = async (productId) => {
    try {
      await CartService.removeFromCart(productId);
      
      // Mettre à jour l'état local
      const updatedCart = await CartService.getCart();
      setCartItems(updatedCart);
      updateCartSummary(updatedCart);
      
      // Déclencher l'événement pour les autres composants
      window.dispatchEvent(new Event('cartUpdated'));
      
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Erreur lors de la suppression du panier');
      return false;
    }
  };

  // Vider le panier
  const clearCart = async () => {
    try {
      await CartService.clearCart();
      
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
      
      // Déclencher l'événement pour les autres composants
      window.dispatchEvent(new Event('cartUpdated'));
      
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Erreur lors de la suppression du panier');
      return false;
    }
  };

  // Créer une commande à partir du panier
  const createOrder = async (shippingInfo) => {
    try {
      if (cartItems.length === 0) {
        throw new Error('Le panier est vide');
      }
      
      const order = await CartService.createOrder(shippingInfo);
      
      // Vider le panier après la commande
      await clearCart();
      
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erreur lors de la création de la commande');
      throw error;
    }
  };

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    loading,
    addToCart,
    updateItemQuantity,
    removeFromCart,
    clearCart,
    createOrder
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};