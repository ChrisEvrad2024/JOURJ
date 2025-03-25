import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Création du contexte
export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  // État pour stocker les produits de la wishlist
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Charger la wishlist depuis le localStorage au chargement
  useEffect(() => {
    const storedWishlist = localStorage.getItem('wishlist');
    if (storedWishlist) {
      try {
        const parsedWishlist = JSON.parse(storedWishlist);
        setWishlistItems(parsedWishlist);
        setWishlistCount(parsedWishlist.length);
      } catch (error) {
        console.error('Erreur lors du chargement de la wishlist:', error);
        // Réinitialiser en cas d'erreur
        localStorage.setItem('wishlist', JSON.stringify([]));
        setWishlistItems([]);
        setWishlistCount(0);
      }
    }
  }, []);

  // Sauvegarder la wishlist dans le localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    setWishlistCount(wishlistItems.length);
  }, [wishlistItems]);

  // Vérifier si un produit est déjà dans la wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  // Ajouter un produit à la wishlist
  const addToWishlist = (product) => {
    try {
      if (!product || !product.id) {
        throw new Error('Produit invalide');
      }

      // Vérifier si le produit est déjà dans la wishlist
      if (isInWishlist(product.id)) {
        return true; // Produit déjà dans la wishlist
      }

      // Ajouter le produit à la wishlist
      setWishlistItems([...wishlistItems, {
        ...product,
        wishlistId: uuidv4() // Générer un ID unique pour l'élément dans la wishlist
      }]);

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la wishlist:', error);
      toast.error('Erreur lors de l\'ajout aux favoris');
      return false;
    }
  };

  // Supprimer un produit de la wishlist
  const removeFromWishlist = (productId) => {
    try {
      setWishlistItems(wishlistItems.filter(item => item.id !== productId));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la wishlist:', error);
      toast.error('Erreur lors de la suppression des favoris');
      return false;
    }
  };

  // Vider la wishlist
  const clearWishlist = () => {
    try {
      setWishlistItems([]);
      return true;
    } catch (error) {
      console.error('Erreur lors du vidage de la wishlist:', error);
      toast.error('Erreur lors de la suppression des favoris');
      return false;
    }
  };

  // Valeur du contexte à exposer
  const value = {
    wishlistItems,
    wishlistCount,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistProvider;