import EnhancedProductService from './EnhancedProductService';

/**
 * Adaptateur pour maintenir la compatibilité avec le service de produit original
 * tout en utilisant les fonctionnalités améliorées
 */
class ProductServiceAdapter {
    /**
     * Récupère tous les produits
     * @returns {Promise<Array>} Liste des produits
     */
    static async getAllProducts() {
        return EnhancedProductService.getAllProducts();
    }

    /**
     * Récupère un produit par son ID
     * @param {string} productId - ID du produit
     * @returns {Promise<Object|null>} Produit ou null si non trouvé
     */
    static async getProductById(productId) {
        return EnhancedProductService.getProductById(productId);
    }

    /**
     * Récupère les produits d'une catégorie
     * @param {string} categoryId - ID de la catégorie
     * @returns {Promise<Array>} Liste des produits de la catégorie
     */
    static async getProductsByCategory(categoryId) {
        return EnhancedProductService.getProductsByCategory(categoryId);
    }

    /**
     * Récupère les produits populaires
     * @param {number} limit - Nombre maximum de produits à retourner
     * @returns {Promise<Array>} Liste des produits populaires
     */
    static async getPopularProducts(limit = 8) {
        return EnhancedProductService.getPopularProducts(limit);
    }

    /**
     * Récupère les produits mis en avant
     * @param {number} limit - Nombre maximum de produits à retourner
     * @returns {Promise<Array>} Liste des produits en vedette
     */
    static async getFeaturedProducts(limit = 4) {
        return EnhancedProductService.getFeaturedProducts(limit);
    }

    /**
     * Recherche des produits
     * @param {string} query - Texte de recherche
     * @returns {Promise<Array>} Liste des produits correspondants
     */
    static async searchProducts(query) {
        return EnhancedProductService.searchProducts(query);
    }

    /**
     * Ajoute un nouveau produit
     * @param {Object} productData - Données du produit
     * @returns {Promise<Object>} Produit créé
     */
    static async addProduct(productData) {
        return EnhancedProductService.addProduct(productData);
    }

    /**
     * Met à jour un produit existant
     * @param {string} productId - ID du produit
     * @param {Object} productData - Nouvelles données
     * @returns {Promise<Object>} Produit mis à jour
     */
    static async updateProduct(productId, productData) {
        return EnhancedProductService.updateProduct(productId, productData);
    }

    /**
     * Supprime un produit
     * @param {string} productId - ID du produit
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async deleteProduct(productId) {
        return EnhancedProductService.deleteProduct(productId);
    }

    /**
     * Met à jour le stock d'un produit
     * @param {string} productId - ID du produit
     * @param {number} quantity - Quantité à ajouter (positif) ou retirer (négatif)
     * @returns {Promise<Object>} Produit mis à jour
     */
    static async updateProductStock(productId, quantity) {
        return EnhancedProductService.updateProductStock(productId, quantity);
    }

    /**
     * Récupère les produits à faible stock
     * @param {number} threshold - Seuil de stock bas
     * @returns {Promise<Array>} Liste des produits à faible stock
     */
    static async getLowStockProducts(threshold = 5) {
        return EnhancedProductService.getLowStockProducts(threshold);
    }

    /**
     * Récupère les produits récemment consultés
     * @returns {Array} Liste des produits récemment consultés
     */
    static getRecentlyViewedProducts() {
        return EnhancedProductService.getRecentlyViewedProducts();
    }

    /**
     * Récupère toutes les catégories
     * @returns {Promise<Array>} Liste des catégories
     */
    static async getAllCategories() {
        return EnhancedProductService.getAllCategories();
    }

    /**
     * Récupère une catégorie par son ID
     * @param {string} categoryId - ID de la catégorie
     * @returns {Promise<Object|null>} Catégorie ou null si non trouvée
     */
    static async getCategoryById(categoryId) {
        return EnhancedProductService.getCategoryById(categoryId);
    }

    /**
     * Ajoute une nouvelle catégorie
     * @param {Object} categoryData - Données de la catégorie
     * @returns {Promise<Object>} Catégorie créée
     */
    static async addCategory(categoryData) {
        return EnhancedProductService.addCategory(categoryData);
    }

    /**
     * Met à jour une catégorie
     * @param {string} categoryId - ID de la catégorie
     * @param {Object} categoryData - Nouvelles données
     * @returns {Promise<Object>} Catégorie mise à jour
     */
    static async updateCategory(categoryId, categoryData) {
        return EnhancedProductService.updateCategory(categoryId, categoryData);
    }

    /**
     * Supprime une catégorie
     * @param {string} categoryId - ID de la catégorie
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async deleteCategory(categoryId) {
        return EnhancedProductService.deleteCategory(categoryId);
    }

    /**
     * Compte le nombre de produits dans chaque catégorie
     * @returns {Promise<Object>} Mapping catégorie -> nombre de produits
     */
    static async countProductsByCategory() {
        return EnhancedProductService.countProductsByCategory();
    }
}

// Exporter sous le même nom que celui utilisé dans le code original
export const ProductService = ProductServiceAdapter;
export default ProductServiceAdapter;