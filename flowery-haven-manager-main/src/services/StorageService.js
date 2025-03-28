/**
 * Service abstrait pour gérer différents types de stockage côté client
 * (localStorage, sessionStorage, IndexedDB)
 */
class StorageService {
    /**
     * Vérifie si localStorage est disponible
     * @returns {boolean}
     */
    static isLocalStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Vérifie si sessionStorage est disponible
     * @returns {boolean}
     */
    static isSessionStorageAvailable() {
        try {
            const test = '__storage_test__';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Vérifie si IndexedDB est disponible
     * @returns {boolean}
     */
    static isIndexedDBAvailable() {
        return !!window.indexedDB;
    }

    /**
     * Calcule la taille approximative d'une chaîne en octets
     * @param {string} str - Chaîne à mesurer
     * @returns {number} - Taille en octets
     */
    static getApproximateSize(str) {
        // Une approximation basée sur l'encodage UTF-16 (2 octets par caractère)
        return str ? str.length * 2 : 0;
    }

    /**
     * Vérifie si l'espace est suffisant avant d'enregistrer des données
     * @param {string} key - Clé de stockage
     * @param {string} serializedData - Données sérialisées
     * @returns {boolean} - True si l'espace est suffisant
     */
    static checkStorageSpace(key, serializedData) {
        try {
            // Calculer la taille des données à stocker
            const dataSize = this.getApproximateSize(key) + this.getApproximateSize(serializedData);
            
            // Si la taille est supérieure à 1MB, c'est probablement trop grand pour localStorage
            if (dataSize > 1024 * 1024) {
                console.warn(`Tentative de stocker ${dataSize} octets dans localStorage, ce qui est probablement trop grand.`);
                return false;
            }

            // Test pour voir si on peut stocker
            localStorage.setItem(key, serializedData);
            return true;
        } catch (e) {
            // Si une exception est levée, c'est probablement une erreur de quota
            console.warn('Espace de stockage insuffisant:', e);
            return false;
        }
    }

    /**
     * Libère de l'espace dans localStorage en supprimant les éléments les moins importants
     * @param {number} bytesNeeded - Espace approximatif nécessaire en octets
     * @returns {boolean} - Vrai si l'espace a été libéré
     */
    static freeUpStorage(bytesNeeded) {
        try {
            // Liste des clés qui peuvent être supprimées si nécessaire, par ordre de priorité
            const lowPriorityKeys = [
                'recentProducts',  // Les produits récemment consultés sont moins critiques
                'cache_', // Les données de cache sont régénérables
            ];

            let freedSpace = 0;

            // Parcourir toutes les clés de localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                
                // Vérifier si c'est une clé de basse priorité
                const isLowPriority = lowPriorityKeys.some(prefix => key.startsWith(prefix));
                
                if (isLowPriority) {
                    const value = localStorage.getItem(key);
                    const size = this.getApproximateSize(key) + this.getApproximateSize(value);
                    
                    // Supprimer l'élément
                    localStorage.removeItem(key);
                    freedSpace += size;
                    
                    console.log(`Libéré ${size} octets en supprimant ${key}`);
                    
                    // Si on a libéré suffisamment d'espace, on s'arrête
                    if (freedSpace >= bytesNeeded) {
                        return true;
                    }
                }
            }
            
            return freedSpace > 0;
        } catch (e) {
            console.error('Erreur lors de la libération d\'espace:', e);
            return false;
        }
    }

    /**
     * Tronque les données si elles sont trop volumineuses
     * @param {Array|Object} data - Données à tronquer
     * @returns {Array|Object} - Données tronquées
     */
    static truncateIfNeeded(data) {
        // Si c'est un tableau, limiter sa taille
        if (Array.isArray(data)) {
            console.log('La liste des produits récents est trop grande, troncature...');
            // Garder seulement les 3 premiers éléments
            return data.slice(0, 3);
        }
        
        // Si c'est un objet, on pourrait supprimer certaines propriétés, mais ici on le retourne tel quel
        return data;
    }

    /**
     * Sauvegarde des données dans localStorage avec gestion de l'espace
     * @param {string} key - Clé de stockage
     * @param {*} data - Données à stocker (seront sérialisées en JSON)
     */
    static setLocalStorageItem(key, data) {
        if (!this.isLocalStorageAvailable()) {
            console.error('localStorage n\'est pas disponible');
            return;
        }

        try {
            // Tronquer les données si nécessaire pour certaines clés
            if (key === 'recentProducts') {
                data = this.truncateIfNeeded(data);
            }
            
            const serializedData = JSON.stringify(data);
            
            // Essayer de stocker les données
            if (!this.checkStorageSpace(key, serializedData)) {
                // Si ça échoue, tenter de libérer de l'espace
                const bytesNeeded = this.getApproximateSize(key) + this.getApproximateSize(serializedData);
                const spaceFreed = this.freeUpStorage(bytesNeeded);
                
                // Nouvelle tentative après avoir libéré de l'espace
                if (spaceFreed) {
                    try {
                        localStorage.setItem(key, serializedData);
                        return;
                    } catch (error) {
                        // Si ça échoue encore, tronquer davantage les données
                        if (Array.isArray(data) && data.length > 1) {
                            this.setLocalStorageItem(key, data.slice(0, Math.max(1, Math.floor(data.length / 2))));
                            return;
                        }
                    }
                }
                
                // En dernier recours, journaliser l'erreur
                console.error('Erreur lors de la sauvegarde dans localStorage:', new Error('QuotaExceededError: Impossible de stocker les données, quota dépassé'));
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde dans localStorage:', error);
        }
    }

    /**
     * Récupère des données depuis localStorage
     * @param {string} key - Clé de stockage
     * @param {*} defaultValue - Valeur par défaut si la clé n'existe pas
     * @returns {*} Données désérialisées ou valeur par défaut
     */
    static getLocalStorageItem(key, defaultValue = null) {
        if (!this.isLocalStorageAvailable()) {
            console.error('localStorage n\'est pas disponible');
            return defaultValue;
        }

        try {
            const serializedData = localStorage.getItem(key);
            if (serializedData === null) {
                return defaultValue;
            }

            return JSON.parse(serializedData);
        } catch (error) {
            console.error('Erreur lors de la récupération depuis localStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Supprime des données de localStorage
     * @param {string} key - Clé à supprimer
     */
    static removeLocalStorageItem(key) {
        if (!this.isLocalStorageAvailable()) {
            console.error('localStorage n\'est pas disponible');
            return;
        }

        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Erreur lors de la suppression de localStorage:', error);
        }
    }

    /**
     * Sauvegarde des données dans sessionStorage
     * @param {string} key - Clé de stockage
     * @param {*} data - Données à stocker (seront sérialisées en JSON)
     */
    static setSessionStorageItem(key, data) {
        if (!this.isSessionStorageAvailable()) {
            console.error('sessionStorage n\'est pas disponible');
            return;
        }

        try {
            const serializedData = JSON.stringify(data);
            sessionStorage.setItem(key, serializedData);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde dans sessionStorage:', error);
        }
    }

    /**
     * Récupère des données depuis sessionStorage
     * @param {string} key - Clé de stockage
     * @param {*} defaultValue - Valeur par défaut si la clé n'existe pas
     * @returns {*} Données désérialisées ou valeur par défaut
     */
    static getSessionStorageItem(key, defaultValue = null) {
        if (!this.isSessionStorageAvailable()) {
            console.error('sessionStorage n\'est pas disponible');
            return defaultValue;
        }

        try {
            const serializedData = sessionStorage.getItem(key);
            if (serializedData === null) {
                return defaultValue;
            }

            return JSON.parse(serializedData);
        } catch (error) {
            console.error('Erreur lors de la récupération depuis sessionStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Supprime des données de sessionStorage
     * @param {string} key - Clé à supprimer
     */
    static removeSessionStorageItem(key) {
        if (!this.isSessionStorageAvailable()) {
            console.error('sessionStorage n\'est pas disponible');
            return;
        }

        try {
            sessionStorage.removeItem(key);
        } catch (error) {
            console.error('Erreur lors de la suppression de sessionStorage:', error);
        }
    }

    /* ----- IndexedDB Methods ----- */

    /**
     * Ouvre une base de données IndexedDB
     * @param {string} dbName - Nom de la base de données
     * @param {number} version - Version de la base de données
     * @param {Function} upgradeCallback - Fonction appelée lors de la mise à jour de la structure
     * @returns {Promise<IDBDatabase>} Base de données ouverte
     */
    static openIndexedDB(dbName, version, upgradeCallback) {
        return new Promise((resolve, reject) => {
            if (!this.isIndexedDBAvailable()) {
                reject(new Error('IndexedDB n\'est pas disponible'));
                return;
            }

            const request = indexedDB.open(dbName, version);

            request.onerror = (event) => {
                reject(new Error(`Erreur lors de l'ouverture de la base de données: ${event.target.error}`));
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                resolve(db);
            };

            if (upgradeCallback && typeof upgradeCallback === 'function') {
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    upgradeCallback(db, event);
                };
            }
        });
    }

    /**
     * Ajoute des données dans un object store d'IndexedDB
     * @param {IDBDatabase} db - Base de données IndexedDB
     * @param {string} storeName - Nom de l'object store
     * @param {Object} data - Données à stocker
     * @returns {Promise<any>} Résultat de l'opération (généralement l'ID généré)
     */
    static addToIndexedDB(db, storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                reject(new Error(`Erreur lors de l'ajout de données: ${event.target.error}`));
            };
        });
    }

    /**
     * Met à jour des données dans un object store d'IndexedDB
     * @param {IDBDatabase} db - Base de données IndexedDB
     * @param {string} storeName - Nom de l'object store
     * @param {Object} data - Données à mettre à jour
     * @returns {Promise<any>} Résultat de l'opération
     */
    static updateInIndexedDB(db, storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                reject(new Error(`Erreur lors de la mise à jour des données: ${event.target.error}`));
            };
        });
    }

