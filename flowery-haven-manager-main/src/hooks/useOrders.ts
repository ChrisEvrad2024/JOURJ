// import { useState, useEffect, useCallback } from 'react';
// import { OrderService } from '../services';

// /**
//  * Hook personnalisé pour gérer les commandes
//  * @returns {Object} Méthodes et données des commandes
//  */
// const useOrders = () => {
//     const [orders, setOrders] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [selectedOrder, setSelectedOrder] = useState(null);

//     // Charger les commandes de l'utilisateur
//     const loadOrders = useCallback(async () => {
//         try {
//             setLoading(true);
//             setError(null);

//             const userOrders = await OrderService.getUserOrders();
//             setOrders(userOrders);
//         } catch (err) {
//             console.error('Erreur lors du chargement des commandes:', err);
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     // Récupérer une commande par son ID
//     const getOrderById = useCallback(async (orderId) => {
//         try {
//             setLoading(true);
//             setError(null);

//             const order = await OrderService.getOrderById(orderId);
//             setSelectedOrder(order);
//             return order;
//         } catch (err) {
//             console.error(`Erreur lors de la récupération de la commande ${orderId}:`, err);
//             setError(err.message);
//             return null;
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     // Créer une nouvelle commande
//     const createOrder = useCallback(async (orderData) => {
//         try {
//             setLoading(true);
//             setError(null);

//             const order = await OrderService.createOrder(orderData);

//             // Recharger les commandes
//             await loadOrders();

//             return order;
//         } catch (err) {
//             console.error('Erreur lors de la création de la commande:', err);
//             setError(err.message);
//             return null;
//         } finally {
//             setLoading(false);
//         }
//     }, [loadOrders]);

//     // Annuler une commande
//     const cancelOrder = useCallback(async (orderId, reason) => {
//         try {
//             setLoading(true);
//             setError(null);

//             const order = await OrderService.cancelOrder(orderId, reason);

//             // Mettre à jour l'état des commandes
//             setOrders(prevOrders =>
//                 prevOrders.map(ord => ord.id === orderId ? order : ord)
//             );

//             // Mettre à jour la commande sélectionnée si nécessaire
//             if (selectedOrder && selectedOrder.id === orderId) {
//                 setSelectedOrder(order);
//             }

//             return true;
//         } catch (err) {
//             console.error(`Erreur lors de l'annulation de la commande ${orderId}:`, err);
//             setError(err.message);
//             return false;
//         } finally {
//             setLoading(false);
//         }
//     }, [selectedOrder]);

//     // Ajouter une note à une commande
//     const addOrderNote = useCallback(async (orderId, message) => {
//         try {
//             setLoading(true);
//             setError(null);

//             const order = await OrderService.addOrderNote(orderId, message, false);

//             // Mettre à jour l'état des commandes
//             setOrders(prevOrders =>
//                 prevOrders.map(ord => ord.id === orderId ? order : ord)
//             );

//             // Mettre à jour la commande sélectionnée si nécessaire
//             if (selectedOrder && selectedOrder.id === orderId) {
//                 setSelectedOrder(order);
//             }

//             return true;
//         } catch (err) {
//             console.error(`Erreur lors de l'ajout d'une note à la commande ${orderId}:`, err);
//             setError(err.message);
//             return false;
//         } finally {
//             setLoading(false);
//         }
//     }, [selectedOrder]);

//     // Récupérer l'historique d'une commande
//     const getOrderHistory = useCallback(async (orderId) => {
//         try {
//             setLoading(true);
//             setError(null);

//             const history = await OrderService.getOrderHistory(orderId);
//             return history;
//         } catch (err) {
//             console.error(`Erreur lors de la récupération de l'historique de la commande ${orderId}:`, err);
//             setError(err.message);
//             return [];
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     // Fonctions administratives
//     const adminFunctions = {
//         // Récupérer toutes les commandes (admin seulement)
//         getAllOrders: async (filters = {}) => {
//             try {
//                 setLoading(true);
//                 setError(null);

//                 const allOrders = await OrderService.getAllOrders(filters);
//                 return allOrders;
//             } catch (err) {
//                 console.error('Erreur lors de la récupération de toutes les commandes:', err);
//                 setError(err.message);
//                 return [];
//             } finally {
//                 setLoading(false);
//             }
//         },

//         // Mettre à jour le statut d'une commande (admin seulement)
//         updateOrderStatus: async (orderId, newStatus, notes = '') => {
//             try {
//                 setLoading(true);
//                 setError(null);

//                 const order = await OrderService.updateOrderStatus(orderId, newStatus, notes);

//                 // Mettre à jour l'état des commandes
//                 setOrders(prevOrders =>
//                     prevOrders.map(ord => ord.id === orderId ? order : ord)
//                 );

//                 // Mettre à jour la commande sélectionnée si nécessaire
//                 if (selectedOrder && selectedOrder.id === orderId) {
//                     setSelectedOrder(order);
//                 }

//                 return true;
//             } catch (err) {
//                 console.error(`Erreur lors de la mise à jour du statut de la commande ${orderId}:`, err);
//                 setError(err.message);
//                 return false;
//             } finally {
//                 setLoading(false);
//             }
//         },

//         // Ajouter des informations de suivi (admin seulement)
//         addTrackingInfo: async (orderId, trackingData) => {
//             try {
//                 setLoading(true);
//                 setError(null);

//                 const order = await OrderService.addTrackingInfo(orderId, trackingData);

//                 // Mettre à jour l'état des commandes
//                 setOrders(prevOrders =>
//                     prevOrders.map(ord => ord.id === orderId ? order : ord)
//                 );

