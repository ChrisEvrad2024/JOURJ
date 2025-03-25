import React, { createContext, useState, useEffect, useContext } from 'react';
import { WishlistService } from '../services';
import { toast } from 'sonner';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Charger la liste de souhaits au démarrage
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const items = await WishlistService.getWishlist();
        setWishlistItems(items);
        setWishlistCount(items.length);
      } catch (error) {
        console.error('Error loading wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();

    // Écouter les événements de mise à jour de la liste de souhaits
    const handleWishlistUpdate = () => {
      loadWishlist();
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, []);

  // Ajouter un produit à la liste de souhaits
  const addToWishlist = async (product) => {
    try {
      if (isInWishlist(product.id)) {
        return;
      }
      
      await WishlistService.addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || ''
      });
      
      // Mettre à jour l'état local
      const updatedWishlist = await WishlistService.getWishlist();
      setWishlistItems(updatedWishlist);
      setWishlistCount(updatedWishlist.length);
      
      // Déclencher l'événement pour les autres composants
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Erreur lors de l\'ajout aux favoris');
    }
  };

  // Supprimer un article de la liste de souhaits
  const removeFromWishlist = async (productId) => {
    try {
      await WishlistService.removeFromWishlist(productId);
      
      // Mettre à jour l'état local
      const updatedWishlist = await WishlistService.getWishlist();
      setWishlistItems(updatedWishlist);
      setWishlistCount(updatedWishlist.length);
      
      // Déclencher l'événement pour les autres composants
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Erreur lors de la suppression des favoris');
    }
  };

  // Vérifier si un produit est dans la liste de souhaits
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  // Vider la liste de souhaits
  const clearWishlist = async () => {
    try {
      await WishlistService.clearWishlist();
      
      setWishlistItems([]);
      setWishlistCount(0);
      
      // Déclencher l'événement pour les autres composants
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Erreur lors de la suppression des favoris');
    }
  };

  const value = {
    wishlistItems,
    wishlistCount,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};