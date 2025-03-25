// src/services/AnalyticsService.js
class AnalyticsService {
    constructor() {
        this.events = [];
        this.sessionId = this.generateSessionId();
        this.isEnabled = true;

        // Charger les préférences utilisateur
        try {
            const analyticsEnabled = localStorage.getItem('analyticsEnabled');
            if (analyticsEnabled !== null) {
                this.isEnabled = analyticsEnabled === 'true';
            }
        } catch (error) {
            console.warn('Failed to load analytics preferences:', error);
        }

        // Enregistrer les événements pour l'envoi différé
        window.addEventListener('beforeunload', () => {
            if (this.isEnabled && this.events.length > 0) {
                this.saveEvents();
            }
        });

        // Essayer d'envoyer les événements stockés
        this.sendStoredEvents();
    }

    /**
     * Génère un ID de session unique
     * @returns {string} - ID de session
     */
    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Active ou désactive l'analytics
     * @param {boolean} isEnabled - True pour activer, false pour désactiver
     */
    setEnabled(isEnabled) {
        this.isEnabled = isEnabled;
        localStorage.setItem('analyticsEnabled', isEnabled.toString());

        if (!isEnabled) {
            this.events = [];
            this.clearStoredEvents();
        }
    }

    /**
     * Enregistre un événement utilisateur
     * @param {string} eventName - Nom de l'événement
     * @param {Object} eventData - Données associées à l'événement
     */
    trackEvent(eventName, eventData = {}) {
        if (!this.isEnabled) return;

        const event = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            name: eventName,
            data: eventData
        };

        this.events.push(event);

        // Si on atteint un certain nombre d'événements, on les envoie
        if (this.events.length >= 10) {
            this.sendEvents();
        }
    }

    /**
     * Enregistre une page vue
     * @param {string} pageName - Nom de la page
     * @param {Object} pageData - Données additionnelles
     */
    trackPageView(pageName, pageData = {}) {
        this.trackEvent('page_view', {
            page: pageName,
            url: window.location.href,
            referrer: document.referrer,
            ...pageData
        });
    }

    /**
     * Enregistre un clic
     * @param {string} elementId - ID ou descripteur de l'élément cliqué
     * @param {Object} clickData - Données additionnelles
     */
    trackClick(elementId, clickData = {}) {
        this.trackEvent('click', {
            element: elementId,
            ...clickData
        });
    }

    /**
     * Enregistre une conversion (achat, inscription, etc.)
     * @param {string} conversionType - Type de conversion
     * @param {Object} conversionData - Données de conversion
     */
    trackConversion(conversionType, conversionData = {}) {
        this.trackEvent('conversion', {
            type: conversionType,
            ...conversionData
        });
    }

    /**
     * Envoie les événements au serveur
     * @returns {Promise<void>}
     */
    async sendEvents() {
        if (!this.isEnabled || this.events.length === 0) return;

        const eventsToSend = [...this.events];
        this.events = [];

        try {
            // En situation réelle, on enverrait ces données à un serveur
            // Ici on simule un envoi réussi
            console.log('Sending analytics events:', eventsToSend);

            // Simulation d'un délai réseau
            await new Promise(resolve => setTimeout(resolve, 300));

            return true;
        } catch (error) {
            console.error('Failed to send analytics events:', error);

            // En cas d'échec, stocker pour réessayer plus tard
            this.storeEvents(eventsToSend);
            return false;
        }
    }

    /**
     * Stocke les événements dans localStorage pour envoi ultérieur
     * @param {Array} events - Événements à stocker
     */
    storeEvents(events) {
        try {
            const storedEvents = this.getStoredEvents();
            const updatedEvents = [...storedEvents, ...events];

            // Limiter le nombre d'événements stockés pour éviter de dépasser les limites de localStorage
            const limitedEvents = updatedEvents.slice(-100);

            localStorage.setItem('analyticsEvents', JSON.stringify(limitedEvents));
        } catch (error) {
            console.error('Failed to store analytics events:', error);
        }
    }

    /**
     * Récupère les événements stockés dans localStorage
     * @returns {Array} - Événements stockés
     */
    getStoredEvents() {
        try {
            const storedEvents = localStorage.getItem('analyticsEvents');
            return storedEvents ? JSON.parse(storedEvents) : [];
        } catch (error) {
            console.error('Failed to retrieve stored analytics events:', error);
            return [];
        }
    }

    /**
     * Supprime les événements stockés dans localStorage
     */
    clearStoredEvents() {
        try {
            localStorage.removeItem('analyticsEvents');
        } catch (error) {
            console.error('Failed to clear stored analytics events:', error);
        }
    }

    /**
     * Sauvegarde les événements actuels dans localStorage
     */
    saveEvents() {
        if (this.events.length === 0) return;
        this.storeEvents(this.events);
        this.events = [];
    }

    /**
     * Tente d'envoyer les événements stockés dans localStorage
     */
    async sendStoredEvents() {
        if (!this.isEnabled) return;

        const storedEvents = this.getStoredEvents();
        if (storedEvents.length === 0) return;

        try {
            // En situation réelle, on enverrait ces données à un serveur
            console.log('Sending stored analytics events:', storedEvents);

            // Simulation d'un délai réseau
            await new Promise(resolve => setTimeout(resolve, 300));

            // Si l'envoi réussit, supprimer les événements stockés
            this.clearStoredEvents();
        } catch (error) {
            console.error('Failed to send stored analytics events:', error);
        }
    }
}

export default new AnalyticsService();