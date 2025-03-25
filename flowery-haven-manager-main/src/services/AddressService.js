import DbService from './db/DbService';
import { STORES } from './db/DbConfig';
import AuthService from './AuthService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service pour gérer les adresses de livraison et de facturation des utilisateurs
 */
class AddressService {
    /**
     * Récupère toutes les adresses d'un utilisateur
     * @param {string} [userId] - ID de l'utilisateur (utilise l'utilisateur courant par défaut)
     * @returns {Promise<Array>} Liste des adresses
     */
    static async getUserAddresses(userId = null) {
        try {
            // Si l'ID utilisateur n'est pas fourni, utiliser l'utilisateur courant
            const currentUser = AuthService.getCurrentUser();

            if (!userId && !currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            const targetUserId = userId || currentUser.id;

            // Si l'utilisateur courant n'est pas admin et essaie d'accéder aux adresses d'un autre utilisateur
            if (currentUser.id !== targetUserId && currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            const addresses = await DbService.getByIndex(STORES.ADDRESSES, 'userId', targetUserId);
            return addresses;
        } catch (error) {
            console.error('Erreur lors de la récupération des adresses:', error);
            throw error;
        }
    }

    /**
     * Récupère une adresse spécifique
     * @param {string} addressId - ID de l'adresse
     * @returns {Promise<Object|null>} Adresse ou null si non trouvée
     */
    static async getAddressById(addressId) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            const address = await DbService.getByKey(STORES.ADDRESSES, addressId);

            if (!address) {
                return null;
            }

            // Vérifier si l'adresse appartient à l'utilisateur ou si c'est un admin
            if (address.userId !== currentUser.id && currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            return address;
        } catch (error) {
            console.error(`Erreur lors de la récupération de l'adresse ${addressId}:`, error);
            throw error;
        }
    }

    /**
     * Récupère l'adresse par défaut d'un utilisateur pour un type spécifique
     * @param {string} type - Type d'adresse ('shipping' ou 'billing')
     * @param {string} [userId] - ID de l'utilisateur (utilise l'utilisateur courant par défaut)
     * @returns {Promise<Object|null>} Adresse par défaut ou null si non trouvée
     */
    static async getDefaultAddress(type, userId = null) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!userId && !currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            const targetUserId = userId || currentUser.id;

            // Si l'utilisateur courant n'est pas admin et essaie d'accéder aux adresses d'un autre utilisateur
            if (currentUser.id !== targetUserId && currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            const addresses = await DbService.getByIndex(STORES.ADDRESSES, 'userId', targetUserId);

            // Filtrer les adresses par type et trouver la première qui est définie comme "par défaut"
            const defaultAddress = addresses.find(address => address.type === type && address.isDefault);

            return defaultAddress || null;
        } catch (error) {
            console.error(`Erreur lors de la récupération de l'adresse par défaut de type ${type}:`, error);
            throw error;
        }
    }

