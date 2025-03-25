import DbService from './db/DbService';
import { STORES, STORAGE_KEYS } from './db/DbConfig';
import StorageService from './StorageService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service pour gérer les produits et catégories
 */
class ProductService {
    /**
     * Récupère tous les produits
     * @returns {Promise<Array>} Liste des produits
     */
    static async getAllProducts() {
        try {
            return await DbService.getAll(STORES.PRODUCTS);
        } catch (error) {
            console.error('Erreur lors de la récupération des produits:', error);
            throw error;
        }
    }

    /**
     * Récupère un produit par son ID
     * @param {string} productId - ID du produit
     * @returns {Promise<Object|null>} Produit ou null si non trouvé
     */
    static async getProductById(productId) {
        try {
            const product = await DbService.getByKey(STORES.PRODUCTS, productId);

            if (product) {
                // Ajouter le produit aux récemment consultés
                this.addToRecentlyViewed(product);
            }

            return product;
        } catch (error) {
            console.error(`Erreur lors de la récupération du produit ${productId}:`, error);
            throw error;
        }
    }

    /**
     * Ajoute un produit aux produits récemment consultés
     * @param {Object} product - Produit à ajouter
     * @private
     */
    static addToRecentlyViewed(product) {
        const recentProducts = StorageService.getLocalStorageItem(STORAGE_KEYS.RECENT_PRODUCTS, []);

        // Supprimer le produit s'il existe déjà
        const filteredProducts = recentProducts.filter(p => p.id !== product.id);

        // Ajouter le produit au début de la liste
        filteredProducts.unshift({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images && product.images.length > 0 ? product.images[0] : null
        });

        // Limiter à 5 produits récents
        const limitedProducts = filteredProducts.slice(0, 5);

        StorageService.setLocalStorageItem(STORAGE_KEYS.RECENT_PRODUCTS, limitedProducts);
    }

    /**
     * Récupère les produits récemment consultés
     * @returns {Array} Liste des produits récemment consultés
     */
    static getRecentlyViewedProducts() {
        return StorageService.getLocalStorageItem(STORAGE_KEYS.RECENT_PRODUCTS, []);
    }

    /**
     * Récupère les produits d'une catégorie
     * @param {string} categoryId - ID de la catégorie
     * @returns {Promise<Array>} Liste des produits de la catégorie
     */
    static async getProductsByCategory(categoryId) {
        try {
            return await DbService.getByIndex(STORES.PRODUCTS, 'category', categoryId);
        } catch (error) {
            console.error(`Erreur lors de la récupération des produits de la catégorie ${categoryId}:`, error);
            throw error;
        }
    }

    /**
     * Récupère les produits populaires (mis en avant)
     * @param {number} limit - Nombre maximum de produits à retourner
     * @returns {Promise<Array>} Liste des produits populaires
     */
    static async getPopularProducts(limit = 8) {
        try {
            const popularProducts = await DbService.getByIndex(STORES.PRODUCTS, 'popular', true);
            return popularProducts.slice(0, limit);
        } catch (error) {
            console.error('Erreur lors de la récupération des produits populaires:', error);
            throw error;
        }
    }

    /**
     * Récupère les produits en vedette
     * @param {number} limit - Nombre maximum de produits à retourner
     * @returns {Promise<Array>} Liste des produits en vedette
     */
    static async getFeaturedProducts(limit = 4) {
        try {
            const featuredProducts = await DbService.getByIndex(STORES.PRODUCTS, 'featured', true);
            return featuredProducts.slice(0, limit);
        } catch (error) {
            console.error('Erreur lors de la récupération des produits en vedette:', error);
            throw error;
        }
    }

