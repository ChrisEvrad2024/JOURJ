// src/components/common/OfflineIndicator.jsx
import { useState, useEffect } from 'react';
import { useOffline } from '../../hooks/useOffline';
import { Wifi, WifiOff, Cloud, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const OfflineIndicator = () => {
  const { isOnline, pendingCount, syncPendingOperations } = useOffline();
  const [isVisible, setIsVisible] = useState(!isOnline || pendingCount > 0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Afficher si hors ligne ou s'il y a des opérations en attente
    setIsVisible(!isOnline || pendingCount > 0);
  }, [isOnline, pendingCount]);

  const handleSync = async () => {
    if (!isOnline) {
      toast.error("Vous êtes hors ligne", {
        description: "Impossible de synchroniser. Veuillez vérifier votre connexion."
      });
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const result = await syncPendingOperations();
      if (result.success) {
        if (result.synced > 0) {
          toast.success("Synchronisation réussie", {
            description: `${result.synced} opération(s) synchronisée(s)`
          });
        }
      } else {
        toast.error("Synchronisation partielle", {
          description: `${result.synced} synchronisée(s), ${result.failed} échouée(s)`
        });
      }
    } catch (error) {
      toast.error("Échec de la synchronisation", {
        description: error.message || "Une erreur est survenue"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Ne rien afficher si tout est en ligne et synchronisé
  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${isOnline ? 'bg-amber-100' : 'bg-red-100'} rounded-lg shadow-lg p-3 flex items-center justify-between max-w-xs w-full transition-all`}>
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="text-amber-600 h-5 w-5" />
        ) : (
          <WifiOff className="text-red-600 h-5 w-5" />
        )}
        
        <div>
          <p className="text-sm font-medium">
            {isOnline ? "En ligne" : "Hors ligne"}
          </p>
          {pendingCount > 0 && (
            <p className="text-xs">
              {pendingCount} opération{pendingCount > 1 ? 's' : ''} en attente
            </p>
          )}
        </div>
      </div>
      
      {isOnline && pendingCount > 0 && (
        <Button 
          size="sm" 
          variant="ghost" 
          className="flex items-center gap-1"
          disabled={isSyncing}
          onClick={handleSync}
        >
          {isSyncing ? (
            <div className="animate-spin h-3 w-3 border border-current rounded-full border-t-transparent" />
          ) : (
            <Cloud className="h-4 w-4" />
          )}
          Sync
        </Button>
      )}
    </div>
  );
};

export default OfflineIndicator;