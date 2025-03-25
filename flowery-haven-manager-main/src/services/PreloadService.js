// src/services/PreloadService.js
import ProductService from './ProductService';
import BlogService from './BlogService';
import CacheService from './CacheService';

class PreloadService {
    /**
     * Précharge les données essentielles pour l'application
     * @returns {Promise<void>}
     */
    async preloadEssentialData() {
        try {
            // Précharger en parallèle plusieurs types de données
            await Promise.all([
                this.preloadFeaturedProducts(),
                this.preloadCategories(),
                this.preloadFeaturedBlogPosts()
            ]);

            console.log('Essential data preloaded successfully');
        } catch (error) {
            console.error('Failed to preload essential data:', error);
        }
    }

    /**
     * Précharge les produits mis en avant
     * @returns {Promise<void>}
     */
    async preloadFeaturedProducts() {
        try {
            const cachedData = CacheService.get('featuredProducts');
            if (cachedData) return;

            const featuredProducts = await ProductService.getFeaturedProducts();
            CacheService.set('featuredProducts', featuredProducts, 5 * 60 * 1000); // 5 minutes
        } catch (error) {
            console.error('Failed to preload featured products:', error);
        }
    }

    /**
     * Précharge les catégories de produits
     * @returns {Promise<void>}
     */
    async preloadCategories() {
        try {
            const cachedData = CacheService.get('productCategories');
            if (cachedData) return;

            const categories = await ProductService.getAllCategories();
            CacheService.set('productCategories', categories, 30 * 60 * 1000); // 30 minutes
        } catch (error) {
            console.error('Failed to preload categories:', error);
        }
    }

    /**
     * Précharge les articles de blog mis en avant
     * @returns {Promise<void>}
     */
    async preloadFeaturedBlogPosts() {
        try {
            const cachedData = CacheService.get('featuredBlogPosts');
            if (cachedData) return;

            const featuredPosts = await BlogService.getFeaturedPosts();
            CacheService.set('featuredBlogPosts', featuredPosts, 10 * 60 * 1000); // 10 minutes
        } catch (error) {
            console.error('Failed to preload featured blog posts:', error);
        }
    }

    /**
     * Précharge les images pour une meilleure expérience utilisateur
     * @param {Array<string>} imageUrls - URLs des images à précharger
     * @returns {Promise<void>}
     */
    preloadImages(imageUrls) {
        if (!imageUrls || !imageUrls.length) return Promise.resolve();

        const promises = imageUrls.map(url => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = img.onerror = resolve;
                img.src = url;
            });
        });

        return Promise.all(promises);
    }

    /**
     * Précharge des données pour des catégories spécifiques
     * @param {Array<string>} categoryIds - IDs des catégories à précharger
     * @returns {Promise<void>}
     */
    async preloadCategoryProducts(categoryIds) {
        if (!categoryIds || !categoryIds.length) return;

        try {
            const promises = categoryIds.map(async (categoryId) => {
                const cacheKey = `products_category_${categoryId}`;
                const cachedData = CacheService.get(cacheKey);
                if (cachedData) return;

                const products = await ProductService.getProductsByCategory(categoryId);
                CacheService.set(cacheKey, products, 10 * 60 * 1000); // 10 minutes
            });

            await Promise.all(promises);
        } catch (error) {
            console.error('Failed to preload category products:', error);
        }
    }
}

export default new PreloadService();