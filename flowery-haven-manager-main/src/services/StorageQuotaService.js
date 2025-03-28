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
        try {
            if (!window.indexedDB) {
                return 0;
            }

            // Liste des bases de données
            const dbList = await this._getDatabaseList();
            let totalSize = 0;

            for (const dbName of dbList) {
                try {
                    // Estimer la taille de chaque base de données
                    const dbSize = await this._estimateDbSize(dbName);
                    totalSize += dbSize;
                } catch (e) {
                    console.warn(`Failed to estimate size of database ${dbName}:`, e);
                }
            }

            return totalSize;
        } catch (error) {
            console.warn('Failed to estimate IndexedDB usage:', error);
            return 0;
        }
    }

    /**
     * Récupère la liste des bases de données
     * @returns {Promise<string[]>} - Liste des noms de bases de données
     * @private
     */
    async _getDatabaseList() {
        // Pour les navigateurs qui supportent indexedDB.databases()
        if (indexedDB.databases && typeof indexedDB.databases === 'function') {
            try {
                const dbs = await indexedDB.databases();
                return dbs.map(db => db.name);
            } catch (e) {
                console.warn('Failed to list databases:', e);
                return [];
            }
        }

        // Pas de fallback fiable pour les autres navigateurs
        return ['chezflora_db']; // Nom de la base de données de l'application
    }

    /**
     * Estime la taille d'une base de données
     * @param {string} dbName - Nom de la base de données
     * @returns {Promise<number>} - Taille estimée en octets
     * @private
     */
    async _estimateDbSize(dbName) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName);
            
            request.onerror = () => {
                resolve(0); // En cas d'erreur, on suppose une taille de 0
            };
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                const objectStoreNames = Array.from(db.objectStoreNames);
                let totalSize = 0;
                
                if (objectStoreNames.length === 0) {
                    db.close();
                    resolve(0);
                    return;
                }
                
                let storesProcessed = 0;
                
                objectStoreNames.forEach(storeName => {
                    try {
                        const transaction = db.transaction(storeName, 'readonly');
                        const store = transaction.objectStore(storeName);
                        const request = store.getAll();
                        
                        request.onsuccess = (event) => {
                            const items = event.target.result;
                            let storeSize = 0;
                            
                            // Estimation approximative par sérialisation JSON
                            if (items.length > 0) {
                                storeSize = JSON.stringify(items).length * 2; // UTF-16 = 2 bytes par caractère
                            }
                            
                            totalSize += storeSize;
                            storesProcessed++;
                            
                            if (storesProcessed === objectStoreNames.length) {
                                db.close();
                                resolve(totalSize);
                            }
                        };
                        
                        request.onerror = () => {
                            storesProcessed++;
                            
                            if (storesProcessed === objectStoreNames.length) {
                                db.close();
                                resolve(totalSize);
                            }
                        };
                    } catch (e) {
                        console.warn(`Failed to estimate size of store ${storeName}:`, e);
                        storesProcessed++;
                        
                        if (storesProcessed === objectStoreNames.length) {
                            db.close();
                            resolve(totalSize);
                        }
                    }
                });
            };
        });
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

            // 2. Si on n'a pas libéré assez d'espace, supprimer les données récemment consultées
            const recentProductsKey = 'recentProducts';
            if (localStorage.hasOwnProperty(recentProductsKey)) {
                const recentProductsData = localStorage.getItem(recentProductsKey);
                freedSpace += (recentProductsKey.length + recentProductsData.length) * 2;
                localStorage.removeItem(recentProductsKey);
                
                if (freedSpace >= targetSpace) {
                    return true;
                }
            }

            // 3. Supprimer d'autres données non essentielles
            const nonEssentialKeys = [
                'theme',
                'language',
                'wishlist'
            ];
            
            for (const key of nonEssentialKeys) {
                if (localStorage.hasOwnProperty(key)) {
                    const itemData = localStorage.getItem(key);
                    freedSpace += (key.length + itemData.length) * 2;
                    localStorage.removeItem(key);
                    
                    if (freedSpace >= targetSpace) {
                        return true;
                    }
                }
            }

            return freedSpace > 0; // Retourne vrai si on a libéré de l'espace, même si pas assez
        } catch (error) {
            console.error('Failed to cleanup storage:', error);
            return false;
        }
    }

    /**
     * Nettoie périodiquement le stockage
     * @param {number} interval - Intervalle en millisecondes entre chaque nettoyage
     */
    startPeriodicCleanup(interval = 24 * 60 * 60 * 1000) { // Par défaut: une fois par jour
        // Arrêter tout nettoyage périodique existant
        this.stopPeriodicCleanup();
        
        // Configurer un nouveau nettoyage périodique
        this._cleanupInterval = setInterval(async () => {
            const quotaInfo = await this.checkStorageQuota();
            
            // Si plus de 80% du stockage est utilisé, nettoyer
            if (quotaInfo.percentUsed > 80) {
                console.log(`Storage usage at ${quotaInfo.percentUsed}%, performing cleanup...`);
                
                // Libérer 20% du quota total
                const targetSpace = quotaInfo.quota * 0.2;
                const cleaned = await this.cleanupStorage(targetSpace);
                
                if (cleaned) {
                    console.log('Storage cleanup successful');
                } else {
                    console.warn('Storage cleanup failed or insufficient');
                }
            }
        }, interval);
    }

    /**
     * Arrête le nettoyage périodique
     */
    stopPeriodicCleanup() {
        if (this._cleanupInterval) {
            clearInterval(this._cleanupInterval);
            this._cleanupInterval = null;
        }
    }
}

export default new StorageQuotaService();