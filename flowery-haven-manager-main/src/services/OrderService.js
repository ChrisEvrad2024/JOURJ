import DbService from './db/DbService';
import { STORES } from './db/DbConfig';
import AuthService from './AuthService';
import { CartService } from './CartService';  // Import corrigé
import ProductService from './ProductService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service pour gérer les commandes
 */
class OrderService {
    /**
     * Statuts de commande possibles
     */
    static ORDER_STATUS = {
        PENDING: 'pending',       // En attente de paiement
        PROCESSING: 'processing', // En cours de traitement
        SHIPPED: 'shipped',       // Expédiée
        DELIVERED: 'delivered',   // Livrée
        CANCELLED: 'cancelled',   // Annulée
        REFUNDED: 'refunded'      // Remboursée
    };

    /**
 * Crée une commande à partir du panier avec une vérification améliorée des adresses
 * @param {Array} cartItems - Articles du panier
 * @param {Object} orderData - Données de la commande
 * @returns {Promise<Object>} Commande créée
 */
    static async createOrderFromCart(cartItems, orderData) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            if (cartItems.length === 0) {
                throw new Error('Le panier est vide');
            }

            // Vérifier la présence des adresses requises
            if (!orderData.shippingAddress) {
                throw new Error('L\'adresse de livraison est requise');
            }

            if (!orderData.billingAddress) {
                // Si l'adresse de facturation n'est pas fournie, utiliser l'adresse de livraison
                orderData.billingAddress = orderData.shippingAddress;
            }

            // Vérifier que les propriétés nécessaires sont présentes dans l'adresse de livraison
            const requiredAddressFields = ['firstName', 'lastName', 'address1', 'city', 'postalCode', 'country'];
            for (const field of requiredAddressFields) {
                if (!orderData.shippingAddress[field]) {
                    throw new Error(`Le champ ${field} est requis dans l'adresse de livraison`);
                }
            }

            // Calculer les montants
            const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            const shippingCost = orderData.shippingMethod?.cost || 7.90; // Coût de livraison par défaut
            const taxRate = 0.20; // TVA à 20%
            const taxAmount = subtotal * taxRate;
            const total = subtotal + shippingCost + taxAmount;

