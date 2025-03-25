// src/hooks/useTranslation.js
import { useState, useEffect } from 'react';
import I18nService from '../services/I18nService';

export const useTranslation = () => {
    const [locale, setLocale] = useState(I18nService.currentLocale);

    useEffect(() => {
        // S'assurer que les traductions sont chargées
        I18nService.loadTranslations(locale);

        // Écouter les changements de locale
        const handleLocaleChange = (event) => {
            setLocale(event.detail);
        };

        window.addEventListener('localeChanged', handleLocaleChange);

        return () => {
            window.removeEventListener('localeChanged', handleLocaleChange);
        };
    }, [locale]);

    const changeLocale = async (newLocale) => {
        const success = await I18nService.setLocale(newLocale);
        return success;
    };

    return {
        // Fonction de traduction
        t: (key, params) => I18nService.translate(key, params),

        // Formatage
        formatNumber: I18nService.formatNumber.bind(I18nService),
        formatDate: I18nService.formatDate.bind(I18nService),
        formatCurrency: I18nService.formatCurrency.bind(I18nService),

        // Gestion de la locale
        locale,
        changeLocale,
        supportedLocales: I18nService.supportedLocales,
        localeInfo: I18nService.getLocaleInfo()
    };
};