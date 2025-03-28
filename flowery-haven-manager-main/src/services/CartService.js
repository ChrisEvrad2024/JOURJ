import StorageService from './StorageService';
import DbService from './db/DbService';
import { STORES, STORAGE_KEYS } from './db/DbConfig';
import AuthService from './AuthService';
import ProductService from './ProductService';
import OrderService from './OrderService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service pour gérer le panier d'achat
 */
class CartService {
    /**
     * Récupère le panier actuel
     * @returns {Promise<Array>} Articles du panier
     */
    static async getCart() {
        try {
            const currentUser = AuthService.getCurrentUser();

            // Si l'utilisateur est connecté, récupérer son panier depuis IndexedDB
            if (currentUser) {
                const cartItems = await DbService.getByIndex(STORES.CART_ITEMS, 'userId', currentUser.id);

                // Enrichir les éléments du panier avec les détails complets des produits
                const enrichedItems = await Promise.all(
                    cartItems.map(async (item) => {
                        try {
                            const product = await ProductService.getProductById(item.productId);
                            if (!product) {
                                console.warn(`Produit ${item.productId} non trouvé dans le panier`);
                                return null;
                            }
                            return {
                                ...item,
                                product
                            };
                        } catch (error) {
                            console.error(`Erreur lors de l'enrichissement du panier pour le produit ${item.productId}:`, error);
                            return null;
                        }
                    })
                );

                // Filtrer les éléments invalides
                return enrichedItems.filter(item => item !== null);
            }

            // Sinon, récupérer le panier depuis localStorage
            const cartItems = StorageService.getLocalStorageItem(STORAGE_KEYS.CART, []);

            // Enrichir les éléments du panier avec les détails complets des produits
            const enrichedItems = await Promise.all(
                cartItems.map(async (item) => {
                    try {
                        const product = await ProductService.getProductById(item.productId);
                        if (!product) {
                            console.warn(`Produit ${item.productId} non trouvé dans le panier`);
                            return null;
                        }
                        return {
                            ...item,
                            product
                        };
                    } catch (error) {
                        console.error(`Erreur lors de l'enrichissement du panier pour le produit ${item.productId}:`, error);
                        return null;
                    }
                })
            );

            // Filtrer les éléments invalides
            return enrichedItems.filter(item => item !== null);
        } catch (error) {
            console.error('Erreur lors de la récupération du panier:', error);
            return [];
        }
    }