            // Créer l'objet commande
            const newOrder = {
                id: `ORD-${Date.now()}`,
                userId: currentUser.id,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    subtotal: item.product.price * item.quantity,
                    sku: item.product.sku
                })),
                subtotal,
                shippingCost,
                taxAmount,
                total,
                status: 'pending',
                shippingAddress: orderData.shippingAddress,
                billingAddress: orderData.billingAddress,
                paymentMethod: orderData.paymentMethod,
                shippingMethod: orderData.shippingMethod || { name: 'Standard', cost: 7.90 },
                notes: orderData.notes || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await DbService.add(STORES.ORDERS, newOrder);

            // Mettre à jour le stock des produits
            for (const item of cartItems) {
                if (item.product.stock !== undefined) {
                    await ProductService.updateProductStock(item.productId, -item.quantity);
                }
            }

            return newOrder;
        } catch (error) {
            console.error('Erreur lors de la création de la commande:', error);
            throw error;
        }
    }

    /**
     * Récupère toutes les commandes d'un utilisateur
     * @param {string} [userId] - ID de l'utilisateur (utilise l'utilisateur courant par défaut)
     * @returns {Promise<Array>} Liste des commandes
     */
    static async getUserOrders(userId = null) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!userId && !currentUser) {
                return [];
            }

            const targetUserId = userId || currentUser.id;

            // Si l'utilisateur courant n'est pas admin et essaie d'accéder aux commandes d'un autre utilisateur
            if (currentUser && currentUser.id !== targetUserId && currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            const orders = await DbService.getByIndex(STORES.ORDERS, 'userId', targetUserId);

            // Trier les commandes par date (plus récente en premier)
            return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            console.error('Erreur lors de la récupération des commandes:', error);
            return [];
        }
    }

    /**
     * Récupère une commande par son ID
     * @param {string} orderId - ID de la commande
     * @returns {Promise<Object|null>} Commande ou null si non trouvée
     */
    static async getOrderById(orderId) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            const order = await DbService.getByKey(STORES.ORDERS, orderId);

            if (!order) {
                return null;
            }

            // Vérifier si la commande appartient à l'utilisateur ou si c'est un admin
            if (order.userId !== currentUser.id && currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            return order;
        } catch (error) {
            console.error(`Erreur lors de la récupération de la commande ${orderId}:`, error);
            return null;
        }
    }

    /**
     * Crée une nouvelle commande à partir du panier
     * @param {Object} orderData - Données de la commande
     * @param {Object} orderData.shippingAddress - Adresse de livraison
     * @param {Object} orderData.billingAddress - Adresse de facturation
     * @param {string} orderData.paymentMethod - Méthode de paiement
     * @param {Object} [orderData.shippingMethod] - Méthode de livraison
     * @returns {Promise<Object>} Commande créée
     */
    static async createOrder(orderData) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            // Récupérer le panier actuel
            const cartItems = await CartService.getCart();

            if (cartItems.length === 0) {
                throw new Error('Le panier est vide');
            }

            // Vérifier la disponibilité du stock pour chaque produit
            for (const item of cartItems) {
                const product = item.product;

                if (product.stock !== undefined && product.stock < item.quantity) {
                    throw new Error(`Stock insuffisant pour le produit "${product.name}"`);
                }
            }

            // Calculer les montants
            const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            const shippingCost = orderData.shippingMethod?.cost || 7.90; // Coût de livraison par défaut
            const taxRate = 0.20; // TVA à 20%
            const taxAmount = subtotal * taxRate;
            const total = subtotal + shippingCost + taxAmount;

            // Créer l'objet commande
            const newOrder = {
                id: `ORD-${Date.now()}`,
                userId: currentUser.id,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    subtotal: item.product.price * item.quantity,
                    sku: item.product.sku
                })),
                subtotal,
                shippingCost,
                taxAmount,
                total,
                status: this.ORDER_STATUS.PENDING,
                shippingAddress: orderData.shippingAddress,
                billingAddress: orderData.billingAddress,
                paymentMethod: orderData.paymentMethod,
                shippingMethod: orderData.shippingMethod || { name: 'Standard', cost: 7.90 },
                notes: orderData.notes || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Ajouter la commande à la base de données
            await DbService.add(STORES.ORDERS, newOrder);

            // Mettre à jour le stock des produits
            for (const item of cartItems) {
                if (item.product.stock !== undefined) {
                    await ProductService.updateProductStock(item.productId, -item.quantity);
                }
            }

            // Vider le panier
            await CartService.clearCart();

            return newOrder;
        } catch (error) {
            console.error('Erreur lors de la création de la commande:', error);
            throw error;
        }
    }
    /**
 * Partie 2 - Gestion des statuts de commande
 */

    /**
     * Met à jour le statut d'une commande
     * @param {string} orderId - ID de la commande
     * @param {string} newStatus - Nouveau statut (voir ORDER_STATUS)
     * @param {string} [notes] - Notes supplémentaires
     * @returns {Promise<Object>} Commande mise à jour
     */
    static async updateOrderStatus(orderId, newStatus, notes = '') {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            // Seul un admin peut mettre à jour le statut d'une commande
            if (currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            const order = await DbService.getByKey(STORES.ORDERS, orderId);

            if (!order) {
                throw new Error('Commande non trouvée');
            }

            // Vérifier si le statut est valide
            const validStatuses = Object.values(this.ORDER_STATUS);
            if (!validStatuses.includes(newStatus)) {
                throw new Error('Statut de commande invalide');
            }

            // Si la commande est annulée, remettre les produits en stock
            if (newStatus === this.ORDER_STATUS.CANCELLED && order.status !== this.ORDER_STATUS.CANCELLED) {
                for (const item of order.items) {
                    await ProductService.updateProductStock(item.productId, item.quantity);
                }
            }

            // Si une commande annulée est remise en cours, retirer les produits du stock
            if (order.status === this.ORDER_STATUS.CANCELLED && newStatus !== this.ORDER_STATUS.CANCELLED) {
                for (const item of order.items) {
                    await ProductService.updateProductStock(item.productId, -item.quantity);
                }
            }

            // Mettre à jour le statut
            order.status = newStatus;
            order.statusHistory = order.statusHistory || [];
            order.statusHistory.push({
                status: newStatus,
                date: new Date().toISOString(),
                notes: notes,
                updatedBy: currentUser.id
            });
            order.updatedAt = new Date().toISOString();

            await DbService.update(STORES.ORDERS, order);

            return order;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du statut de la commande ${orderId}:`, error);
            throw error;
        }
    }

    /**
     * Annule une commande (si elle n'est pas déjà expédiée ou livrée)
     * @param {string} orderId - ID de la commande
     * @param {string} reason - Raison de l'annulation
     * @returns {Promise<Object>} Commande mise à jour
     */
    static async cancelOrder(orderId, reason) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            const order = await DbService.getByKey(STORES.ORDERS, orderId);

            if (!order) {
                throw new Error('Commande non trouvée');
            }

            // Vérifier si l'utilisateur a le droit d'annuler cette commande
            const isAdmin = currentUser.role === 'admin';
            const isOwner = order.userId === currentUser.id;

            if (!isAdmin && !isOwner) {
                throw new Error('Accès non autorisé');
            }

            // Vérifier si la commande peut être annulée
            const nonCancellableStatuses = [
                this.ORDER_STATUS.SHIPPED,
                this.ORDER_STATUS.DELIVERED,
                this.ORDER_STATUS.CANCELLED,
                this.ORDER_STATUS.REFUNDED
            ];

            if (nonCancellableStatuses.includes(order.status)) {
                throw new Error(`Impossible d'annuler une commande avec le statut '${order.status}'`);
            }

            // Remettre les produits en stock (ajouté dans la version 2)
            for (const item of order.items) {
                await ProductService.updateProductStock(item.productId, item.quantity);
            }

            // Mettre à jour le statut
            order.status = this.ORDER_STATUS.CANCELLED;
            order.statusHistory = order.statusHistory || [];
            order.statusHistory.push({
                status: this.ORDER_STATUS.CANCELLED,
                date: new Date().toISOString(),
                notes: `Annulé par ${isAdmin ? 'admin' : 'client'}: ${reason}`,
                updatedBy: currentUser.id
            });
            order.cancellationReason = reason;
            order.updatedAt = new Date().toISOString();

            await DbService.update(STORES.ORDERS, order);

            return order;
        } catch (error) {
            console.error(`Erreur lors de l'annulation de la commande ${orderId}:`, error);
            throw error;
        }
    }

    /**
     * Récupère l'historique des modifications d'une commande
     * @param {string} orderId - ID de la commande
     * @returns {Promise<Array>} Historique des modifications
     */
    static async getOrderHistory(orderId) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            const order = await DbService.getByKey(STORES.ORDERS, orderId);

            if (!order) {
                throw new Error('Commande non trouvée');
            }

            // Vérifier si l'utilisateur a le droit de consulter l'historique de cette commande
            const isAdmin = currentUser.role === 'admin';
            const isOwner = order.userId === currentUser.id;

            if (!isAdmin && !isOwner) {
                throw new Error('Accès non autorisé');
            }

            // Retourner l'historique des statuts, ou un tableau vide s'il n'y en a pas
            return order.statusHistory || [];
        } catch (error) {
            console.error(`Erreur lors de la récupération de l'historique de la commande ${orderId}:`, error);
            throw error;
        }
    }

    /**
     * Marque une commande comme livrée
     * @param {string} orderId - ID de la commande
     * @param {string} [notes] - Notes supplémentaires
     * @returns {Promise<Object>} Commande mise à jour
     */
    static async markAsDelivered(orderId, notes = '') {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            const order = await DbService.getByKey(STORES.ORDERS, orderId);

            if (!order) {
                throw new Error('Commande non trouvée');
            }

            // Vérifier si la commande peut être marquée comme livrée
            if (order.status !== this.ORDER_STATUS.SHIPPED) {
                throw new Error(`Impossible de marquer comme livrée une commande avec le statut '${order.status}'`);
            }

            // Mettre à jour le statut
            order.status = this.ORDER_STATUS.DELIVERED;
            order.statusHistory = order.statusHistory || [];
            order.statusHistory.push({
                status: this.ORDER_STATUS.DELIVERED,
                date: new Date().toISOString(),
                notes: notes || 'Commande livrée au client',
                updatedBy: currentUser.id
            });
            order.deliveredAt = new Date().toISOString();
            order.updatedAt = new Date().toISOString();

            await DbService.update(STORES.ORDERS, order);

            return order;
        } catch (error) {
            console.error(`Erreur lors du marquage de la commande ${orderId} comme livrée:`, error);
            throw error;
        }
    }

    /**
     * Ajoute des données de suivi à une commande
     * @param {string} orderId - ID de la commande
     * @param {Object} trackingData - Données de suivi
     * @param {string} trackingData.trackingNumber - Numéro de suivi
     * @param {string} trackingData.carrier - Transporteur
     * @param {string} [trackingData.trackingUrl] - URL de suivi
     * @returns {Promise<Object>} Commande mise à jour
     */
    static async addTrackingInfo(orderId, trackingData) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            const order = await DbService.getByKey(STORES.ORDERS, orderId);

            if (!order) {
                throw new Error('Commande non trouvée');
            }

            // Ajouter les informations de suivi
            order.tracking = {
                ...trackingData,
                addedAt: new Date().toISOString(),
                addedBy: currentUser.id
            };

            // Si la commande n'est pas encore expédiée, mettre à jour son statut
            if (order.status === this.ORDER_STATUS.PROCESSING || order.status === this.ORDER_STATUS.PENDING) {
                order.status = this.ORDER_STATUS.SHIPPED;
                order.statusHistory = order.statusHistory || [];
                order.statusHistory.push({
                    status: this.ORDER_STATUS.SHIPPED,
                    date: new Date().toISOString(),
                    notes: `Expédié avec ${trackingData.carrier} (${trackingData.trackingNumber})`,
                    updatedBy: currentUser.id
                });
            }

            order.updatedAt = new Date().toISOString();

            await DbService.update(STORES.ORDERS, order);

            return order;
        } catch (error) {
            console.error(`Erreur lors de l'ajout d'informations de suivi à la commande ${orderId}:`, error);
            throw error;
        }
    }

    /**
     * Effectue un remboursement pour une commande
     * @param {string} orderId - ID de la commande
     * @param {string} reason - Raison du remboursement
     * @param {number} [amount] - Montant à rembourser (si différent du total)
     * @returns {Promise<Object>} Commande mise à jour
     */
    static async refundOrder(orderId, reason, amount = null) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            const order = await DbService.getByKey(STORES.ORDERS, orderId);

            if (!order) {
                throw new Error('Commande non trouvée');
            }

            // Vérifier si la commande peut être remboursée
            if (order.status === this.ORDER_STATUS.CANCELLED ||
                order.status === this.ORDER_STATUS.REFUNDED) {
                throw new Error(`Impossible de rembourser une commande avec le statut '${order.status}'`);
            }

            // Déterminer le montant du remboursement
            const refundAmount = amount !== null ? amount : order.total;

            // Si c'est un remboursement complet, remettre les produits en stock
            if (refundAmount >= order.total * 0.99) { // 99% du total pour gérer les arrondis
                for (const item of order.items) {
                    await ProductService.updateProductStock(item.productId, item.quantity);
                }
            }

            // Mettre à jour le statut
            order.status = this.ORDER_STATUS.REFUNDED;
            order.statusHistory = order.statusHistory || [];
            order.statusHistory.push({
                status: this.ORDER_STATUS.REFUNDED,
                date: new Date().toISOString(),
                notes: `Remboursement de ${refundAmount.toFixed(2)} XAF - Raison: ${reason}`,
                updatedBy: currentUser.id
            });
            order.refundAmount = refundAmount;
            order.refundReason = reason;
            order.refundedAt = new Date().toISOString();
            order.updatedAt = new Date().toISOString();

            await DbService.update(STORES.ORDERS, order);

            return order;
        } catch (error) {
            console.error(`Erreur lors du remboursement de la commande ${orderId}:`, error);
            throw error;
        }
    }

    /**
 * Partie 3 - Fonctionnalités d'administration
 */

    /**
     * Récupère toutes les commandes (admin seulement)
     * @param {Object} [filters] - Filtres à appliquer
     * @param {string} [filters.status] - Filtrer par statut
     * @param {string} [filters.dateFrom] - Date de début (ISO string)
     * @param {string} [filters.dateTo] - Date de fin (ISO string)
     * @returns {Promise<Array>} Liste des commandes
     */
    static async getAllOrders(filters = {}) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            // Récupérer toutes les commandes
            let orders = await DbService.getAll(STORES.ORDERS);

            // Appliquer les filtres
            if (filters.status) {
                orders = orders.filter(order => order.status === filters.status);
            }

            if (filters.dateFrom) {
                const fromDate = new Date(filters.dateFrom);
                orders = orders.filter(order => new Date(order.createdAt) >= fromDate);
            }

            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999); // Fin de journée
                orders = orders.filter(order => new Date(order.createdAt) <= toDate);
            }

            // Trier les commandes par date (plus récente en premier)
            return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            console.error('Erreur lors de la récupération de toutes les commandes:', error);
            throw error;
        }
    }

    /**
     * Recherche des commandes par mot-clé
     * @param {string} query - Terme de recherche
     * @returns {Promise<Array>} Commandes correspondantes
     */
    static async searchOrders(query) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            if (!query || query.trim() === '') {
                return [];
            }

            const normalizedQuery = query.toLowerCase().trim();

            const orders = await DbService.getAll(STORES.ORDERS);

            // Rechercher dans les champs pertinents
            return orders.filter(order =>
                order.id.toLowerCase().includes(normalizedQuery) ||
                (order.shippingAddress && (
                    order.shippingAddress.firstName?.toLowerCase().includes(normalizedQuery) ||
                    order.shippingAddress.lastName?.toLowerCase().includes(normalizedQuery) ||
                    order.shippingAddress.email?.toLowerCase().includes(normalizedQuery) ||
                    order.shippingAddress.phone?.toLowerCase().includes(normalizedQuery)
                ))
            );
        } catch (error) {
            console.error(`Erreur lors de la recherche de commandes pour "${query}":`, error);
            throw error;
        }
    }

    /**
     * Génère des statistiques sur les commandes
     * @param {string} [period='month'] - Période ('day', 'week', 'month', 'year')
     * @returns {Promise<Object>} Statistiques de commandes
     */
    static async getOrderStats(period = 'month') {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            const orders = await DbService.getAll(STORES.ORDERS);

            // Définir la date de début en fonction de la période
            const now = new Date();
            let startDate;

            switch (period) {
                case 'day':
                    startDate = new Date(now);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate = new Date(now);
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    startDate = new Date(now);
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
                default:
                    startDate = new Date(now);
                    startDate.setMonth(now.getMonth() - 1);
            }

            // Filtrer les commandes pour la période spécifiée
            const periodOrders = orders.filter(order => new Date(order.createdAt) >= startDate);

            // Calculer les statistiques de base
            const totalOrders = periodOrders.length;
            const totalRevenue = periodOrders.reduce((sum, order) => sum + order.total, 0);
            const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            // Compter les commandes par statut
            const ordersByStatus = {};
            Object.values(this.ORDER_STATUS).forEach(status => {
                ordersByStatus[status] = periodOrders.filter(order => order.status === status).length;
            });

            // Extraire les produits les plus vendus
            const productSales = {};
            periodOrders.forEach(order => {
                order.items.forEach(item => {
                    if (productSales[item.productId]) {
                        productSales[item.productId].quantity += item.quantity;
                        productSales[item.productId].revenue += item.subtotal;
                    } else {
                        productSales[item.productId] = {
                            id: item.productId,
                            name: item.name,
                            quantity: item.quantity,
                            revenue: item.subtotal
                        };
                    }
                });
            });

            // Convertir en tableau et trier par quantité vendue
            const topProducts = Object.values(productSales)
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5);

            // Regrouper les commandes par jour
            const salesByDay = {};
            periodOrders.forEach(order => {
                const date = new Date(order.createdAt).toISOString().split('T')[0];
                if (salesByDay[date]) {
                    salesByDay[date].orders += 1;
                    salesByDay[date].revenue += order.total;
                } else {
                    salesByDay[date] = {
                        date,
                        orders: 1,
                        revenue: order.total
                    };
                }
            });

            // Convertir en tableau et trier par date
            const dailySales = Object.values(salesByDay).sort((a, b) => a.date.localeCompare(b.date));

            return {
                period,
                totalOrders,
                totalRevenue,
                avgOrderValue,
                ordersByStatus,
                topProducts,
                dailySales
            };
        } catch (error) {
            console.error(`Erreur lors de la génération des statistiques de commandes:`, error);
            throw error;
        }
    }

    /**
     * Calcule les statistiques de vente par période
     * @param {string} groupBy - Regroupement ('day', 'week', 'month', 'year')
     * @param {Date} startDate - Date de début
     * @param {Date} endDate - Date de fin
     * @returns {Promise<Array>} Statistiques de vente par période
     */
    static async getSalesByPeriod(groupBy = 'day', startDate = null, endDate = null) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            // Définir les dates par défaut si non fournies
            const now = new Date();
            const defaultStartDate = new Date(now);
            defaultStartDate.setMonth(now.getMonth() - 1);

            const start = startDate || defaultStartDate;
            const end = endDate || now;

            // Récupérer toutes les commandes
            const orders = await DbService.getAll(STORES.ORDERS);

            // Filtrer les commandes par période et ne garder que celles qui sont payées
            const validStatuses = [
                this.ORDER_STATUS.PROCESSING,
                this.ORDER_STATUS.SHIPPED,
                this.ORDER_STATUS.DELIVERED
            ];

            const filteredOrders = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= start &&
                    orderDate <= end &&
                    validStatuses.includes(order.status);
            });

            // Fonction pour formater la date selon le regroupement
            const formatPeriod = (date) => {
                const d = new Date(date);

                switch (groupBy) {
                    case 'day':
                        return d.toISOString().split('T')[0]; // YYYY-MM-DD
                    case 'week':
                        // Obtenir le premier jour de la semaine (lundi)
                        const day = d.getDay();
                        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Si dimanche, aller au lundi précédent
                        const monday = new Date(d.setDate(diff));
                        return monday.toISOString().split('T')[0]; // YYYY-MM-DD du lundi
                    case 'month':
                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
                    case 'year':
                        return `${d.getFullYear()}`; // YYYY
                    default:
                        return d.toISOString().split('T')[0]; // YYYY-MM-DD
                }
            };

            // Regrouper les commandes par période
            const salesByPeriod = {};

            filteredOrders.forEach(order => {
                const period = formatPeriod(order.createdAt);

                if (!salesByPeriod[period]) {
                    salesByPeriod[period] = {
                        period,
                        orders: 0,
                        revenue: 0,
                        items: 0
                    };
                }

                salesByPeriod[period].orders += 1;
                salesByPeriod[period].revenue += order.total;
                salesByPeriod[period].items += order.items.reduce((sum, item) => sum + item.quantity, 0);
            });

            // Convertir en tableau et trier par période
            const result = Object.values(salesByPeriod).sort((a, b) => a.period.localeCompare(b.period));

            return result;
        } catch (error) {
            console.error('Erreur lors du calcul des statistiques de vente par période:', error);
            throw error;
        }
    }
    /**
 * Partie 4 - Fonctionnalités utilitaires
 */

    /**
     * Exporte les commandes au format CSV
     * @param {Array} orders - Liste des commandes à exporter
     * @returns {string} Données CSV
     */
    static exportOrdersToCsv(orders) {
        try {
            if (!orders || orders.length === 0) {
                return '';
            }

            // Définir les colonnes d'en-tête
            const headers = [
                'ID',
                'Date',
                'Client',
                'Email',
                'Statut',
                'Articles',
                'Sous-total',
                'Frais de livraison',
                'TVA',
                'Total',
                'Méthode de paiement',
                'Adresse de livraison'
            ];

            // Construire les lignes
            const rows = orders.map(order => {
                const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                const clientName = order.shippingAddress ?
                    `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` :
                    'Inconnu';
                const clientEmail = order.shippingAddress?.email || 'Non spécifié';
                const shippingAddress = order.shippingAddress ?
                    `${order.shippingAddress.address1}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}` :
                    'Non spécifié';

                return [
                    order.id,
                    new Date(order.createdAt).toLocaleDateString(),
                    clientName,
                    clientEmail,
                    order.status,
                    itemsCount,
                    order.subtotal.toFixed(2),
                    order.shippingCost.toFixed(2),
                    order.taxAmount.toFixed(2),
                    order.total.toFixed(2),
                    order.paymentMethod,
                    shippingAddress
                ];
            });

            // Combiner l'en-tête et les lignes
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

            return csvContent;
        } catch (error) {
            console.error('Erreur lors de l\'exportation des commandes au format CSV:', error);
            throw error;
        }
    }

    /**
     * Ajoute un message ou une note à une commande
     * @param {string} orderId - ID de la commande
     * @param {string} message - Message à ajouter
     * @param {boolean} [isInternal=false] - Si le message est interne (visible uniquement par les admins)
     * @returns {Promise<Object>} Commande mise à jour
     */
    static async addOrderNote(orderId, message, isInternal = false) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            const order = await DbService.getByKey(STORES.ORDERS, orderId);

            if (!order) {
                throw new Error('Commande non trouvée');
            }

            // Vérifier si l'utilisateur a le droit d'ajouter des notes
            const isAdmin = currentUser.role === 'admin';
            const isOwner = order.userId === currentUser.id;

            // Les notes internes ne peuvent être ajoutées que par les administrateurs
            if (isInternal && !isAdmin) {
                throw new Error('Accès non autorisé');
            }

            // Vérifier si l'utilisateur a le droit de modifier cette commande
            if (!isAdmin && !isOwner) {
                throw new Error('Accès non autorisé');
            }

            // Créer l'objet note
            const note = {
                id: uuidv4(),
                message,
                isInternal,
                createdAt: new Date().toISOString(),
                createdBy: currentUser.id,
                createdByName: `${currentUser.firstName} ${currentUser.lastName}`,
                isAdmin
            };

            // Initialiser le tableau de notes s'il n'existe pas
            order.notes = order.notes || [];
            order.notes.push(note);
            order.updatedAt = new Date().toISOString();

            await DbService.update(STORES.ORDERS, order);

            return order;
        } catch (error) {
            console.error(`Erreur lors de l'ajout d'une note à la commande ${orderId}:`, error);
            throw error;
        }
    }

    /**
     * Génère des données de commande fictives pour les tests
     * @param {number} [count=5] - Nombre de commandes à générer
     * @returns {Promise<void>}
     */
    static async generateDemoOrders(count = 5) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            // Récupérer quelques produits pour les commandes de démonstration
            const products = await ProductService.getAllProducts();

            if (products.length === 0) {
                throw new Error('Aucun produit disponible pour générer des commandes de démonstration');
            }

            const statuses = Object.values(this.ORDER_STATUS);

            for (let i = 0; i < count; i++) {
                // Générer une date aléatoire dans les 60 derniers jours
                const orderDate = new Date();
                orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 60));

                // Choisir un nombre aléatoire de produits (1 à 3)
                const numItems = Math.floor(Math.random() * 3) + 1;
                const orderItems = [];
                let subtotal = 0;

                for (let j = 0; j < numItems; j++) {
                    // Choisir un produit aléatoire
                    const product = products[Math.floor(Math.random() * products.length)];

                    // Vérifier si le produit n'est pas déjà dans la commande
                    if (orderItems.some(item => item.productId === product.id)) {
                        continue;
                    }

                    // Quantité aléatoire (1 à 3)
                    const quantity = Math.floor(Math.random() * 3) + 1;
                    const itemSubtotal = product.price * quantity;

                    orderItems.push({
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        quantity,
                        subtotal: itemSubtotal,
                        sku: product.sku
                    });

                    subtotal += itemSubtotal;
                }

                const shippingCost = 7.90;
                const taxRate = 0.20;
                const taxAmount = subtotal * taxRate;
                const total = subtotal + shippingCost + taxAmount;

                // Statut aléatoire
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                // Adresse fictive
                const address = {
                    firstName: 'Jean',
                    lastName: 'Dupont',
                    address1: '123 Rue de Paris',
                    address2: 'Apt 4B',
                    city: 'Paris',
                    postalCode: '75001',
                    country: 'France',
                    phone: '0123456789',
                    email: 'jean.dupont@example.com'
                };

                const newOrder = {
                    id: `ORD-DEMO-${Date.now()}-${i}`,
                    userId: currentUser.id,
                    items: orderItems,
                    subtotal,
                    shippingCost,
                    taxAmount,
                    total,
                    status,
                    shippingAddress: { ...address },
                    billingAddress: { ...address },
                    paymentMethod: 'card',
                    shippingMethod: { name: 'Standard', cost: shippingCost },
                    createdAt: orderDate.toISOString(),
                    updatedAt: orderDate.toISOString(),
                    statusHistory: [
                        {
                            status,
                            date: orderDate.toISOString(),
                            notes: 'Commande de démonstration',
                            updatedBy: currentUser.id
                        }
                    ]
                };

                // Ajouter des informations de suivi pour les commandes expédiées ou livrées
                if (status === this.ORDER_STATUS.SHIPPED || status === this.ORDER_STATUS.DELIVERED) {
                    const trackingNumber = `TRACK-${Math.floor(Math.random() * 1000000)}`;
                    const carriers = ['Chronopost', 'La Poste', 'DHL', 'UPS'];
                    const carrier = carriers[Math.floor(Math.random() * carriers.length)];

                    newOrder.tracking = {
                        trackingNumber,
                        carrier,
                        trackingUrl: `https://example.com/track/${trackingNumber}`,
                        addedAt: new Date(orderDate.getTime() + 86400000).toISOString(), // +1 jour
                        addedBy: currentUser.id
                    };

                    // Ajouter une date de livraison pour les commandes livrées
                    if (status === this.ORDER_STATUS.DELIVERED) {
                        newOrder.deliveredAt = new Date(orderDate.getTime() + 172800000).toISOString(); // +2 jours

                        // Ajouter l'étape de livraison à l'historique
                        newOrder.statusHistory.push({
                            status: this.ORDER_STATUS.DELIVERED,
                            date: newOrder.deliveredAt,
                            notes: 'Commande livrée au client',
                            updatedBy: currentUser.id
                        });
                    }
                }

                // Ajouter les informations de remboursement pour les commandes remboursées
                if (status === this.ORDER_STATUS.REFUNDED) {
                    newOrder.refundAmount = total;
                    newOrder.refundReason = 'Produit non conforme';
                    newOrder.refundedAt = new Date(orderDate.getTime() + 259200000).toISOString(); // +3 jours

                    // Ajouter l'étape de remboursement à l'historique
                    newOrder.statusHistory.push({
                        status: this.ORDER_STATUS.REFUNDED,
                        date: newOrder.refundedAt,
                        notes: `Remboursement de ${total.toFixed(2)} XAF - Raison: Produit non conforme`,
                        updatedBy: currentUser.id
                    });
                }

                // Ajouter la raison d'annulation pour les commandes annulées
                if (status === this.ORDER_STATUS.CANCELLED) {
                    newOrder.cancellationReason = 'Annulé à la demande du client';

                    // Ajouter l'étape d'annulation à l'historique
                    newOrder.statusHistory.push({
                        status: this.ORDER_STATUS.CANCELLED,
                        date: new Date(orderDate.getTime() + 43200000).toISOString(), // +12 heures
                        notes: `Annulé par client: Annulé à la demande du client`,
                        updatedBy: currentUser.id
                    });
                }

                // Ajouter la commande à la base de données
                await DbService.add(STORES.ORDERS, newOrder);
            }

            console.log(`${count} commandes de démonstration générées avec succès`);
        } catch (error) {
            console.error('Erreur lors de la génération des commandes de démonstration:', error);
            throw error;
        }
    }
}
export default OrderService;