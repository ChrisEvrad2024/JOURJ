// src/services/I18nService.js
class I18nService {
    constructor() {
        this.translations = {};
        this.currentLocale = 'fr-FR'; // Locale par défaut
        this.fallbackLocale = 'fr-FR';
        this.supportedLocales = ['fr-FR', 'en-US', 'es-ES', 'de-DE'];

        // Essayer de charger la locale depuis localStorage
        try {
            const savedLocale = localStorage.getItem('locale');
            if (savedLocale && this.supportedLocales.includes(savedLocale)) {
                this.currentLocale = savedLocale;
            } else {
                // Détecter la langue du navigateur
                const browserLocale = navigator.language;
                const matchedLocale = this.supportedLocales.find(locale =>
                    locale.startsWith(browserLocale.split('-')[0])
                );

                if (matchedLocale) {
                    this.currentLocale = matchedLocale;
                    localStorage.setItem('locale', matchedLocale);
                }
            }
        } catch (error) {
            console.error('Failed to initialize locale:', error);
        }
    }

    /**
     * Charge les traductions pour une locale spécifique
     * @param {string} locale - Code de la locale à charger
     * @returns {Promise<boolean>} - Succès du chargement
     */
    async loadTranslations(locale) {
        if (!this.supportedLocales.includes(locale)) {
            console.error(`Locale ${locale} is not supported`);
            return false;
        }

        if (this.translations[locale]) {
            return true; // Déjà chargé
        }

        try {
            // Dans un environnement réel, on chargerait les traductions depuis un fichier/API
            // Ici on simule le chargement avec un délai
            await new Promise(resolve => setTimeout(resolve, 200));

            // Traductions simulées
            this.translations[locale] = await this.getTranslationsForLocale(locale);
            return true;
        } catch (error) {
            console.error(`Failed to load translations for ${locale}:`, error);
            return false;
        }
    }

    /**
     * Obtient les traductions pour une locale (simulation)
     * @param {string} locale - Code de la locale
     * @returns {Object} - Traductions
     */
    async getTranslationsForLocale(locale) {
        // Dans une application réelle, ces traductions viendraient d'un fichier JSON ou d'une API
        const translations = {
            'fr-FR': {
                common: {
                    welcome: 'Bienvenue chez ChezFLORA',
                    cart: 'Panier',
                    login: 'Connexion',
                    logout: 'Déconnexion',
                    search: 'Rechercher',
                    home: 'Accueil',
                    catalog: 'Catalogue',
                    about: 'À propos',
                    contact: 'Contact'
                },
                product: {
                    addToCart: 'Ajouter au panier',
                    addToWishlist: 'Ajouter aux favoris',
                    inStock: 'En stock',
                    outOfStock: 'Rupture de stock',
                    quantity: 'Quantité'
                },
                // Autres catégories de traductions...
            },
            'en-US': {
                common: {
                    welcome: 'Welcome to ChezFLORA',
                    cart: 'Cart',
                    login: 'Login',
                    logout: 'Logout',
                    search: 'Search',
                    home: 'Home',
                    catalog: 'Catalog',
                    about: 'About',
                    contact: 'Contact'
                },
                product: {
                    addToCart: 'Add to cart',
                    addToWishlist: 'Add to wishlist',
                    inStock: 'In stock',
                    outOfStock: 'Out of stock',
                    quantity: 'Quantity'
                },
                // Autres catégories de traductions...
            },
            'es-ES': {
                common: {
                    welcome: 'Bienvenido a ChezFLORA',
                    cart: 'Carrito',
                    login: 'Iniciar sesión',
                    logout: 'Cerrar sesión',
                    search: 'Buscar',
                    home: 'Inicio',
                    catalog: 'Catálogo',
                    about: 'Sobre nosotros',
                    contact: 'Contacto'
                },
                product: {
                    addToCart: 'Añadir al carrito',
                    addToWishlist: 'Añadir a favoritos',
                    inStock: 'En stock',
                    outOfStock: 'Agotado',
                    quantity: 'Cantidad'
                },
                // Autres catégories de traductions...
            },
            'de-DE': {
                common: {
                    welcome: 'Willkommen bei ChezFLORA',
                    cart: 'Warenkorb',
                    login: 'Anmelden',
                    logout: 'Abmelden',
                    search: 'Suchen',
                    home: 'Startseite',
                    catalog: 'Katalog',
                    about: 'Über uns',
                    contact: 'Kontakt'
                },
                product: {
                    addToCart: 'In den Warenkorb',
                    addToWishlist: 'Zur Wunschliste hinzufügen',
                    inStock: 'Auf Lager',
                    outOfStock: 'Nicht auf Lager',
                    quantity: 'Menge'
                },
                // Autres catégories de traductions...
            }
        };

        return translations[locale] || translations[this.fallbackLocale];
    }

