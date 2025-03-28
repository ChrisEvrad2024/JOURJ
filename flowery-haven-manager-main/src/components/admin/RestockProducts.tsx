import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ArrowLeft, ArrowRight, CheckCircle, Download, Plus, Truck, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Product } from "@/types/product";
import { ProductService } from "@/services";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface RestockItem extends Product {
  selected: boolean;
  orderQuantity: number;
}

const RestockProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<RestockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [threshold, setThreshold] = useState(10);
  const [selectAll, setSelectAll] = useState(false);
  const [csvData, setCsvData] = useState<string | null>(null);
  
  useEffect(() => {
    loadProducts();
  }, [threshold]);
  
  const loadProducts = async () => {
    setLoading(true);
    try {
      // Charger tous les produits
      const allProducts = await ProductService.getAllProducts();
      
      // Filtrer les produits avec un stock bas ou nul
      const lowStockProducts = allProducts
        .filter(product => product.stock !== undefined && product.stock <= threshold)
        .map(product => ({
          ...product,
          selected: false,
          orderQuantity: calculateSuggestedQuantity(product.stock)
        }))
        .sort((a, b) => (a.stock || 0) - (b.stock || 0));
      
      setProducts(lowStockProducts);
      
      // Charger les catégories
      const categoriesData = await ProductService.getAllCategories();
      const categoriesMap: Record<string, string> = {};
      categoriesData.forEach(category => {
        categoriesMap[category.id] = category.name;
      });
      setCategories(categoriesMap);
      
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };
  
  // Calcule une quantité suggérée basée sur le stock actuel
  const calculateSuggestedQuantity = (stock: number | undefined): number => {
    if (stock === undefined) return 0;
    
    if (stock === 0) {
      return 10; // Réapprovisionner avec 10 unités pour les produits en rupture
    } else {
      return 10 - stock; // Compléter jusqu'à 10 unités
    }
  };
  
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    setProducts(products.map(product => ({
      ...product,
      selected: newSelectAll
    })));
  };
  
  const handleSelectProduct = (productId: string) => {
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? { ...product, selected: !product.selected } 
        : product
    );
    
    setProducts(updatedProducts);
    
    // Mettre à jour l'état de "Tout sélectionner"
    setSelectAll(updatedProducts.every(product => product.selected));
  };
  
  const handleQuantityChange = (productId: string, quantity: number) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, orderQuantity: Math.max(0, quantity) } 
        : product
    ));
  };
  
  const getSelectedCount = () => {
    return products.filter(product => product.selected).length;
  };
  
  const getTotalOrderQuantity = () => {
    return products
      .filter(product => product.selected)
      .reduce((total, product) => total + product.orderQuantity, 0);
  };
  
  const generateCsvData = () => {
    const selectedProducts = products.filter(product => product.selected);
    
    if (selectedProducts.length === 0) {
      toast.error("Aucun produit sélectionné");
      return;
    }
    
    // Entêtes du CSV
    const headers = [
      "ID",
      "SKU",
      "Nom",
      "Catégorie",
      "Stock actuel",
      "Quantité à commander"
    ];
    
    // Générer les lignes
    const rows = selectedProducts.map(product => [
      product.id,
      product.sku || "",
      product.name,
      categories[product.category] || product.category,
      product.stock,
      product.orderQuantity
    ]);
    
    // Assembler le tout
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    setCsvData(csvContent);
    
    // Téléchargement du fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `commande_reapprovisionnement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Fichier CSV généré et téléchargé");
  };
  
  const handleSubmitOrder = () => {
    const selectedProducts = products.filter(product => product.selected);
    
    if (selectedProducts.length === 0) {
      toast.error("Aucun produit sélectionné");
      return;
    }
    
    toast.success("Commande de réapprovisionnement créée", {
      description: `${selectedProducts.length} produits - ${getTotalOrderQuantity()} unités au total`
    });
    
    // Ici vous pourriez implémenter la génération d'une véritable commande
    // puis rediriger vers une page de confirmation
    
    // Pour cette démo, nous réinitialisons simplement la page
    loadProducts();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/products")} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Réapprovisionnement</h1>
            <p className="text-muted-foreground">Gérez vos commandes de réapprovisionnement</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadProducts}>
            Actualiser
          </Button>
          <Button onClick={handleSubmitOrder} disabled={getSelectedCount() === 0}>
            <Truck className="h-4 w-4 mr-2" />
            Créer la commande
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Produits à réapprovisionner</CardTitle>
              <CardDescription>
                {products.length} produits en dessous du seuil de stock
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm whitespace-nowrap">Seuil:</span>
                <Input
                  type="number"
                  min="1"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value) || 1)}
                  className="w-20"
                />
              </div>
              
              <Button variant="outline" onClick={generateCsvData} disabled={getSelectedCount() === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {products.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox 
                            checked={selectAll} 
                            onCheckedChange={handleSelectAll} 
                            aria-label="Sélectionner tous les produits"
                          />
                        </TableHead>
                        <TableHead>Produit</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-center">Stock actuel</TableHead>
                        <TableHead className="text-center">Quantité à commander</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id} className={product.selected ? "bg-primary/5" : ""}>
                          <TableCell>
                            <Checkbox 
                              checked={product.selected} 
                              onCheckedChange={() => handleSelectProduct(product.id)} 
                              aria-label={`Sélectionner ${product.name}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                <img
                                  src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg'}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                                  }}
                                />
                              </div>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {product.sku || 'Pas de SKU'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{categories[product.category] || product.category}</TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={product.stock === 0 ? "destructive" : "outline"}
                              className={product.stock === 0 ? "" : "bg-amber-100 text-amber-800 border-amber-200"}
                            >
                              {product.stock}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center">
                              <Input
                                type="number"
                                min="0"
                                value={product.orderQuantity}
                                onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 0)}
                                className="w-20 text-center"
                                disabled={!product.selected}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium">Aucun produit à réapprovisionner</h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    Tous les produits ont un stock supérieur au seuil de {threshold} unités.
                  </p>
                  <Button variant="outline" onClick={() => setThreshold(threshold - 1)} disabled={threshold <= 1}>
                    Baisser le seuil à {threshold - 1}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
        {products.length > 0 && (
          <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t p-4 gap-4">
            <div className="text-sm">
              <p><strong>{getSelectedCount()}</strong> produits sélectionnés</p>
              <p className="text-muted-foreground">
                {getTotalOrderQuantity()} unités au total
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-initial"
                onClick={() => navigate("/admin/products")}
              >
                Annuler
              </Button>
              <Button 
                className="flex-1 sm:flex-initial"
                onClick={handleSubmitOrder}
                disabled={getSelectedCount() === 0}
              >
                Valider la commande
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default RestockProducts;