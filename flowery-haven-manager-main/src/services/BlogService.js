import DbService from './db/DbService';
import { STORES } from './db/DbConfig';
import AuthService from './AuthService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service pour gérer les articles de blog et les commentaires
 */
class BlogService {
    /**
     * Récupère tous les articles de blog
     * @returns {Promise<Array>} Liste des articles
     */
    static async getAllPosts() {
        try {
            const posts = await DbService.getAll(STORES.BLOG_POSTS);
            return posts;
        } catch (error) {
            console.error('Erreur lors de la récupération des articles:', error);
            throw error;
        }
    }

    /**
     * Récupère un article par son ID
     * @param {string|number} postId - ID de l'article
     * @returns {Promise<Object|null>} Article ou null si non trouvé
     */
    static async getPostById(postId) {
        try {
            const post = await DbService.getByKey(STORES.BLOG_POSTS, postId);

            if (post) {
                // Incrémenter le compteur de vues
                post.viewCount = (post.viewCount || 0) + 1;
                await DbService.update(STORES.BLOG_POSTS, post);
            }

            return post;
        } catch (error) {
            console.error(`Erreur lors de la récupération de l'article ${postId}:`, error);
            throw error;
        }
    }

    /**
     * Crée un nouvel article (admin seulement)
     * @param {Object} postData - Données de l'article
     * @returns {Promise<Object>} Article créé
     */
    static async createPost(postData) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            // Créer l'objet article
            const newPost = {
                id: uuidv4(),
                title: postData.title,
                excerpt: postData.excerpt,
                content: postData.content,
                author: postData.author || `${currentUser.firstName} ${currentUser.lastName}`,
                authorId: currentUser.id,
                category: postData.category,
                imageUrl: postData.imageUrl,
                tags: postData.tags || [],
                status: postData.status || 'published', // 'draft' ou 'published'
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                publishedAt: postData.status === 'published' ? new Date().toISOString() : null,
                viewCount: 0
            };

            await DbService.add(STORES.BLOG_POSTS, newPost);