    /**
     * Ajoute une nouvelle adresse
     * @param {Object} addressData - Données de l'adresse
     * @returns {Promise<Object>} Adresse ajoutée
     */
    static async addAddress(addressData) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            // Créer l'objet adresse
            const newAddress = {
                id: uuidv4(),
                userId: currentUser.id,
                ...addressData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Si l'adresse est définie comme adresse par défaut, mettre à jour les autres adresses du même type
            if (newAddress.isDefault) {
                await this._resetDefaultAddress(currentUser.id, newAddress.type);
            }

            // Ajouter l'adresse à la base de données
            await DbService.add(STORES.ADDRESSES, newAddress);

            return newAddress;
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'adresse:', error);
            throw error;
        }
    }

    /**
     * Met à jour une adresse existante
     * @param {string} addressId - ID de l'adresse
     * @param {Object} addressData - Nouvelles données
     * @returns {Promise<Object>} Adresse mise à jour
     */
    static async updateAddress(addressId, addressData) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            const existingAddress = await DbService.getByKey(STORES.ADDRESSES, addressId);

            if (!existingAddress) {
                throw new Error('Adresse non trouvée');
            }

            // Vérifier si l'adresse appartient à l'utilisateur ou si c'est un admin
            if (existingAddress.userId !== currentUser.id && currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            // Mettre à jour l'adresse en conservant les champs non modifiés
            const updatedAddress = {
                ...existingAddress,
                ...addressData,
                updatedAt: new Date().toISOString()
            };

            // Si le type a changé ou si l'adresse devient une adresse par défaut
            if ((updatedAddress.type !== existingAddress.type ||
                (updatedAddress.isDefault && !existingAddress.isDefault)) &&
                updatedAddress.isDefault) {
                await this._resetDefaultAddress(updatedAddress.userId, updatedAddress.type);
            }

            // Mettre à jour dans la base de données
            await DbService.update(STORES.ADDRESSES, updatedAddress);

            return updatedAddress;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de l'adresse ${addressId}:`, error);
            throw error;
        }
    }

    /**
     * Supprime une adresse
     * @param {string} addressId - ID de l'adresse
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async deleteAddress(addressId) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            const address = await DbService.getByKey(STORES.ADDRESSES, addressId);

            if (!address) {
                throw new Error('Adresse non trouvée');
            }

            // Vérifier si l'adresse appartient à l'utilisateur ou si c'est un admin
            if (address.userId !== currentUser.id && currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            // Si c'est une adresse par défaut, essayer de définir une autre adresse comme par défaut
            if (address.isDefault) {
                await this._setNewDefaultAddress(address.userId, address.type, addressId);
            }

            await DbService.delete(STORES.ADDRESSES, addressId);

            return true;
        } catch (error) {
            console.error(`Erreur lors de la suppression de l'adresse ${addressId}:`, error);
            throw error;
        }
    }

    /**
     * Définit une adresse comme adresse par défaut
     * @param {string} addressId - ID de l'adresse
     * @returns {Promise<Object>} Adresse mise à jour
     */
    static async setAsDefault(addressId) {
        try {
            const currentUser = AuthService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            const address = await DbService.getByKey(STORES.ADDRESSES, addressId);

            if (!address) {
                throw new Error('Adresse non trouvée');
            }

            // Vérifier si l'adresse appartient à l'utilisateur ou si c'est un admin
            if (address.userId !== currentUser.id && currentUser.role !== 'admin') {
                throw new Error('Accès non autorisé');
            }

            // Réinitialiser les autres adresses par défaut du même type
            await this._resetDefaultAddress(address.userId, address.type);

            // Définir cette adresse comme adresse par défaut
            address.isDefault = true;
            address.updatedAt = new Date().toISOString();

            await DbService.update(STORES.ADDRESSES, address);

            return address;
        } catch (error) {
            console.error(`Erreur lors de la définition de l'adresse ${addressId} comme adresse par défaut:`, error);
            throw error;
        }
    }

    /**
     * Réinitialise les adresses par défaut d'un utilisateur pour un type spécifique
     * @param {string} userId - ID de l'utilisateur
     * @param {string} type - Type d'adresse ('shipping' ou 'billing')
     * @private
     */
    static async _resetDefaultAddress(userId, type) {
        try {
            const addresses = await DbService.getByIndex(STORES.ADDRESSES, 'userId', userId);

            // Parcourir toutes les adresses du type spécifié et réinitialiser le flag "isDefault"
            for (const address of addresses) {
                if (address.type === type && address.isDefault) {
                    address.isDefault = false;
                    address.updatedAt = new Date().toISOString();

                    await DbService.update(STORES.ADDRESSES, address);
                }
            }
        } catch (error) {
            console.error(`Erreur lors de la réinitialisation des adresses par défaut de type ${type}:`, error);
            throw error;
        }
    }

    /**
     * Définit une nouvelle adresse par défaut lorsqu'une adresse par défaut est supprimée
     * @param {string} userId - ID de l'utilisateur
     * @param {string} type - Type d'adresse ('shipping' ou 'billing')
     * @param {string} excludeAddressId - ID de l'adresse à exclure (celle qui est supprimée)
     * @private
     */
    static async _setNewDefaultAddress(userId, type, excludeAddressId) {
        try {
            const addresses = await DbService.getByIndex(STORES.ADDRESSES, 'userId', userId);

            // Filtrer les adresses du même type, en excluant celle qui est supprimée
            const sameTypeAddresses = addresses.filter(address =>
                address.type === type && address.id !== excludeAddressId
            );

            // S'il y a au moins une adresse du même type, la définir comme adresse par défaut
            if (sameTypeAddresses.length > 0) {
                const newDefaultAddress = sameTypeAddresses[0];
                newDefaultAddress.isDefault = true;
                newDefaultAddress.updatedAt = new Date().toISOString();

                await DbService.update(STORES.ADDRESSES, newDefaultAddress);
            }
        } catch (error) {
            console.error(`Erreur lors de la définition d'une nouvelle adresse par défaut de type ${type}:`, error);
            throw error;
        }
    }
}

export default AddressService;