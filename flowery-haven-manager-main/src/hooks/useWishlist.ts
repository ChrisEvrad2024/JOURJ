// import { useState, useEffect, useCallback } from 'react';
// import { WishlistService } from '../services';

// /**
//  * Hook personnalisé pour gérer la liste de souhaits
//  * @returns {Object} Méthodes et données de la liste de souhaits
//  */
// const useWishlist = () => {
//     const [wishlist, setWishlist] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [itemCount, setItemCount] = useState(0);

//     // Charger la liste de souhaits
//     const loadWishlist = useCallback(async () => {
//         try {
//             setLoading(true);
//             setError(null);

//             const wishlistItems = await WishlistService.getWishlist();
//             setWishlist(wishlistItems);

//             const count = await WishlistService.getWishlistCount();
//             setItemCount(count);
//         } catch (err) {
//             console.error('Erreur lors du chargement de la liste de souhaits:', err);
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     // Vérifier si un produit est dans la liste de souhaits
//     const isInWishlist = useCallback(async (productId) => {
//         try {
//             return await WishlistService.isInWishlist(productId);
//         } catch (err) {
//             console.error('Erreur lors de la vérification du produit dans la liste de souhaits:', err);
//             return false;
//         }
//     }, []);

//     // Ajouter un produit à la liste de souhaits
//     const addToWishlist = useCallback(async (productId) => {
//         try {
//             setLoading(true);
//             setError(null);

//             await WishlistService.addToWishlist(productId);

//             // Recharger la liste de souhaits
//             await loadWishlist();

//             return true;
//         } catch (err) {
//             console.error('Erreur lors de l\'ajout à la liste de souhaits:', err);
//             setError(err.message);
//             return false;
//         } finally {
//             setLoading(false);
//         }
//     }, [loadWishlist]);

//     // Supprimer un produit de la liste de souhaits
//     const removeFromWishlist = useCallback(async (productId) => {
//         try {
//             setLoading(true);
//             setError(null);

//             await WishlistService.removeFromWishlist(productId);

//             // Recharger la liste de souhaits
//             await loadWishlist();

//             return true;
//         } catch (err) {
//             console.error('Erreur lors de la suppression de la liste de souhaits:', err);
//             setError(err.message);
//             return false;
//         } finally {
//             setLoading(false);
//         }
//     }, [loadWishlist]);

//     // Vider la liste de souhaits
//     const clearWishlist = useCallback(async () => {
//         try {
//             setLoading(true);
//             setError(null);

//             await WishlistService.clearWishlist();

//             // Recharger la liste de souhaits
//             await loadWishlist();

//             return true;
//         } catch (err) {
//             console.error('Erreur lors du vidage de la liste de souhaits:', err);
//             setError(err.message);
//             return false;
//         } finally {
//             setLoading(false);
//         }
//     }, [loadWishlist]);

//     // Basculer un produit dans la liste de souhaits (ajouter s'il n'y est pas, supprimer s'il y est)
//     const toggleWishlist = useCallback(async (productId) => {
//         try {
//             const inWishlist = await isInWishlist(productId);

//             if (inWishlist) {
//                 return await removeFromWishlist(productId);
//             } else {
//                 return await addToWishlist(productId);
//             }
//         } catch (err) {
//             console.error('Erreur lors du basculement dans la liste de souhaits:', err);
//             setError(err.message);
//             return false;
//         }
//     }, [isInWishlist, removeFromWishlist, addToWishlist]);

//     // Charger la liste de souhaits au montage du composant
//     useEffect(() => {
//         loadWishlist();

//         // Écouter les événements de mise à jour de la liste de souhaits
//         const handleWishlistUpdate = () => {
//             loadWishlist();
//         };

//         window.addEventListener('wishlistUpdated', handleWishlistUpdate);

//         // Nettoyage
//         return () => {
//             window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
//         };
//     }, [loadWishlist]);

//     return {
//         wishlist,
//         loading,
//         error,
//         itemCount,
//         isInWishlist,
//         addToWishlist,
//         removeFromWishlist,
//         clearWishlist,
//         toggleWishlist,
//         refreshWishlist: loadWishlist
//     };
// };

// export default useWishlist;

// Stub pour useWishlist
import { useContext } from 'react';
import { WishlistContext } from '../contexts/WishlistContext';

/**
 * Hook personnalisé pour accéder au contexte de la liste de souhaits
 * @returns {Object} Fonctions et données de la liste de souhaits
 */
export const useWishlist = () => {
    const context = useContext(WishlistContext);

    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }

    return context;
};

// Export par défaut pour compatibilité
export default useWishlist;