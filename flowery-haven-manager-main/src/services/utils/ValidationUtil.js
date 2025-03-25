// src/services/utils/ValidationUtil.js
class ValidationUtil {
    /**
     * Valide que tous les champs requis sont présents
     * @param {Object} data - Données à valider
     * @param {Array<string>} requiredFields - Liste des champs requis
     * @throws {Error} - Si un champ requis est manquant
     */
    validateRequiredFields(data, requiredFields) {
        for (const field of requiredFields) {
            if (data[field] === undefined || data[field] === null || data[field] === '') {
                throw new Error(`Le champ "${field}" est requis`);
            }
        }
    }

    /**
     * Valide une adresse email
     * @param {string} email - Email à valider
     * @returns {boolean} - Vrai si l'email est valide
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Valide la force d'un mot de passe
     * @param {string} password - Mot de passe à valider
     * @returns {boolean} - Vrai si le mot de passe est assez fort
     */
    isStrongPassword(password) {
        // Au moins 8 caractères, une majuscule, une minuscule et un chiffre
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    }

    /**
     * Valide un numéro de téléphone (format international)
     * @param {string} phone - Numéro de téléphone à valider
     * @returns {boolean} - Vrai si le numéro est valide
     */
    isValidPhoneNumber(phone) {
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Valide un code postal français
     * @param {string} postalCode - Code postal à valider
     * @returns {boolean} - Vrai si le code postal est valide
     */
    isValidPostalCode(postalCode) {
        const postalCodeRegex = /^[0-9]{5}$/;
        return postalCodeRegex.test(postalCode);
    }

    /**
     * Valide une carte de crédit
     * @param {string} cardNumber - Numéro de carte à valider
     * @returns {boolean} - Vrai si le numéro est valide
     */
    isValidCreditCard(cardNumber) {
        // Algorithme de Luhn (simplifié)
        cardNumber = cardNumber.replace(/\D/g, '');

        if (!/^\d+$/.test(cardNumber)) return false;
        if (cardNumber.length < 13 || cardNumber.length > 19) return false;

        let sum = 0;
        let shouldDouble = false;

        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i));

            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }

            sum += digit;
            shouldDouble = !shouldDouble;
        }

        return sum % 10 === 0;
    }
}

export default new ValidationUtil();