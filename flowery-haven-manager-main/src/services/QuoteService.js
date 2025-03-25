import DbService from './db/DbService';
import { STORES } from './db/DbConfig';
import AuthService from './AuthService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service pour gérer les devis personnalisés
 */
class QuoteService {
    /**
     * Statuts de devis possibles
     */
    static QUOTE_STATUS = {
        PENDING: 'pending',       // En attente de traitement
        IN_PROGRESS: 'in_progress', // En cours de traitement par l'admin
        SENT: 'sent',             // Devis envoyé au client
        ACCEPTED: 'accepted',     // Accepté par le client
        DECLINED: 'declined',     // Refusé par le client
        EXPIRED: 'expired',       // Expiré (sans réponse)
        COMPLETED: 'completed'    // Terminé (converti en commande)
    };

    /**
     * Types de devis possibles
     */
    static QUOTE_TYPES = {
        EVENT: 'event',           // Événement (mariage, etc.)
        CORPORATE: 'corporate',   // Entreprise
        DECORATION: 'decoration', // Décoration
        CUSTOM: 'custom'          // Personnalisé
    };

    /**
     * Récupère tous les devis d'un utilisateur
     * @param {string} [userId] - ID de l'utilisateur (utilise l'utilisateur courant par défaut)
     * @returns {Promise<Array>} Liste des devis
     */
    static async getUserQuotes(userId = null) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!userId && !currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            const targetUserId = userId || currentUser.id;

