import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import ProductService from '@/services/ProductService';
import { Product } from '@/types/product';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StockAlertsProps {
  lowStockThreshold?: number;
  maxItems?: number;
}

const StockAlerts: React.FC<StockAlertsProps> = ({ 
  lowStockThreshold = 5,
  maxItems = 5
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const allProducts = await ProductService.getAllProducts();
        
        // Filtrer les produits en rupture de stock ou à stock faible
        const filteredProducts = allProducts.filter(product => 
          product.stock !== undefined && (product.stock === 0 || product.stock <= lowStockThreshold)
        );
        
        // Trier: d'abord les ruptures de stock, puis par niveau de stock croissant
        const sortedProducts = filteredProducts.sort((a, b) => {
          // Si l'un est en rupture et l'autre non
          if (a.stock === 0 && b.stock !== 0) return -1;
          if (a.stock !== 0 && b.stock === 0) return 1;
          
          // Sinon par niveau de stock
          return (a.stock || 0) - (b.stock || 0);
        });
        
        setProducts(sortedProducts.slice(0, maxItems));
      } catch (error) {
        console.error('Erreur lors du chargement des alertes de stock:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [lowStockThreshold, maxItems]);
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertes de Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertes de Stock</CardTitle>
          <CardDescription>Suivi des produits en stock faible ou en rupture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="bg-green-50 p-3 rounded-full mb-2">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-sm font-medium">Aucune alerte de stock</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tous vos produits ont un niveau de stock suffisant
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Alertes de Stock
        </CardTitle>
        <CardDescription>
          {products.filter(p => p.stock === 0).length} produit(s) en rupture et {products.filter(p => p.stock !== undefined && p.stock > 0 && p.stock <= lowStockThreshold).length} en stock faible
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  {product.stock === 0 ? (
                    <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                      <XCircle className="h-3 w-3" />
                      Rupture
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1 text-amber-600 bg-amber-50 border-amber-200 w-fit">
                      <AlertTriangle className="h-3 w-3" />
                      Stock Faible
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {product.stock}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link to="/admin/products">
            Voir tous les produits
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

// Icônes supplémentaires
const CheckCircleIcon = (props) => (
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
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default StockAlerts;