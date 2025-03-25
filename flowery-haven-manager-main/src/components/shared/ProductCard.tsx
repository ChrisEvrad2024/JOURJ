import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { ShoppingBag, Heart, CheckCircle, XCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [inWishlist, setInWishlist] = useState(isInWishlist(product.id));

  const quickAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Utiliser le hook pour ajouter au panier au lieu de la fonction de lib
    const success = addToCart(product, 1);
    
    if (success !== false) {
      toast.success("Ajouté au panier", {
        description: `${product.name} a été ajouté à votre panier.`,
        duration: 3000,
      });
    }
  };
  
  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inWishlist) {
      removeFromWishlist(product.id);
      setInWishlist(false);
      toast.info("Retiré des favoris", {
        description: `${product.name} a été retiré de vos favoris.`,
        duration: 3000,
      });
    } else {
      // Vérification que les images existent avant d'accéder à images[0]
      const productImage = product.images && product.images.length > 0 
        ? product.images[0] 
        : '/placeholder.svg';
        
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: productImage
      });
      setInWishlist(true);
      toast.success("Ajouté aux favoris", {
        description: `${product.name} a été ajouté à vos favoris.`,
        duration: 3000,
      });
    }
  };

  const isInStock = product.stock === undefined || product.stock > 0;

  // Récupérer l'image sécurisée
  const productImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/placeholder.svg';

  return (
    <div 
      className="product-card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="product-image-wrapper rounded-lg overflow-hidden relative aspect-[3/4]">
          <img 
            src={productImage} 
            alt={product.name}
            className={`product-image w-full h-full object-cover transition-transform hover:scale-105 duration-700 ${!isInStock ? 'opacity-70' : ''}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          
          {/* Stock indicator */}
          {product.stock !== undefined && (
            <div className="absolute top-2 right-2 z-10">
              {product.stock > 0 ? (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                  <CheckCircle size={12} className="mr-1" />
                  En stock
                </span>
              ) : (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                  <XCircle size={12} className="mr-1" />
                  Rupture
                </span>
              )}
            </div>
          )}
          
          {/* Quick action overlay */}
          <div 
            className={`absolute inset-0 bg-black/5 flex items-center justify-center gap-3 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button 
              onClick={quickAddToCart}
              className={`bg-white text-primary hover:bg-primary hover:text-white transition-colors duration-300 rounded-full p-3 shadow-md transform translate-y-2 group-hover:translate-y-0 ${!isInStock ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Ajouter au panier"
              disabled={!isInStock}
            >
              <ShoppingBag size={20} />
            </button>
            
            <button 
              onClick={toggleWishlist}
              className={`${inWishlist ? 'bg-primary text-white' : 'bg-white text-primary'} hover:bg-primary hover:text-white transition-colors duration-300 rounded-full p-3 shadow-md transform translate-y-2 group-hover:translate-y-0`}
              aria-label={inWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <h3 className="font-serif text-lg font-medium">{product.name}</h3>
          <p className="mt-1 text-primary font-medium">{product.price?.toFixed(2) || "0.00"} XAF</p>
          {!isInStock && (
            <p className="text-xs text-red-500 mt-1">Rupture de stock</p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;