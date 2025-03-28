import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Copy,
  Trash2, 
  Edit, 
  Eye, 
  ArrowUpDown, 
  CheckCircle, 
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/types/product';
import ProductService from '@/services/ProductService';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ProductForm } from '@/components/admin/ProductForm';

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  // Charger les produits et les catégories
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const productsData = await ProductService.getAllProducts();
        const categoriesData = await ProductService.getAllCategories();
        
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filtrer et trier les produits
  const filteredProducts = products
    .filter(product => {
      // Filtre de recherche
      const matchesSearch = 
        searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filtre par catégorie
      const matchesCategory = 
        categoryFilter === '' || 
        product.category === categoryFilter;
      
      // Filtre par stock
      let matchesStock = true;
      if (stockFilter === 'in-stock') {
        matchesStock = product.stock === undefined || product.stock > 0;
      } else if (stockFilter === 'out-of-stock') {
        matchesStock = product.stock !== undefined && product.stock === 0;
      } else if (stockFilter === 'low-stock') {
        matchesStock = product.stock !== undefined && product.stock > 0 && product.stock <= lowStockThreshold;
      }
      
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      // Tri
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        comparison = a.price - b.price;
      } else if (sortBy === 'stock') {
        const stockA = a.stock === undefined ? Infinity : a.stock;
        const stockB = b.stock === undefined ? Infinity : b.stock;
        comparison = stockA - stockB;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Ajouter un nouveau produit
  const handleAddProduct = () => {
    setCurrentProduct(null);
    setShowProductForm(true);
  };

  // Éditer un produit existant
  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setShowProductForm(true);
  };

  // Voir les détails d'un produit
  const handleViewProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  // Dupliquer un produit
  const handleDuplicateProduct = async (product: Product) => {
    try {
      // Créer une copie du produit avec un nouveau nom
      const newProduct = {
        ...product,
        id: undefined, // L'ID sera généré automatiquement
        name: `${product.name} (Copie)`,
        sku: product.sku ? `${product.sku}-COPY` : undefined
      };
      
      await ProductService.addProduct(newProduct);
      
      // Rafraîchir la liste des produits
      const updatedProducts = await ProductService.getAllProducts();
      setProducts(updatedProducts);
      
      toast.success('Produit dupliqué avec succès');
    } catch (error) {
      console.error('Erreur lors de la duplication du produit:', error);
      toast.error('Erreur lors de la duplication du produit');
    }
  };

  // Supprimer un produit
  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    
    try {
      await ProductService.deleteProduct(confirmDelete);
      
      // Rafraîchir la liste des produits
      setProducts(products.filter(product => product.id !== confirmDelete));
      
      toast.success('Produit supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      toast.error('Erreur lors de la suppression du produit');
    } finally {
      setConfirmDelete(null);
    }
  };

  // Soumettre le formulaire de produit
  const handleProductSubmit = async (productData: Product) => {
    try {
      if (currentProduct) {
        // Mettre à jour un produit existant
        await ProductService.updateProduct(currentProduct.id, productData);
        
        // Mettre à jour la liste des produits
        setProducts(products.map(p => p.id === currentProduct.id ? {...p, ...productData} : p));
        
        toast.success('Produit mis à jour avec succès');
      } else {
        // Ajouter un nouveau produit
        const newProduct = await ProductService.addProduct(productData);
        
        // Ajouter le nouveau produit à la liste
        setProducts([...products, newProduct]);
        
        toast.success('Produit ajouté avec succès');
      }
      
      // Fermer le formulaire
      setShowProductForm(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du produit:', error);
      toast.error('Erreur lors de l\'enregistrement du produit');
    }
  };

  // Changer le tri
  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Obtenir le nom de la catégorie
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Non catégorisé';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Gestion des Produits</CardTitle>
              <CardDescription>
                Gérez l'inventaire de votre boutique en ligne
              </CardDescription>
            </div>
            <Button onClick={handleAddProduct} className="sm:self-end whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Produits</p>
                  <h3 className="text-2xl font-bold">{products.length}</h3>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <PackageIcon className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rupture de Stock</p>
                  <h3 className="text-2xl font-bold">
                    {products.filter(p => p.stock !== undefined && p.stock === 0).length}
                  </h3>
                </div>
                <div className="bg-destructive/10 p-3 rounded-full">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stock Faible</p>
                  <h3 className="text-2xl font-bold">
                    {products.filter(p => p.stock !== undefined && p.stock > 0 && p.stock <= lowStockThreshold).length}
                  </h3>
                </div>
                <div className="bg-warning/10 p-3 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-categories">Toutes les catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={stockFilter}
              onValueChange={setStockFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les stocks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-stock">Tous les stocks</SelectItem>
                <SelectItem value="in-stock">En stock</SelectItem>
                <SelectItem value="out-of-stock">Rupture de stock</SelectItem>
                <SelectItem value="low-stock">Stock faible</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('');
                  setStockFilter('');
                  setSortBy('name');
                  setSortDirection('asc');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
          
          {/* Alerte stock faible */}
          {products.some(p => p.stock !== undefined && p.stock > 0 && p.stock <= lowStockThreshold) && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Attention</AlertTitle>
              <AlertDescription>
                Certains produits ont un stock faible. Vérifiez la colonne stock et réapprovisionnez si nécessaire.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Tableau de produits */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <PackageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Aucun produit trouvé</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Essayez de modifier vos filtres ou d'ajouter de nouveaux produits.
                  </p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Image</TableHead>
                        <TableHead>
                          <button 
                            className="flex items-center space-x-1"
                            onClick={() => toggleSort('name')}
                          >
                            <span>Nom du produit</span>
                            {sortBy === 'name' && (
                              <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                            )}
                          </button>
                        </TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>
                          <button 
                            className="flex items-center space-x-1"
                            onClick={() => toggleSort('price')}
                          >
                            <span>Prix</span>
                            {sortBy === 'price' && (
                              <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                            )}
                          </button>
                        </TableHead>
                        <TableHead>
                          <button 
                            className="flex items-center space-x-1"
                            onClick={() => toggleSort('stock')}
                          >
                            <span>Stock</span>
                            {sortBy === 'stock' && (
                              <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                            )}
                          </button>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="w-12 h-12 rounded-md border overflow-hidden bg-muted">
                              {product.images && product.images.length > 0 ? (
                                <img 
                                  src={product.images[0]} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <PackageIcon className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{product.name}</div>
                            {product.sku && (
                              <div className="text-xs text-muted-foreground">
                                SKU: {product.sku}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getCategoryName(product.category)}
                            </Badge>
                          </TableCell>
                          <TableCell>{product.price.toFixed(2)} XAF</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {product.stock !== undefined ? (
                                <>
                                  {product.stock === 0 ? (
                                    <Badge variant="destructive" className="flex items-center gap-1">
                                      <XCircle className="h-3 w-3" />
                                      Rupture
                                    </Badge>
                                  ) : product.stock <= lowStockThreshold ? (
                                    <Badge variant="warning" className="flex items-center gap-1 bg-warning text-white">
                                      <AlertTriangle className="h-3 w-3" />
                                      {product.stock}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                      {product.stock}
                                    </Badge>
                                  )}
                                </>
                              ) : (
                                <Badge variant="outline">Illimité</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontalIcon className="h-4 w-4" />
                                  <span className="sr-only">Menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewProduct(product.id)}>
                                  <Eye className="h-4 w-4 mr-2" /> Visualiser
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                  <Edit className="h-4 w-4 mr-2" /> Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicateProduct(product)}>
                                  <Copy className="h-4 w-4 mr-2" /> Dupliquer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setConfirmDelete(product.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Dialogue de suppression */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Formulaire de produit */}
      <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentProduct ? 'Modifier le produit' : 'Ajouter un produit'}
            </DialogTitle>
            <DialogDescription>
              {currentProduct 
                ? 'Modifiez les informations du produit ci-dessous.'
                : 'Entrez les informations du nouveau produit.'}
            </DialogDescription>
          </DialogHeader>
          
          <ProductForm 
            product={currentProduct}
            categories={categories}
            onSubmit={handleProductSubmit}
            onCancel={() => setShowProductForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Icônes supplémentaires
const PackageIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.29 7 12 12 20.71 7"></polyline>
    <line x1="12" y1="22" x2="12" y2="12"></line>
  </svg>
);

const MoreHorizontalIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="19" cy="12" r="1"></circle>
    <circle cx="5" cy="12" r="1"></circle>
  </svg>
);

export default AdminProducts;