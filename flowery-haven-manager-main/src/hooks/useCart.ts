// import { useState, useEffect, useCallback } from 'react';
// import { CartService } from '../services';

// /**
//  * Hook personnalisé pour gérer le panier
//  * @returns {Object} Méthodes et données du panier
//  */
// const useCart = () => {
//     const [cart, setCart] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [total, setTotal] = useState(0);
//     const [itemCount, setItemCount] = useState(0);

//     // Charger le panier
//     const loadCart = useCallback(async () => {
//         try {
//             setLoading(true);
//             setError(null);

//             const cartItems = await CartService.getCart();
//             setCart(cartItems);

//             const cartTotal = await CartService.getCartTotal();
//             setTotal(cartTotal);

//             const count = await CartService.getCartItemCount();
//             setItemCount(count);
//         } catch (err) {
//             console.error('Erreur lors du chargement du panier:', err);
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     // Ajouter un produit au panier
//     const addToCart = useCallback(async (productId, quantity = 1) => {
//         try {
//             setLoading(true);
//             setError(null);

//             await CartService.addToCart(productId, quantity);

//             // Recharger le panier
//             await loadCart();

//             return true;
//         } catch (err) {
//             console.error('Erreur lors de l\'ajout au panier:', err);
//             setError(err.message);
//             return false;
//         } finally {
//             setLoading(false);
//         }
//     }, [loadCart]);

//     // Mettre à jour la quantité d'un produit
//     const updateQuantity = useCallback(async (itemId, quantity) => {
//         try {
//             setLoading(true);
//             setError(null);

//             await CartService.updateCartItemQuantity(itemId, quantity);

//             // Recharger le panier
//             await loadCart();

//             return true;
//         } catch (err) {
//             console.error('Erreur lors de la mise à jour de la quantité:', err);
//             setError(err.message);
//             return false;
//         } finally {
//             setLoading(false);
//         }
//     }, [loadCart]);

//     // Supprimer un produit du panier
//     const removeFromCart = useCallback(async (itemId) => {
//         try {
//             setLoading(true);
//             setError(null);

//             await CartService.removeFromCart(itemId);

//             // Recharger le panier
//             await loadCart();

//             return true;
//         } catch (err) {
//             console.error('Erreur lors de la suppression du panier:', err);
//             setError(err.message);
//             return false;
//         } finally {
//             setLoading(false);
//         }
//     }, [loadCart]);

//     // Vider le panier
//     const clearCart = useCallback(async () => {
//         try {
//             setLoading(true);
//             setError(null);

//             await CartService.clearCart();

//             // Recharger le panier
//             await loadCart();

//             return true;
//         } catch (err) {
//             console.error('Erreur lors du vidage du panier:', err);
//             setError(err.message);
//             return false;
//         } finally {
//             setLoading(false);
//         }
//     }, [loadCart]);

//     // Charger le panier au montage du composant
//     useEffect(() => {
//         loadCart();

//         // Écouter les événements de mise à jour du panier
//         const handleCartUpdate = () => {
//             loadCart();
//         };

//         window.addEventListener('cartUpdated', handleCartUpdate);

//         // Nettoyage
//         return () => {
//             window.removeEventListener('cartUpdated', handleCartUpdate);
//         };
//     }, [loadCart]);

//     return {
//         cart,
//         loading,
//         error,
//         total,
//         itemCount,
//         addToCart,
//         updateQuantity,
//         removeFromCart,
//         clearCart,
//         refreshCart: loadCart
//     };
// };

// export default useCart;

// Stub pour useCart
// src/hooks/useCart.js
// import { useContext } from 'react';
// import { useCart as useCartFromContext } from '../contexts/CartContext';


// export const useCart = () => {
//     export const useCart = useCartFromContext;


//     if (context === undefined) {
//         // Retourner un objet par défaut pour éviter les erreurs
//         return {
//             cartItems: [],
//             cartTotal: 0,
//             cartCount: 0,
//             addToCart: () => console.warn('CartContext non disponible'),
//             updateItemQuantity: () => console.warn('CartContext non disponible'),
//             removeFromCart: () => console.warn('CartContext non disponible'),
//             clearCart: () => console.warn('CartContext non disponible'),
//             createOrder: async () => {
//                 console.warn('CartContext non disponible');
//                 throw new Error('Impossible de créer une commande - CartContext non disponible');
//             }
//         };
//     }

//     return context;
// };

// src/hooks/useCart.ts

import { useCart as useCartFromContext } from '../contexts/CartContext';

export const useCart = useCartFromContext;