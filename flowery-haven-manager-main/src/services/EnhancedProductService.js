import DbService from './db/DbService';
import { STORES } from './db/DbConfig';
import StorageService from './StorageService';
import ImageUploadService from './ImageUploadService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service amélioré pour gérer les produits et catégories
 * avec prise en charge des images et validation avancée
 */
class EnhancedProductService {
    /**
     * Récupère tous les produits
     * @returns {Promise<Array>} Liste des produits
     */
    static async getAllProducts() {
        try {
            const products = await DbService.getAll(STORES.PRODUCTS);
            
            // Trier par date de création
            return products.sort((a, b) => {
                return new Date(b.updatedAt || b.createdAt).getTime() - 
                    new Date(a.updatedAt || a.createdAt).getTime();
            });
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
                
                // Vérifier si toutes les images existent encore
                if (product.images && product.images.length > 0) {
                    product.images = await this.validateProductImages(product.images);
                }
            }

            return product;
        } catch (error) {
            console.error(`Erreur lors de la récupération du produit ${productId}:`, error);
            throw error;
        }
    }

    /**
     * Valide les URLs d'images pour s'assurer qu'elles existent
     * @param {Array<string>} images - URLs des images à valider
     * @returns {Promise<Array<string>>} URLs valides
     * @private
     */
    static async validateProductImages(images) {
        if (!images || !Array.isArray(images) || images.length === 0) {
            return [];
        }

        // Validation des images
        const validImages = [];
        
        for (const imageUrl of images) {
            try {
                // Dans un environnement réel, cela devrait vérifier si l'URL d'image est accessible
                // ou si l'image existe dans un système de stockage
                // Pour cette démo, nous supposons que toutes les images sont valides
                validImages.push(imageUrl);
            } catch (error) {
                console.warn(`Image invalide ignorée: ${imageUrl}`, error);
            }
        }
        
        return validImages;
    }

    /**
     * Ajoute un produit aux produits récemment consultés
     * @param {Object} product - Produit à ajouter
     * @private
     */
    static addToRecentlyViewed(product) {
        const recentProducts = StorageService.getLocalStorageItem('recentProducts', []);

        // Supprimer le produit s'il existe déjà dans la liste
        const filteredProducts = recentProducts.filter(p => p.id !== product.id);

        // Préparer un objet simplifié avec les infos essentielles
        const simplifiedProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            image: product.images && product.images.length > 0 ? product.images[0] : null
        };

        // Ajouter le produit au début de la liste
        filteredProducts.unshift(simplifiedProduct);

        // Limiter à 5 produits récents
        const limitedProducts = filteredProducts.slice(0, 5);

        StorageService.setLocalStorageItem('recentProducts', limitedProducts);
    }

    /**
     * Récupère les produits récemment consultés
     * @returns {Array} Liste des produits récemment consultés
     */
    static getRecentlyViewedProducts() {
        return StorageService.getLocalStorageItem('recentProducts', []);
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
     * Récupère les produits populaires
     * @param {number} limit - Nombre maximum de produits à retourner
     * @returns {Promise<Array>} Liste des produits populaires
     */
    static async getPopularProducts(limit = 8) {
        try {
            // Récupérer tous les produits marqués comme populaires
            const popularProducts = await DbService.getByIndex(STORES.PRODUCTS, 'popular', true);
            
            // Ne retourner que les produits en stock
            const inStockProducts = popularProducts.filter(
                product => product.stock === undefined || product.stock > 0
            );
            
            // Limiter le nombre de résultats
            return inStockProducts.slice(0, limit);
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
            // Récupérer tous les produits marqués comme vedette
            const featuredProducts = await DbService.getByIndex(STORES.PRODUCTS, 'featured', true);
            
            // Ne retourner que les produits en stock
            const inStockProducts = featuredProducts.filter(
                product => product.stock === undefined || product.stock > 0
            );
            
            // Limiter le nombre de résultats
            return inStockProducts.slice(0, limit);
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
                    (product.sku && product.sku.toLowerCase().includes(normalizedQuery)) ||
                    (product.tags && product.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)))
                );
            });
        } catch (error) {
            console.error(`Erreur lors de la recherche de produits pour "${query}":`, error);
            throw error;
        }
    }

    /**
     * Ajoute un nouveau produit
     * @param {Object} productData - Données du produit
     * @returns {Promise<Object>} Produit créé
     */
    static async addProduct(productData) {
        try {
            // Vérifier que les champs obligatoires sont présents
            if (!productData.name || !productData.description || productData.price === undefined) {
                throw new Error('Données de produit incomplètes');
            }

            // Générer un ID unique pour le produit si non fourni
            const productId = productData.id || `prod-${uuidv4()}`;

            // Valider les images
            const validatedImages = await this.validateProductImages(productData.images || []);

            // Créer l'objet produit
            const newProduct = {
                id: productId,
                name: productData.name,
                description: productData.description,
                price: productData.price,
                stock: productData.stock,
                images: validatedImages,
                category: productData.category,
                popular: productData.popular || false,
                featured: productData.featured || false,
                sku: productData.sku,
                weight: productData.weight,
                dimensions: productData.dimensions,
                tags: productData.tags || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Ajouter le produit à la base de données
            await DbService.add(STORES.PRODUCTS, newProduct);
            
            return newProduct;
        } catch (error) {
            console.error('Erreur lors de l\'ajout du produit:', error);
            throw error;
        }
    }

    /**
     * Met à jour un produit existant
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

            // Valider les images
            const validatedImages = await this.validateProductImages(productData.images || []);

            // Créer un nouvel objet en fusionnant les données existantes et nouvelles
            const updatedProduct = {
                ...existingProduct,
                ...productData,
                images: validatedImages,
                updatedAt: new Date().toISOString()
            };

            // Mettre à jour le produit dans la base de données
            await DbService.update(STORES.PRODUCTS, updatedProduct);
            
            return updatedProduct;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du produit ${productId}:`, error);
            throw error;
        }
    }

    /**
     * Supprime un produit
     * @param {string} productId - ID du produit
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async deleteProduct(productId) {
        try {
            const product = await DbService.getByKey(STORES.PRODUCTS, productId);
            
            if (!product) {
                throw new Error('Produit non trouvé');
            }
            
            // Supprimer les images associées
            if (product.images && product.images.length > 0) {
                for (const imageUrl of product.images) {
                    try {
                        await ImageUploadService.deleteImage(imageUrl);
                    } catch (error) {
                        console.warn(`Erreur lors de la suppression de l'image ${imageUrl}:`, error);
                    }
                }
            }
            
            // Supprimer le produit
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

            const currentStock = product.stock !== undefined ? product.stock : 0;
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

    /**
     * Récupère les produits à faible stock
     * @param {number} threshold - Seuil de stock bas
     * @returns {Promise<Array>} Liste des produits à faible stock
     */
    static async getLowStockProducts(threshold = 5) {
        try {
            const allProducts = await this.getAllProducts();
            
            // Filtrer les produits dont le stock est inférieur ou égal au seuil
            return allProducts.filter(product => {
                return product.stock !== undefined && product.stock <= threshold;
            }).sort((a, b) => a.stock - b.stock); // Trier par stock croissant
        } catch (error) {
            console.error(`Erreur lors de la récupération des produits à faible stock:`, error);
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
            // Vérifier que le nom est unique
            const categories = await this.getAllCategories();
            const existingCategory = categories.find(c => 
                c.name.toLowerCase() === categoryData.name.toLowerCase()
            );

            if (existingCategory) {
                throw new Error('Une catégorie avec ce nom existe déjà');
            }

            // Générer un ID unique si non fourni
            const categoryId = categoryData.id || `cat-${uuidv4()}`;

            // Valider l'image si fournie
            let validatedImage = categoryData.image;
            if (validatedImage) {
                try {
                    // Vérifier si l'image est valide
                    const imageExists = await ImageUploadService.imageExists(validatedImage);
                    if (!imageExists) {
                        validatedImage = null;
                    }
                } catch (error) {
                    console.warn(`Image de catégorie invalide:`, error);
                    validatedImage = null;
                }
            }

            // Créer l'objet catégorie
            const newCategory = {
                id: categoryId,
                name: categoryData.name,
                description: categoryData.description || '',
                image: validatedImage,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Ajouter la catégorie à la base de données
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
                const categories = await this.getAllCategories();
                const nameExists = categories.some(c => 
                    c.id !== categoryId && 
                    c.name.toLowerCase() === categoryData.name.toLowerCase()
                );

                if (nameExists) {
                    throw new Error('Une catégorie avec ce nom existe déjà');
                }
            }

            // Valider l'image si modifiée
            let validatedImage = categoryData.image;
            if (validatedImage && validatedImage !== existingCategory.image) {
                try {
                    // Vérifier si la nouvelle image est valide
                    const imageExists = await ImageUploadService.imageExists(validatedImage);
                    if (!imageExists) {
                        validatedImage = existingCategory.image;
                    }
                } catch (error) {
                    console.warn(`Image de catégorie invalide:`, error);
                    validatedImage = existingCategory.image;
                }
            }

            // Créer un nouvel objet en fusionnant les données existantes et nouvelles
            const updatedCategory = {
                ...existingCategory,
                ...categoryData,
                image: validatedImage,
                updatedAt: new Date().toISOString()
            };

            // Mettre à jour la catégorie dans la base de données
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
            const products = await this.getProductsByCategory(categoryId);

            if (products.length > 0) {
                throw new Error('Cette catégorie est utilisée par des produits. Veuillez d\'abord réassigner ces produits à une autre catégorie.');
            }

            // Récupérer la catégorie pour supprimer l'image
            const category = await DbService.getByKey(STORES.CATEGORIES, categoryId);
            
            if (category && category.image) {
                try {
                    await ImageUploadService.deleteImage(category.image);
                } catch (error) {
                    console.warn(`Erreur lors de la suppression de l'image de catégorie:`, error);
                }
            }

            // Supprimer la catégorie
            await DbService.delete(STORES.CATEGORIES, categoryId);
            
            return true;
        } catch (error) {
            console.error(`Erreur lors de la suppression de la catégorie ${categoryId}:`, error);
            throw error;
        }
    }

    /**
     * Compte le nombre de produits dans chaque catégorie
     * @returns {Promise<Object>} Mapping catégorie -> nombre de produits
     */
    static async countProductsByCategory() {
        try {
            const products = await this.getAllProducts();
            const counts = {};
            
            products.forEach(product => {
                if (product.category) {
                    counts[product.category] = (counts[product.category] || 0) + 1;
                }
            });
            
            return counts;
        } catch (error) {
            console.error('Erreur lors du comptage des produits par catégorie:', error);
            throw error;
        }
    }
}

export default EnhancedProductService;