            // Si l'utilisateur courant n'est pas admin et essaie d'accéder aux devis d'un autre utilisateur
            if (currentUser.id !== targetUserId && currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            const quotes = await DbService.getByIndex(STORES.QUOTES, 'userId', targetUserId);

            // Trier les devis par date (plus récent en premier)
            return quotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            console.error('Erreur lors de la récupération des devis:', error);
            throw error;
        }
    }

    /**
     * Récupère un devis par son ID
     * @param {string} quoteId - ID du devis
     * @returns {Promise<Object|null>} Devis ou null si non trouvé
     */
    static async getQuoteById(quoteId) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            const quote = await DbService.getByKey(STORES.QUOTES, quoteId);

            if (!quote) {
                return null;
            }

            // Vérifier si le devis appartient à l'utilisateur ou si c'est un admin
            if (quote.userId !== currentUser.id && currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            return quote;
        } catch (error) {
            console.error(`Erreur lors de la récupération du devis ${quoteId}:`, error);
            throw error;
        }
    }

    /**
     * Crée une nouvelle demande de devis
     * @param {Object} quoteData - Données du devis
     * @returns {Promise<Object>} Devis créé
     */
    static async createQuote(quoteData) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            // Valider le type de devis
            if (!Object.values(this.QUOTE_TYPES).includes(quoteData.type)) {
                throw new Error('Type de devis invalide');
            }

            // Créer l'objet devis
            const newQuote = {
                id: `QUOTE-${Date.now()}`,
                userId: currentUser.id,
                type: quoteData.type,
                title: quoteData.title,
                description: quoteData.description,
                eventDate: quoteData.eventDate,
                budget: quoteData.budget,
                contactName: quoteData.contactName || `${currentUser.firstName} ${currentUser.lastName}`,
                contactEmail: quoteData.contactEmail || currentUser.email,
                contactPhone: quoteData.contactPhone,
                status: this.QUOTE_STATUS.PENDING,
                files: quoteData.files || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await DbService.add(STORES.QUOTES, newQuote);

            return newQuote;
        } catch (error) {
            console.error('Erreur lors de la création du devis:', error);
            throw error;
        }
    }

    /**
     * Met à jour le statut d'un devis
     * @param {string} quoteId - ID du devis
     * @param {string} newStatus - Nouveau statut (voir QUOTE_STATUS)
     * @param {string} [notes] - Notes supplémentaires
     * @returns {Promise<Object>} Devis mis à jour
     */
    static async updateQuoteStatus(quoteId, newStatus, notes = '') {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            const quote = await DbService.getByKey(STORES.QUOTES, quoteId);

            if (!quote) {
                throw new Error('Devis non trouvé');
            }

            // Vérifier les permissions selon le statut
            if (newStatus === this.QUOTE_STATUS.IN_PROGRESS ||
                newStatus === this.QUOTE_STATUS.SENT) {
                // Seul un admin peut mettre en cours ou envoyer un devis
                if (currentUser.role !== 'admin') {
                    throw new Error('Accès non autorisé');
                }
            } else if (newStatus === this.QUOTE_STATUS.ACCEPTED ||
                newStatus === this.QUOTE_STATUS.DECLINED) {
                // Seul le propriétaire du devis peut l'accepter ou le refuser
                if (quote.userId !== currentUser.id) {
                    throw new Error('Accès non autorisé');
                }
            } else if (currentUser.role !== 'admin') {
                // Pour les autres changements de statut, seul un admin est autorisé
                throw new Error('Accès non autorisé');
            }

            // Vérifier si le statut est valide
            const validStatuses = Object.values(this.QUOTE_STATUS);
            if (!validStatuses.includes(newStatus)) {
                throw new Error('Statut de devis invalide');
            }

            // Mettre à jour le statut
            quote.status = newStatus;
            quote.statusHistory = quote.statusHistory || [];
            quote.statusHistory.push({
                status: newStatus,
                date: new Date().toISOString(),
                notes: notes,
                updatedBy: currentUser.id
            });
            quote.updatedAt = new Date().toISOString();

            await DbService.update(STORES.QUOTES, quote);

            return quote;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du statut du devis ${quoteId}:`, error);
            throw error;
        }
    }

    /**
     * Ajoute une proposition de prix à un devis (admin seulement)
     * @param {string} quoteId - ID du devis
     * @param {Object} proposalData - Données de la proposition
     * @returns {Promise<Object>} Devis mis à jour
     */
    static async addProposal(quoteId, proposalData) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            const quote = await DbService.getByKey(STORES.QUOTES, quoteId);

            if (!quote) {
                throw new Error('Devis non trouvé');
            }

            // Créer la proposition
            const proposal = {
                id: uuidv4(),
                amount: proposalData.amount,
                description: proposalData.description,
                items: proposalData.items || [],
                validUntil: proposalData.validUntil,
                termsAndConditions: proposalData.termsAndConditions,
                createdBy: currentUser.id,
                createdAt: new Date().toISOString()
            };

            // Ajouter la proposition au devis
            quote.proposal = proposal;
            quote.status = this.QUOTE_STATUS.SENT;
            quote.statusHistory = quote.statusHistory || [];
            quote.statusHistory.push({
                status: this.QUOTE_STATUS.SENT,
                date: new Date().toISOString(),
                notes: 'Proposition de devis envoyée',
                updatedBy: currentUser.id
            });
            quote.updatedAt = new Date().toISOString();

            await DbService.update(STORES.QUOTES, quote);

            return quote;
        } catch (error) {
            console.error(`Erreur lors de l'ajout d'une proposition au devis ${quoteId}:`, error);
            throw error;
        }
    }

    /**
     * Accepte un devis (client seulement)
     * @param {string} quoteId - ID du devis
     * @param {string} [notes] - Notes supplémentaires
     * @returns {Promise<Object>} Devis mis à jour
     */
    static async acceptQuote(quoteId, notes = '') {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            const quote = await DbService.getByKey(STORES.QUOTES, quoteId);

            if (!quote) {
                throw new Error('Devis non trouvé');
            }

            // Vérifier si le devis appartient à l'utilisateur
            if (quote.userId !== currentUser.id) {
                throw new Error('Accès non autorisé');
            }

            // Vérifier si le devis a bien une proposition
            if (!quote.proposal) {
                throw new Error('Ce devis n\'a pas encore de proposition');
            }

            // Vérifier si le devis n'est pas déjà accepté ou refusé
            if (quote.status === this.QUOTE_STATUS.ACCEPTED ||
                quote.status === this.QUOTE_STATUS.DECLINED ||
                quote.status === this.QUOTE_STATUS.COMPLETED) {
                throw new Error(`Ce devis est déjà ${quote.status}`);
            }

            // Vérifier si le devis n'est pas expiré
            if (quote.proposal.validUntil) {
                const validUntil = new Date(quote.proposal.validUntil);
                if (validUntil < new Date()) {
                    // Mettre à jour le statut en expiré
                    quote.status = this.QUOTE_STATUS.EXPIRED;
                    quote.statusHistory = quote.statusHistory || [];
                    quote.statusHistory.push({
                        status: this.QUOTE_STATUS.EXPIRED,
                        date: new Date().toISOString(),
                        notes: 'Devis expiré',
                        updatedBy: currentUser.id
                    });

                    await DbService.update(STORES.QUOTES, quote);

                    throw new Error('Ce devis a expiré');
                }
            }

            // Mettre à jour le statut en accepté
            quote.status = this.QUOTE_STATUS.ACCEPTED;
            quote.statusHistory = quote.statusHistory || [];
            quote.statusHistory.push({
                status: this.QUOTE_STATUS.ACCEPTED,
                date: new Date().toISOString(),
                notes: notes || 'Devis accepté par le client',
                updatedBy: currentUser.id
            });
            quote.acceptedAt = new Date().toISOString();
            quote.updatedAt = new Date().toISOString();

            await DbService.update(STORES.QUOTES, quote);

            return quote;
        } catch (error) {
            console.error(`Erreur lors de l'acceptation du devis ${quoteId}:`, error);
            throw error;
        }
    }

    /**
     * Refuse un devis (client seulement)
     * @param {string} quoteId - ID du devis
     * @param {string} reason - Raison du refus
     * @returns {Promise<Object>} Devis mis à jour
     */
    static async declineQuote(quoteId, reason) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            const quote = await DbService.getByKey(STORES.QUOTES, quoteId);

            if (!quote) {
                throw new Error('Devis non trouvé');
            }

            // Vérifier si le devis appartient à l'utilisateur
            if (quote.userId !== currentUser.id) {
                throw new Error('Accès non autorisé');
            }

            // Vérifier si le devis n'est pas déjà accepté ou refusé
            if (quote.status === this.QUOTE_STATUS.ACCEPTED ||
                quote.status === this.QUOTE_STATUS.DECLINED ||
                quote.status === this.QUOTE_STATUS.COMPLETED) {
                throw new Error(`Ce devis est déjà ${quote.status}`);
            }

            // Mettre à jour le statut en refusé
            quote.status = this.QUOTE_STATUS.DECLINED;
            quote.statusHistory = quote.statusHistory || [];
            quote.statusHistory.push({
                status: this.QUOTE_STATUS.DECLINED,
                date: new Date().toISOString(),
                notes: `Devis refusé par le client: ${reason}`,
                updatedBy: currentUser.id
            });
            quote.declinedAt = new Date().toISOString();
            quote.declineReason = reason;
            quote.updatedAt = new Date().toISOString();

            await DbService.update(STORES.QUOTES, quote);

            return quote;
        } catch (error) {
            console.error(`Erreur lors du refus du devis ${quoteId}:`, error);
            throw error;
        }
    }

    /**
     * Récupère tous les devis (admin seulement)
     * @param {Object} [filters] - Filtres à appliquer
     * @param {string} [filters.status] - Filtrer par statut
     * @param {string} [filters.type] - Filtrer par type
     * @returns {Promise<Array>} Liste des devis
     */
    static async getAllQuotes(filters = {}) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            // Récupérer tous les devis
            let quotes = await DbService.getAll(STORES.QUOTES);

            // Appliquer les filtres
            if (filters.status) {
                quotes = quotes.filter(quote => quote.status === filters.status);
            }

            if (filters.type) {
                quotes = quotes.filter(quote => quote.type === filters.type);
            }

            // Trier par date (plus récent en premier)
            return quotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            console.error('Erreur lors de la récupération de tous les devis:', error);
            throw error;
        }
    }

    /**
     * Récupère les devis en attente (admin seulement)
     * @returns {Promise<Array>} Liste des devis en attente
     */
    static async getPendingQuotes() {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            const quotes = await DbService.getByIndex(STORES.QUOTES, 'status', this.QUOTE_STATUS.PENDING);

            // Trier par date (plus ancien en premier, FIFO)
            return quotes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } catch (error) {
            console.error('Erreur lors de la récupération des devis en attente:', error);
            throw error;
        }
    }
}

export default QuoteService;