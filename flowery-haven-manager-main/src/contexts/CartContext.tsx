// src/contexts/CartContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { Product } from '@/types/product';
import useCart from '@/hooks/useCart';

// Type pour le contexte
type CartContextType = {
  cartItems: any[];
  cartTotal: number;
  cartCount: number;
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => boolean;
  removeFromCart: (productId: string) => boolean;
  updateItemQuantity: (productId: string, quantity: number) => boolean;
  clearCart: () => boolean;
  createOrder: (orderDetails: any) => Promise<any>;
  refreshCart: () => void;
};

// Créer le contexte
const CartContext = createContext<CartContextType | undefined>(undefined);

// Props pour le fournisseur de contexte
interface CartProviderProps {
  children: ReactNode;
}

// Fournisseur de contexte
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const cart = useCart();
  
  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};