// src/services/ImageOptimizationService.js
class ImageOptimizationService {
    /**
     * Génère une URL d'image optimisée pour une taille donnée
     * @param {string} url - URL originale de l'image
     * @param {number} width - Largeur souhaitée
     * @param {number} height - Hauteur souhaitée (optionnelle)
     * @param {Object} options - Options supplémentaires
     * @returns {string} - URL optimisée
     */
    getOptimizedImageUrl(url, width, height = null, options = {}) {
        if (!url) return '';

        // Si l'URL est déjà une URL d'image optimisée, la retourner telle quelle
        if (url.includes('imageproxy') || url.includes('placeholder')) {
            return url;
        }

        // Pour les images externes, utiliser un proxy d'images (simulé ici)
        // Dans une application réelle, vous pourriez utiliser un service comme Imgix, Cloudinary, etc.
        try {
            const baseUrl = '/api/imageproxy';
            const urlObj = new URL(url);

            const params = new URLSearchParams();
            params.append('url', encodeURIComponent(url));
            params.append('w', width.toString());

            if (height) {
                params.append('h', height.toString());
            }

            if (options.fit) {
                params.append('fit', options.fit); // cover, contain, etc.
            }

            if (options.format) {
                params.append('fmt', options.format); // webp, jpeg, etc.
            }

            return `${baseUrl}?${params.toString()}`;
        } catch (error) {
            console.warn('Failed to create optimized image URL:', error);
            return url; // Fallback à l'URL originale
        }
    }

    /**
     * Génère un ensemble d'URLs pour différentes tailles (srcset)
     * @param {string} url - URL originale de l'image
     * @param {Array<number>} widths - Tableau des largeurs souhaitées
     * @param {Object} options - Options supplémentaires
     * @returns {string} - Attribut srcset pour l'élément img
     */
    generateSrcSet(url, widths = [640, 960, 1280, 1920], options = {}) {
        if (!url) return '';

        return widths
            .map(width => {
                const optimizedUrl = this.getOptimizedImageUrl(url, width, null, options);
                return `${optimizedUrl} ${width}w`;
            })
            .join(', ');
    }

    /**
     * Précharge une image
     * @param {string} url - URL de l'image à précharger
     * @returns {Promise<HTMLImageElement>} - Promesse résolue avec l'élément image
     */
    preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }

    /**
     * Précharge une liste d'images
     * @param {Array<string>} urls - URLs des images à précharger
     * @returns {Promise<Array<HTMLImageElement>>} - Promesse résolue avec les éléments image
     */
    preloadImages(urls) {
        return Promise.all(urls.map(url => this.preloadImage(url)));
    }

    /**
     * Détecte le support du format WebP
     * @returns {Promise<boolean>} - True si WebP est supporté
     */
    async isWebPSupported() {
        if (this._webpSupported !== undefined) {
            return this._webpSupported;
        }

        return new Promise(resolve => {
            const image = new Image();
            image.onload = () => {
                this._webpSupported = image.width > 0 && image.height > 0;
                resolve(this._webpSupported);
            };
            image.onerror = () => {
                this._webpSupported = false;
                resolve(false);
            };
            image.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
        });
    }

    /**
     * Optimise une URL d'image en fonction des capacités du navigateur
     * @param {string} url - URL originale de l'image
     * @param {Object} options - Options d'optimisation
     * @returns {Promise<string>} - URL optimisée
     */
    async getAutoOptimizedImageUrl(url, options = {}) {
        const webpSupported = await this.isWebPSupported();

        if (webpSupported && !options.format) {
            options.format = 'webp';
        }

        return this.getOptimizedImageUrl(
            url,
            options.width || 800,
            options.height,
            options
        );
    }
}

export default new ImageOptimizationService();