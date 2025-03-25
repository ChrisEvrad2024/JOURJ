/**
 * Configuration de la base de données IndexedDB pour l'application ChezFlora
 */

// Nom de la base de données
export const DB_NAME = 'chezflora_db';

// Version actuelle de la base de données
export const DB_VERSION = 1;

// Noms des object stores (tables)
export const STORES = {
  USERS: 'users',
  PRODUCTS: 'products',
  CART_ITEMS: 'cartItems',
  ORDERS: 'orders',
  WISHLIST: 'wishlist',
  ADDRESSES: 'addresses',
  QUOTES: 'quotes',
  BLOG_POSTS: 'blogPosts',
  BLOG_COMMENTS: 'blogComments',
  CATEGORIES: 'categories'
};

// Clés pour le localStorage et sessionStorage
export const STORAGE_KEYS = {
  CURRENT_USER: 'currentUser',
  AUTH_TOKEN: 'authToken',
  CART: 'cart',
  WISHLIST: 'wishlist',
  THEME: 'theme',
  LANGUAGE: 'language',
  RECENT_PRODUCTS: 'recentProducts',
};

/**
 * Initialise et configure la base de données IndexedDB
 * @param {IDBDatabase} db - L'objet de la base de données
 * @param {IDBVersionChangeEvent} event - L'événement de changement de version
 */
export function initializeDatabase(db, event) {
  const oldVersion = event.oldVersion;
  const newVersion = event.newVersion;
  
  console.log(`Mise à jour de la base de données de la version ${oldVersion} à ${newVersion}`);
  
  // Création des object stores si c'est une nouvelle base de données
  if (oldVersion < 1) {
    // 1. Users store - stockage des utilisateurs
    const usersStore = db.createObjectStore(STORES.USERS, { keyPath: 'id' });
    usersStore.createIndex('email', 'email', { unique: true });
    usersStore.createIndex('role', 'role', { unique: false });
    
    // 2. Products store - catalogue de produits
    const productsStore = db.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' });
    productsStore.createIndex('category', 'category', { unique: false });
    productsStore.createIndex('popular', 'popular', { unique: false });
    productsStore.createIndex('featured', 'featured', { unique: false });
    
    // 3. Cart items store - panier d'achat
    const cartStore = db.createObjectStore(STORES.CART_ITEMS, { keyPath: 'id', autoIncrement: true });
    cartStore.createIndex('userId', 'userId', { unique: false });
    cartStore.createIndex('productId', 'productId', { unique: false });
    
    // 4. Orders store - commandes
    const ordersStore = db.createObjectStore(STORES.ORDERS, { keyPath: 'id' });
    ordersStore.createIndex('userId', 'userId', { unique: false });
    ordersStore.createIndex('status', 'status', { unique: false });
    ordersStore.createIndex('date', 'date', { unique: false });
    
    // 5. Wishlist store - liste de souhaits
    const wishlistStore = db.createObjectStore(STORES.WISHLIST, { keyPath: 'id', autoIncrement: true });
    wishlistStore.createIndex('userId', 'userId', { unique: false });
    wishlistStore.createIndex('productId', 'productId', { unique: false });
    
    // 6. Addresses store - adresses
    const addressesStore = db.createObjectStore(STORES.ADDRESSES, { keyPath: 'id' });
    addressesStore.createIndex('userId', 'userId', { unique: false });
    addressesStore.createIndex('isDefault', 'isDefault', { unique: false });
    addressesStore.createIndex('type', 'type', { unique: false });
    
    // 7. Quotes store - devis personnalisés
    const quotesStore = db.createObjectStore(STORES.QUOTES, { keyPath: 'id' });
    quotesStore.createIndex('userId', 'userId', { unique: false });
    quotesStore.createIndex('status', 'status', { unique: false });
    quotesStore.createIndex('date', 'date', { unique: false });
    
    // 8. Blog posts store - articles du blog
    const blogPostsStore = db.createObjectStore(STORES.BLOG_POSTS, { keyPath: 'id' });
    blogPostsStore.createIndex('category', 'category', { unique: false });
    blogPostsStore.createIndex('author', 'author', { unique: false });
    blogPostsStore.createIndex('date', 'date', { unique: false });
    
    // 9. Blog comments store - commentaires du blog
    const blogCommentsStore = db.createObjectStore(STORES.BLOG_COMMENTS, { keyPath: 'id', autoIncrement: true });
    blogCommentsStore.createIndex('postId', 'postId', { unique: false });
    blogCommentsStore.createIndex('userId', 'userId', { unique: false });
    blogCommentsStore.createIndex('parentId', 'parentId', { unique: false });
    
    // 10. Categories store - catégories de produits
    const categoriesStore = db.createObjectStore(STORES.CATEGORIES, { keyPath: 'id' });
    categoriesStore.createIndex('name', 'name', { unique: true });
  }
  
  // Exemple de migration de la version 1 à 2 (pour les futures mises à jour)
  // if (oldVersion < 2) {
  //   // Modifications pour la version 2
  // }
}