    /**
     * Ajoute un produit au panier
     * @param {Object|string} product - Produit ou ID du produit
     * @param {number} quantity - Quantité à ajouter
     * @returns {Promise<Object>} Élément ajouté au panier
     */
    static async addToCart(product, quantity = 1) {
        try {
            // Déterminer l'ID du produit
            const productId = typeof product === 'object' ? product.id : product;

            // Vérifier si le produit existe
            const productData = await ProductService.getProductById(productId);

            if (!productData) {
                throw new Error('Produit non trouvé');
            }

            // Vérifier la disponibilité du stock
            if (productData.stock !== undefined && productData.stock < quantity) {
                throw new Error('Stock insuffisant');
            }

            const currentUser = AuthService.getCurrentUser();

            // Si l'utilisateur est connecté, ajouter au panier dans IndexedDB
            if (currentUser) {
                // Vérifier si le produit est déjà dans le panier
                const existingItems = await DbService.getByIndex(STORES.CART_ITEMS, 'userId', currentUser.id);
                const existingItem = existingItems.find(item => item.productId === productId);

                if (existingItem) {
                    // Mettre à jour la quantité
                    existingItem.quantity += quantity;
                    existingItem.updatedAt = new Date().toISOString();

                    await DbService.update(STORES.CART_ITEMS, existingItem);

                    // Déclencher un événement pour mettre à jour l'UI
                    window.dispatchEvent(new Event('cartUpdated'));

                    return {
                        ...existingItem,
                        product: productData
                    };
                } else {
                    // Ajouter un nouvel élément au panier
                    const newItem = {
                        id: uuidv4(),
                        userId: currentUser.id,
                        productId,
                        quantity,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };

                    await DbService.add(STORES.CART_ITEMS, newItem);

                    // Déclencher un événement pour mettre à jour l'UI
                    window.dispatchEvent(new Event('cartUpdated'));

                    return {
                        ...newItem,
                        product: productData
                    };
                }
            } else {
                // Pour les utilisateurs non connectés, utiliser localStorage
                const cartItems = StorageService.getLocalStorageItem(STORAGE_KEYS.CART, []);

                // Vérifier si le produit est déjà dans le panier
                const existingItemIndex = cartItems.findIndex(item => item.productId === productId);

                if (existingItemIndex !== -1) {
                    // Mettre à jour la quantité
                    cartItems[existingItemIndex].quantity += quantity;
                    cartItems[existingItemIndex].updatedAt = new Date().toISOString();

                    StorageService.setLocalStorageItem(STORAGE_KEYS.CART, cartItems);

                    // Déclencher un événement pour mettre à jour l'UI
                    window.dispatchEvent(new Event('cartUpdated'));

                    return {
                        ...cartItems[existingItemIndex],
                        product: productData
                    };
                } else {
                    // Ajouter un nouvel élément au panier
                    const newItem = {
                        id: uuidv4(),
                        productId,
                        quantity,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };

                    cartItems.push(newItem);
                    StorageService.setLocalStorageItem(STORAGE_KEYS.CART, cartItems);

                    // Déclencher un événement pour mettre à jour l'UI
                    window.dispatchEvent(new Event('cartUpdated'));

                    return {
                        ...newItem,
                        product: productData
                    };
                }
            }
        } catch (error) {
            console.error(`Erreur lors de l'ajout du produit au panier:`, error);
            throw error;
        }
    }

    /**
     * Met à jour la quantité d'un produit dans le panier
     * @param {string} itemId - ID de l'élément du panier
     * @param {number} quantity - Nouvelle quantité
     * @returns {Promise<Object>} Élément mis à jour
     */
    static async updateCartItemQuantity(itemId, quantity) {
        try {
            if (quantity <= 0) {
                throw new Error('La quantité doit être positive');
            }

            const currentUser = AuthService.getCurrentUser();

            // Si l'utilisateur est connecté, mettre à jour dans IndexedDB
            if (currentUser) {
                const cartItem = await DbService.getByKey(STORES.CART_ITEMS, itemId);

                if (!cartItem) {
                    throw new Error('Élément non trouvé dans le panier');
                }

                // Vérifier si l'élément appartient à l'utilisateur
                if (cartItem.userId !== currentUser.id) {
                    throw new Error('Accès non autorisé');
                }

                // Vérifier la disponibilité du stock
                const product = await ProductService.getProductById(cartItem.productId);
                if (!product) {
                    throw new Error('Produit non trouvé');
                }

                if (product.stock !== undefined && product.stock < quantity) {
                    throw new Error('Stock insuffisant');
                }

                // Mettre à jour la quantité
                cartItem.quantity = quantity;
                cartItem.updatedAt = new Date().toISOString();

                await DbService.update(STORES.CART_ITEMS, cartItem);

                // Déclencher un événement pour mettre à jour l'UI
                window.dispatchEvent(new Event('cartUpdated'));

                return {
                    ...cartItem,
                    product
                };
            } else {
                // Pour les utilisateurs non connectés, utiliser localStorage
                const cartItems = StorageService.getLocalStorageItem(STORAGE_KEYS.CART, []);

                const itemIndex = cartItems.findIndex(item => item.id === itemId);

                if (itemIndex === -1) {
                    throw new Error('Élément non trouvé dans le panier');
                }

                // Vérifier la disponibilité du stock
                const product = await ProductService.getProductById(cartItems[itemIndex].productId);
                if (!product) {
                    throw new Error('Produit non trouvé');
                }

                if (product.stock !== undefined && product.stock < quantity) {
                    throw new Error('Stock insuffisant');
                }

                // Mettre à jour la quantité
                cartItems[itemIndex].quantity = quantity;
                cartItems[itemIndex].updatedAt = new Date().toISOString();

                StorageService.setLocalStorageItem(STORAGE_KEYS.CART, cartItems);

                // Déclencher un événement pour mettre à jour l'UI
                window.dispatchEvent(new Event('cartUpdated'));

                return {
                    ...cartItems[itemIndex],
                    product
                };
            }
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de la quantité dans le panier:`, error);
            throw error;
        }
    }

    /**
     * Supprime un élément du panier
     * @param {string} itemId - ID de l'élément à supprimer
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async removeFromCart(productId) {
        try {
            // Récupérer le panier actuel du localStorage
            const cartItems = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];

            // Vérifier si le produit existe dans le panier
            const itemIndex = cartItems.findIndex((item) => item.product && item.product.id === productId);

            // Si l'élément n'existe pas, retourner true sans erreur
            if (itemIndex === -1) {
                console.warn(`Produit ${productId} non trouvé dans le panier.`);
                return true; // Nous retournons true car le résultat final est le même: le produit n'est pas dans le panier
            }

            // Supprimer l'élément du panier
            cartItems.splice(itemIndex, 1);

            // Sauvegarder le panier mis à jour
            localStorage.setItem('cart', JSON.stringify(cartItems));

            // Déclencher un événement pour notifier les autres composants du changement
            window.dispatchEvent(new Event('cartUpdated'));

            return true;
        } catch (error) {
            console.error(`Erreur lors de la suppression de l'élément ${productId} du panier:`, error);
            return false;
        }
    };

