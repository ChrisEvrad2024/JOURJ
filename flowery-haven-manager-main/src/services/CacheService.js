// src/services/CacheService.js
class CacheService {
    constructor() {
        this.memoryCache = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes par défaut
    }

    /**
     * Stocke une valeur en cache
     * @param {string} key - Clé de cache
     * @param {any} value - Valeur à stocker
     * @param {number} ttl - Durée de vie en ms (optionnel)
     */
    set(key, value, ttl = this.defaultTTL) {
        const expiresAt = Date.now() + ttl;
        this.memoryCache.set(key, {
            value,
            expiresAt
        });

        // Stockage persistant en localStorage si possible
        try {
            const item = JSON.stringify({
                value,
                expiresAt
            });
            localStorage.setItem(`cache_${key}`, item);
        } catch (error) {
            console.warn('Failed to store cache in localStorage:', error);
        }
    }

    /**
     * Récupère une valeur du cache
     * @param {string} key - Clé de cache
     * @returns {any|null} - Valeur en cache ou null si absente/expirée
     */
    get(key) {
        // Essayer le cache mémoire d'abord
        if (this.memoryCache.has(key)) {
            const cacheItem = this.memoryCache.get(key);
            if (cacheItem.expiresAt > Date.now()) {
                return cacheItem.value;
            }
            this.memoryCache.delete(key);
        }

        // Sinon essayer le localStorage
        try {
            const cachedItem = localStorage.getItem(`cache_${key}`);
            if (cachedItem) {
                const parsed = JSON.parse(cachedItem);

                if (parsed.expiresAt > Date.now()) {
                    // Restaurer aussi dans le cache mémoire
                    this.memoryCache.set(key, parsed);
                    return parsed.value;
                }

                // Supprimer les entrées expirées
                localStorage.removeItem(`cache_${key}`);
            }
        } catch (error) {
            console.warn('Failed to retrieve cache from localStorage:', error);
        }

        return null;
    }

    /**
     * Supprime une entrée du cache
     * @param {string} key - Clé de cache à supprimer
     */
    remove(key) {
        this.memoryCache.delete(key);
        localStorage.removeItem(`cache_${key}`);
    }

    /**
     * Vide tout le cache
     */
    clear() {
        this.memoryCache.clear();

        // Supprimer uniquement les entrées de cache du localStorage
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('cache_')) {
                localStorage.removeItem(key);
            }
        });
    }

    /**
     * Récupère une valeur ou l'initialise si absente
     * @param {string} key - Clé de cache
     * @param {Function} factory - Fonction pour créer la valeur si absente
     * @param {number} ttl - Durée de vie en ms (optionnel)
     * @returns {Promise<any>} - Valeur en cache ou nouvellement créée
     */
    async getOrSet(key, factory, ttl = this.defaultTTL) {
        const cached = this.get(key);
        if (cached !== null) {
            return cached;
        }

        const value = await factory();
        this.set(key, value, ttl);
        return value;
    }
}

export default new CacheService();