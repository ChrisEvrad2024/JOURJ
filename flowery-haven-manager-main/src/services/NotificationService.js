// src/services/NotificationService.js
import { toast } from 'sonner';

class NotificationService {
    /**
     * Affiche une notification de succès
     * @param {string} title - Titre de la notification
     * @param {string} message - Message détaillé (optionnel)
     * @param {number} duration - Durée d'affichage en ms
     */
    showSuccess(title, message = '', duration = 3000) {
        toast.success(title, {
            description: message,
            duration,
        });
    }

    /**
     * Affiche une notification d'erreur
     * @param {string} title - Titre de la notification
     * @param {string|Error} error - Message d'erreur ou objet Error
     * @param {number} duration - Durée d'affichage en ms
     */
    showError(title, error = '', duration = 5000) {
        const errorMessage = error instanceof Error ? error.message : error;

        toast.error(title, {
            description: errorMessage || 'Une erreur inattendue est survenue',
            duration,
        });

        // Log l'erreur en console pour débogage
        if (error instanceof Error) {
            console.error(`${title}:`, error);
        } else {
            console.error(`${title}: ${errorMessage}`);
        }
    }

    /**
     * Affiche une notification d'information
     * @param {string} title - Titre de la notification
     * @param {string} message - Message détaillé (optionnel)
     * @param {number} duration - Durée d'affichage en ms
     */
    showInfo(title, message = '', duration = 3000) {
        toast.info(title, {
            description: message,
            duration,
        });
    }

    /**
     * Affiche une notification d'avertissement
     * @param {string} title - Titre de la notification
     * @param {string} message - Message détaillé (optionnel)
     * @param {number} duration - Durée d'affichage en ms
     */
    showWarning(title, message = '', duration = 4000) {
        toast.warning(title, {
            description: message,
            duration,
        });
    }

    /**
     * Gère les erreurs d'API de manière uniforme
     * @param {Error} error - L'erreur à traiter
     * @param {string} fallbackMessage - Message par défaut si l'erreur n'a pas de message
     */
    handleError(error, fallbackMessage = 'Une erreur est survenue') {
        if (error.name === 'NetworkError') {
            this.showError('Erreur de connexion', 'Vérifiez votre connexion internet et réessayez.');
        } else if (error.name === 'AuthorizationError') {
            this.showError('Accès non autorisé', 'Vous n\'avez pas les permissions nécessaires.');
        } else if (error.name === 'ValidationError') {
            this.showError('Erreur de validation', error.message || 'Les données fournies sont invalides.');
        } else {
            this.showError('Erreur', error.message || fallbackMessage);
        }
    }
}

export default new NotificationService();