    /**
     * Change la locale courante
     * @param {string} locale - Nouvelle locale
     * @returns {Promise<boolean>} - Succès du changement
     */
    async setLocale(locale) {
        if (!this.supportedLocales.includes(locale)) {
            console.error(`Locale ${locale} is not supported`);
            return false;
        }

        // Charger les traductions si nécessaire
        if (!this.translations[locale]) {
            const success = await this.loadTranslations(locale);
            if (!success) return false;
        }

        this.currentLocale = locale;
        localStorage.setItem('locale', locale);

        // Déclencher un événement pour notifier le changement
        window.dispatchEvent(new CustomEvent('localeChanged', { detail: locale }));

        return true;
    }

    /**
     * Traduit une clé de traduction dans la locale courante
     * @param {string} key - Clé de traduction (format "category.key")
     * @param {Object} params - Paramètres pour les placeholders dans les traductions
     * @returns {string} - Texte traduit
     */
    translate(key, params = {}) {
        if (!key) return '';

        // S'assurer que les traductions pour la locale courante sont chargées
        if (!this.translations[this.currentLocale]) {
            return key; // Fallback à la clé
        }

        // Séparer la catégorie et la clé
        const parts = key.split('.');
        let translation;

        if (parts.length === 1) {
            // Clé simple, chercher directement
            translation = this.translations[this.currentLocale][key];
        } else {
            // Clé avec catégorie, naviguer dans l'objet
            let current = this.translations[this.currentLocale];

            for (const part of parts) {
                if (!current[part]) {
                    return key; // Clé non trouvée
                }
                current = current[part];
            }

            translation = current;
        }

        // Si la traduction n'est pas trouvée, essayer la locale de fallback
        if (!translation && this.currentLocale !== this.fallbackLocale) {
            return this.translateWithFallback(key, params);
        }

        // Si la traduction est une chaîne, remplacer les placeholders
        if (typeof translation === 'string') {
            return this.replacePlaceholders(translation, params);
        }

        return key; // Aucune traduction trouvée
    }

    /**
     * Traduit avec la locale de fallback
     * @param {string} key - Clé de traduction
     * @param {Object} params - Paramètres pour les placeholders
     * @returns {string} - Texte traduit
     */
    translateWithFallback(key, params = {}) {
        if (!this.translations[this.fallbackLocale]) {
            return key;
        }

        // Même logique que translate mais avec la locale de fallback
        const parts = key.split('.');
        let translation;

        if (parts.length === 1) {
            translation = this.translations[this.fallbackLocale][key];
        } else {
            let current = this.translations[this.fallbackLocale];

            for (const part of parts) {
                if (!current[part]) {
                    return key;
                }
                current = current[part];
            }

            translation = current;
        }

        if (typeof translation === 'string') {
            return this.replacePlaceholders(translation, params);
        }

        return key;
    }

    /**
     * Remplace les placeholders dans une chaîne de traduction
     * @param {string} text - Texte avec placeholders
     * @param {Object} params - Paramètres à insérer
     * @returns {string} - Texte avec placeholders remplacés
     */
    replacePlaceholders(text, params) {
        return text.replace(/{(\w+)}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    /**
     * Formate un nombre selon la locale courante
     * @param {number} value - Nombre à formater
     * @param {Object} options - Options de formatage
     * @returns {string} - Nombre formaté
     */
    formatNumber(value, options = {}) {
        return new Intl.NumberFormat(this.currentLocale, options).format(value);
    }

    /**
     * Formate une date selon la locale courante
     * @param {Date|string|number} date - Date à formater
     * @param {Object} options - Options de formatage
     * @returns {string} - Date formatée
     */
    formatDate(date, options = {}) {
        const dateObj = date instanceof Date ? date : new Date(date);
        return new Intl.DateTimeFormat(this.currentLocale, options).format(dateObj);
    }

    /**
     * Formate un prix selon la locale courante
     * @param {number} value - Prix à formater
     * @param {string} currency - Code de la devise (EUR, USD, etc.)
     * @returns {string} - Prix formaté
     */
    formatCurrency(value, currency = 'EUR') {
        return new Intl.NumberFormat(this.currentLocale, {
            style: 'currency',
            currency
        }).format(value);
    }

    /**
     * Obtient les informations sur la locale courante
     * @returns {Object} - Informations sur la locale
     */
    getLocaleInfo() {
        return {
            code: this.currentLocale,
            language: this.currentLocale.split('-')[0],
            country: this.currentLocale.split('-')[1],
            direction: ['ar', 'he', 'fa', 'ur'].includes(this.currentLocale.split('-')[0]) ? 'rtl' : 'ltr'
        };
    }
}

export default new I18nService();