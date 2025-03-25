// Import and re-export all services
import DbService from './db/DbService';
import StorageService from './StorageService';
import AuthService from './AuthService';
import ProductService from './ProductService';
import CartService from './CartService';
import WishlistService from './WishlistService';
import AddressService from './AddressService';
import OrderService from './OrderService';
import QuoteService from './QuoteService';
import BlogService from './BlogService';
import AppInitializationService from './AppInitializationService';
export { default as OfflineService } from './OfflineService';
export { default as SyncService } from './SyncService';

// Import configuration
import { DB_NAME, DB_VERSION, STORES, STORAGE_KEYS } from './db/DbConfig';

// Export all services
export {
    DbService,
    StorageService,
    AuthService,
    ProductService,
    CartService,
    WishlistService,
    AddressService,
    OrderService,
    QuoteService,
    BlogService,
    AppInitializationService,
    // Export configuration
    DB_NAME,
    DB_VERSION,
    STORES,
    STORAGE_KEYS
};

// Export default for convenience
export default {
    DbService,
    StorageService,
    AuthService,
    ProductService,
    CartService,
    WishlistService,
    AddressService,
    OrderService,
    QuoteService,
    BlogService,
    AppInitializationService
};