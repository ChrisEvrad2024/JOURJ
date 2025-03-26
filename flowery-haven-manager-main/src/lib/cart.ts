// src/lib/cart.ts
import { Product } from "@/types/product";
import { v4 as uuidv4 } from 'uuid';
import DbService from '@/services/db/DbService';
import { STORES } from '@/services/db/DbConfig';
import ProductService from '@/services/ProductService';
import AuthService from '@/services/AuthService';

// Clés de stockage
const CART_STORAGE_KEY = "cart";
const ANONYMOUS_CART_KEY = "anonymous_cart";

// Types et interfaces
export interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
  productId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ------------------- FONCTIONS POUR UTILISATEURS ANONYMES -------------------

/**
 * Récupère le panier d'un utilisateur anonyme depuis localStorage
 */
export function getAnonymousCart(): CartItem[] {
  try {
    const cartString = localStorage.getItem(ANONYMOUS_CART_KEY);
    return cartString ? JSON.parse(cartString) : [];
  } catch (error) {
    console.error("Failed to parse anonymous cart from localStorage:", error);
    return [];
  }
}

/**
 * Sauvegarde le panier d'un utilisateur anonyme dans localStorage
 */
export function saveAnonymousCart(cart: CartItem[]): void {
  try {
    localStorage.setItem(ANONYMOUS_CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  } catch (error) {
    console.error("Failed to save anonymous cart to localStorage:", error);
  }
}

/**
 * Ajoute un produit au panier anonyme
 */
export function addToAnonymousCart(product: Product, quantity: number = 1): boolean {
  try {
    // Vérifier si le produit est en stock
    if (product.stock !== undefined && product.stock < quantity) {
      throw new Error("Stock insuffisant");
    }
    
    const cart = getAnonymousCart();
    const existingItemIndex = cart.findIndex((item) => item.product.id === product.id);

    if (existingItemIndex !== -1) {
      // Si le produit existe déjà, mettre à jour la quantité
      const newQuantity = cart[existingItemIndex].quantity + quantity;
      
      // Vérifier à nouveau le stock avec la nouvelle quantité
      if (product.stock !== undefined && product.stock < newQuantity) {
        throw new Error("Stock insuffisant pour la quantité demandée");
      }
      
      cart[existingItemIndex].quantity = newQuantity;
    } else {
      // Si le produit n'existe pas, l'ajouter au panier
      cart.push({ product, quantity });
    }

    saveAnonymousCart(cart);
    return true;
  } catch (error) {
    console.error("Error adding to anonymous cart:", error);
    return false;
  }
}

/**
 * Vide le panier anonyme
 */
export function clearAnonymousCart(): void {
  localStorage.removeItem(ANONYMOUS_CART_KEY);
  window.dispatchEvent(new Event('cartUpdated'));
}

// ------------------- FONCTIONS POUR UTILISATEURS CONNECTÉS -------------------

/**
 * Récupère le panier d'un utilisateur connecté depuis la base de données
 */
export async function getUserCart(userId: string): Promise<CartItem[]> {
  try {
    const cartItems = await DbService.getByIndex(STORES.CART_ITEMS, 'userId', userId);
    
    // Enrichir avec les détails des produits
    const enrichedItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ProductService.getProductById(item.productId);
        return {
          ...item,
          product
        };
      })
    );
    
    return enrichedItems;
  } catch (error) {
    console.error("Failed to get user cart from database:", error);
    return [];
  }
}

/**
 * Ajoute un élément au panier de l'utilisateur connecté
 */
