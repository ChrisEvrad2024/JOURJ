// src/services/OfflineService.js
import SyncService from './SyncService';
import NotificationService from './NotificationService';

class OfflineService {
    constructor() {
        this.isOnline = navigator.onLine;
        this.pendingOperations = [];

        // Charger les opérations en attente depuis localStorage
        this.loadPendingOperations();

        // Ajouter les écouteurs d'événements pour détecter les changements de connectivité
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
    }

    /**
     * Vérifie si l'application est en ligne
     * @returns {boolean} - Vrai si l'application est en ligne
     */
    checkOnlineStatus() {
        return navigator.onLine;
    }

    /**
     * Gère le passage en ligne
     */
    handleOnline() {
        this.isOnline = true;
        console.log('Application is online');

        NotificationService.showInfo('Vous êtes en ligne', 'La connexion internet a été rétablie');

        // Synchroniser les données en attente
        this.syncPendingOperations();

        // Notifier les composants du changement de statut
        SyncService.publish('connectivityChange', { isOnline: true });
    }

    /**
     * Gère le passage hors ligne
     */
    handleOffline() {
        this.isOnline = false;
        console.log('Application is offline');

        NotificationService.showWarning('Vous êtes hors ligne', 'Certaines fonctionnalités peuvent être limitées');

        // Notifier les composants du changement de statut
        SyncService.publish('connectivityChange', { isOnline: false });
    }

    /**
     * Ajoute une opération en attente pour synchronisation ultérieure
     * @param {string} type - Type d'opération (create, update, delete)
     * @param {string} store - Nom du store
     * @param {Object} data - Données de l'opération
     * @param {Function} onSync - Callback à exécuter lors de la synchronisation
     */
    addPendingOperation(type, store, data, onSync = null) {
        if (this.isOnline) {
            console.warn('Adding pending operation while online. Consider executing directly.');
        }

        const operation = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            type,
            store,
            data,
            timestamp: Date.now(),
            onSync
        };

        this.pendingOperations.push(operation);
        this.savePendingOperations();

        return operation.id;
    }

    /**
     * Enregistre les opérations en attente dans localStorage
     */
    savePendingOperations() {
        try {
            const serializedOperations = this.pendingOperations.map(op => ({
                ...op,
                onSync: null // Les fonctions ne peuvent pas être sérialisées
            }));

            localStorage.setItem('pendingOperations', JSON.stringify(serializedOperations));
        } catch (error) {
            console.error('Failed to save pending operations:', error);
        }
    }

    /**
     * Charge les opérations en attente depuis localStorage
     */
    loadPendingOperations() {
        try {
            const storedOperations = localStorage.getItem('pendingOperations');
            if (storedOperations) {
                this.pendingOperations = JSON.parse(storedOperations);
            }
        } catch (error) {
            console.error('Failed to load pending operations:', error);
            this.pendingOperations = [];
        }
    }

    /**
     * Synchronise les opérations en attente avec le serveur
     * @returns {Promise<Object>} - Résultat de la synchronisation
     */
    async syncPendingOperations() {
        if (!this.isOnline || this.pendingOperations.length === 0) {
            return { success: true, synced: 0, failed: 0 };
        }

        console.log(`Syncing ${this.pendingOperations.length} pending operations`);

        const operationsToSync = [...this.pendingOperations];
        let synced = 0;
        let failed = 0;

        for (const operation of operationsToSync) {
            try {
                // Dans une application réelle, on enverrait ces opérations à un serveur
                // Ici on simule une synchronisation réussie
                console.log(`Syncing operation: ${operation.type} on ${operation.store}`, operation.data);

                // Simuler un délai réseau
                await new Promise(resolve => setTimeout(resolve, 200));

                // Supprimer l'opération de la liste
                this.pendingOperations = this.pendingOperations.filter(op => op.id !== operation.id);
                this.savePendingOperations();

                // Exécuter le callback de synchronisation si présent
                if (typeof operation.onSync === 'function') {
                    operation.onSync(true, null);
                }

                synced++;
            } catch (error) {
                console.error(`Failed to sync operation ${operation.id}:`, error);
                failed++;

                // Exécuter le callback de synchronisation avec l'erreur
                if (typeof operation.onSync === 'function') {
                    operation.onSync(false, error);
                }
            }
        }

        if (synced > 0) {
            NotificationService.showSuccess(
                'Synchronisation terminée',
                `${synced} opération${synced > 1 ? 's' : ''} synchronisée${synced > 1 ? 's' : ''}`
            );
        }

        return { success: failed === 0, synced, failed };
    }

    /**
     * Supprime une opération en attente
     * @param {string} operationId - ID de l'opération à supprimer
     * @returns {boolean} - Vrai si l'opération a été supprimée
     */
    removePendingOperation(operationId) {
        const initialLength = this.pendingOperations.length;
        this.pendingOperations = this.pendingOperations.filter(op => op.id !== operationId);

        if (this.pendingOperations.length !== initialLength) {
            this.savePendingOperations();
            return true;
        }

        return false;
    }

    /**
     * Récupère les opérations en attente pour un store spécifique
     * @param {string} store - Nom du store
     * @returns {Array} - Opérations en attente
     */
    getPendingOperationsForStore(store) {
        return this.pendingOperations.filter(op => op.store === store);
    }

    /**
     * Récupère le nombre d'opérations en attente
     * @returns {number} - Nombre d'opérations en attente
     */
    getPendingOperationsCount() {
        return this.pendingOperations.length;
    }
}

export default new OfflineService();