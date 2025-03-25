import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { QuoteService } from '@/services';

/**
 * Hook personnalisé pour gérer les devis de l'utilisateur
 */
export const useQuotes = () => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    // Charger les devis au démarrage
    useEffect(() => {
        if (!currentUser) {
            setQuotes([]);
            setLoading(false);
            return;
        }

        const fetchQuotes = async () => {
            try {
                setLoading(true);
                setError(null);

                // Utilisateur admin : tous les devis ou devis filtrés
                const userQuotes = currentUser.role === 'admin'
                    ? await QuoteService.getAllQuotes()
                    : await QuoteService.getUserQuotes(currentUser.id);

                setQuotes(userQuotes);
            } catch (err) {
                console.error('Erreur lors du chargement des devis:', err);
                setError(err.message || 'Erreur lors du chargement des devis');
            } finally {
                setLoading(false);
            }
        };

        fetchQuotes();
    }, [currentUser]);

    /**
     * Créer un nouveau devis
     * @param {Object} quoteData - Données du devis
     * @returns {Promise<Object>} Le devis créé
     */
    const createQuote = async (quoteData) => {
        try {
            const newQuote = await QuoteService.createQuote(quoteData);
            setQuotes([newQuote, ...quotes]);
            return newQuote;
        } catch (err) {
            console.error('Erreur lors de la création du devis:', err);
            setError(err.message || 'Erreur lors de la création du devis');
            throw err;
        }
    };

    /**
     * Accepter un devis
     * @param {string} quoteId - ID du devis
     * @param {string} notes - Notes additionnelles
     * @returns {Promise<boolean>} Succès de l'opération
     */
    const acceptQuote = async (quoteId, notes = '') => {
        try {
            await QuoteService.acceptQuote(quoteId, notes);

            // Mettre à jour l'état local
            setQuotes(quotes.map(quote => {
                if (quote.id === quoteId) {
                    return {
                        ...quote,
                        status: 'accepted',
                        statusHistory: [
                            ...(quote.statusHistory || []),
                            {
                                status: 'accepted',
                                date: new Date().toISOString(),
                                notes: notes || 'Devis accepté'
                            }
                        ],
                        acceptedAt: new Date().toISOString()
                    };
                }
                return quote;
            }));

            return true;
        } catch (err) {
            console.error(`Erreur lors de l'acceptation du devis ${quoteId}:`, err);
            setError(err.message || `Erreur lors de l'acceptation du devis`);
            return false;
        }
    };

    /**
     * Refuser un devis
     * @param {string} quoteId - ID du devis
     * @param {string} reason - Raison du refus
     * @returns {Promise<boolean>} Succès de l'opération
     */
    const declineQuote = async (quoteId, reason) => {
        try {
            await QuoteService.declineQuote(quoteId, reason);

            // Mettre à jour l'état local
            setQuotes(quotes.map(quote => {
                if (quote.id === quoteId) {
                    return {
                        ...quote,
                        status: 'declined',
                        statusHistory: [
                            ...(quote.statusHistory || []),
                            {
                                status: 'declined',
                                date: new Date().toISOString(),
                                notes: `Devis refusé: ${reason}`
                            }
                        ],
                        declinedAt: new Date().toISOString(),
                        declineReason: reason
                    };
                }
                return quote;
            }));

            return true;
        } catch (err) {
            console.error(`Erreur lors du refus du devis ${quoteId}:`, err);
            setError(err.message || `Erreur lors du refus du devis`);
            return false;
        }
    };

    /**
     * Récupère un devis spécifique
     * @param {string} quoteId - ID du devis
     * @returns {Object|null} Le devis ou null si non trouvé
     */
    const getQuoteById = (quoteId) => {
        return quotes.find(quote => quote.id === quoteId) || null;
    };

    /**
     * Filtrer les devis par statut
     * @param {string} status - Statut à filtrer
     * @returns {Array} Devis filtrés
     */
    const getQuotesByStatus = (status) => {
        if (!status || status === 'all') return quotes;
        return quotes.filter(quote => quote.status === status);
    };

    /**
     * Mise à jour du statut d'un devis (admin uniquement)
     * @param {string} quoteId - ID du devis
     * @param {string} newStatus - Nouveau statut
     * @param {string} notes - Notes additionnelles
     * @returns {Promise<boolean>} Succès de l'opération
     */
    const updateQuoteStatus = async (quoteId, newStatus, notes = '') => {
        if (!currentUser || currentUser.role !== 'admin') {
            setError('Permission refusée');
            return false;
        }

        try {
            await QuoteService.updateQuoteStatus(quoteId, newStatus, notes);

            // Mettre à jour l'état local
            setQuotes(quotes.map(quote => {
                if (quote.id === quoteId) {
                    return {
                        ...quote,
                        status: newStatus,
                        statusHistory: [
                            ...(quote.statusHistory || []),
                            {
                                status: newStatus,
                                date: new Date().toISOString(),
                                notes
                            }
                        ]
                    };
                }
                return quote;
            }));

            return true;
        } catch (err) {
            console.error(`Erreur lors de la mise à jour du statut du devis ${quoteId}:`, err);
            setError(err.message || `Erreur lors de la mise à jour du statut du devis`);
            return false;
        }
    };

    /**
     * Ajouter une proposition à un devis (admin uniquement)
     * @param {string} quoteId - ID du devis
     * @param {Object} proposalData - Données de la proposition
     * @returns {Promise<boolean>} Succès de l'opération
     */
    const addProposal = async (quoteId, proposalData) => {
        if (!currentUser || currentUser.role !== 'admin') {
            setError('Permission refusée');
            return false;
        }

        try {
            await QuoteService.addProposal(quoteId, proposalData);

            // Mettre à jour l'état local
            setQuotes(quotes.map(quote => {
                if (quote.id === quoteId) {
                    return {
                        ...quote,
                        status: 'sent',
                        proposal: {
                            ...proposalData,
                            id: `prop-${Date.now()}`,
                            createdBy: currentUser.id,
                            createdAt: new Date().toISOString()
                        },
                        statusHistory: [
                            ...(quote.statusHistory || []),
                            {
                                status: 'sent',
                                date: new Date().toISOString(),
                                notes: 'Proposition de devis envoyée'
                            }
                        ]
                    };
                }
                return quote;
            }));

            return true;
        } catch (err) {
            console.error(`Erreur lors de l'ajout d'une proposition au devis ${quoteId}:`, err);
            setError(err.message || `Erreur lors de l'ajout d'une proposition au devis`);
            return false;
        }
    };

    return {
        quotes,
        loading,
        error,
        createQuote,
        acceptQuote,
        declineQuote,
        getQuoteById,
        getQuotesByStatus,
        updateQuoteStatus,
        addProposal
    };
};