import React, { createContext, useState, useEffect, useContext } from 'react';
import { CartService } from '../services';
// Choisissez une seule bibliothèque de toast
import { toast } from 'sonner';
import AuthService from '../services/AuthService'; 

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fonction pour nettoyer les données du panier
  const cleanCartData = (items) => {
    // Filtrer les éléments qui ont des produits valides
    return Array.isArray(items) 
      ? items.filter(item => item && item.product && item.product.id)
      : [];
  };

  // Charger le panier au démarrage
  useEffect(() => {
    const loadCart = async () => {
      try {
        const items = await CartService.getCart();
        
        // Nettoyer les données du panier
        const cleanedItems = cleanCartData(items);
        setCartItems(cleanedItems);
        updateCartSummary(cleanedItems);
      } catch (error) {
        console.error('Error loading cart:', error);
        // Réinitialiser le panier en cas d'erreur
        setCartItems([]);
        setCartCount(0);
        setCartTotal(0);
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
    if (!Array.isArray(items)) {
      setCartCount(0);
      setCartTotal(0);
      return;
    }
    
    // Calculer la quantité totale
    const count = items.reduce((total, item) => {
      if (item && typeof item.quantity === 'number') {
        return total + item.quantity;
      }
      return total;
    }, 0);
    
    // Calculer le prix total
    const total = items.reduce((sum, item) => {
      if (item && item.product && typeof item.product.price === 'number') {
        return sum + (item.product.price * item.quantity);
      }
      return sum;
    }, 0);
    
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
      const success = await CartService.addToCart(product, quantity);
      
      if (!success) {
        throw new Error("Échec de l'ajout au panier");
      }
      
      // Mettre à jour l'état local
      const updatedCart = await CartService.getCart();
      const cleanedItems = cleanCartData(updatedCart);
      setCartItems(cleanedItems);
      updateCartSummary(cleanedItems);
      
      toast.success('Produit ajouté au panier');
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
      if (!productId) {
        throw new Error('ID de produit invalide');
      }
      
      if (quantity <= 0) {
        await removeFromCart(productId);
        return true;
      }
      
      const success = await CartService.updateCartItemQuantity(productId, quantity);
      
      if (!success) {
        throw new Error("Échec de la mise à jour de la quantité");
      }
      
      // Mettre à jour l'état local
      const updatedCart = await CartService.getCart();
      const cleanedItems = cleanCartData(updatedCart);
      setCartItems(cleanedItems);
      updateCartSummary(cleanedItems);
      
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
      if (!productId) {
        throw new Error('ID de produit invalide');
      }
      
      const success = await CartService.removeFromCart(productId);
      
      if (!success) {
        throw new Error("Échec de la suppression du produit");
      }
      
      // Mettre à jour l'état local
      const updatedCart = await CartService.getCart();
      const cleanedItems = cleanCartData(updatedCart);
      setCartItems(cleanedItems);
      updateCartSummary(cleanedItems);
      
      toast.success('Produit retiré du panier');
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
      
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Erreur lors de la suppression du panier');
      return false;
    }
  };

  // Créer une commande à partir du panier
  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      
      // Vérification que l'utilisateur est connecté
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        toast.error('Vous devez être connecté pour passer une commande');
        setLoading(false);
        return null;
      }
      
      // Vérifier que les données de commande sont complètes
      if (!orderData || !orderData.shippingAddress) {
        toast.error('Veuillez fournir une adresse de livraison');
        setLoading(false);
        return null;
      }
      
      // Vérification des champs obligatoires
      const requiredFields = ['firstName', 'lastName', 'address1', 'city', 'postalCode', 'country'];
      const missingFields = requiredFields.filter(field => !orderData.shippingAddress[field]);
      
      if (missingFields.length > 0) {
        toast.error(`Champs obligatoires manquants dans l'adresse: ${missingFields.join(', ')}`);
        setLoading(false);
        return null;
      }
      
      // Création de la commande
      const order = await CartService.createOrder(orderData);
      
      // Mise à jour de l'état
      await refreshCart();
      
      toast.success('Commande créée avec succès');
      setLoading(false);
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(`Erreur lors de la création de la commande: ${error.message}`);
      setLoading(false);
      return null;
    }
  };

  // Fonction manquante détectée dans le code d'origine
  const refreshCart = async () => {
    try {
      const updatedCart = await CartService.getCart();
      const cleanedItems = cleanCartData(updatedCart);
      setCartItems(cleanedItems);
      updateCartSummary(cleanedItems);
      return true;
    } catch (error) {
      console.error('Error refreshing cart:', error);
      return false;
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