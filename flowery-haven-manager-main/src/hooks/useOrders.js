// src/hooks/useOrders.js
import { useState, useEffect, useCallback } from 'react';
import { OrderService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';

/**
 * Hook personnalisé pour gérer les commandes de l'utilisateur
 */
export const useOrders = () => {
    const { currentUser } = useAuth();
    const { addToCart } = useCart();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Charger les commandes de l'utilisateur
    const loadOrders = useCallback(async () => {
        if (!currentUser) {
            setOrders([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const userOrders = await OrderService.getUserOrders();

            // Trier les commandes par date (plus récente en premier)
            userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setOrders(userOrders);
        } catch (err) {
            console.error('Erreur lors du chargement des commandes:', err);
            setError('Impossible de charger vos commandes. Veuillez réessayer plus tard.');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    // Récupérer les commandes au chargement du composant
    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    /**
     * Obtenir une commande par son ID
     * @param {string} orderId - ID de la commande
     * @returns {Promise<Object>} Détails de la commande
     */
    const getOrderById = useCallback(async (orderId) => {
        try {
            return await OrderService.getOrderById(orderId);
        } catch (err) {
            console.error(`Erreur lors de la récupération de la commande ${orderId}:`, err);
            throw err;
        }
    }, []);

    /**
     * Annuler une commande
     * @param {string} orderId - ID de la commande
     * @param {string} reason - Raison de l'annulation
     * @returns {Promise<boolean>} Succès de l'opération
     */
    const cancelOrder = useCallback(async (orderId, reason) => {
        try {
            await OrderService.cancelOrder(orderId, reason);

            // Mettre à jour la liste des commandes
            const updatedOrders = orders.map(order =>
                order.id === orderId
                    ? { ...order, status: 'cancelled', cancellationReason: reason }
                    : order
            );

            setOrders(updatedOrders);
            return true;
        } catch (err) {
            console.error(`Erreur lors de l'annulation de la commande ${orderId}:`, err);
            throw err;
        }
    }, [orders]);

    /**
     * Commander à nouveau les articles d'une commande précédente
     * @param {Array} items - Articles à ajouter au panier
     * @returns {Promise<boolean>} Succès de l'opération
     */
    const reorderItems = useCallback(async (items) => {
        try {
            if (!items || items.length === 0) {
                throw new Error('Aucun article à commander');
            }

            // Ajouter chaque article au panier
            for (const item of items) {
                await addToCart(item.productId, item.quantity);
            }

            return true;
        } catch (err) {
            console.error('Erreur lors de la recommande des articles:', err);
            throw err;
        }
    }, [addToCart]);

    /**
     * Création d'une commande (à partir du panier)
     * Cette fonction serait utilisée pour finaliser le panier
     * @param {Object} orderData - Données de la commande
     * @returns {Promise<Object>} Commande créée
     */
    const createOrder = useCallback(async (orderData) => {
        try {
            const newOrder = await OrderService.createOrder(orderData);

            // Ajouter la nouvelle commande à la liste
            setOrders(prevOrders => [newOrder, ...prevOrders]);

            return newOrder;
        } catch (err) {
            console.error('Erreur lors de la création de la commande:', err);
            throw err;
        }
    }, []);

    return {
        orders,
        loading,
        error,
        getOrderById,
        cancelOrder,
        reorderItems,
        createOrder,
        refreshOrders: loadOrders
    };
};