    /**
     * Vide le panier
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async clearCart() {
        try {
            const currentUser = AuthService.getCurrentUser();

            // Si l'utilisateur est connecté, vider son panier dans IndexedDB
            if (currentUser) {
                const cartItems = await DbService.getByIndex(STORES.CART_ITEMS, 'userId', currentUser.id);

                // Supprimer chaque élément
                for (const item of cartItems) {
                    await DbService.delete(STORES.CART_ITEMS, item.id);
                }
            } else {
                // Pour les utilisateurs non connectés, vider localStorage
                StorageService.setLocalStorageItem(STORAGE_KEYS.CART, []);
            }

            // Déclencher un événement pour mettre à jour l'UI
            window.dispatchEvent(new Event('cartUpdated'));

            return true;
        } catch (error) {
            console.error('Erreur lors du vidage du panier:', error);
            throw error;
        }
    }

    /**
     * Calcule le nombre total d'articles dans le panier
     * @returns {Promise<number>} Nombre d'articles
     */
    static async getCartItemCount() {
        try {
            const cartItems = await this.getCart();

            return cartItems.reduce((total, item) => {
                if (item && typeof item.quantity === 'number') {
                    return total + item.quantity;
                }
                return total;
            }, 0);
        } catch (error) {
            console.error('Erreur lors du calcul du nombre d\'articles dans le panier:', error);
            return 0;
        }
    }

    /**
     * Calcule le montant total du panier
     * @returns {Promise<number>} Montant total
     */
    static async getCartTotal() {
        try {
            const cartItems = await this.getCart();

            return cartItems.reduce((total, item) => {
                if (item && item.product && typeof item.product.price === 'number') {
                    return total + (item.product.price * item.quantity);
                }
                return total;
            }, 0);
        } catch (error) {
            console.error('Erreur lors du calcul du montant total du panier:', error);
            return 0;
        }
    }

