// src/hooks/useCart.ts
import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/product';
import {
  getCart,
  addToCart as addToCartLib,
  removeFromCart as removeFromCartLib,
  updateCartItemQuantity as updateQuantityLib,
  clearCart as clearCartLib,
  getCartTotal,
  getCartItemCount,
  createOrderFromCart
} from '@/lib/cart';
import { toast } from 'sonner';

export function useCart() {
  const [cartItems, setCartItems] = useState(getCart());
  const [cartTotal, setCartTotal] = useState(getCartTotal());
  const [cartCount, setCartCount] = useState(getCartItemCount());
  const [loading, setLoading] = useState(false);

  // Fonction pour rafraîchir les données du panier
  const refreshCart = useCallback(() => {
    setCartItems(getCart());
    setCartTotal(getCartTotal());
    setCartCount(getCartItemCount());
  }, []);

  // Ajouter un produit au panier
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    try {
      setLoading(true);
      const success = addToCartLib(product, quantity);
      
      if (success) {
        refreshCart();
        return true;
      } else {
        toast.error("Impossible d'ajouter au panier", {
          description: "Vérifiez si le produit est en stock.",
        });
        return false;
      }
    } catch (error) {
      console.error("Error in addToCart:", error);
      toast.error("Erreur lors de l'ajout au panier", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  // Supprimer un produit du panier
  const removeFromCart = useCallback((productId: string) => {
    try {
      setLoading(true);
      const success = removeFromCartLib(productId);
      
      if (success) {
        refreshCart();
        return true;
      } else {
        toast.error("Impossible de supprimer du panier");
        return false;
      }
    } catch (error) {
      console.error("Error in removeFromCart:", error);
      toast.error("Erreur lors de la suppression du panier");
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  // Mettre à jour la quantité d'un produit
  const updateItemQuantity = useCallback((productId: string, quantity: number) => {
    try {
      setLoading(true);
      const success = updateQuantityLib(productId, quantity);
      
      if (success) {
        refreshCart();
        return true;
      } else {
        toast.error("Impossible de mettre à jour la quantité", {
          description: "Vérifiez si le produit est en stock.",
        });
        return false;
      }
    } catch (error) {
      console.error("Error in updateItemQuantity:", error);
      toast.error("Erreur lors de la mise à jour de la quantité", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  // Vider le panier
  const clearCart = useCallback(() => {
    try {
      setLoading(true);
      clearCartLib();
      refreshCart();
      return true;
    } catch (error) {
      console.error("Error in clearCart:", error);
      toast.error("Erreur lors du vidage du panier");
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  // Créer une commande à partir du panier
  const createOrder = useCallback(async (orderDetails: any) => {
    try {
      setLoading(true);
      const order = await createOrderFromCart(orderDetails);
      refreshCart();
      return order;
    } catch (error) {
      console.error("Error in createOrder:", error);
      toast.error("Erreur lors de la création de la commande", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  // Écouter les événements de mise à jour du panier
  useEffect(() => {
    const handleCartUpdate = () => {
      refreshCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, [refreshCart]);

  // Charger le panier au montage du composant
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return {
    cartItems,
    cartTotal,
    cartCount,
    loading,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    createOrder,
    refreshCart
  };
}

export default useCart;