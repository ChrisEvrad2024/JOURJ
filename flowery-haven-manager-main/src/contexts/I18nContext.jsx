// src/contexts/I18nContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import I18nService from '../services/I18nService';

export const I18nContext = createContext();

export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState(I18nService.currentLocale);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Charger les traductions initiales
    const initTranslations = async () => {
      setIsLoading(true);
      await I18nService.loadTranslations(I18nService.currentLocale);
      setIsLoading(false);
    };

    initTranslations();

    // Écouter les changements de locale
    const handleLocaleChange = (event) => {
      setLocale(event.detail);
    };
    
    window.addEventListener('localeChanged', handleLocaleChange);
    
    return () => {
      window.removeEventListener('localeChanged', handleLocaleChange);
    };
  }, []);

  const changeLocale = async (newLocale) => {
    setIsLoading(true);
    const success = await I18nService.setLocale(newLocale);
    setIsLoading(false);
    return success;
  };

  const value = {
    locale,
    changeLocale,
    isLoading,
    t: (key, params) => I18nService.translate(key, params),
    formatNumber: I18nService.formatNumber.bind(I18nService),
    formatDate: I18nService.formatDate.bind(I18nService),
    formatCurrency: I18nService.formatCurrency.bind(I18nService),
    supportedLocales: I18nService.supportedLocales,
    localeInfo: I18nService.getLocaleInfo()
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = React.useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};