    /**
     * Fusionne le panier localStorage avec le panier de l'utilisateur connecté
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async mergeLocalCartWithUserCart() {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            // Récupérer le panier local
            const localCart = StorageService.getLocalStorageItem(STORAGE_KEYS.CART, []);

            if (localCart.length === 0) {
                return true; // Rien à fusionner
            }

            // Récupérer le panier utilisateur
            const userCart = await DbService.getByIndex(STORES.CART_ITEMS, 'userId', currentUser.id);

            // Fusionner les deux paniers
            for (const localItem of localCart) {
                const existingItem = userCart.find(item => item.productId === localItem.productId);

                if (existingItem) {
                    // Mettre à jour la quantité
                    existingItem.quantity += localItem.quantity;
                    existingItem.updatedAt = new Date().toISOString();

                    await DbService.update(STORES.CART_ITEMS, existingItem);
                } else {
                    // Ajouter un nouvel élément
                    const newItem = {
                        id: uuidv4(),
                        userId: currentUser.id,
                        productId: localItem.productId,
                        quantity: localItem.quantity,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };

                    await DbService.add(STORES.CART_ITEMS, newItem);
                }
            }

            // Vider le panier local
            StorageService.setLocalStorageItem(STORAGE_KEYS.CART, []);

            // Déclencher un événement pour mettre à jour l'UI
            window.dispatchEvent(new Event('cartUpdated'));

            return true;
        } catch (error) {
            console.error('Erreur lors de la fusion des paniers:', error);
            throw error;
        }
    }

    /**
     * Nettoie le panier des éléments corrompus
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async cleanupCart() {
        try {
            const cartItems = await this.getCart();
            let hasChanges = false;

            // Vérifier chaque article du panier
            for (const item of cartItems) {
                // Vérifier si le produit existe encore et est disponible
                try {
                    const product = await ProductService.getProductById(item.productId);

                    // Si le produit n'existe plus ou n'est pas disponible
                    if (!product) {
                        await this.removeFromCart(item.id);
                        hasChanges = true;
                        continue;
                    }

                    // Si le stock est insuffisant, ajuster la quantité
                    if (product.stock !== undefined && product.stock < item.quantity) {
                        if (product.stock > 0) {
                            await this.updateCartItemQuantity(item.id, product.stock);
                        } else {
                            await this.removeFromCart(item.id);
                        }
                        hasChanges = true;
                    }
                } catch (error) {
                    // En cas d'erreur lors de la récupération du produit, le conserver dans le panier
                    console.warn(`Impossible de vérifier le produit ${item.productId}:`, error);
                }
            }

            return hasChanges;
        } catch (error) {
            console.error('Erreur lors du nettoyage du panier:', error);
            return false;
        }
    }

    /**
     * Crée une commande à partir du contenu du panier
     * @param {Object} orderData - Données de la commande
     * @returns {Promise<Object>} Commande créée
     */
    /**
 * Crée une commande à partir du contenu du panier
 * @param {Object} orderData - Données de la commande
 * @returns {Promise<Object>} Commande créée
 */
    static async createOrder(orderData) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            // Récupérer le panier
            const cartItems = await this.getCart();

            if (cartItems.length === 0) {
                throw new Error('Le panier est vide');
            }

            // Vérifier que les données de commande sont complètes
            if (!orderData) {
                throw new Error('Les données de commande sont requises');
            }

            // Vérifier la présence des données obligatoires
            if (!orderData.shippingAddress) {
                throw new Error('L\'adresse de livraison est requise');
            }

            // Créer la commande via OrderService
            try {
                const order = await OrderService.createOrderFromCart(cartItems, orderData);

                // Si la commande est créée avec succès, vider le panier
                await this.clearCart();

                return order;
            } catch (error) {
                // Erreur spécifique pour faciliter le débogage
                throw new Error(`Erreur lors de la création de la commande: ${error.message}`);
            }
        } catch (error) {
            console.error('Erreur lors de la création de la commande:', error);
            throw error;
        }
    }
}

// Exporter CartService comme export nommé
export { CartService };

// Et aussi comme export par défaut pour la compatibilité
export default CartService;