import StorageService from './StorageService';
import DbService from './db/DbService';
import { STORES, STORAGE_KEYS } from './db/DbConfig';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service d'authentification pour gérer les utilisateurs et les sessions
 */
class AuthService {
    /**
     * Vérifie si un utilisateur est actuellement connecté
     * @returns {boolean} Vrai si un utilisateur est connecté
     */
    static isAuthenticated() {
        const currentUser = StorageService.getLocalStorageItem(STORAGE_KEYS.CURRENT_USER);
        const authToken = StorageService.getLocalStorageItem(STORAGE_KEYS.AUTH_TOKEN);

        return !!currentUser && !!authToken;
    }

    /**
     * Récupère l'utilisateur actuellement connecté
     * @returns {Object|null} Utilisateur connecté ou null
     */
    static getCurrentUser() {
        return StorageService.getLocalStorageItem(STORAGE_KEYS.CURRENT_USER);
    }

    /**
     * Connecte un utilisateur avec ses identifiants
     * @param {string} email - Adresse email
     * @param {string} password - Mot de passe
     * @returns {Promise<Object>} Informations de l'utilisateur connecté
     */
    static async login(email, password) {
        try {
            // Dans une application réelle, cette validation serait faite côté serveur
            // Ici, nous simulons la validation en récupérant l'utilisateur depuis IndexedDB
            const users = await DbService.getByIndex(STORES.USERS, 'email', email);

            if (users.length === 0) {
                throw new Error('Aucun utilisateur trouvé avec cette adresse email');
            }

            const user = users[0];

            // Pour simplifier, nous utilisons des mots de passe en clair
            // Dans une application réelle, les mots de passe seraient hachés
            if (user.password !== password) {
                throw new Error('Mot de passe incorrect');
            }

            // Créer un token d'authentification (simulé)
            const authToken = this._generateAuthToken(user.id);

            // Stocker l'utilisateur et le token dans localStorage
            const userToStore = { ...user };
            delete userToStore.password; // Ne jamais stocker le mot de passe en clair côté client

            StorageService.setLocalStorageItem(STORAGE_KEYS.CURRENT_USER, userToStore);
            StorageService.setLocalStorageItem(STORAGE_KEYS.AUTH_TOKEN, authToken);

            return userToStore;
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            throw error;
        }
    }

