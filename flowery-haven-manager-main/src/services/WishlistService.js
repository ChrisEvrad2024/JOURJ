import StorageService from './StorageService';
import DbService from './db/DbService';
import { STORES, STORAGE_KEYS } from './db/DbConfig';
import AuthService from './AuthService';
import ProductService from './ProductService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service pour gérer la liste de souhaits
 */
class WishlistService {
    /**
     * Récupère la liste de souhaits actuelle
     * @returns {Promise<Array>} Éléments de la liste de souhaits
     */
    static async getWishlist() {
        try {
            const currentUser = AuthService.getCurrentUser();

            // Si l'utilisateur est connecté, récupérer sa liste depuis IndexedDB
            if (currentUser) {
                const wishlistItems = await DbService.getByIndex(STORES.WISHLIST, 'userId', currentUser.id);

                // Enrichir les éléments avec les détails complets des produits
                const enrichedItems = await Promise.all(
                    wishlistItems.map(async (item) => {
                        const product = await ProductService.getProductById(item.productId);
                        return {
                            ...item,
                            product
                        };
                    })
                );

                return enrichedItems;
            }

            // Sinon, récupérer la liste depuis localStorage
            const wishlistItems = StorageService.getLocalStorageItem(STORAGE_KEYS.WISHLIST, []);

            // Enrichir les éléments avec les détails complets des produits
            const enrichedItems = await Promise.all(
                wishlistItems.map(async (item) => {
                    const product = await ProductService.getProductById(item.productId);
                    return {
                        ...item,
                        product
                    };
                })
            );

            return enrichedItems;
        } catch (error) {
            console.error('Erreur lors de la récupération de la liste de souhaits:', error);
            return [];
        }
    }

    /**
     * Vérifie si un produit est dans la liste de souhaits
     * @param {string} productId - ID du produit
     * @returns {Promise<boolean>} Vrai si le produit est dans la liste
     */
    static async isInWishlist(productId) {
        try {
            const currentUser = AuthService.getCurrentUser();

            // Si l'utilisateur est connecté, vérifier dans IndexedDB
            if (currentUser) {
                const wishlistItems = await DbService.getByIndex(STORES.WISHLIST, 'userId', currentUser.id);
                return wishlistItems.some(item => item.productId === productId);
            }

            // Sinon, vérifier dans localStorage
            const wishlistItems = StorageService.getLocalStorageItem(STORAGE_KEYS.WISHLIST, []);
            return wishlistItems.some(item => item.productId === productId);
        } catch (error) {
            console.error(`Erreur lors de la vérification du produit ${productId} dans la liste de souhaits:`, error);
            return false;
        }
    }


