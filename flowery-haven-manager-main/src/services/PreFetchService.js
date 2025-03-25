// src/services/PreFetchService.js
class PreFetchService {
    constructor() {
        this.prefetchedLinks = new Set();
        this.prefetchTimeout = null;
        this.enabled = true;

        // Désactiver le prefetch pour les connexions lentes ou les économies de données
        if (navigator.connection) {
            const { effectiveType, saveData } = navigator.connection;

            if (saveData || (effectiveType && (effectiveType === '2g' || effectiveType === 'slow-2g'))) {
                this.enabled = false;
            }
        }
    }

    /**
     * Préfetche une page quand l'utilisateur survole un lien
     * @param {string} path - Chemin de la page à préfetcher
     */
    prefetchRoute(path) {
        if (!this.enabled || this.prefetchedLinks.has(path)) return;

        // Annuler tout timeout en cours
        if (this.prefetchTimeout) {
            clearTimeout(this.prefetchTimeout);
        }

        // Mettre en place un nouveau timeout pour éviter les préfetchs inutiles
        this.prefetchTimeout = setTimeout(() => {
            const { origin } = window.location;
            const link = document.createElement('link');

            link.rel = 'prefetch';
            link.href = `${origin}${path}`;
            link.as = 'document';

            link.onload = () => this.prefetchedLinks.add(path);
            link.onerror = (err) => console.warn('Prefetch error:', err);

            document.head.appendChild(link);
        }, 200); // Délai pour éviter les préfetchs inutiles
    }

    /**
     * Précharge une ressource spécifique (script, image, etc.)
     * @param {string} url - URL de la ressource
     * @param {string} as - Type de ressource ('script', 'style', 'image', etc.)
     */
    preloadResource(url, as = 'script') {
        if (!this.enabled) return;

        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = as;

        document.head.appendChild(link);
    }
}

export default new PreFetchService();