export async function addToUserCart(userId: string, product: Product, quantity: number = 1): Promise<boolean> {
  try {
    // Vérifier si le produit est en stock
    if (product.stock !== undefined && product.stock < quantity) {
      throw new Error("Stock insuffisant");
    }
    
    // Vérifier si le produit existe déjà dans le panier
    const userCart = await getUserCart(userId);
    const existingItem = userCart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      // Mettre à jour la quantité
      const newQuantity = existingItem.quantity + quantity;
      
      // Vérifier le stock
      if (product.stock !== undefined && product.stock < newQuantity) {
        throw new Error("Stock insuffisant pour la quantité demandée");
      }
      
      // Mettre à jour dans la base de données
      await DbService.update(STORES.CART_ITEMS, {
        ...existingItem,
        quantity: newQuantity,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Ajouter un nouvel élément
      await DbService.add(STORES.CART_ITEMS, {
        id: uuidv4(),
        userId,
        productId: product.id,
        quantity,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    window.dispatchEvent(new Event('cartUpdated'));
    return true;
  } catch (error) {
    console.error("Failed to add to user cart:", error);
    return false;
  }
}

/**
 * Vide le panier d'un utilisateur connecté
 */
export async function clearUserCart(userId: string): Promise<boolean> {
  try {
    const cartItems = await DbService.getByIndex(STORES.CART_ITEMS, 'userId', userId);
    
    for (const item of cartItems) {
      await DbService.delete(STORES.CART_ITEMS, item.id);
    }
    
    window.dispatchEvent(new Event('cartUpdated'));
    return true;
  } catch (error) {
    console.error("Failed to clear user cart:", error);
    return false;
  }
}

// ------------------- FONCTIONS GÉNÉRIQUES POUR TOUS LES UTILISATEURS -------------------

/**
 * Récupère le panier approprié selon le type d'utilisateur
 */
export function getCart(): CartItem[] | Promise<CartItem[]> {
  const currentUser = AuthService.getCurrentUser();
  
  if (currentUser) {
    // Utilisateur connecté - utiliser IndexedDB
    return getUserCart(currentUser.id);
  } else {
    // Utilisateur anonyme - utiliser localStorage
    return getAnonymousCart();
  }
}

/**
 * Ajoute un produit au panier
 */
export function addToCart(product: Product, quantity: number = 1): boolean | Promise<boolean> {
  const currentUser = AuthService.getCurrentUser();
  
  if (currentUser) {
    // Utilisateur connecté - ajouter à IndexedDB
    return addToUserCart(currentUser.id, product, quantity);
  } else {
    // Utilisateur anonyme - ajouter à localStorage
    return addToAnonymousCart(product, quantity);
  }
}

/**
 * Supprime un produit du panier
 */
export async function removeFromCart(productId: string): Promise<boolean> {
  const currentUser = AuthService.getCurrentUser();
  
  if (currentUser) {
    try {
      const userCart = await getUserCart(currentUser.id);
      const itemToRemove = userCart.find(item => item.product.id === productId);
      
      if (itemToRemove) {
        await DbService.delete(STORES.CART_ITEMS, itemToRemove.id);
        window.dispatchEvent(new Event('cartUpdated'));
      }
      
      return true;
    } catch (error) {
      console.error("Error removing from user cart:", error);
      return false;
    }
  } else {
    try {
      const cart = getAnonymousCart();
      const updatedCart = cart.filter((item) => item.product.id !== productId);
      saveAnonymousCart(updatedCart);
      return true;
    } catch (error) {
      console.error("Error removing from anonymous cart:", error);
      return false;
    }
  }
}

/**
 * Met à jour la quantité d'un produit dans le panier
 */
export async function updateCartItemQuantity(productId: string, quantity: number): Promise<boolean> {
  if (quantity <= 0) {
    return removeFromCart(productId);
  }
  
  const currentUser = AuthService.getCurrentUser();
  
  if (currentUser) {
    try {
      const userCart = await getUserCart(currentUser.id);
      const itemToUpdate = userCart.find(item => item.product.id === productId);
      
      if (!itemToUpdate) {
        throw new Error("Produit non trouvé dans le panier");
      }
      
      // Vérifier le stock
      if (itemToUpdate.product.stock !== undefined && itemToUpdate.product.stock < quantity) {
        throw new Error("Stock insuffisant");
      }
      
      // Mettre à jour dans la base de données
      await DbService.update(STORES.CART_ITEMS, {
        ...itemToUpdate,
        quantity,
        updatedAt: new Date().toISOString()
      });
      
      window.dispatchEvent(new Event('cartUpdated'));
      return true;
    } catch (error) {
      console.error("Error updating user cart item quantity:", error);
      return false;
    }
  } else {
    try {
      const cart = getAnonymousCart();
      const itemIndex = cart.findIndex((item) => item.product.id === productId);
      
      if (itemIndex === -1) {
        throw new Error("Produit non trouvé dans le panier");
      }
      
      // Vérifier le stock
      const product = cart[itemIndex].product;
      if (product.stock !== undefined && product.stock < quantity) {
        throw new Error("Stock insuffisant");
      }
      
      cart[itemIndex].quantity = quantity;
      saveAnonymousCart(cart);
      return true;
    } catch (error) {
      console.error("Error updating anonymous cart item quantity:", error);
      return false;
    }
  }
}

/**
 * Vide le panier
 */
export async function clearCart(): Promise<void> {
  const currentUser = AuthService.getCurrentUser();
  
  if (currentUser) {
    await clearUserCart(currentUser.id);
  } else {
    clearAnonymousCart();
  }
}

/**
 * Transfert le panier anonyme vers un utilisateur connecté
 */
export async function transferAnonymousCartToUser(anonymousCart: CartItem[], userId: string): Promise<boolean> {
  try {
    // Ajouter chaque élément au panier utilisateur
    for (const item of anonymousCart) {
      await addToUserCart(userId, item.product, item.quantity);
    }
    
    // Vider le panier anonyme
    clearAnonymousCart();
    
    return true;
  } catch (error) {
    console.error("Error transferring anonymous cart to user:", error);
    return false;
  }
}

/**
 * Fusion des paniers anonyme et utilisateur
 */
export async function mergeCartItems(anonymousCart: CartItem[], savedCart: CartItem[], userId: string): Promise<boolean> {
  try {
    // Créer un dictionnaire des éléments du panier utilisateur pour un accès plus rapide
    const userCartDict = {};
    savedCart.forEach(item => {
      userCartDict[item.product.id] = item;
    });
    
    // Parcourir le panier anonyme
    for (const anonymousItem of anonymousCart) {
      const productId = anonymousItem.product.id;
      
      if (userCartDict[productId]) {
        // Le produit existe déjà dans le panier utilisateur, mettre à jour la quantité
        const existingItem = userCartDict[productId];
        const newQuantity = existingItem.quantity + anonymousItem.quantity;
        
        // Vérifier le stock
        if (anonymousItem.product.stock !== undefined && anonymousItem.product.stock < newQuantity) {
          // Si pas assez de stock, prendre le maximum possible
          const maxQuantity = anonymousItem.product.stock;
          await updateCartItemQuantity(productId, maxQuantity);
        } else {
          await updateCartItemQuantity(productId, newQuantity);
        }
      } else {
        // Le produit n'existe pas dans le panier utilisateur, l'ajouter
        await addToUserCart(userId, anonymousItem.product, anonymousItem.quantity);
      }
    }
    
    // Vider le panier anonyme
    clearAnonymousCart();
    
    return true;
  } catch (error) {
    console.error("Error merging cart items:", error);
    return false;
  }
}

// ------------------- FONCTIONS UTILITAIRES -------------------

/**
 * Calcule le total du panier
 */
export async function getCartTotal(): Promise<number> {
  const cart = await getCart();
  
  if (Array.isArray(cart)) {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }
  
  return 0;
}

/**
 * Obtient le nombre d'articles dans le panier
 */
export async function getCartItemCount(): Promise<number> {
  const cart = await getCart();
  
  if (Array.isArray(cart)) {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }
  
  return 0;
}

/**
 * Vérifie si un produit est dans le panier
 */
export async function isProductInCart(productId: string): Promise<boolean> {
  const cart = await getCart();
  
  if (Array.isArray(cart)) {
    return cart.some(item => item.product.id === productId);
  }
  
  return false;
}

/**
 * Obtient un élément spécifique du panier
 */
export async function getCartItem(productId: string): Promise<CartItem | undefined> {
  const cart = await getCart();
  
  if (Array.isArray(cart)) {
    return cart.find(item => item.product.id === productId);
  }
  
  return undefined;
}

/**
 * Calcule les frais de livraison
 */
export function getShippingFee(total: number): number {
  // Gratuit au-dessus de 60 euros
  return total >= 60 ? 0 : 7.90;
}

/**
 * Crée une commande à partir du panier
 */
export async function createOrderFromCart(orderDetails: any): Promise<any> {
  try {
    const cart = await getCart();
    
    if (!Array.isArray(cart) || cart.length === 0) {
      throw new Error("Le panier est vide");
    }
    
    // Ici, vous feriez normalement un appel API pour créer la commande
    // Pour notre exemple, nous allons simuler une réponse
    
    const orderItems = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      total: item.product.price * item.quantity
    }));
    
    const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    const shippingFee = getShippingFee(subtotal);
    
    const order = {
      id: `ORD-${Date.now()}`,
      orderNumber: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      items: orderItems,
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
      status: 'pending',
      ...orderDetails,
      createdAt: new Date().toISOString()
    };
    
    // Dans une application réelle, vous enregistreriez la commande dans la base de données
    
    // Vider le panier après création de la commande
    await clearCart();
    
    return order;
  } catch (error) {
    console.error("Error creating order from cart:", error);
    throw error;
  }
}