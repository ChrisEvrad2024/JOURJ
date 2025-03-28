// src/services/ImageUploadService.js
import { v4 as uuidv4 } from 'uuid';

/**
 * Service pour gérer l'upload et le stockage des images
 * Dans une application réelle, on utiliserait un service cloud comme AWS S3, 
 * Cloudinary, etc. Pour cette démo, nous simulons avec localStorage et data URLs.
 */
class ImageUploadService {
    /**
     * Stocke les images uploadées
     * @private
     */
    static STORAGE_KEY = 'flowery_haven_images';

    /**
     * Charge les images stockées en localStorage
     * @returns {Object} Map des images stockées
     * @private
     */
    static _loadImages() {
        try {
            const storedImages = localStorage.getItem(this.STORAGE_KEY);
            return storedImages ? JSON.parse(storedImages) : {};
        } catch (error) {
            console.error('Erreur lors du chargement des images:', error);
            return {};
        }
    }

    /**
     * Sauvegarde les images en localStorage
     * @param {Object} images - Map des images à stocker
     * @private
     */
    static _saveImages(images) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des images:', error);
        }
    }

    /**
     * Upload une image
     * @param {File} file - Fichier image à uploader
     * @returns {Promise<string>} URL de l'image uploadée
     */
    static async uploadImage(file) {
        return new Promise((resolve, reject) => {
            // Vérifier le type de fichier
            if (!file.type.startsWith('image/')) {
                reject(new Error('Le fichier doit être une image'));
                return;
            }

            // Simuler un délai d'upload
            setTimeout(() => {
                const reader = new FileReader();

                reader.onload = () => {
                    try {
                        // Générer un ID unique pour l'image
                        const imageId = uuidv4();
                        const imageUrl = reader.result;

                        // Stocker l'image
                        const images = this._loadImages();
                        images[imageId] = {
                            url: imageUrl,
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            uploadedAt: new Date().toISOString()
                        };
                        this._saveImages(images);

                        // Retourner l'URL de l'image
                        resolve(imageUrl);
                    } catch (error) {
                        reject(error);
                    }
                };

                reader.onerror = () => {
                    reject(new Error('Erreur lors de la lecture du fichier'));
                };

                reader.readAsDataURL(file);
            }, 500);
        });
    }

    /**
     * Supprime une image
     * @param {string} imageUrl - URL de l'image à supprimer
     * @returns {Promise<boolean>} Succès de l'opération
     */
    static async deleteImage(imageUrl) {
        return new Promise((resolve) => {
            // Simuler un délai
            setTimeout(() => {
                const images = this._loadImages();

                // Chercher l'image par son URL
                let imageIdToDelete = null;

                for (const [id, imageData] of Object.entries(images)) {
                    if (imageData.url === imageUrl) {
                        imageIdToDelete = id;
                        break;
                    }
                }

                // Supprimer l'image si trouvée
                if (imageIdToDelete) {
                    delete images[imageIdToDelete];
                    this._saveImages(images);
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, 300);
        });
    }

    /**
     * Vérifie si une URL d'image existe
     * @param {string} imageUrl - URL à vérifier
     * @returns {Promise<boolean>} Vrai si l'image existe
     */
    static async imageExists(imageUrl) {
        return new Promise((resolve) => {
            const images = this._loadImages();

            // Vérifier si l'URL existe dans les images stockées
            const exists = Object.values(images).some(image => image.url === imageUrl);

            resolve(exists);
        });
    }
}

export default ImageUploadService;