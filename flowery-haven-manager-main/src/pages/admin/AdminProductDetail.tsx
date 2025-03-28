import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Trash2,
  Edit,
  Plus,
  ChevronRight,
  ShoppingBag,
  Tag,
  PackageCheck
} from 'lucide-react';
import { Product } from '@/types/product';
import ProductService from '@/services/ProductService';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductForm } from '@/components/admin/ProductForm';
import { toast } from 'sonner';

const AdminProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Charger le produit et les catégories
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const productData = await ProductService.getProductById(id);
        const categoriesData = await ProductService.getAllCategories();
        
        if (!productData) {
          toast.error('Produit non trouvé');
          navigate('/admin/products');
          return;
        }
        
        setProduct(productData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Erreur lors du chargement du produit:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);

  // Obtenir le nom de la catégorie
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Non catégorisé';
  };

  // Gérer la suppression du produit
  const handleDelete = async () => {
    if (!product) return;
    
    try {
      await ProductService.deleteProduct(product.id);
      toast.success('Produit supprimé avec succès');
      navigate('/admin/products');
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      toast.error('Erreur lors de la suppression du produit');
    } finally {
      setConfirmDelete(false);
    }
  };

  // Gérer la mise à jour du produit
  const handleProductSubmit = async (productData: Product) => {
    if (!product) return;
    
    try {
      const updatedProduct = await ProductService.updateProduct(product.id, productData);
      setProduct(updatedProduct);
      setIsEditing(false);
      toast.success('Produit mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      toast.error('Erreur lors de la mise à jour du produit');
    }
  };

  // Mettre à jour le stock
  const handleUpdateStock = async (adjustment: number) => {
    if (!product) return;
    
    try {
      const newStock = (product.stock || 0) + adjustment;
      if (newStock < 0) {
        toast.error('Le stock ne peut pas être négatif');
        return;
      }
      
      const updatedProduct = await ProductService.updateProductStock(product.id, adjustment);
      setProduct(updatedProduct);
      toast.success(`Stock ${adjustment > 0 ? 'augmenté' : 'diminué'} avec succès`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du stock:', error);
      toast.error('Erreur lors de la mise à jour du stock');
    }
  };
  
  // Rendu du contenu principal
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      );
    }
    
    if (!product) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Produit non trouvé</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/admin/products')}
          >
            Retour à la liste des produits
          </Button>
        </div>
      );
    }
    
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="details">Détails du produit</TabsTrigger>
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Nom du produit</h3>
                  <p className="mt-1 font-medium">{product.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p className="mt-1">{product.description}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Catégorie</h3>
                  <p className="mt-1">
                    <Badge variant="outline">{getCategoryName(product.category)}</Badge>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Prix</h3>
                  <p className="mt-1 font-medium">{product.price.toFixed(2)} XAF</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">SKU</h3>
                  <p className="mt-1">{product.sku || '—'}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Caractéristiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Mise en avant</h3>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge variant={product.featured ? "default" : "outline"}>
                      {product.featured ? 'En vedette' : 'Non mis en avant'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Popularité</h3>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge variant={product.popular ? "secondary" : "outline"}>
                      {product.popular ? 'Populaire' : 'Standard'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Poids</h3>
                  <p className="mt-1">{product.weight ? `${product.weight} kg` : '—'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Dimensions</h3>
                  <p className="mt-1">
                    {product.dimensions 
                      ? `${product.dimensions.length} × ${product.dimensions.width} × ${product.dimensions.height} cm`
                      : '—'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion du stock</CardTitle>
              <CardDescription>
                Mettez à jour les informations de stock et les seuils d'alerte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="text-lg font-medium">Stock actuel</h3>
                      <p className="text-3xl font-bold mt-2 mb-4">
                        {product.stock !== undefined ? product.stock : 'Illimité'}
                      </p>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStock(-1)}
                          disabled={product.stock === undefined || product.stock <= 0}
                        >
                          -
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUpdateStock(1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium">Ajustement de stock</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ajoutez ou retirez des unités du stock
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="add-stock">Ajouter au stock</Label>
                        <div className="flex space-x-2">
                          <Input 
                            id="add-stock" 
                            type="number" 
                            min="1" 
                            placeholder="Quantité"
                            className="w-full"
                          />
                          <Button 
                            onClick={() => {
                              const input = document.getElementById('add-stock') as HTMLInputElement;
                              const value = parseInt(input.value);
                              if (!isNaN(value) && value > 0) {
                                handleUpdateStock(value);
                                input.value = '';
                              }
                            }}
                          >
                            Ajouter
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="remove-stock">Retirer du stock</Label>
                        <div className="flex space-x-2">
                          <Input 
                            id="remove-stock" 
                            type="number" 
                            min="1"
                            max={product.stock !== undefined ? product.stock : undefined}
                            placeholder="Quantité"
                            className="w-full"
                          />
                          <Button 
                            variant="outline"
                            onClick={() => {
                              const input = document.getElementById('remove-stock') as HTMLInputElement;
                              const value = parseInt(input.value);
                              if (!isNaN(value) && value > 0 && (product.stock === undefined || value <= product.stock)) {
                                handleUpdateStock(-value);
                                input.value = '';
                              }
                            }}
                          >
                            Retirer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Images du produit</CardTitle>
              <CardDescription>
                Gérez les images de votre produit
              </CardDescription>
            </CardHeader>
            <CardContent>
              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-md overflow-hidden border">
                        <img 
                          src={image} 
                          alt={`Image ${index + 1} de ${product.name}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="opacity-90"
                          onClick={() => {
                            // Créer une copie des images sans celle-ci
                            const updatedImages = [...product.images];
                            updatedImages.splice(index, 1);
                            
                            // Mettre à jour le produit
                            handleProductSubmit({
                              ...product,
                              images: updatedImages
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border rounded-md">
                  <p className="text-muted-foreground">Aucune image disponible</p>
                </div>
              )}
              
              <div className="mt-6 space-y-2">
                <Label htmlFor="add-image">Ajouter une image (URL)</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="add-image" 
                    type="url" 
                    placeholder="https://exemple.com/image.jpg"
                    className="w-full"
                  />
                  <Button 
                    onClick={() => {
                      const input = document.getElementById('add-image') as HTMLInputElement;
                      const url = input.value.trim();
                      if (url) {
                        // Créer une copie des images et ajouter la nouvelle
                        const updatedImages = [...(product.images || []), url];
                        
                        // Mettre à jour le produit
                        handleProductSubmit({
                          ...product,
                          images: updatedImages
                        });
                        
                        input.value = '';
                      }
                    }}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    );
  };
};
export default AdminProductDetail;