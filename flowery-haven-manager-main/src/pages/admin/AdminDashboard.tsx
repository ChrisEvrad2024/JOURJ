import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PackageOpen, 
  Users, 
  ShoppingBag, 
  CreditCard,
  Package,
  TrendingUp,
  Calendar,
  Truck,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  AlertTriangle,
  ClipboardList,
  Clock,
  BarChart3,
  FileText
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { 
  StatisticsWidget, 
  KpiCard 
} from "@/components/admin/StatisticsWidget";

import { 
  LowStockProductsCard, 
  PendingQuoteRequestsCard,
  AdminNotifications 
} from "@/components/admin/AdminDashboardAlerts";

import StockAlerts from '@/components/admin/StockAlerts';
import ProductService from '@/services/ProductService';
import OrderService from '@/services/OrderService';

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState(0);
  const [recentSales, setRecentSales] = useState(0);
  const [salesChange, setSalesChange] = useState(0);
  const [salesChangeType, setSalesChangeType] = useState('up');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch products data
        let products = [];
        try {
          products = await ProductService.getAllProducts();
        } catch (error) {
          console.warn('Error fetching from ProductService, using fallback data:', error);
          // Fallback: directly get products if service fails
          products = getAllProducts();
        }
        
        setTotalProducts(products.length);
        
        // Filter low stock products (stock < 5)
        const lowStockCount = products.filter(p => p.stock !== undefined && p.stock > 0 && p.stock <= 5);
        setLowStockProducts(lowStockCount);
        
        // Count out of stock products
        const outOfStockCount = products.filter(p => p.stock !== undefined && p.stock === 0).length;
        setOutOfStockProducts(outOfStockCount);
        
        // In a real application, this would come from an API
        setTotalOrders(124);
        setTotalCustomers(128);
        setTotalRevenue(7845.50);
        setRecentSales(1875600);
        setSalesChange(12.5);
        setSalesChangeType('up');
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Format currency in XAF
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Sales data for charts
  const monthlySales = [
    { name: 'Jan', value: 1200 },
    { name: 'Fév', value: 1900 },
    { name: 'Mar', value: 1500 },
    { name: 'Avr', value: 2200 },
    { name: 'Mai', value: 2700 },
    { name: 'Juin', value: 2900 },
  ];
  
  const weeklyOrders = [
    { name: 'Lun', value: 12 },
    { name: 'Mar', value: 19 },
    { name: 'Mer', value: 15 },
    { name: 'Jeu', value: 22 },
    { name: 'Ven', value: 27 },
    { name: 'Sam', value: 29 },
    { name: 'Dim', value: 18 },
  ];
  
  const topCategories = [
    { name: 'Bouquets', value: 42 },
    { name: 'Plantes', value: 28 },
    { name: 'Fleurs', value: 18 },
    { name: 'Déco', value: 12 },
  ];
  
  const customerSources = [
    { name: 'Direct', value: 35 },
    { name: 'Social', value: 25 },
    { name: 'Search', value: 20 },
    { name: 'Referral', value: 15 },
    { name: 'Email', value: 5 },
  ];
  
  const recentOrdersData = [
    { id: 'ORD-001', customer: 'Marie Dupont', date: '2023-06-05', amount: 59.99, status: 'Livré' },
    { id: 'ORD-002', customer: 'Jean Martin', date: '2023-06-04', amount: 124.50, status: 'En cours' },
    { id: 'ORD-004', customer: 'Thomas Robert', date: '2023-06-02', amount: 89.99, status: 'Préparation' },
  ];

  // Mock data for pending quote requests
  const pendingQuoteRequests = [
    { id: 'QUO-001', customer: 'Entreprise ABC', date: '2023-06-05', type: 'Événement d\'entreprise', status: 'En attente' },
    { id: 'QUO-002', customer: 'Mariage Dupont', date: '2023-06-04', type: 'Mariage', status: 'En attente' },
    { id: 'QUO-003', customer: 'Restaurant Le Gourmet', date: '2023-06-03', type: 'Décoration', status: 'En attente' },
  ];

  // Render loading spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-12">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3 text-lg">Chargement du tableau de bord...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Bienvenue sur le tableau de bord de votre boutique ChezFLORA.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="sales">Ventes</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="customers">Clients</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ventes récentes
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(recentSales)}</div>
                <p className="text-xs text-muted-foreground">
                  {salesChangeType === 'up' ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <ArrowUp className="h-3 w-3" /> +{salesChange}%
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <ArrowDown className="h-3 w-3" /> -{salesChange}%
                    </span>
                  )}
                  <span className="ml-1">par rapport au mois dernier</span>
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Commandes
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  5.2% d'augmentation
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Clients
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  Clients inscrits
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Produits
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  {outOfStockProducts > 0 && (
                    <span className="text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {outOfStockProducts} en rupture, {lowStockProducts.length} en stock faible
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders and Pending Quotes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Recent Orders */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Commandes récentes
                    </CardTitle>
                    <CardDescription>
                      Les dernières commandes reçues
                    </CardDescription>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/admin/orders">Voir tout</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrdersData.map((order, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>
                          <Badge variant={
                            order.status === 'Livré' ? 'default' :
                            order.status === 'En cours' ? 'secondary' :
                            'outline'
                          }>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{order.amount.toFixed(2)} XAF</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pending Quote Requests */}
            <PendingQuoteRequestsCard quotes={pendingQuoteRequests} />
          </div>

          {/* Low Stock Products */}
          <LowStockProductsCard products={lowStockProducts} />
          
          {/* Quick Access */}
          <Card>
            <CardHeader>
              <CardTitle>Accès rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button asChild variant="outline" className="h-20 justify-start" size="lg">
                  <Link to="/admin/products" className="flex flex-col items-center justify-center w-full h-full gap-1">
                    <PackageOpen className="h-6 w-6" />
                    <span>Gérer les produits</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-20 justify-start" size="lg">
                  <Link to="/admin/products/restock" className="flex flex-col items-center justify-center w-full h-full gap-1">
                    <AlertTriangle className="h-6 w-6" />
                    <span>Réapprovisionner</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-20 justify-start" size="lg">
                  <Link to="/admin/orders" className="flex flex-col items-center justify-center w-full h-full gap-1">
                    <ShoppingBag className="h-6 w-6" />
                    <span>Commandes</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-20 justify-start" size="lg">
                  <Link to="/admin/analytics" className="flex flex-col items-center justify-center w-full h-full gap-1">
                    <BarChart3 className="h-6 w-6" />
                    <span>Statistiques</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatisticsWidget 
                  title="Ventes mensuelles (XAF)" 
                  data={monthlySales} 
                  color="#22c55e"
                  valuePrefix="XAF"
                  chartType="line"
                />
                <StatisticsWidget 
                  title="Ventes par catégorie (%)" 
                  data={topCategories} 
                  color="#6366f1"
                  valueSuffix="%"
                  chartType="pie"
                />
              </div>
            </div>
            <div>
              <AdminNotifications />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StatisticsWidget 
              title="Commandes hebdomadaires" 
              data={weeklyOrders} 
              color="#f59e0b"
              chartType="bar"
            />
            <StatisticsWidget 
              title="Sources clients" 
              data={customerSources} 
              color="#8b5cf6"
              valueSuffix="%"
              chartType="pie"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <KpiCard 
              title="Ventes aujourd'hui" 
              value="475.25 XAF" 
              icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
              change="12.5%"
              changeType="increase"
              changeLabel="vs hier"
            />
            <KpiCard 
              title="Commandes en attente" 
              value="8" 
              icon={<Calendar className="h-5 w-5 text-muted-foreground" />}
            />
            <KpiCard 
              title="Livraisons en cours" 
              value="6" 
              icon={<Truck className="h-5 w-5 text-muted-foreground" />}
              change="2"
              changeType="increase"
              changeLabel="nouvelles"
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Analyse des ventes</CardTitle>
              <CardDescription>Consultez les indicateurs détaillés des ventes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <StatisticsWidget 
                  title="" 
                  data={monthlySales} 
                  color="#22c55e"
                  valuePrefix="XAF"
                  chartType="line"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Orders Table (Full) */}
          <Card>
            <CardHeader>
              <CardTitle>Commandes récentes</CardTitle>
              <CardDescription>Les 5 dernières commandes de votre boutique.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Montant</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {recentOrdersData.map((order, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{order.id}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{order.customer}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{order.date}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{order.amount.toFixed(2)} XAF</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'Livré' ? 'bg-green-100 text-green-700 border-green-300' :
                            order.status === 'En cours' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <Button variant="ghost" size="sm">Voir</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Produits populaires</CardTitle>
                  <CardDescription>Les produits les plus vendus de votre boutique.</CardDescription>
                </div>
                <Button size="sm">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Voir tous
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Produit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Catégorie</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Prix</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ventes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">Bouquet Élégance Rose</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">Bouquets</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">59.99 XAF</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">24</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">Harmonie Printanière</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">Bouquets</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">49.99 XAF</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">18</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">Orchidée Zen</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">Plantes</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">69.99 XAF</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">15</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Low Stock Products Section */}
          <StockAlerts lowStockThreshold={5} maxItems={5} />
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu des clients</CardTitle>
              <CardDescription>Statistiques et informations sur vos clients.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatisticsWidget 
                  title="Sources d'acquisition" 
                  data={customerSources} 
                  chartType="pie"
                  valueSuffix="%"
                />
                <div>
                  <h3 className="text-lg font-medium mb-4">Clients récents</h3>
                  <div className="space-y-4">
                    {['Sophie Martin', 'Thomas Dubois', 'Laura Petit'].map((name, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{name}</p>
                          <p className="text-sm text-muted-foreground">Client depuis {i+1} jour{i > 0 ? 's' : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytiques</CardTitle>
              <CardDescription>
                Visualisez les performances de votre boutique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatisticsWidget 
                  title="Ventes mensuelles (XAF)" 
                  data={monthlySales} 
                  color="#22c55e"
                  valuePrefix="XAF"
                  chartType="line"
                />
                <StatisticsWidget 
                  title="Sources clients" 
                  data={customerSources} 
                  color="#8b5cf6"
                  valueSuffix="%"
                  chartType="pie"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapports</CardTitle>
              <CardDescription>
                Téléchargez les rapports de votre boutique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                    <FileText className="h-8 w-8 mb-1" />
                    <span>Rapport des ventes</span>
                    <span className="text-xs text-muted-foreground">Juin 2023</span>
                  </Button>
                  
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                    <Users className="h-8 w-8 mb-1" />
                    <span>Rapport clients</span>
                    <span className="text-xs text-muted-foreground">Juin 2023</span>
                  </Button>
                  
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                    <Package className="h-8 w-8 mb-1" />
                    <span>Inventaire produits</span>
                    <span className="text-xs text-muted-foreground">Juin 2023</span>
                  </Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Rapports programmés</h3>
                  <p className="text-muted-foreground">
                    Les rapports automatiques seront disponibles prochainement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;