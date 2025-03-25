import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OrderService } from '@/services';

/**
 * Hook personnalisé pour gérer les commandes de l'utilisateur
 */
export const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    // Charger les commandes au démarrage
    useEffect(() => {
        if (!currentUser) {
            setOrders([]);
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);

                // Utilisateur admin : toutes les commandes ou commandes filtrées
                const userOrders = currentUser.role === 'admin'
                    ? await OrderService.getAllOrders()
                    : await OrderService.getUserOrders(currentUser.id);

                setOrders(userOrders);
            } catch (err) {
                console.error('Erreur lors du chargement des commandes:', err);
                setError(err.message || 'Erreur lors du chargement des commandes');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentUser]);

    /**
     * Annuler une commande
     * @param {string} orderId - ID de la commande
     * @returns {Promise<boolean>} Succès de l'opération
     */
    const cancelOrder = async (orderId) => {
        try {
            const reason = "Annulée à la demande du client";
            await OrderService.cancelOrder(orderId, reason);

            // Mettre à jour l'état local
            setOrders(orders.map(order => {
                if (order.id === orderId) {
                    return {
                        ...order,
                        status: 'cancelled',
                        statusHistory: [
                            ...(order.statusHistory || []),
                            {
                                status: 'cancelled',
                                date: new Date().toISOString(),
                                notes: `Annulé par client: ${reason}`
                            }
                        ]
                    };
                }
                return order;
            }));

            return true;
        } catch (err) {
            console.error(`Erreur lors de l'annulation de la commande ${orderId}:`, err);
            setError(err.message || `Erreur lors de l'annulation de la commande`);
            return false;
        }
    };

    /**
     * Récupère une commande spécifique
     * @param {string} orderId - ID de la commande
     * @returns {Object|null} La commande ou null si non trouvée
     */
    const getOrderById = (orderId) => {
        return orders.find(order => order.id === orderId) || null;
    };

    /**
     * Filtrer les commandes par statut
     * @param {string} status - Statut à filtrer
     * @returns {Array} Commandes filtrées
     */
    const getOrdersByStatus = (status) => {
        if (!status || status === 'all') return orders;
        return orders.filter(order => order.status === status);
    };

    /**
     * Mise à jour du statut d'une commande (admin uniquement)
     * @param {string} orderId - ID de la commande
     * @param {string} newStatus - Nouveau statut
     * @param {string} notes - Notes additionnelles
     * @returns {Promise<boolean>} Succès de l'opération
     */
    const updateOrderStatus = async (orderId, newStatus, notes = '') => {
        if (!currentUser || currentUser.role !== 'admin') {
            setError('Permission refusée');
            return false;
        }

        try {
            await OrderService.updateOrderStatus(orderId, newStatus, notes);

            // Mettre à jour l'état local
            setOrders(orders.map(order => {
                if (order.id === orderId) {
                    return {
                        ...order,
                        status: newStatus,
                        statusHistory: [
                            ...(order.statusHistory || []),
                            {
                                status: newStatus,
                                date: new Date().toISOString(),
                                notes
                            }
                        ]
                    };
                }
                return order;
            }));

            return true;
        } catch (err) {
            console.error(`Erreur lors de la mise à jour du statut de la commande ${orderId}:`, err);
            setError(err.message || `Erreur lors de la mise à jour du statut de la commande`);
            return false;
        }
    };

    return {
        orders,
        loading,
        error,
        cancelOrder,
        getOrderById,
        getOrdersByStatus,
        updateOrderStatus
    };
};