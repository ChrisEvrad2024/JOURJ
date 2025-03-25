import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ProductService } from '@/services';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/shared/ProductCard';
import { Minus, Plus, ShoppingBag, Heart, Share2, ArrowLeft, CheckCircle, XCircle, Facebook, Twitter, Linkedin, Copy } from 'lucide-react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist'; // Correction de l'extension

// Mock color options for demonstration
const COLORS = [
  { name: 'Rouge', value: '#DC2626' },
  { name: 'Rose', value: '#EC4899' },
  { name: 'Blanc', value: '#F9FAFB' },
  { name: 'Jaune', value: '#FBBF24' },
  { name: 'Bleu', value: '#3B82F6' },
];

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  
  // Utiliser nos hooks personnalisés
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  useEffect(() => {
    const fetchProduct = async () => {
      // Reset scroll position when navigating to a new product
      window.scrollTo(0, 0);

      if (!id) {
        setError("ID du produit manquant");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Récupérer le produit
        const productData = await ProductService.getProductById(id);
        if (!productData) {
          setError("Produit non trouvé");
          setLoading(false);
          return;
        }
        
        setProduct(productData);
        setQuantity(1);
        setSelectedImage(0);
        setSelectedColor(COLORS[0]);
        
        // Récupérer les produits récemment vus (exclure le produit actuel)
        const viewedProducts = ProductService.getRecentlyViewedProducts();
        setRecentlyViewed(viewedProducts.filter(item => item.id !== id));
        
        // Récupérer les produits liés (même catégorie)
        try {
          const categoryProducts = await ProductService.getProductsByCategory(productData.category);
          setRelatedProducts(categoryProducts.filter(p => p.id !== id).slice(0, 4));
        } catch (categoryError) {
          console.error('Error fetching related products:', categoryError);
          setRelatedProducts([]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError("Erreur lors du chargement du produit");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-16 min-h-screen">
          <div className="container mx-auto px-4 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <p>Chargement du produit...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  if (error || !product) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-16 min-h-screen">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-serif mb-4">Produit non trouvé</h1>
            <p className="mb-8">{error || "Le produit que vous recherchez n'existe pas ou a été retiré."}</p>
            <Link to="/catalog" className="btn-primary inline-flex">
              Retour à la boutique
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  const isInStock = product.stock === undefined || (product.stock || 0) > 0;
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    // Limit quantity to stock level if stock is defined
    if (product.stock !== undefined && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else if (product.stock === undefined) {
      setQuantity(quantity + 1);
    } else {
      toast.error("Quantité maximale atteinte", {
        description: "Vous avez atteint le maximum de stock disponible.",
        duration: 3000,
      });
    }
  };
  
  const handleAddToCart = () => {
    if (product && isInStock) {
      const success = addToCart(product, quantity);
      if (success !== false) {
        toast.success("Ajouté au panier", {
          description: `${product.name} (${quantity}) a été ajouté à votre panier.`,
          duration: 3000,
        });
      }
    } else {
      toast.error("Produit en rupture de stock", {
        description: "Ce produit n'est actuellement pas disponible.",
        duration: 3000,
      });
    }
  };
  
  const toggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.info("Retiré des favoris", {
        description: `${product.name} a été retiré de vos favoris.`,
        duration: 3000,
      });
    } else {
      addToWishlist(product);
      toast.success("Ajouté aux favoris", {
        description: `${product.name} a été ajouté à vos favoris.`,
        duration: 3000,
      });
    }
  };
  
  const shareProduct = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsLinkCopied(true);
    toast.success("Lien copié !", {
      description: "Le lien du produit a été copié dans le presse-papier.",
      duration: 3000,
    });
    
    setTimeout(() => {
      setIsLinkCopied(false);
    }, 3000);
  };
  
  const shareToSocial = (platform: 'facebook' | 'twitter' | 'linkedin') => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Découvrez ${product.name} - ChezFlora`);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };
  
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Retour
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[selectedImage]} 
                    alt={product.name}
                    className={`w-full h-full object-cover animate-fade-in ${!isInStock ? 'opacity-70' : ''}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/f9fafb/a1a1a9?text=Image+non+disponible';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <p className="text-gray-400">Image non disponible</p>
                  </div>
                )}
              </div>
              
              {product.images && product.images.length > 1 && (
                <div className="flex gap-4 flex-wrap">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      className={`aspect-square rounded-md overflow-hidden w-20 border-2 transition-all ${
                        selectedImage === index ? 'border-primary' : 'border-transparent'
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img 
                        src={image} 
                        alt={`${product.name} - vue ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/f9fafb/a1a1a9?text=Image+non+disponible';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl lg:text-4xl font-serif font-medium mb-2">{product.name}</h1>
                  
                  {/* Stock indicator */}
                  {product.stock !== undefined && (
                    <div className="flex-shrink-0">
                      {product.stock > 0 ? (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                          <CheckCircle size={12} className="mr-1" />
                          En stock
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                          <XCircle size={12} className="mr-1" />
                          Rupture
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-2xl text-primary font-medium">{product.price?.toFixed(2)} €</p>
                
                {/* SKU */}
                {product.sku && (
                  <p className="text-sm text-muted-foreground mt-2">
                    SKU: <span className="font-medium">{product.sku}</span>
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
              
              {/* Color selector */}
              <div>
                <h3 className="font-medium mb-4">Couleur</h3>
                <div className="flex gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color.name}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedColor.name === color.name ? 'ring-2 ring-offset-2 ring-primary' : ''
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setSelectedColor(color)}
                      aria-label={color.name}
                    >
                      {selectedColor.name === color.name && (
                        <CheckCircle size={16} className={`text-${color.name === 'Blanc' ? 'black' : 'white'}`} />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Couleur sélectionnée: <span className="font-medium">{selectedColor.name}</span>
                </p>
              </div>
              
              {/* Product details if available */}
              {(product.weight || product.dimensions) && (
                <div>
                  <h3 className="font-medium mb-2">Détails du produit</h3>
                  <ul className="space-y-1 text-sm">
                    {product.weight && (
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Poids:</span>
                        <span>{product.weight} kg</span>
                      </li>
                    )}
                    {product.dimensions && (
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Dimensions:</span>
                        <span>
                          {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
              
              <div className="pt-4">
                <h3 className="font-medium mb-4">Quantité</h3>
                <div className="flex items-center">
                  <button 
                    className="border border-border rounded-l-md p-3 hover:bg-muted transition-colors"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <div className="border-t border-b border-border px-6 py-2 flex items-center justify-center min-w-[60px]">
                    {quantity}
                  </div>
                  <button 
                    className="border border-border rounded-r-md p-3 hover:bg-muted transition-colors"
                    onClick={increaseQuantity}
                    disabled={product.stock !== undefined && quantity >= product.stock}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                {/* Display available stock if defined */}
                {product.stock !== undefined && product.stock > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {product.stock} unités disponibles
                  </p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  className={`btn-primary flex-1 flex items-center justify-center gap-2 ${
                    !isInStock ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={handleAddToCart}
                  disabled={!isInStock}
                >
                  <ShoppingBag size={18} /> Ajouter au panier
                </button>
                <button 
                  className={`btn-ghost flex items-center justify-center gap-2 ${isInWishlist(product.id) ? 'border-primary text-primary' : ''}`}
                  onClick={toggleWishlist}
                >
                  <Heart size={18} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} /> Favoris
                </button>
              </div>
              
              <Separator className="my-4" />
              
              {/* Social sharing */}
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium">Partager:</span>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => shareToSocial('facebook')}
                    aria-label="Partager sur Facebook"
                    className="rounded-full"
                  >
                    <Facebook size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => shareToSocial('twitter')}
                    aria-label="Partager sur Twitter"
                    className="rounded-full"
                  >
                    <Twitter size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => shareToSocial('linkedin')}
                    aria-label="Partager sur LinkedIn"
                    className="rounded-full"
                  >
                    <Linkedin size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={shareProduct}
                    aria-label="Copier le lien"
                    className="rounded-full"
                  >
                    {isLinkCopied ? <CheckCircle size={16} className="text-primary" /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-24">
              <h2 className="text-2xl font-serif mb-8">Produits similaires</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
          
          {/* Recently Viewed Products */}
          {recentlyViewed.length > 0 && (
            <div className="mt-24">
              <h2 className="text-2xl font-serif mb-8">Récemment consultés</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentlyViewed.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
          
          {/* You may also like */}
          {relatedProducts.length === 0 && recentlyViewed.length === 0 && (
            <div className="mt-24">
              <h2 className="text-2xl font-serif mb-8">Vous pourriez aussi aimer</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <p className="col-span-4 text-center text-muted-foreground py-12">
                  Aucune suggestion disponible pour le moment
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductDetail;