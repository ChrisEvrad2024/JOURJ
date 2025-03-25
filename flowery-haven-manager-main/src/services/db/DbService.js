import StorageService from '../StorageService';
import { DB_NAME, DB_VERSION, initializeDatabase, STORES } from './DbConfig';

/**
 * Service pour gérer l'accès à la base de données IndexedDB
 */
class DbService {
  static db = null;
  static dbPromise = null;

  /**
   * Initialise la connexion à la base de données
   * @returns {Promise<IDBDatabase>} Base de données ouverte
   */
  static async initDb() {
    if (this.db) {
      return this.db;
    }

    // Si une initialisation est déjà en cours, on retourne la promesse existante
    if (this.dbPromise) {
      return this.dbPromise;
    }

    // Sinon on crée une nouvelle promesse d'initialisation
    this.dbPromise = StorageService.openIndexedDB(DB_NAME, DB_VERSION, initializeDatabase)
      .then(database => {
        this.db = database;
        console.log('Base de données initialisée avec succès');
        return database;
      })
      .catch(error => {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
        this.dbPromise = null;
        throw error;
      });

    return this.dbPromise;
  }

  /**
   * Ajoute un élément dans un store
   * @param {string} storeName - Nom du store
   * @param {Object} data - Données à ajouter
   * @returns {Promise<any>} Résultat de l'opération
   */
  static async add(storeName, data) {
    try {
      const db = await this.initDb();
      return await StorageService.addToIndexedDB(db, storeName, data);
    } catch (error) {
      console.error(`Erreur lors de l'ajout de données dans ${storeName}:`, error);
      throw error;
    }
  }

  /**
   * Met à jour un élément dans un store
   * @param {string} storeName - Nom du store
   * @param {Object} data - Données à mettre à jour
   * @returns {Promise<any>} Résultat de l'opération
   */
  static async update(storeName, data) {
    try {
      const db = await this.initDb();
      return await StorageService.updateInIndexedDB(db, storeName, data);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de données dans ${storeName}:`, error);
      throw error;
    }
  }

  /**
   * Récupère un élément par sa clé
   * @param {string} storeName - Nom du store
   * @param {string|number} key - Clé de l'élément
   * @returns {Promise<any>} Élément récupéré
   */
  static async getByKey(storeName, key) {
    try {
      const db = await this.initDb();
      return await StorageService.getFromIndexedDB(db, storeName, key);
    } catch (error) {
      console.error(`Erreur lors de la récupération de données depuis ${storeName}:`, error);
      throw error;
    }
  }

  /**
   * Récupère tous les éléments d'un store
   * @param {string} storeName - Nom du store
   * @returns {Promise<Array>} Tous les éléments du store
   */
  static async getAll(storeName) {
    try {
      const db = await this.initDb();
      return await StorageService.getAllFromIndexedDB(db, storeName);
    } catch (error) {
      console.error(`Erreur lors de la récupération des données depuis ${storeName}:`, error);
      throw error;
    }
  }

  /**
   * Supprime un élément par sa clé
   * @param {string} storeName - Nom du store
   * @param {string|number} key - Clé de l'élément à supprimer
   * @returns {Promise<void>}
   */
  static async delete(storeName, key) {
    try {
      const db = await this.initDb();
      return await StorageService.deleteFromIndexedDB(db, storeName, key);
    } catch (error) {
      console.error(`Erreur lors de la suppression de données dans ${storeName}:`, error);
      throw error;
    }
  }

  /**
   * Efface tous les éléments d'un store
   * @param {string} storeName - Nom du store à vider
   * @returns {Promise<void>}
   */
  static async clear(storeName) {
    try {
      const db = await this.initDb();
      return await StorageService.clearObjectStore(db, storeName);
    } catch (error) {
      console.error(`Erreur lors de l'effacement du store ${storeName}:`, error);
      throw error;
    }
  }

  /**
   * Récupère des éléments par une valeur d'index
   * @param {string} storeName - Nom du store
   * @param {string} indexName - Nom de l'index
   * @param {any} indexValue - Valeur de l'index
   * @returns {Promise<Array>} Éléments correspondant à la valeur d'index
   */
  static async getByIndex(storeName, indexName, indexValue) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.initDb();
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(indexValue);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = (event) => {
          reject(new Error(`Erreur lors de la récupération par index: ${event.target.error}`));
        };
      } catch (error) {
        console.error(`Erreur lors de la récupération par index dans ${storeName}:`, error);
        reject(error);
      }
    });
  }

  /**
   * Compte le nombre d'éléments dans un store
   * @param {string} storeName - Nom du store
   * @returns {Promise<number>} Nombre d'éléments
   */
  static async count(storeName) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.initDb();
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.count();

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = (event) => {
          reject(new Error(`Erreur lors du comptage: ${event.target.error}`));
        };
      } catch (error) {
        console.error(`Erreur lors du comptage dans ${storeName}:`, error);
        reject(error);
      }
    });
  }
}

export default DbService;