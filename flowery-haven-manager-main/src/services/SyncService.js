// src/services/SyncService.js
class SyncService {
    constructor() {
        this.broadcastChannel = typeof BroadcastChannel !== 'undefined'
            ? new BroadcastChannel('chezflora-sync')
            : null;

        this.listeners = new Map();

        if (this.broadcastChannel) {
            this.broadcastChannel.onmessage = (event) => {
                const { type, data } = event.data;
                this.notifyListeners(type, data);
            };
        }

        // Fallback pour les navigateurs ne supportant pas BroadcastChannel
        window.addEventListener('storage', (event) => {
            if (event.key === 'chezflora-sync') {
                try {
                    const { type, data } = JSON.parse(event.newValue);
                    this.notifyListeners(type, data);
                } catch (error) {
                    console.error('Failed to parse sync data:', error);
                }
            }
        });
    }

    /**
     * Émet un événement de synchronisation
     * @param {string} type - Type d'événement
     * @param {any} data - Données associées à l'événement
     */
    publish(type, data) {
        const message = { type, data };

        // Utilisation de BroadcastChannel si disponible
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage(message);
        }

        // Fallback avec localStorage
        localStorage.setItem('chezflora-sync', JSON.stringify(message));
        localStorage.removeItem('chezflora-sync');

        // Notifier les listeners dans la fenêtre actuelle
        this.notifyListeners(type, data);
    }

    /**
     * S'abonne à un événement de synchronisation
     * @param {string} type - Type d'événement
     * @param {Function} callback - Fonction à appeler lors de l'événement
     * @returns {Function} - Fonction pour se désabonner
     */
    subscribe(type, callback) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }

        const typeListeners = this.listeners.get(type);
        typeListeners.add(callback);

        // Retourner une fonction pour se désabonner
        return () => {
            if (this.listeners.has(type)) {
                const listeners = this.listeners.get(type);
                listeners.delete(callback);

                if (listeners.size === 0) {
                    this.listeners.delete(type);
                }
            }
        };
    }

    /**
     * Notifie tous les listeners pour un type d'événement
     * @param {string} type - Type d'événement
     * @param {any} data - Données associées à l'événement
     */
    notifyListeners(type, data) {
        if (this.listeners.has(type)) {
            const listeners = this.listeners.get(type);
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in sync listener for "${type}":`, error);
                }
            });
        }
    }
}

export default new SyncService();