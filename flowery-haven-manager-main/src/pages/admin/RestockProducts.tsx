import React, { useState, useEffect } from 'react';
import { 
  PackageCheck, 
  AlertTriangle, 
  XCircle, 
  ArrowUpDown, 
  RefreshCw,
  FileText,
  Printer
} from 'lucide-react';
import ProductService from '@/services/ProductService';
import { Product } from '@/types/product';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const RestockProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [restockItems, setRestockItems] = useState<Record<string, number>>({});
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('low-and-out');
  const [sortBy, setSortBy] = useState('stock');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);
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
        
        // Initialiser les quantités de réapprovisionnement
        const initialRestockItems: Record<string, number> = {};
        productsData.forEach(product => {
          if (product.stock !== undefined && product.stock <= lowStockThreshold) {
            // Calculer la quantité de réapprovisionnement suggérée (jusqu'à 2x le seuil)
            const suggestedQuantity = Math.max(lowStockThreshold * 2 - product.stock, 1);
            initialRestockItems[product.id] = suggestedQuantity;
          }
        });
        setRestockItems(initialRestockItems);
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [lowStockThreshold]);

  // Filtrer et trier les produits
  const filteredProducts = products
    .filter(product => {
      // Filtre par catégorie
      const matchesCategory = 
        categoryFilter === '' || 
        product.category === categoryFilter;
      
      // Filtre par stock
      let matchesStock = true;
      if (stockFilter === 'out-of-stock') {
        matchesStock = product.stock !== undefined && product.stock === 0;
      } else if (stockFilter === 'low-stock') {
        matchesStock = product.stock !== undefined && product.stock > 0 && product.stock <= lowStockThreshold;
      } else if (stockFilter === 'low-and-out') {
        matchesStock = product.stock !== undefined && product.stock <= lowStockThreshold;
      }
      
      return matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      // Tri
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'stock') {
        const stockA = a.stock === undefined ? Infinity : a.stock;
        const stockB = b.stock === undefined ? Infinity : b.stock;
        comparison = stockA - stockB;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

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

  // Mettre à jour la quantité à réapprovisionner
  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 0) return;
    
    setRestockItems({
      ...restockItems,
      [productId]: quantity
    });
  };

  // Réapprovisionner un produit
  const handleRestock = async (productId: string) => {
    const quantity = restockItems[productId];
    if (!quantity || quantity <= 0) return;
    
    try {
      const updatedProduct = await ProductService.updateProductStock(productId, quantity);
      
      // Mettre à jour la liste des produits
      setProducts(products.map(p => p.id === productId ? updatedProduct : p));
      
      // Réinitialiser la quantité
      setRestockItems({
        ...restockItems,
        [productId]: 0
      });
      
      toast.success(`Stock ajouté avec succès pour ${updatedProduct.name}`);
    } catch (error) {
      console.error('Erreur lors du réapprovisionnement:', error);
      toast.error('Erreur lors du réapprovisionnement');
    }
  };

  // Réapprovisionner tous les produits
  const handleRestockAll = async () => {
    const productsToRestock = Object.entries(restockItems)
      .filter(([_, quantity]) => quantity > 0);
    
    if (productsToRestock.length === 0) {
      toast.info('Aucun produit à réapprovisionner');
      return;
    }
    
    try {
      // Réapprovisionner chaque produit
      for (const [productId, quantity] of productsToRestock) {
        await ProductService.updateProductStock(productId, quantity);
      }
      
      // Rafraîchir les données
      const updatedProducts = await ProductService.getAllProducts();
      setProducts(updatedProducts);
      
      // Réinitialiser les quantités
      const newRestockItems: Record<string, number> = {};
      Object.keys(restockItems).forEach(key => {
        newRestockItems[key] = 0;
      });
      setRestockItems(newRestockItems);
      
      toast.success(`${productsToRestock.length} produit(s) réapprovisionné(s) avec succès`);
    } catch (error) {
      console.error('Erreur lors du réapprovisionnement groupé:', error);
      toast.error('Erreur lors du réapprovisionnement');
    }
  };

  // Générer un rapport de réapprovisionnement
  const generateRestockReport = () => {
    const productsToRestock = Object.entries(restockItems)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return {
          name: product?.name || 'Produit inconnu',
          sku: product?.sku || 'N/A',
          currentStock: product?.stock || 0,
          toAdd: quantity,
          newStock: (product?.stock || 0) + quantity
        };
      });
    
    if (productsToRestock.length === 0) {
      toast.info('Aucun produit à inclure dans le rapport');
      return;
    }
    
    // Créer le contenu du rapport
    let reportContent = `RAPPORT DE RÉAPPROVISIONNEMENT - ${new Date().toLocaleDateString()}\n\n`;
    reportContent += 'Produit\tSKU\tStock actuel\tQuantité à ajouter\tNouveau stock\n';
    
    productsToRestock.forEach(item => {
      reportContent += `${item.name}\t${item.sku}\t${item.currentStock}\t${item.toAdd}\t${item.newStock}\n`;
    });
    
    // Créer un blob et télécharger
    const blob = new Blob([reportContent], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-reapprovisionnement-${new Date().toISOString().split('T')[0]}.tsv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Rapport de réapprovisionnement généré');
  };

  // Calculer le total de produits à réapprovisionner
  const calculateTotalToRestock = () => {
    return Object.values(restockItems).reduce((sum, quantity) => sum + quantity, 0);
  };

  // Calculer le nombre de produits à réapprovisionner
  const calculateProductsToRestock = () => {
    return Object.values(restockItems).filter(quantity => quantity > 0).length;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Réapprovisionnement</CardTitle>
              <CardDescription>
                Gérez les stocks et passez des commandes de réapprovisionnement
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={generateRestockReport}
                disabled={calculateProductsToRestock() === 0}
              >
                <FileText className="mr-2 h-4 w-4" />
                Générer un rapport
              </Button>
              
              <Button 
                onClick={handleRestockAll}
                disabled={calculateProductsToRestock() === 0}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Réapprovisionner tout
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total des Produits</p>
                  <h3 className="text-2xl font-bold">{products.length}</h3>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <PackageCheck className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">À Réapprovisionner</p>
                  <h3 className="text-2xl font-bold">
                    {calculateProductsToRestock()}
                  </h3>
                </div>
                <div className="bg-blue-500/10 p-3 rounded-full">
                  <RefreshCw className="h-5 w-5 text-blue-500" />
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
                <div className="bg-amber-500/10 p-3 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
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
          </div>
          
          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les catégories</SelectItem>
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
                <SelectValue placeholder="Filtrer par stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low-and-out">Stock faible et ruptures</SelectItem>
                <SelectItem value="low-stock">Stock faible uniquement</SelectItem>
                <SelectItem value="out-of-stock">Ruptures uniquement</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                placeholder="Seuil de stock faible"
                value={lowStockThreshold}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value > 0) {
                    setLowStockThreshold(value);
                  }
                }}
              />
            </div>
          </div>
          
          {/* Tableau de réapprovisionnement */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <PackageCheck className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium">Aucun produit à réapprovisionner</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tous vos produits ont un niveau de stock suffisant.
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
                            onClick={() => toggleSort('stock')}
                          >
                            <span>Stock actuel</span>
                            {sortBy === 'stock' && (
                              <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                            )}
                          </button>
                        </TableHead>
                        <TableHead>Quantité à ajouter</TableHead>
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
                                    <Badge variant="outline" className="flex items-center gap-1 text-amber-600">
                                      <AlertTriangle className="h-3 w-3" />
                                      {product.stock}
                                    </Badge>
                                  ) : (
                                    <span>{product.stock}</span>
                                  )}
                                </>
                              ) : (
                                <Badge variant="outline">Illimité</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              value={restockItems[product.id] || 0}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                handleQuantityChange(product.id, isNaN(value) ? 0 : value);
                              }}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestock(product.id)}
                              disabled={!restockItems[product.id] || restockItems[product.id] <= 0}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Réapprovisionner
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
          
          {calculateProductsToRestock() > 0 && (
            <div className="mt-6 p-4 border rounded-md bg-muted">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <p className="font-medium">Résumé du réapprovisionnement</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {calculateProductsToRestock()} produit(s) à réapprovisionner pour un total de {calculateTotalToRestock()} unités
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={generateRestockReport}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimer
                  </Button>
                  <Button onClick={handleRestockAll}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Réapprovisionner tout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Icône supplémentaire
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

export default RestockProducts;