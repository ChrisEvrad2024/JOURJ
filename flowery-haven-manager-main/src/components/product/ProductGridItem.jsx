// src/components/product/ProductGridItem.jsx
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';
import OptimizedImage from '../common/OptimizedImage';
import { Heart, ShoppingBag } from 'lucide-react';

const ProductGridItem = memo(({ 
  product, 
  onAddToCart, 
  onAddToWishlist, 
  isInWishlist 
}) => {
  const { t, formatCurrency } = useI18n();
  
  // Vérifier si le produit est en stock
  const isInStock = product.stock === undefined || product.stock > 0;
  
  // Ne déclencher un re-rendu que si les props essentielles changent
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInStock && onAddToCart) {
      onAddToCart(product);
    }
  };
  
  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onAddToWishlist) {
      onAddToWishlist(product);
    }
  };
  
  return (
    <div className="product-card group animate-fade-in">
      <Link to={`/product/${product.id}`} className="block">
        <div className="product-image-wrapper rounded-lg overflow-hidden relative aspect-[3/4]">
          <OptimizedImage
            src={product.images[0]}
            alt={product.name}
            width={300}
            height={400}
            fit="cover"
            className={!isInStock ? 'opacity-70' : ''}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {/* Stock indicator */}
          {product.stock !== undefined && (
            <div className="absolute top-2 right-2 z-10">
              {product.stock > 0 ? (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                  {t('product.inStock')}
                </span>
              ) : (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                  {t('product.outOfStock')}
                </span>
              )}
            </div>
          )}
          
          {/* Quick action buttons */}
          <div 
            className="absolute inset-0 bg-black/5 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <button 
              onClick={handleAddToCart}
              className={`bg-white text-primary hover:bg-primary hover:text-white transition-colors duration-300 rounded-full p-3 shadow-md transform translate-y-2 group-hover:translate-y-0 ${!isInStock ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label={t('product.addToCart')}
              disabled={!isInStock}
            >
              <ShoppingBag size={20} />
            </button>
            
            <button 
              onClick={handleToggleWishlist}
              className={`${isInWishlist ? 'bg-primary text-white' : 'bg-white text-primary'} hover:bg-primary hover:text-white transition-colors duration-300 rounded-full p-3 shadow-md transform translate-y-2 group-hover:translate-y-0`}
              aria-label={isInWishlist ? t('product.removeFromWishlist') : t('product.addToWishlist')}
            >
              <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <h3 className="font-serif text-lg font-medium">{product.name}</h3>
          <p className="mt-1 text-primary font-medium">{formatCurrency(product.price)}</p>
          {!isInStock && (
            <p className="text-xs text-red-500 mt-1">{t('product.outOfStock')}</p>
          )}
        </div>
      </Link>
    </div>
  );
}, (prevProps, nextProps) => {
  // Optimisation des performances avec une fonction de comparaison personnalisée
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.isInWishlist === nextProps.isInWishlist &&
    prevProps.product.stock === nextProps.product.stock &&
    prevProps.product.price === nextProps.product.price
  );
});

ProductGridItem.displayName = 'ProductGridItem';

export default ProductGridItem;