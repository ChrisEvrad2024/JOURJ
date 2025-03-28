// src/hooks/useOrders.js
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import OrderService from '@/services/OrderService';
import { CartService } from '@/services/CartService';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook pour gérer les commandes utilisateur
 */
export const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

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
            setOrders(userOrders);
        } catch (err) {
            console.error('Erreur lors du chargement des commandes:', err);
            setError('Impossible de charger vos commandes.');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    // Charger les commandes au chargement
    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    // Récupérer une commande par son ID
    const getOrderById = useCallback(async (orderId) => {
        if (!currentUser) {
            return null;
        }

        try {
            return await OrderService.getOrderById(orderId);
        } catch (err) {
            console.error(`Erreur lors de la récupération de la commande ${orderId}:`, err);
            throw err;
        }
    }, [currentUser]);

    // Annuler une commande
    const cancelOrder = useCallback(async (orderId, reason) => {
        if (!currentUser) {
            throw new Error('Vous devez être connecté pour annuler une commande');
        }

        try {
            await OrderService.cancelOrder(orderId, reason);
            // Actualiser la liste après annulation
            await loadOrders();
            return true;
        } catch (err) {
            console.error(`Erreur lors de l'annulation de la commande ${orderId}:`, err);
            throw err;
        }
    }, [currentUser, loadOrders]);

    // Commander à nouveau les articles d'une commande précédente
    const reorderItems = useCallback(async (items) => {
        if (!currentUser) {
            throw new Error('Vous devez être connecté pour commander à nouveau');
        }

        try {
            // Ajouter chaque article au panier
            for (const item of items) {
                await CartService.addToCart(item.productId, item.quantity);
            }

            toast.success('Articles ajoutés au panier');
            return true;
        } catch (err) {
            console.error('Erreur lors de la commande à nouveau:', err);
            toast.error('Erreur lors de l\'ajout au panier');
            throw err;
        }
    }, [currentUser]);

    return {
        orders,
        loading,
        error,
        loadOrders,
        getOrderById,
        cancelOrder,
        reorderItems
    };
};

export default useOrders;