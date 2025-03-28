import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Minus, 
  Plus, 
  ShoppingBag, 
  Heart, 
  Share2, 
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  InfoIcon,
  ShieldCheck,
  Truck
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/shared/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import ProductService from '@/services/ProductService';
import { CartService } from '@/services/CartService';
import { useWishlist } from '@/hooks/useWishlist';
import { Product } from '@/types/product';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [inWishlist, setInWishlist] = useState(false);
  
  // Charger les données du produit
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const productData = await ProductService.getProductById(id);
        const categoriesData = await ProductService.getAllCategories();
        
        if (!productData) {
          navigate('/catalog');
          return;
        }
        
        setProduct(productData);
        setCategories(categoriesData);
        setInWishlist(isInWishlist(productData.id));
        
        // Récupérer les produits de la même catégorie
        if (productData.category) {
          const categoryProducts = await ProductService.getProductsByCategory(productData.category);
          // Filtrer le produit actuel et prendre jusqu'à 4 produits
          setRelatedProducts(
            categoryProducts
              .filter(p => p.id !== productData.id)
              .slice(0, 4)
          );
        }
      } catch (error) {
        console.error('Erreur lors du chargement du produit:', error);
        toast.error('Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    // Réinitialiser la quantité et l'image sélectionnée
    setQuantity(1);
    setSelectedImage(0);
  }, [id, navigate, isInWishlist]);
  
  // Obtenir le nom de la catégorie
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  };
  
  // Ajouter au panier
  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      if (product.stock !== undefined && product.stock < quantity) {
        toast.error('Stock insuffisant');
        return;
      }
      
      await CartService.addToCart(product, quantity);
      toast.success('Produit ajouté au panier');
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      toast.error('Erreur lors de l\'ajout au panier');
    }
  };
  
  // Ajouter/retirer des favoris
  const toggleWishlist = () => {
    if (!product) return;
    
    if (inWishlist) {
      removeFromWishlist(product.id);
      setInWishlist(false);
      toast.info('Produit retiré des favoris');
    } else {
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
      toast.success('Produit ajouté aux favoris');
    }
  };
  
  // Partager le produit
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name || 'Produit ChezFlora',
        text: `Découvrez ${product?.name} sur ChezFlora`,
        url: window.location.href
      })
        .then(() => console.log('Produit partagé avec succès'))
        .catch((error) => console.log('Erreur lors du partage:', error));
    } else {
      setShowShareDialog(true);
    }
  };
  
  // Copier le lien du produit
  const copyProductLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        toast.success('Lien copié dans le presse-papier');
        setShowShareDialog(false);
      })
      .catch(() => {
        toast.error('Impossible de copier le lien');
      });
  };
  
  // Navigation entre images
  const nextImage = () => {
    if (!product || !product.images) return;
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };
  
  const prevImage = () => {
    if (!product || !product.images) return;
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };
  
  // Rendu du contenu principal avec squelettes de chargement
  const renderContent = () => {
    if (loading) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Squelette de la galerie d'images */}
            <div className="lg:w-1/2 space-y-4">
              <Skeleton className="w-full aspect-square rounded-lg" />
              <div className="flex gap-2 overflow-x-auto">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-md flex-shrink-0" />
                ))}
              </div>
            </div>
            
            {/* Squelette des informations produit */}
            <div className="lg:w-1/2 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>
              
              <Skeleton className="h-10 w-32" />
              
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
              
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-12 w-1/2" />
                  <Skeleton className="h-12 w-1/2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (!product) {
      return (
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Produit non trouvé</h2>
          <p className="text-muted-foreground mb-8">
            Le produit que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Button asChild>
            <Link to="/catalog">Retour au catalogue</Link>
          </Button>
        </div>
      );
    }
    
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Fil d'Ariane */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/catalog">Catalogue</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {product.category && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/catalog?category=${product.category}`}>
                    {getCategoryName(product.category)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbLink>{product.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Galerie d'images */}
          <div className="lg:w-1/2 space-y-4">
            <div className="relative rounded-lg overflow-hidden border aspect-square">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground opacity-30" />
                </div>
              )}
              
              {product.images && product.images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={prevImage}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={nextImage}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            
            {/* Miniatures */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`w-20 h-20 rounded-md border overflow-hidden flex-shrink-0 ${
                      selectedImage === index ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} - vue ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Informations produit */}
          <div className="lg:w-1/2 space-y-6">
            <div>
              <h1 className="text-3xl font-serif font-medium">{product.name}</h1>
              {product.sku && (
                <p className="text-sm text-muted-foreground mt-1">
                  Référence: {product.sku}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Badge de stock */}
              {product.stock !== undefined ? (
                product.stock > 0 ? (
                  <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    En stock
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">
                    <XCircle className="h-3 w-3 mr-1" />
                    Rupture de stock
                  </Badge>
                )
              ) : (
                <Badge variant="outline">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Disponible
                </Badge>
              )}
              
              {/* Badge populaire/en vedette */}
              {product.popular && (
                <Badge variant="secondary">
                  Populaire
                </Badge>
              )}
              {product.featured && (
                <Badge>
                  En vedette
                </Badge>
              )}
            </div>
            
            <p className="text-2xl font-medium text-primary">{product.price.toFixed(2)} XAF</p>
            
            <p className="text-muted-foreground">{product.description}</p>
            
            {/* Sélection de quantité et ajout au panier */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">Quantité:</span>
                <div className="flex border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-r-none"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center justify-center w-12">
                    {quantity}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-l-none"
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    disabled={product.stock === 0 || (product.stock !== undefined && quantity >= product.stock)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {product.stock !== undefined && product.stock > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {product.stock} unité(s) disponible(s)
                  </span>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Ajouter au panier
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    variant={inWishlist ? "secondary" : "outline"}
                    size="icon"
                    className="h-12 w-12"
                    onClick={toggleWishlist}
                  >
                    <Heart className="h-5 w-5" fill={inWishlist ? "currentColor" : "none"} />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onClick={handleShare}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Garanties et informations supplémentaires */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-sm">Garantie satisfaction</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-sm">Livraison offerte</span>
              </div>
              
              <div className="flex items-center gap-2">
                <InfoIcon className="h-5 w-5 text-primary" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-sm cursor-help underline underline-offset-4">Besoin d'aide?</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Contactez-nous pour plus d'informations</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            {/* Accordéons d'informations supplémentaires */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="dimensions">
                <AccordionTrigger>Dimensions et poids</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {product.weight && (
                      <div className="flex justify-between">
                        <span className="text-sm">Poids:</span>
                        <span className="text-sm font-medium">{product.weight} kg</span>
                      </div>
                    )}
                    
                    {product.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-sm">Dimensions:</span>
                        <span className="text-sm font-medium">
                          {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                        </span>
                      </div>
                    )}
                    
                    {!product.weight && !product.dimensions && (
                      <p className="text-sm text-muted-foreground">
                        Informations non disponibles
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="delivery">
                <AccordionTrigger>Livraison et retours</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Livraison standard:</strong> 1-3 jours ouvrables
                    </p>
                    <p>
                      <strong>Livraison express:</strong> 24h (supplément)
                    </p>
                    <p>
                      <strong>Politique de retour:</strong> 14 jours pour changer d'avis
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        
        {/* Onglets d'informations supplémentaires */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="mb-6">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="care">Entretien</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="space-y-4">
              <div className="prose max-w-none">
                <p>{product.description}</p>
                <p>
                  Nos produits floraux sont soigneusement sélectionnés pour leur fraîcheur et leur qualité. Chaque arrangement est créé avec passion par nos fleuristes experts.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <h3 className="font-medium">Caractéristiques</h3>
                  <ul className="mt-2 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Produit de qualité supérieure</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Composé de fleurs fraîches</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Arrangé à la main</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium">Informations produit</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between pb-2 border-b">
                      <span className="text-sm text-muted-foreground">Catégorie</span>
                      <span className="text-sm font-medium">{getCategoryName(product.category)}</span>
                    </div>
                    {product.sku && (
                      <div className="flex justify-between pb-2 border-b">
                        <span className="text-sm text-muted-foreground">Référence</span>
                        <span className="text-sm font-medium">{product.sku}</span>
                      </div>
                    )}
                    <div className="flex justify-between pb-2 border-b">
                      <span className="text-sm text-muted-foreground">Disponibilité</span>
                      <span className="text-sm font-medium">
                        {product.stock !== undefined 
                          ? (product.stock > 0 ? `En stock (${product.stock})` : 'Rupture de stock')
                          : 'Disponible'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="care" className="space-y-4">
              <div className="prose max-w-none">
                <h3>Conseils d'entretien</h3>
                <ul>
                  <li>Changez l'eau tous les deux jours</li>
                  <li>Coupez les tiges en biseau</li>
                  <li>Gardez les fleurs à l'abri du soleil direct et de la chaleur</li>
                  <li>Utilisez l'engrais pour fleurs coupées fourni</li>
                  <li>Retirez les fleurs fanées pour prolonger la durée de vie du bouquet</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Produits associés */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-serif font-medium mb-6">Vous aimerez aussi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
        
        {/* Dialogue de partage */}
        <AlertDialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Partager ce produit</AlertDialogTitle>
              <AlertDialogDescription>
                Partagez ce produit avec vos amis et votre famille.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <div className="flex justify-center gap-4">
                {/* Boutons de partage social */}
                <Button variant="outline" className="flex-1" onClick={copyProductLink}>
                  Copier le lien
                </Button>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };
  
  return (
    <>
      <Navbar />
      <main>
        {renderContent()}
      </main>
      <Footer />
    </>
  );
};

// Composant pour le badge de stock
const StockBadge = ({ stock }: { stock: number | undefined }) => {
  if (stock === undefined) {
    return (
      <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Disponible
      </Badge>
    );
  }
  
  if (stock > 0) {
    return (
      <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        En stock
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">
      <XCircle className="h-3 w-3 mr-1" />
      Rupture de stock
    </Badge>
  );
};

export default ProductDetailPage;