    /**
     * Ajoute un produit à la liste de souhaits avec une meilleure gestion de l'espace de stockage
     * @param {string|Object} product - Produit ou ID du produit à ajouter
     * @returns {Promise<Object>} - Résultat de l'opération
     */
    static async addToWishlist(product) {
        try {
            // Déterminer si nous avons reçu un ID ou un objet produit
            const productId = typeof product === 'object' ? product.id : product;
            const productObject = typeof product === 'object' ? product : null;

            // Récupérer les détails du produit si nous n'avons que l'ID
            const productDetails = productObject || await ProductService.getProductById(productId);

            if (!productDetails) {
                throw new Error('Produit non trouvé');
            }

            // Vérifier si le produit est déjà dans la liste
            const isAlreadyInWishlist = await this.isInWishlist(productId);

            if (isAlreadyInWishlist) {
                throw new Error('Ce produit est déjà dans votre liste de souhaits');
            }

            const currentUser = AuthService.getCurrentUser();

            // Si l'utilisateur est connecté, ajouter à sa liste dans IndexedDB
            if (currentUser) {
                const newItem = {
                    id: uuidv4(),
                    userId: currentUser.id,
                    productId: productDetails.id,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                await DbService.add(STORES.WISHLIST, newItem);

                // Déclencher un événement pour mettre à jour l'UI
                window.dispatchEvent(new Event('wishlistUpdated'));

                return {
                    ...newItem,
                    product: productDetails
                };
            } else {
                // Pour les utilisateurs non connectés, utiliser localStorage avec stockage optimisé
                const wishlistItems = StorageService.getLocalStorageItem(STORAGE_KEYS.WISHLIST, []);

                // Créer une version simplifiée du produit avec seulement les données essentielles
                const compressedProduct = {
                    id: productDetails.id,
                    productId: productDetails.id, // Pour compatibilité avec la structure IndexedDB
                    name: productDetails.name,
                    price: productDetails.price,
                    image: productDetails.images && productDetails.images.length > 0 ? productDetails.images[0] : null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                // Limiter la taille de la wishlist si nécessaire
                if (wishlistItems.length >= 50) {
                    // Garder les 30 plus récents
                    console.log('La liste des favoris est trop grande, troncature...');
                    wishlistItems.splice(0, wishlistItems.length - 30);
                }

                // Ajouter le nouvel élément
                wishlistItems.push(compressedProduct);

                // Essayer de sauvegarder avec notre service amélioré
                StorageService.setLocalStorageItem(STORAGE_KEYS.WISHLIST, wishlistItems);

                // Déclencher un événement pour mettre à jour l'UI
                window.dispatchEvent(new Event('wishlistUpdated'));

                return compressedProduct;
            }
        } catch (error) {
            console.error(`Erreur lors de l'ajout du produit à la liste de souhaits:`, error);

            // Gestion des erreurs de quota
            if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                // Si c'est une erreur de quota, essayer de nettoyer la wishlist et réessayer
                try {
                    const wishlistItems = StorageService.getLocalStorageItem(STORAGE_KEYS.WISHLIST, []);

                    // Garder seulement les 10 derniers articles
                    const limitedWishlist = wishlistItems.slice(-10);
                    StorageService.setLocalStorageItem(STORAGE_KEYS.WISHLIST, limitedWishlist);

                    console.warn('Wishlist tronquée en raison du dépassement de quota');
                    return false;
                } catch (cleanupError) {
                    console.error('Impossible de nettoyer la wishlist:', cleanupError);
                }
            }

            throw error;
        }
    }

    /**
     * Supprime un produit de la liste de souhaits
     * @param {string} productId - ID du produit
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async removeFromWishlist(productId) {
        try {
            const currentUser = AuthService.getCurrentUser();

            // Si l'utilisateur est connecté, supprimer de sa liste dans IndexedDB
            if (currentUser) {
                const wishlistItems = await DbService.getByIndex(STORES.WISHLIST, 'userId', currentUser.id);
                const itemToRemove = wishlistItems.find(item => item.productId === productId);

                if (itemToRemove) {
                    await DbService.delete(STORES.WISHLIST, itemToRemove.id);
                }
            } else {
                // Pour les utilisateurs non connectés, utiliser localStorage
                const wishlistItems = StorageService.getLocalStorageItem(STORAGE_KEYS.WISHLIST, []);

                const updatedWishlist = wishlistItems.filter(item => item.productId !== productId);

                StorageService.setLocalStorageItem(STORAGE_KEYS.WISHLIST, updatedWishlist);
            }

            // Déclencher un événement pour mettre à jour l'UI
            window.dispatchEvent(new Event('wishlistUpdated'));

            return true;
        } catch (error) {
            console.error(`Erreur lors de la suppression du produit ${productId} de la liste de souhaits:`, error);
            throw error;
        }
    }

    /**
     * Vide la liste de souhaits
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async clearWishlist() {
        try {
            const currentUser = AuthService.getCurrentUser();

            // Si l'utilisateur est connecté, vider sa liste dans IndexedDB
            if (currentUser) {
                const wishlistItems = await DbService.getByIndex(STORES.WISHLIST, 'userId', currentUser.id);

                // Supprimer chaque élément
                for (const item of wishlistItems) {
                    await DbService.delete(STORES.WISHLIST, item.id);
                }
            } else {
                // Pour les utilisateurs non connectés, vider localStorage
                StorageService.setLocalStorageItem(STORAGE_KEYS.WISHLIST, []);
            }

            // Déclencher un événement pour mettre à jour l'UI
            window.dispatchEvent(new Event('wishlistUpdated'));

            return true;
        } catch (error) {
            console.error('Erreur lors du vidage de la liste de souhaits:', error);
            throw error;
        }
    }

    /**
     * Compte le nombre d'éléments dans la liste de souhaits
     * @returns {Promise<number>} Nombre d'éléments
     */
    static async getWishlistCount() {
        try {
            const wishlistItems = await this.getWishlist();
            return wishlistItems.length;
        } catch (error) {
            console.error('Erreur lors du calcul du nombre d\'éléments dans la liste de souhaits:', error);
            return 0;
        }
    }

    /**
     * Fusionne la liste de souhaits localStorage avec celle de l'utilisateur connecté
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async mergeLocalWishlistWithUserWishlist() {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            // Récupérer la liste locale
            const localWishlist = StorageService.getLocalStorageItem(STORAGE_KEYS.WISHLIST, []);

            if (localWishlist.length === 0) {
                return true; // Rien à fusionner
            }

            // Récupérer la liste utilisateur
            const userWishlist = await DbService.getByIndex(STORES.WISHLIST, 'userId', currentUser.id);
            const userWishlistProductIds = userWishlist.map(item => item.productId);

            // Fusionner les deux listes
            for (const localItem of localWishlist) {
                // Ne pas ajouter les doublons
                if (!userWishlistProductIds.includes(localItem.productId)) {
                    const newItem = {
                        id: uuidv4(),
                        userId: currentUser.id,
                        productId: localItem.productId,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };

                    await DbService.add(STORES.WISHLIST, newItem);
                }
            }

            // Vider la liste locale
            StorageService.setLocalStorageItem(STORAGE_KEYS.WISHLIST, []);

            // Déclencher un événement pour mettre à jour l'UI
            window.dispatchEvent(new Event('wishlistUpdated'));

            return true;
        } catch (error) {
            console.error('Erreur lors de la fusion des listes de souhaits:', error);
            throw error;
        }
    }
}

export default WishlistService;