//                 // Mettre à jour la commande sélectionnée si nécessaire
//                 if (selectedOrder && selectedOrder.id === orderId) {
//                     setSelectedOrder(order);
//                 }

//                 return true;
//             } catch (err) {
//                 console.error(`Erreur lors de l'ajout d'informations de suivi à la commande ${orderId}:`, err);
//                 setError(err.message);
//                 return false;
//             } finally {
//                 setLoading(false);
//             }
//         },

//         // Marquer une commande comme livrée (admin seulement)
//         markAsDelivered: async (orderId, notes = '') => {
//             try {
//                 setLoading(true);
//                 setError(null);

//                 const order = await OrderService.markAsDelivered(orderId, notes);

//                 // Mettre à jour l'état des commandes
//                 setOrders(prevOrders =>
//                     prevOrders.map(ord => ord.id === orderId ? order : ord)
//                 );

//                 // Mettre à jour la commande sélectionnée si nécessaire
//                 if (selectedOrder && selectedOrder.id === orderId) {
//                     setSelectedOrder(order);
//                 }

//                 return true;
//             } catch (err) {
//                 console.error(`Erreur lors du marquage de la commande ${orderId} comme livrée:`, err);
//                 setError(err.message);
//                 return false;
//             } finally {
//                 setLoading(false);
//             }
//         },

//         // Effectuer un remboursement (admin seulement)
//         refundOrder: async (orderId, reason, amount = null) => {
//             try {
//                 setLoading(true);
//                 setError(null);

//                 const order = await OrderService.refundOrder(orderId, reason, amount);

//                 // Mettre à jour l'état des commandes
//                 setOrders(prevOrders =>
//                     prevOrders.map(ord => ord.id === orderId ? order : ord)
//                 );

//                 // Mettre à jour la commande sélectionnée si nécessaire
//                 if (selectedOrder && selectedOrder.id === orderId) {
//                     setSelectedOrder(order);
//                 }

//                 return true;
//             } catch (err) {
//                 console.error(`Erreur lors du remboursement de la commande ${orderId}:`, err);
//                 setError(err.message);
//                 return false;
//             } finally {
//                 setLoading(false);
//             }
//         },

//         // Rechercher des commandes (admin seulement)
//         searchOrders: async (query) => {
//             try {
//                 setLoading(true);
//                 setError(null);

//                 const searchResults = await OrderService.searchOrders(query);
//                 return searchResults;
//             } catch (err) {
//                 console.error(`Erreur lors de la recherche de commandes pour "${query}":`, err);
//                 setError(err.message);
//                 return [];
//             } finally {
//                 setLoading(false);
//             }
//         },

//         // Générer des statistiques (admin seulement)
//         getOrderStats: async (period = 'month') => {
//             try {
//                 setLoading(true);
//                 setError(null);

//                 const stats = await OrderService.getOrderStats(period);
//                 return stats;
//             } catch (err) {
//                 console.error('Erreur lors de la génération des statistiques de commandes:', err);
//                 setError(err.message);
//                 return null;
//             } finally {
//                 setLoading(false);
//             }
//         },

//         // Obtenir les ventes par période (admin seulement)
//         getSalesByPeriod: async (groupBy = 'day', startDate = null, endDate = null) => {
//             try {
//                 setLoading(true);
//                 setError(null);

//                 const sales = await OrderService.getSalesByPeriod(groupBy, startDate, endDate);
//                 return sales;
//             } catch (err) {
//                 console.error('Erreur lors du calcul des statistiques de vente par période:', err);
//                 setError(err.message);
//                 return [];
//             } finally {
//                 setLoading(false);
//             }
//         },

//         // Exporter les commandes au format CSV (admin seulement)
//         exportOrdersToCsv: (ordersToExport) => {
//             try {
//                 return OrderService.exportOrdersToCsv(ordersToExport);
//             } catch (err) {
//                 console.error('Erreur lors de l\'exportation des commandes au format CSV:', err);
//                 setError(err.message);
//                 return '';
//             }
//         }
//     };

//     // Charger les commandes au montage du composant
//     useEffect(() => {
//         loadOrders();
//     }, [loadOrders]);

//     return {
//         orders,
//         selectedOrder,
//         loading,
//         error,
//         setSelectedOrder,
//         loadOrders,
//         getOrderById,
//         createOrder,
//         cancelOrder,
//         addOrderNote,
//         getOrderHistory,
//         admin: adminFunctions
//     };
// };

// export default useOrders;

// Stub pour useOrders
export const useOrders = () => {
    return {
        orders: [],
        selectedOrder: null,
        loading: false,
        error: null,
        setSelectedOrder: () => { },
        loadOrders: () => Promise.resolve(),
        getOrderById: () => Promise.resolve(null),
        createOrder: () => Promise.resolve(null),
        cancelOrder: () => Promise.resolve(false),
        addOrderNote: () => Promise.resolve(false),
        getOrderHistory: () => Promise.resolve([]),
        admin: {
            getAllOrders: () => Promise.resolve([]),
            updateOrderStatus: () => Promise.resolve(false),
            addTrackingInfo: () => Promise.resolve(false),
            markAsDelivered: () => Promise.resolve(false),
            refundOrder: () => Promise.resolve(false),
            searchOrders: () => Promise.resolve([]),
            getOrderStats: () => Promise.resolve(null),
            getSalesByPeriod: () => Promise.resolve([]),
            exportOrdersToCsv: () => ''
        }
    };
};

export default useOrders;