    /**
     * Récupère des données depuis un object store d'IndexedDB
     * @param {IDBDatabase} db - Base de données IndexedDB
     * @param {string} storeName - Nom de l'object store
     * @param {string|number} key - Clé de l'enregistrement à récupérer
     * @returns {Promise<any>} Données récupérées
     */
    static getFromIndexedDB(db, storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                reject(new Error(`Erreur lors de la récupération des données: ${event.target.error}`));
            };
        });
    }

    /**
     * Récupère toutes les données d'un object store d'IndexedDB
     * @param {IDBDatabase} db - Base de données IndexedDB
     * @param {string} storeName - Nom de l'object store
     * @returns {Promise<Array>} Tableau de toutes les données
     */
    static getAllFromIndexedDB(db, storeName) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                reject(new Error(`Erreur lors de la récupération des données: ${event.target.error}`));
            };
        });
    }

    /**
     * Supprime des données d'un object store d'IndexedDB
     * @param {IDBDatabase} db - Base de données IndexedDB
     * @param {string} storeName - Nom de l'object store
     * @param {string|number} key - Clé de l'enregistrement à supprimer
     * @returns {Promise<void>}
     */
    static deleteFromIndexedDB(db, storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                reject(new Error(`Erreur lors de la suppression des données: ${event.target.error}`));
            };
        });
    }

    /**
     * Efface toutes les données d'un object store d'IndexedDB
     * @param {IDBDatabase} db - Base de données IndexedDB
     * @param {string} storeName - Nom de l'object store
     * @returns {Promise<void>}
     */
    static clearObjectStore(db, storeName) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                reject(new Error(`Erreur lors de l'effacement de l'object store: ${event.target.error}`));
            };
        });
    }
}

export default StorageService;