    /**
     * Recherche des produits
     * @param {string} query - Texte de recherche
     * @returns {Promise<Array>} Liste des produits correspondants
     */
    static async searchProducts(query) {
        try {
            if (!query || query.trim() === '') {
                return [];
            }

            const normalizedQuery = query.toLowerCase().trim();

            const allProducts = await this.getAllProducts();

            // Filtrer les produits qui correspondent à la recherche
            return allProducts.filter(product => {
                return (
                    product.name.toLowerCase().includes(normalizedQuery) ||
                    product.description.toLowerCase().includes(normalizedQuery) ||
                    (product.tags && product.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)))
                );
            });
        } catch (error) {
            console.error(`Erreur lors de la recherche de produits pour "${query}":`, error);
            throw error;
        }
    }

    /**
     * Ajoute un nouveau produit (admin seulement)
     * @param {Object} productData - Données du produit
     * @returns {Promise<Object>} Produit créé
     */
    static async addProduct(productData) {
        try {
            // Générer un ID unique pour le produit
            const newProduct = {
                id: uuidv4(),
                ...productData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await DbService.add(STORES.PRODUCTS, newProduct);
            return newProduct;
        } catch (error) {
            console.error('Erreur lors de l\'ajout du produit:', error);
            throw error;
        }
    }

    /**
     * Met à jour un produit (admin seulement)
     * @param {string} productId - ID du produit
     * @param {Object} productData - Nouvelles données
     * @returns {Promise<Object>} Produit mis à jour
     */
    static async updateProduct(productId, productData) {
        try {
            const existingProduct = await DbService.getByKey(STORES.PRODUCTS, productId);

            if (!existingProduct) {
                throw new Error('Produit non trouvé');
            }

            const updatedProduct = {
                ...existingProduct,
                ...productData,
                updatedAt: new Date().toISOString()
            };

            await DbService.update(STORES.PRODUCTS, updatedProduct);
            return updatedProduct;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du produit ${productId}:`, error);
            throw error;
        }
    }

    /**
     * Supprime un produit (admin seulement)
     * @param {string} productId - ID du produit
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async deleteProduct(productId) {
        try {
            await DbService.delete(STORES.PRODUCTS, productId);
            return true;
        } catch (error) {
            console.error(`Erreur lors de la suppression du produit ${productId}:`, error);
            throw error;
        }
    }

    /**
     * Met à jour le stock d'un produit
     * @param {string} productId - ID du produit
     * @param {number} quantity - Quantité à ajouter (positif) ou retirer (négatif)
     * @returns {Promise<Object>} Produit mis à jour
     */
    static async updateProductStock(productId, quantity) {
        try {
            const product = await DbService.getByKey(STORES.PRODUCTS, productId);

            if (!product) {
                throw new Error('Produit non trouvé');
            }

            const currentStock = product.stock || 0;
            const newStock = currentStock + quantity;

            if (newStock < 0) {
                throw new Error('Stock insuffisant');
            }

            product.stock = newStock;
            product.updatedAt = new Date().toISOString();

            await DbService.update(STORES.PRODUCTS, product);
            return product;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du stock du produit ${productId}:`, error);
            throw error;
        }
    }

    /* ----- Gestion des catégories ----- */

    /**
     * Récupère toutes les catégories
     * @returns {Promise<Array>} Liste des catégories
     */
    static async getAllCategories() {
        try {
            return await DbService.getAll(STORES.CATEGORIES);
        } catch (error) {
            console.error('Erreur lors de la récupération des catégories:', error);
            throw error;
        }
    }

    /**
     * Récupère une catégorie par son ID
     * @param {string} categoryId - ID de la catégorie
     * @returns {Promise<Object|null>} Catégorie ou null si non trouvée
     */
    static async getCategoryById(categoryId) {
        try {
            return await DbService.getByKey(STORES.CATEGORIES, categoryId);
        } catch (error) {
            console.error(`Erreur lors de la récupération de la catégorie ${categoryId}:`, error);
            throw error;
        }
    }

    /**
     * Ajoute une nouvelle catégorie
     * @param {Object} categoryData - Données de la catégorie
     * @returns {Promise<Object>} Catégorie créée
     */
    static async addCategory(categoryData) {
        try {
            // Vérifier si le nom est unique
            const categories = await DbService.getByIndex(STORES.CATEGORIES, 'name', categoryData.name);

            if (categories.length > 0) {
                throw new Error('Une catégorie avec ce nom existe déjà');
            }

            const newCategory = {
                id: uuidv4(),
                ...categoryData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await DbService.add(STORES.CATEGORIES, newCategory);
            return newCategory;
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la catégorie:', error);
            throw error;
        }
    }

    /**
     * Met à jour une catégorie
     * @param {string} categoryId - ID de la catégorie
     * @param {Object} categoryData - Nouvelles données
     * @returns {Promise<Object>} Catégorie mise à jour
     */
    static async updateCategory(categoryId, categoryData) {
        try {
            const existingCategory = await DbService.getByKey(STORES.CATEGORIES, categoryId);

            if (!existingCategory) {
                throw new Error('Catégorie non trouvée');
            }

            // Vérifier l'unicité du nom si modifié
            if (categoryData.name && categoryData.name !== existingCategory.name) {
                const categories = await DbService.getByIndex(STORES.CATEGORIES, 'name', categoryData.name);

                if (categories.length > 0) {
                    throw new Error('Une catégorie avec ce nom existe déjà');
                }
            }

            const updatedCategory = {
                ...existingCategory,
                ...categoryData,
                updatedAt: new Date().toISOString()
            };

            await DbService.update(STORES.CATEGORIES, updatedCategory);
            return updatedCategory;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de la catégorie ${categoryId}:`, error);
            throw error;
        }
    }

    /**
     * Supprime une catégorie
     * @param {string} categoryId - ID de la catégorie
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async deleteCategory(categoryId) {
        try {
            // Vérifier si des produits utilisent cette catégorie
            const products = await DbService.getByIndex(STORES.PRODUCTS, 'category', categoryId);

            if (products.length > 0) {
                throw new Error('Impossible de supprimer une catégorie utilisée par des produits');
            }

            await DbService.delete(STORES.CATEGORIES, categoryId);
            return true;
        } catch (error) {
            console.error(`Erreur lors de la suppression de la catégorie ${categoryId}:`, error);
            throw error;
        }
    }

    /**
     * Initialise les données produits et catégories par défaut (pour démo)
     * @returns {Promise<void>}
     */
    static async initDefaultProductsAndCategories() {
        try {
            // Vérifier si les catégories existent déjà
            const categoriesCount = await DbService.count(STORES.CATEGORIES);

            if (categoriesCount === 0) {
                // Ajouter les catégories par défaut
                const defaultCategories = [
                    {
                        id: 'fresh-flowers',
                        name: 'Fleurs Fraîches',
                        description: 'Des fleurs fraîchement coupées pour illuminer votre intérieur.',
                        image: 'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=800'
                    },
                    {
                        id: 'bouquets',
                        name: 'Bouquets',
                        description: 'Compositions florales magnifiquement arrangées pour toutes les occasions.',
                        image: 'https://images.unsplash.com/photo-1537530360953-3b8b369e01fe?w=800'
                    },
                    {
                        id: 'potted-plants',
                        name: 'Plantes en Pot',
                        description: 'Des plantes en pot pour apporter de la verdure à votre espace de vie.',
                        image: 'https://images.unsplash.com/photo-1463320898484-cdee8141c787?w=800'
                    },
                    {
                        id: 'floral-decor',
                        name: 'Décoration Florale',
                        description: 'Éléments décoratifs floraux pour embellir votre maison ou événement.',
                        image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800'
                    }
                ];

                for (const category of defaultCategories) {
                    const newCategory = {
                        ...category,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };

                    await DbService.add(STORES.CATEGORIES, newCategory);
                }

                console.log('Catégories par défaut créées');
            }

            // Vérifier si des produits existent déjà
            const productsCount = await DbService.count(STORES.PRODUCTS);

            if (productsCount === 0) {
                // Ajouter des produits par défaut
                const defaultProducts = [
                    {
                        id: 'elegance-rose-bouquet',
                        name: 'Bouquet Élégance Rose',
                        description: 'Un bouquet raffiné de roses roses et blanches, parfait pour exprimer votre amour ou votre admiration.',
                        price: 59.99,
                        stock: 15,
                        images: [
                            'https://images.unsplash.com/photo-1537530360953-3b8b369e01fe?w=800',
                            'https://images.unsplash.com/photo-1594654281947-7114da78db59?w=800'
                        ],
                        category: 'bouquets',
                        popular: true,
                        featured: true,
                        sku: 'BQT-ROSE-001'
                    },
                    {
                        id: 'spring-harmony',
                        name: 'Harmonie Printanière',
                        description: 'Une explosion de couleurs printanières avec un mélange de tulipes, jonquilles et renoncules.',
                        price: 49.99,
                        stock: 8,
                        images: [
                            'https://images.unsplash.com/photo-1613539246066-78db6f03a16f?w=800',
                            'https://images.unsplash.com/photo-1546842931-886c185b4c8c?w=800'
                        ],
                        category: 'bouquets',
                        popular: true,
                        featured: false,
                        sku: 'BQT-SPRING-002'
                    },
                    {
                        id: 'zen-orchid',
                        name: 'Orchidée Zen',
                        description: 'Une magnifique orchidée blanche en pot, symbole d\'élégance et de pureté.',
                        price: 69.99,
                        stock: 5,
                        images: [
                            'https://images.unsplash.com/photo-1524598171347-abf62dfd6694?w=800',
                            'https://images.unsplash.com/photo-1594663358079-4a39ff4f4ef4?w=800'
                        ],
                        category: 'potted-plants',
                        popular: true,
                        featured: true,
                        sku: 'PLT-ORCH-001'
                    },
                    {
                        id: 'rustic-wildflowers',
                        name: 'Fleurs Sauvages Rustiques',
                        description: 'Un arrangement bohème de fleurs sauvages dans un vase en terre cuite.',
                        price: 44.99,
                        stock: 12,
                        images: [
                            'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=800',
                            'https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=800'
                        ],
                        category: 'fresh-flowers',
                        popular: false,
                        featured: false,
                        sku: 'FLW-WILD-003'
                    },
                    {
                        id: 'succulent-garden',
                        name: 'Jardin de Succulentes',
                        description: 'Un ensemble harmonieux de succulentes dans un pot design, facile d\'entretien et durable.',
                        price: 39.99,
                        stock: 20,
                        images: [
                            'https://images.unsplash.com/photo-1446071103084-c257b5f70672?w=800',
                            'https://images.unsplash.com/photo-1520302630591-fd2dfd937acd?w=800'
                        ],
                        category: 'potted-plants',
                        popular: false,
                        featured: false,
                        sku: 'PLT-SUCC-002'
                    },
                    {
                        id: 'vintage-roses',
                        name: 'Roses Vintage',
                        description: 'Des roses aux teintes pastel dans un vase vintage, évoquant une élégance intemporelle.',
                        price: 54.99,
                        stock: 0,
                        images: [
                            'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=800',
                            'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800'
                        ],
                        category: 'fresh-flowers',
                        popular: true,
                        featured: false,
                        sku: 'FLW-ROSE-002'
                    }
                ];

                for (const product of defaultProducts) {
                    const newProduct = {
                        ...product,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };

                    await DbService.add(STORES.PRODUCTS, newProduct);
                }

                console.log('Produits par défaut créés');
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des produits et catégories:', error);
        }
    }
}

export default ProductService;