    /**
     * Génère un token d'authentification (simulé)
     * @param {string} userId - ID de l'utilisateur
     * @returns {string} Token d'authentification
     * @private
     */
    static _generateAuthToken(userId) {
        // Dans une application réelle, on utiliserait JWT ou un autre système de token
        return `${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    /**
     * Déconnecte l'utilisateur en cours
     */
    static logout() {
        StorageService.removeLocalStorageItem(STORAGE_KEYS.CURRENT_USER);
        StorageService.removeLocalStorageItem(STORAGE_KEYS.AUTH_TOKEN);
    }

    /**
     * Inscrit un nouvel utilisateur
     * @param {Object} userData - Données de l'utilisateur
     * @param {string} userData.firstName - Prénom
     * @param {string} userData.lastName - Nom
     * @param {string} userData.email - Email
     * @param {string} userData.password - Mot de passe
     * @returns {Promise<Object>} Informations de l'utilisateur inscrit
     */
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    async register(userData) {
        try {
            // Vérifier si l'utilisateur existe déjà
            const existingUser = await this.getUserByEmail(userData.email);
            if (existingUser) {
                throw new Error('Un utilisateur avec cette adresse email existe déjà');
            }

            // Ajouter l'utilisateur à la base de données
            await DbService.add('users', {
                email: userData.email.toLowerCase(), // Stocker en minuscules pour faciliter la recherche
                password: userData.password, // Idéalement, hashé dans une vraie application
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: 'customer',
                createdAt: new Date()
            });

            // Créer un nouvel utilisateur
            const newUser = {
                id: this.generateUserId(),
                ...userData,
                role: 'customer',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Stocker l'utilisateur
            const users = await this.getAllUsers();
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            // Connecter automatiquement l'utilisateur
            this.setCurrentUser(newUser);

            return newUser;
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            throw error;
        }
    }

    /**
     * Met à jour les informations d'un utilisateur
     * @param {string} userId - ID de l'utilisateur
     * @param {Object} userData - Nouvelles données
     * @returns {Promise<Object>} Utilisateur mis à jour
     */
    static async updateUser(userId, userData) {
        try {
            // Récupérer l'utilisateur actuel
            const currentUser = await DbService.getByKey(STORES.USERS, userId);

            if (!currentUser) {
                throw new Error('Utilisateur non trouvé');
            }

            // Mettre à jour l'utilisateur en conservant les champs non modifiés
            const updatedUser = {
                ...currentUser,
                ...userData,
                updatedAt: new Date().toISOString()
            };

            // Ne pas modifier l'email si c'est le même
            if (userData.email && userData.email !== currentUser.email) {
                // Vérifier si le nouvel email existe déjà
                const existingUsers = await DbService.getByIndex(STORES.USERS, 'email', userData.email);

                if (existingUsers.length > 0) {
                    throw new Error('Cette adresse email est déjà utilisée');
                }
            }

            // Ne pas écraser le mot de passe si non fourni
            if (!userData.password) {
                updatedUser.password = currentUser.password;
            }

            // Mettre à jour dans la base de données
            await DbService.update(STORES.USERS, updatedUser);

            // Mettre à jour l'utilisateur en session si c'est l'utilisateur courant
            const currentLoggedInUser = this.getCurrentUser();
            if (currentLoggedInUser && currentLoggedInUser.id === userId) {
                const userToStore = { ...updatedUser };
                delete userToStore.password;
                StorageService.setLocalStorageItem(STORAGE_KEYS.CURRENT_USER, userToStore);
            }

            // Retourner l'utilisateur sans le mot de passe
            const returnUser = { ...updatedUser };
            delete returnUser.password;
            return returnUser;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
            throw error;
        }
    }

    /**
     * Change le mot de passe d'un utilisateur
     * @param {string} userId - ID de l'utilisateur
     * @param {string} currentPassword - Mot de passe actuel
     * @param {string} newPassword - Nouveau mot de passe
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async changePassword(userId, currentPassword, newPassword) {
        try {
            // Récupérer l'utilisateur
            const user = await DbService.getByKey(STORES.USERS, userId);

            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }

            // Vérifier l'ancien mot de passe
            if (user.password !== currentPassword) {
                throw new Error('Mot de passe actuel incorrect');
            }

            // Mettre à jour le mot de passe
            user.password = newPassword;
            user.updatedAt = new Date().toISOString();

            await DbService.update(STORES.USERS, user);
            return true;
        } catch (error) {
            console.error('Erreur lors du changement de mot de passe:', error);
            throw error;
        }
    }

    /**
     * Initie le processus de réinitialisation de mot de passe
     * @param {string} email - Email de l'utilisateur
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async requestPasswordReset(email) {
        try {
            // Vérifier si l'utilisateur existe
            const users = await DbService.getByIndex(STORES.USERS, 'email', email);

            if (users.length === 0) {
                // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
                // Retourner un succès même si l'email n'existe pas
                return true;
            }

            const user = users[0];

            // Générer un token de réinitialisation
            const resetToken = uuidv4();
            const resetExpires = new Date();
            resetExpires.setHours(resetExpires.getHours() + 1); // Expire après 1 heure

            // Mettre à jour l'utilisateur avec le token
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = resetExpires.toISOString();
            user.updatedAt = new Date().toISOString();

            await DbService.update(STORES.USERS, user);

            // Dans une application réelle, on enverrait un email avec le lien de réinitialisation
            console.log(`Token de réinitialisation pour ${email}: ${resetToken}`);

            return true;
        } catch (error) {
            console.error('Erreur lors de la demande de réinitialisation:', error);
            throw error;
        }
    }

    /**
     * Réinitialise le mot de passe avec un token
     * @param {string} token - Token de réinitialisation
     * @param {string} newPassword - Nouveau mot de passe
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async resetPassword(token, newPassword) {
        try {
            // Dans une application réelle, on aurait une méthode pour rechercher par token
            // Ici, on parcourt tous les utilisateurs pour simplifier
            const allUsers = await DbService.getAll(STORES.USERS);
            const user = allUsers.find(u => u.resetPasswordToken === token);

            if (!user) {
                throw new Error('Token de réinitialisation invalide');
            }

            // Vérifier si le token est expiré
            const expires = new Date(user.resetPasswordExpires);
            if (expires < new Date()) {
                throw new Error('Token de réinitialisation expiré');
            }

            // Mettre à jour le mot de passe
            user.password = newPassword;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            user.updatedAt = new Date().toISOString();

            await DbService.update(STORES.USERS, user);
            return true;
        } catch (error) {
            console.error('Erreur lors de la réinitialisation du mot de passe:', error);
            throw error;
        }
    }

    /**
     * Récupère tous les utilisateurs (admin seulement)
     * @returns {Promise<Array>} Liste des utilisateurs
     */
    // Méthode pour récupérer tous les utilisateurs
    async getAllUsers() {
        try {
            const users = localStorage.getItem('users');
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            return [];
        }
    }

    /**
     * Supprime un utilisateur (admin ou utilisateur lui-même)
     * @param {string} userId - ID de l'utilisateur à supprimer
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async deleteUser(userId) {
        try {
            // Vérifier les permissions
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            if (currentUser.id !== userId && currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            // Supprimer l'utilisateur
            await DbService.delete(STORES.USERS, userId);

            // Si l'utilisateur supprime son propre compte, déconnecter
            if (currentUser.id === userId) {
                this.logout();
            }

            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur:', error);
            throw error;
        }
    }

    /**
     * Initialise les données utilisateur avec un admin par défaut (pour démo)
     * @returns {Promise<void>}
     */
    static async initDefaultUsers() {
        try {
            // Vérifier si la base de données est déjà initialisée
            const count = await DbService.count(STORES.USERS);

            if (count === 0) {
                // Ajouter un admin par défaut
                const adminUser = {
                    id: uuidv4(),
                    firstName: 'Admin',
                    lastName: 'ChezFlora',
                    email: 'admin@floral.com',
                    password: 'AdminPass123', // En production, utiliser un mot de passe haché
                    role: 'admin',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                await DbService.add(STORES.USERS, adminUser);
                console.log('Utilisateur admin par défaut créé');

                // Ajouter un client de test
                const testUser = {
                    id: uuidv4(),
                    firstName: 'Client',
                    lastName: 'Test',
                    email: 'client@test.com',
                    password: 'ClientPass123', // En production, utiliser un mot de passe haché
                    role: 'customer',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                await DbService.add(STORES.USERS, testUser);
                console.log('Utilisateur de test créé');
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des utilisateurs par défaut:', error);
        }
    }
}

export default AuthService;