/**
 * Service pour gérer le mode hors ligne
 */
class OfflineService {
    constructor() {
        this.isOfflineMode = false;
    }

    /**
     * Vérifie si l'application est en mode hors ligne
     * @returns {boolean} True si l'application est en mode hors ligne
     */
    isOffline() {
        return this.isOfflineMode || !navigator.onLine;
    }

    /**
     * Active le mode hors ligne
     */
    enableOfflineMode() {
        this.isOfflineMode = true;
        localStorage.setItem('offlineMode', 'true');
        // Déclencher un événement pour informer les autres composants
        window.dispatchEvent(new CustomEvent('offlineStatusChanged', { detail: true }));
    }

    /**
     * Désactive le mode hors ligne
     */
    disableOfflineMode() {
        this.isOfflineMode = false;
        localStorage.setItem('offlineMode', 'false');
        // Déclencher un événement pour informer les autres composants
        window.dispatchEvent(new CustomEvent('offlineStatusChanged', { detail: false }));
    }

    /**
     * Initialise le mode hors ligne depuis le stockage local
     */
    initFromLocalStorage() {
        const offlineMode = localStorage.getItem('offlineMode') === 'true';
        this.isOfflineMode = offlineMode;
        return offlineMode;
    }
}

export default new OfflineService();