            return newPost;
        } catch (error) {
            console.error('Erreur lors de la création de l\'article:', error);
            throw error;
        }
    }

    /**
     * Met à jour un article (admin seulement)
     * @param {string|number} postId - ID de l'article
     * @param {Object} postData - Nouvelles données
     * @returns {Promise<Object>} Article mis à jour
     */
    static async updatePost(postId, postData) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            const existingPost = await DbService.getByKey(STORES.BLOG_POSTS, postId);

            if (!existingPost) {
                throw new Error('Article non trouvé');
            }

            // Déterminer si l'article passe de brouillon à publié
            const isNewlyPublished = existingPost.status === 'draft' && postData.status === 'published';

            // Mettre à jour l'article en conservant les champs non modifiés
            const updatedPost = {
                ...existingPost,
                ...postData,
                updatedAt: new Date().toISOString(),
                publishedAt: isNewlyPublished ? new Date().toISOString() : existingPost.publishedAt
            };

            await DbService.update(STORES.BLOG_POSTS, updatedPost);

            return updatedPost;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de l'article ${postId}:`, error);
            throw error;
        }
    }

    /**
     * Supprime un article (admin seulement)
     * @param {string|number} postId - ID de l'article
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async deletePost(postId) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            const post = await DbService.getByKey(STORES.BLOG_POSTS, postId);

            if (!post) {
                throw new Error('Article non trouvé');
            }

            // Supprimer les commentaires associés
            const comments = await DbService.getByIndex(STORES.BLOG_COMMENTS, 'postId', postId);

            for (const comment of comments) {
                await DbService.delete(STORES.BLOG_COMMENTS, comment.id);
            }

            // Supprimer l'article
            await DbService.delete(STORES.BLOG_POSTS, postId);

            return true;
        } catch (error) {
            console.error(`Erreur lors de la suppression de l'article ${postId}:`, error);
            throw error;
        }
    }

    /**
     * Récupère les articles par catégorie
     * @param {string} category - Catégorie
     * @returns {Promise<Array>} Articles de la catégorie
     */
    static async getPostsByCategory(category) {
        try {
            const posts = await DbService.getByIndex(STORES.BLOG_POSTS, 'category', category);

            // Filtrer pour obtenir seulement les articles publiés
            return posts.filter(post => post.status === 'published');
        } catch (error) {
            console.error(`Erreur lors de la récupération des articles de la catégorie ${category}:`, error);
            throw error;
        }
    }

    /**
     * Récupère les articles par tag
     * @param {string} tag - Tag à rechercher
     * @returns {Promise<Array>} Articles avec ce tag
     */
    static async getPostsByTag(tag) {
        try {
            const allPosts = await this.getAllPosts();

            // Filtrer les articles qui contiennent le tag
            const filteredPosts = allPosts.filter(post =>
                post.status === 'published' &&
                post.tags &&
                post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
            );

            return filteredPosts;
        } catch (error) {
            console.error(`Erreur lors de la récupération des articles avec le tag ${tag}:`, error);
            throw error;
        }
    }

    /**
     * Récupère les articles récents
     * @param {number} [count=5] - Nombre d'articles à récupérer
     * @returns {Promise<Array>} Articles récents
     */
    static async getRecentPosts(count = 5) {
        try {
            const allPosts = await this.getAllPosts();

            // Filtrer pour obtenir seulement les articles publiés
            const publishedPosts = allPosts.filter(post => post.status === 'published');

            // Trier par date (plus récent en premier)
            const sortedPosts = publishedPosts.sort((a, b) =>
                new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)
            );

            // Limiter au nombre demandé
            return sortedPosts.slice(0, count);
        } catch (error) {
            console.error('Erreur lors de la récupération des articles récents:', error);
            throw error;
        }
    }

    /**
     * Récupère les articles populaires (plus de vues)
     * @param {number} [count=5] - Nombre d'articles à récupérer
     * @returns {Promise<Array>} Articles populaires
     */
    static async getPopularPosts(count = 5) {
        try {
            const allPosts = await this.getAllPosts();

            // Filtrer pour obtenir seulement les articles publiés
            const publishedPosts = allPosts.filter(post => post.status === 'published');

            // Trier par nombre de vues (descendant)
            const sortedPosts = publishedPosts.sort((a, b) =>
                (b.viewCount || 0) - (a.viewCount || 0)
            );

            // Limiter au nombre demandé
            return sortedPosts.slice(0, count);
        } catch (error) {
            console.error('Erreur lors de la récupération des articles populaires:', error);
            throw error;
        }
    }

    /**
     * Recherche des articles par mot-clé
     * @param {string} query - Terme de recherche
     * @returns {Promise<Array>} Articles correspondants
     */
    static async searchPosts(query) {
        try {
            if (!query || query.trim() === '') {
                return [];
            }

            const normalizedQuery = query.toLowerCase().trim();

            const allPosts = await this.getAllPosts();

            // Rechercher dans les champs pertinents
            return allPosts.filter(post =>
                post.status === 'published' &&
                (post.title.toLowerCase().includes(normalizedQuery) ||
                    post.excerpt.toLowerCase().includes(normalizedQuery) ||
                    post.content.toLowerCase().includes(normalizedQuery) ||
                    (post.tags && post.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)))
                )
            );
        } catch (error) {
            console.error(`Erreur lors de la recherche d'articles pour "${query}":`, error);
            throw error;
        }
    }

    /**
     * Récupère tous les tags utilisés dans les articles
     * @returns {Promise<Array>} Liste des tags uniques
     */
    static async getAllTags() {
        try {
            const allPosts = await this.getAllPosts();

            // Extraire tous les tags de tous les articles
            const allTags = allPosts.reduce((tags, post) => {
                if (post.tags && Array.isArray(post.tags)) {
                    return [...tags, ...post.tags];
                }
                return tags;
            }, []);

            // Convertir en minuscules pour éviter les doublons dus à la casse
            const normalizedTags = allTags.map(tag => tag.toLowerCase());

            // Éliminer les doublons
            return [...new Set(normalizedTags)];
        } catch (error) {
            console.error('Erreur lors de la récupération de tous les tags:', error);
            throw error;
        }
    }

    /* ----- Gestion des commentaires ----- */

    /**
     * Récupère les commentaires d'un article
     * @param {string|number} postId - ID de l'article
     * @returns {Promise<Array>} Commentaires de l'article
     */
    static async getCommentsByPostId(postId) {
        try {
            const comments = await DbService.getByIndex(STORES.BLOG_COMMENTS, 'postId', postId);

            // Organiser les commentaires en arborescence (parent/enfant)
            const topLevelComments = comments.filter(comment => !comment.parentId);

            topLevelComments.forEach(comment => {
                comment.replies = comments.filter(reply => reply.parentId === comment.id);
            });

            return topLevelComments;
        } catch (error) {
            console.error(`Erreur lors de la récupération des commentaires de l'article ${postId}:`, error);
            throw error;
        }
    }

    /**
     * Ajoute un commentaire à un article
     * @param {string|number} postId - ID de l'article
     * @param {Object} commentData - Données du commentaire
     * @returns {Promise<Object>} Commentaire créé
     */
    static async addComment(postId, commentData) {
        try {
            const currentUser = AuthService.getCurrentUser();

            // Vérifier si l'article existe
            const post = await DbService.getByKey(STORES.BLOG_POSTS, postId);

            if (!post) {
                throw new Error('Article non trouvé');
            }

            // Créer l'objet commentaire
            const newComment = {
                id: uuidv4(),
                postId,
                author: commentData.author,
                content: commentData.content,
                parentId: commentData.parentId || null,
                userId: currentUser ? currentUser.id : null,
                email: commentData.email,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                reactions: [
                    { type: 'like', count: 0 },
                    { type: 'love', count: 0 },
                    { type: 'laugh', count: 0 }
                ]
            };

            await DbService.add(STORES.BLOG_COMMENTS, newComment);

            return newComment;
        } catch (error) {
            console.error(`Erreur lors de l'ajout d'un commentaire à l'article ${postId}:`, error);
            throw error;
        }
    }

    /**
     * Ajoute une réaction à un commentaire
     * @param {string} commentId - ID du commentaire
     * @param {string} reactionType - Type de réaction ('like', 'love', 'laugh')
     * @returns {Promise<Object>} Commentaire mis à jour
     */
    static async addReactionToComment(commentId, reactionType) {
        try {
            // Vérifier si le type de réaction est valide
            const validReactions = ['like', 'love', 'laugh'];
            if (!validReactions.includes(reactionType)) {
                throw new Error('Type de réaction invalide');
            }

            const comment = await DbService.getByKey(STORES.BLOG_COMMENTS, commentId);

            if (!comment) {
                throw new Error('Commentaire non trouvé');
            }

            // Initialiser le tableau de réactions si nécessaire
            if (!comment.reactions) {
                comment.reactions = validReactions.map(type => ({ type, count: 0 }));
            }

            // Trouver et incrémenter la réaction correspondante
            const reaction = comment.reactions.find(r => r.type === reactionType);
            if (reaction) {
                reaction.count += 1;
            } else {
                comment.reactions.push({ type: reactionType, count: 1 });
            }

            comment.updatedAt = new Date().toISOString();

            await DbService.update(STORES.BLOG_COMMENTS, comment);

            return comment;
        } catch (error) {
            console.error(`Erreur lors de l'ajout d'une réaction au commentaire ${commentId}:`, error);
            throw error;
        }
    }

    /**
     * Supprime un commentaire (admin ou auteur du commentaire)
     * @param {string} commentId - ID du commentaire
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async deleteComment(commentId) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            const comment = await DbService.getByKey(STORES.BLOG_COMMENTS, commentId);

            if (!comment) {
                throw new Error('Commentaire non trouvé');
            }

            // Vérifier si l'utilisateur a le droit de supprimer ce commentaire
            const isAdmin = currentUser.role === 'admin';
            const isAuthor = comment.userId === currentUser.id;

            if (!isAdmin && !isAuthor) {
                throw new Error('Accès non autorisé');
            }

            // Supprimer les réponses à ce commentaire
            const replies = await DbService.getByIndex(STORES.BLOG_COMMENTS, 'parentId', commentId);

            for (const reply of replies) {
                await DbService.delete(STORES.BLOG_COMMENTS, reply.id);
            }

            // Supprimer le commentaire
            await DbService.delete(STORES.BLOG_COMMENTS, commentId);

            return true;
        } catch (error) {
            console.error(`Erreur lors de la suppression du commentaire ${commentId}:`, error);
            throw error;
        }
    }

    /**
     * Initialise des données de blog par défaut pour la démo
     * @returns {Promise<void>}
     */
    static async initDefaultBlogPosts() {
        try {
            // Vérifier si des articles existent déjà
            const postsCount = await DbService.count(STORES.BLOG_POSTS);

            if (postsCount === 0) {
                // Ajouter des articles par défaut
                const defaultPosts = [
                    {
                        title: "Les tendances florales de l'automne",
                        excerpt: "Découvrez les arrangements floraux qui feront sensation cette saison.",
                        content: "L'automne est une saison magique pour les compositions florales. Avec ses couleurs chaudes et ses textures riches, cette période offre une palette somptueuse pour créer des arrangements uniques. Les tons ambrés, les rouges profonds et les oranges chaleureux dominent désormais nos créations. N'hésitez pas à intégrer des éléments naturels comme des branches, des baies, ou même des petites citrouilles décoratives pour un effet saisonnier parfait. Les chrysanthèmes, dahlias et roses d'automne sont particulièrement à l'honneur cette année.",
                        author: "Sophie Martin",
                        category: "tendances",
                        imageUrl: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?q=80&w=2070&auto=format&fit=crop",
                        tags: ["automne", "tendances", "décoration"],
                        status: "published",
                        viewCount: 42
                    },
                    {
                        title: "Comment prendre soin de vos orchidées",
                        excerpt: "Nos conseils pour maintenir vos orchidées en pleine santé toute l'année.",
                        content: "Les orchidées sont souvent considérées comme difficiles à entretenir, mais avec quelques connaissances de base, elles peuvent fleurir pendant des années. La clé réside dans l'arrosage : contrairement à la croyance populaire, les orchidées ne doivent pas être arrosées fréquemment. Un arrosage hebdomadaire est généralement suffisant, en laissant le substrat sécher complètement entre deux arrosages. Placez votre orchidée dans un endroit lumineux mais sans soleil direct. La température idéale se situe entre 18 et 24°C. N'oubliez pas de fertiliser légèrement une fois par mois pendant la période de croissance.",
                        author: "Pierre Dubois",
                        category: "conseils",
                        imageUrl: "https://images.unsplash.com/photo-1610631683255-b88ebc25a24a?q=80&w=2070&auto=format&fit=crop",
                        tags: ["orchidées", "entretien", "plantes d'intérieur"],
                        status: "published",
                        viewCount: 27
                    },
                    {
                        title: "Les fleurs de mariage parfaites pour chaque saison",
                        excerpt: "Guide complet pour choisir les fleurs idéales selon la saison de votre mariage.",
                        content: "Choisir les fleurs de votre mariage en fonction de la saison présente de nombreux avantages : elles seront non seulement plus fraîches et plus belles, mais aussi plus abordables. Au printemps, optez pour des pivoines, tulipes et renoncules. L'été offre une abondance de choix avec les roses, tournesols et hortensias. L'automne invite les dahlias, chrysanthèmes et roses d'automne dans vos bouquets. Et même en hiver, vous pouvez créer des arrangements magnifiques avec des amaryllis, des camélias ou des branches givrées. N'oubliez pas que le style de votre mariage est aussi important que la saison pour déterminer vos choix floraux.",
                        author: "Marie Laurent",
                        category: "evenements",
                        imageUrl: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=2070&auto=format&fit=crop",
                        tags: ["mariage", "saisonnier", "bouquets"],
                        status: "published",
                        viewCount: 35
                    }
                ];

                for (const postData of defaultPosts) {
                    const newPost = {
                        id: uuidv4(),
                        ...postData,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        publishedAt: new Date().toISOString()
                    };

                    await DbService.add(STORES.BLOG_POSTS, newPost);
                }

                console.log('Articles de blog par défaut créés');
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des articles de blog par défaut:', error);
        }
    }
}

export default BlogService;