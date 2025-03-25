// src/hooks/useOffline.ts
import { useState, useEffect } from 'react';

export const useOffline = () => {
    const [isOffline, setIsOffline] = useState(false);
    const [offlineMode, setOfflineMode] = useState(false);

    // Vérifie si le navigateur est en ligne
    useEffect(() => {
        const updateOnlineStatus = () => {
            setIsOffline(!navigator.onLine);
        };

        // Initialiser le statut
        updateOnlineStatus();

        // Écouter les changements de connectivité
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    // Activer le mode hors ligne manuellement
    const enableOfflineMode = () => {
        setOfflineMode(true);
        localStorage.setItem('offlineMode', 'true');
        window.dispatchEvent(new CustomEvent('offlineStatusChanged', { detail: true }));
    };

    // Désactiver le mode hors ligne
    const disableOfflineMode = () => {
        setOfflineMode(false);
        localStorage.setItem('offlineMode', 'false');
        window.dispatchEvent(new CustomEvent('offlineStatusChanged', { detail: false }));
    };

    // Vérifier s'il y a des données à synchroniser
    const hasPendingSync = () => {
        return false; // Factice pour le moment
    };

    // Synchroniser les données
    const syncData = async () => {
        console.log('Simulation de synchronisation');
        return true; // Factice pour le moment
    };

    return {
        isOffline: isOffline || offlineMode,
        offlineMode,
        enableOfflineMode,
        disableOfflineMode,
        hasPendingSync,
        syncData
    };
};

export default useOffline;