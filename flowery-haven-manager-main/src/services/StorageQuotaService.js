// src/services/StorageQuotaService.js
class StorageQuotaService {
    /**
     * Vérifie l'espace de stockage disponible
     * @returns {Promise<Object>} - Informations sur le stockage
     */
    async checkStorageQuota() {
        try {
            // Essayer d'utiliser l'API Storage Manager si disponible
            if (navigator.storage && navigator.storage.estimate) {
                const estimate = await navigator.storage.estimate();
                return {
                    usage: estimate.usage || 0,
                    quota: estimate.quota || 0,
                    percentUsed: estimate.quota ? Math.round((estimate.usage / estimate.quota) * 100) : 0,
                    remaining: estimate.quota ? estimate.quota - estimate.usage : 0
                };
            }

            // Fallback pour les navigateurs qui ne supportent pas Storage Manager
            const localStorageUsage = this.estimateLocalStorageUsage();
            const indexedDBUsage = await this.estimateIndexedDBUsage();

            return {
                usage: localStorageUsage + indexedDBUsage,
                quota: 10 * 1024 * 1024, // Estimation conservative: 10MB
                percentUsed: 0, // Ne peut pas être calculé précisément
                remaining: 0, // Ne peut pas être calculé précisément
                localStorageUsage,
                indexedDBUsage
            };
        } catch (error) {
            console.error('Failed to check storage quota:', error);
            return {
                usage: 0,
                quota: 0,
                percentUsed: 0,
                remaining: 0,
                error: error.message
            };
        }
    }

    /**
     * Estime l'espace utilisé par localStorage
     * @returns {number} - Taille en octets
     */
    estimateLocalStorageUsage() {
        try {
            let totalSize = 0;

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                totalSize += (key.length + value.length) * 2; // UTF-16 = 2 bytes par caractère
            }

            return totalSize;
        } catch (error) {
            console.warn('Failed to estimate localStorage usage:', error);
            return 0;
        }
    }

    /**
     * Estime l'espace utilisé par IndexedDB
     * @returns {Promise<number>} - Taille en octets
     */
    async estimateIndexedDBUsage() {
        // Cette estimation est approximative et simplement basée
        // sur la taille des objets en mémoire
        // Dans un environnement réel, vous pourriez avoir besoin d'une logique plus complexe
        return 0;
    }

    /**
     * Vérifie si l'espace est suffisant pour une opération
     * @param {number} requiredSpace - Espace requis en octets
     * @returns {Promise<boolean>} - Vrai si l'espace est suffisant
     */
    async hasEnoughSpace(requiredSpace) {
        const quota = await this.checkStorageQuota();
        return quota.remaining > requiredSpace;
    }

    /**
     * Nettoie le stockage pour libérer de l'espace
     * @param {number} targetSpace - Espace à libérer en octets
     * @returns {Promise<boolean>} - Vrai si le nettoyage a réussi
     */
    async cleanupStorage(targetSpace) {
        try {
            // 1. Supprimer les données de cache les plus anciennes
            const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));

            if (cacheKeys.length > 0) {
                // Trier par timestamp (supposant que les valeurs ont une propriété expiresAt)
                const sortedCacheKeys = cacheKeys.sort((a, b) => {
                    try {
                        const itemA = JSON.parse(localStorage.getItem(a));
                        const itemB = JSON.parse(localStorage.getItem(b));
                        return itemA.expiresAt - itemB.expiresAt;
                    } catch {
                        return 0;
                    }
                });

                // Supprimer les caches les plus anciens jusqu'à libérer assez d'espace
                let freedSpace = 0;

                for (const key of sortedCacheKeys) {
                    const item = localStorage.getItem(key);
                    freedSpace += (key.length + item.length) * 2;
                    localStorage.removeItem(key);

                    if (freedSpace >= targetSpace) {
                        return true;
                    }
                }
            }

            // 2. Si on n'a pas libéré assez d'espace, supprimer d'autres données non essentielles
            // ...

            return false;
        } catch (error) {
            console.error('Failed to cleanup storage:', error);
            return false;
        }
    }
}

export default new StorageQuotaService();