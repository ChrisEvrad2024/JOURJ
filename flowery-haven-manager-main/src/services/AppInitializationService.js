import DbService from './db/DbService';
import AuthService from './AuthService';
import ProductService from './ProductService';
import CartService from './CartService';
import WishlistService from './WishlistService';
import AddressService from './AddressService';
import OrderService from './OrderService';
import QuoteService from './QuoteService';
import BlogService from './BlogService';

/**
 * Service pour initialiser l'application avec des données de démonstration
 */
class AppInitializationService {
    /**
     * Initialise la base de données
     * @returns {Promise<void>}
     */
    static async initDb() {
        try {
            console.log('Initialisation de la base de données...');
            await DbService.initDb();
            console.log('Base de données initialisée');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de la base de données:', error);
            throw error;
        }
    }

    /**
     * Initialise les données essentielles (produits et catégories)
     * @returns {Promise<void>}
     */
    static async initEssentialData() {
        try {
            // Vérifier si les produits sont déjà initialisés
            const productsCount = await DbService.count('products');
            if (productsCount === 0) {
                // Initialiser seulement les produits et catégories (essentiels pour la navigation)
                await ProductService.initDefaultProductsAndCategories();
                console.log('Produits et catégories initialisés');
            } else {
                console.log('Produits déjà initialisés');
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des données essentielles:', error);
            throw error;
        }
    }

    /**
     * Initialise les données utilisateur (authentification)
     * @returns {Promise<void>}
     */
    static async initUserData() {
        try {
            // Vérifier si les utilisateurs sont déjà initialisés
            const usersCount = await DbService.count('users');
            if (usersCount === 0) {
                // Initialiser les utilisateurs par défaut
                await AuthService.initDefaultUsers();
                console.log('Utilisateurs initialisés');
            } else {
                console.log('Utilisateurs déjà initialisés');
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des données utilisateur:', error);
            throw error;
        }
    }

    /**
     * Initialise les données non essentielles (blog, commandes de démo)
     * @returns {Promise<void>}
     */
    static async initNonEssentialData() {
        try {
            console.log('Chargement des données non essentielles...');
            
            // Initialiser les articles de blog en arrière-plan
            const blogCount = await DbService.count('blogPosts');
            if (blogCount === 0) {
                await BlogService.initDefaultBlogPosts();
                console.log('Articles de blog initialisés');
            }
            
            // Générer quelques commandes de démo si nécessaire
            const ordersCount = await DbService.count('orders');
            if (ordersCount === 0) {
                await OrderService.generateDemoOrders(3);
                console.log('Commandes de démo générées');
            }
            
            console.log('Données non essentielles chargées avec succès');
        } catch (error) {
            console.error('Erreur lors du chargement des données non essentielles:', error);
            // Ne pas relancer l'erreur pour ne pas bloquer l'application
        }
    }

    /**
     * Initialise l'application avec toutes les données de démonstration
     * Cette méthode est conservée pour la compatibilité avec le code existant
     * @returns {Promise<void>}
     */
    static async initializeApp() {
        try {
            // Vérifier si l'application a déjà été initialisée
            const isInitialized = await this.isAppInitialized();
            if (isInitialized) {
                console.log('Application déjà initialisée');
                return true;
            }
            
            await this.initDb();
            await this.initEssentialData();
            await this.initUserData();
            await this.initNonEssentialData();
            
            console.log('Initialisation de l\'application terminée avec succès');
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de l\'application:', error);
            throw error;
        }
    }

    /**
     * Vérifie si l'application a déjà été initialisée
     * @returns {Promise<boolean>} Vrai si l'application est déjà initialisée
     */
    static async isAppInitialized() {
        try {
            await DbService.initDb();
            // Vérifier si des utilisateurs existent
            const usersCount = await DbService.count('users');
            return usersCount > 0;
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'initialisation de l\'application:', error);
            return false;
        }
    }

    /**
     * Réinitialise l'application en effaçant toutes les données
     * ATTENTION: Cette méthode efface toutes les données !
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async resetApp() {
        try {
            // Confirmer la réinitialisation
            if (!confirm('ATTENTION: Cette action va effacer TOUTES les données de l\'application. Cette action est irréversible. Voulez-vous continuer ?')) {
                return false;
            }

            const db = await DbService.initDb();

            // Effacer tous les stores
            const storeNames = [...db.objectStoreNames];

            for (const storeName of storeNames) {
                await DbService.clear(storeName);
            }

            // Effacer les données du localStorage et sessionStorage
            localStorage.clear();
            sessionStorage.clear();

            // Réinitialiser l'application
            await this.initializeApp();

            return true;
        } catch (error) {
            console.error('Erreur lors de la réinitialisation de l\'application:', error);
            throw error;
        }
    }
}

export default AppInitializationService;