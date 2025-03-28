// src/contexts/WishlistContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Chargement initial plus sécurisé
  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) {
        const parsedWishlist = JSON.parse(storedWishlist);
        if (Array.isArray(parsedWishlist)) {
          setItems(parsedWishlist);
          setWishlistCount(parsedWishlist.length);
        } else {
          // Réinitialiser si le format n'est pas valide
          localStorage.setItem('wishlist', JSON.stringify([]));
          setItems([]);
          setWishlistCount(0);
        }
      } else {
        // Initialiser si vide
        localStorage.setItem('wishlist', JSON.stringify([]));
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la wishlist:', error);
      // En cas d'erreur, réinitialiser
      try {
        localStorage.setItem('wishlist', JSON.stringify([]));
      } catch (storageError) {
        console.error('Erreur lors de la réinitialisation de la wishlist:', storageError);
        // Si l'erreur persiste, ne pas essayer de manipuler localStorage
      }
      setItems([]);
      setWishlistCount(0);
    }

    // Écouter les événements de mise à jour
    const handleWishlistUpdate = () => {
      try {
        const updatedWishlist = localStorage.getItem('wishlist') 
          ? JSON.parse(localStorage.getItem('wishlist')) 
          : [];
        
        if (Array.isArray(updatedWishlist)) {
          setItems(updatedWishlist);
          setWishlistCount(updatedWishlist.length);
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la wishlist:', error);
      }
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    window.addEventListener('storage', handleWishlistUpdate);

    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      window.removeEventListener('storage', handleWishlistUpdate);
    };
  }, []);

  // Ajouter un produit à la wishlist
  const addToWishlist = (product) => {
    try {
      // Vérifier si le produit existe déjà
      const existingItem = items.find(item => item.id === product.id);
      
      if (!existingItem) {
        // Compresser les données du produit
        const compressedProduct = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images && product.images.length > 0 ? product.images[0] : null
        };
        
        const newItems = [...items, compressedProduct];
        
        // Limiter la taille de la wishlist à 50 éléments maximum
        const limitedItems = newItems.length > 50 ? newItems.slice(-50) : newItems;
        
        try {
          localStorage.setItem('wishlist', JSON.stringify(limitedItems));
          setItems(limitedItems);
          setWishlistCount(limitedItems.length);
          window.dispatchEvent(new Event('wishlistUpdated'));
          toast.success('Produit ajouté à votre wishlist');
          return true;
        } catch (storageError) {
          // Gestion des erreurs de quota dépassé
          if (storageError.name === 'QuotaExceededError') {
            const reducedItems = limitedItems.slice(-20); // Garder seulement 20 éléments
            localStorage.setItem('wishlist', JSON.stringify(reducedItems));
            setItems(reducedItems);
            setWishlistCount(reducedItems.length);
            toast.success('Produit ajouté à votre wishlist (liste limitée)');
            return true;
          } else {
            throw storageError;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la wishlist:', error);
      toast.error('Erreur lors de l\'ajout à la wishlist');
      return false;
    }
  };

  // Supprimer un produit de la wishlist
  const removeFromWishlist = (productId) => {
    try {
      const newItems = items.filter(item => item.id !== productId);
      
      localStorage.setItem('wishlist', JSON.stringify(newItems));
      setItems(newItems);
      setWishlistCount(newItems.length);
      
      window.dispatchEvent(new Event('wishlistUpdated'));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la wishlist:', error);
      toast.error('Erreur lors de la suppression de la wishlist');
      return false;
    }
  };

  // Vider la wishlist
  const clearWishlist = () => {
    try {
      localStorage.setItem('wishlist', JSON.stringify([]));
      setItems([]);
      setWishlistCount(0);
      
      window.dispatchEvent(new Event('wishlistUpdated'));
      return true;
    } catch (error) {
      console.error('Erreur lors du vidage de la wishlist:', error);
      toast.error('Erreur lors du vidage de la wishlist');
      return false;
    }
  };

  // Vérifier si un produit est dans la wishlist
  const isInWishlist = (productId) => {
    return items.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider 
      value={{ 
        items, 
        wishlistCount, 
        addToWishlist, 
        removeFromWishlist, 
        clearWishlist, 
        isInWishlist 
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  
  return context;
};