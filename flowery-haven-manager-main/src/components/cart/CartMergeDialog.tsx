// src/components/cart/CartMergeDialog.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CartService } from '@/services';
import StorageService from '@/services/StorageService';

const CartMergeDialog = () => {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState('merge');
  const [mergeData, setMergeData] = useState(null);
  
  // Écouter l'événement pour afficher le dialogue
  useEffect(() => {
    const handleShowDialog = () => {
      const pendingMerge = StorageService.getSessionStorageItem('pendingCartMerge');
      if (pendingMerge) {
        setMergeData(pendingMerge);
        setOpen(true);
      }
    };
    
    window.addEventListener('showCartMergeDialog', handleShowDialog);
    
    // Vérifier au montage du composant
    handleShowDialog();
    
    return () => {
      window.removeEventListener('showCartMergeDialog', handleShowDialog);
    };
  }, []);
  
  // Gérer la confirmation de l'utilisateur
  const handleConfirm = async () => {
    if (!mergeData) return;
    
    const { anonymousCart, savedCart, userId } = mergeData;
    
    try {
      switch (choice) {
        case 'merge':
          await CartService.mergeCartItems(anonymousCart, savedCart, userId);
          break;
        case 'keep-anonymous':
          await CartService.clearUserCart(userId);
          await CartService.transferAnonymousCartToUser(anonymousCart, userId);
          break;
        case 'keep-saved':
          CartService.clearAnonymousCart();
          break;
      }
      
      // Supprimer les données temporaires
      StorageService.removeSessionStorageItem('pendingCartMerge');
      
      // Notifier les composants que le panier a changé
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Fermer le dialogue
      setOpen(false);
    } catch (error) {
      console.error('Erreur lors de la fusion des paniers:', error);
      // Gérer l'erreur (afficher une notification, etc.)
    }
  };
  
  if (!mergeData) return null;
  
  const { anonymousCart, savedCart } = mergeData;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Articles dans votre panier</DialogTitle>
          <DialogDescription>
            Nous avons détecté des articles dans votre panier actuel et d'autres articles 
            enregistrés dans votre compte. Que souhaitez-vous faire?
          </DialogDescription>
        </DialogHeader>
        
        <RadioGroup value={choice} onValueChange={setChoice}>
          <div className="space-y-4 py-4">
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="merge" id="merge" />
              <Label htmlFor="merge" className="cursor-pointer">
                <span className="font-medium">Fusionner les paniers</span>
                <p className="text-muted-foreground text-sm">
                  Combiner les articles des deux paniers ({anonymousCart.length + savedCart.length} articles au total)
                </p>
              </Label>
            </div>
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="keep-anonymous" id="keep-anonymous" />
              <Label htmlFor="keep-anonymous" className="cursor-pointer">
                <span className="font-medium">Conserver le panier actuel</span>
                <p className="text-muted-foreground text-sm">
                  Garder uniquement les {anonymousCart.length} articles ajoutés récemment
                </p>
              </Label>
            </div>
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="keep-saved" id="keep-saved" />
              <Label htmlFor="keep-saved" className="cursor-pointer">
                <span className="font-medium">Utiliser mon panier enregistré</span>
                <p className="text-muted-foreground text-sm">
                  Restaurer les {savedCart.length} articles enregistrés précédemment
                </p>
              </Label>
            </div>
          </div>
        </RadioGroup>
        
        <DialogFooter>
          <Button onClick={handleConfirm}>Confirmer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CartMergeDialog;