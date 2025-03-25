// src/pages/admin/AdminAnalytics.tsx
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Calendar 
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Services
import { OrderService, QuoteService, ProductService } from "@/services";

// Types de période pour les analyses
const PERIOD_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
};

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(PERIOD_TYPES.MONTHLY);
  const [salesData, setSalesData] = useState([]);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  });
  const [quoteStats, setQuoteStats] = useState({
    totalQuotes: 0,
    acceptedQuotesRate: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    newUsersThisMonth: 0
  });

  // Charger les données analytiques
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Récupérer les statistiques de commandes
        const orders = await OrderService.getOrderAnalytics(period);
        setOrderStats({
          totalOrders: orders.total,
          totalRevenue: orders.revenue,
          averageOrderValue: orders.averageValue
        });
        setSalesData(orders.salesByPeriod);

        // Récupérer les statistiques de devis
        const quotes = await QuoteService.getQuoteAnalytics(period);
        setQuoteStats({
          totalQuotes: quotes.total,
          acceptedQuotesRate: quotes.acceptedRate
        });

        // Récupérer les produits les plus vendus
        const topSellingProducts = await ProductService.getTopSellingProducts(5);
        setTopProducts(topSellingProducts);

        // Récupérer les statistiques utilisateurs
        const users = await UserService.getUserAnalytics(period);
        setUserStats({
          totalUsers: users.total,
          newUsersThisMonth: users.newThisMonth
        });

      } catch (error) {
        console.error("Erreur lors du chargement des analyses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  // État de chargement
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytiques</h1>
            <p className="text-muted-foreground">Tableau de bord des performances</p>
          </div>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded-md w-full max-w-md"></div>
          <div className="h-64 bg-muted rounded-md w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytiques</h1>
          <p className="text-muted-foreground">Tableau de bord des performances</p>
        </div>
        <div>
          <Tabs 
            value={period} 
            onValueChange={setPeriod}
          >
            <TabsList>
              <TabsTrigger value={PERIOD_TYPES.DAILY}>Journalier</TabsTrigger>
              <TabsTrigger value={PERIOD_TYPES.WEEKLY}>Hebdomadaire</TabsTrigger>
              <TabsTrigger value={PERIOD_TYPES.MONTHLY}>Mensuel</TabsTrigger>
              <TabsTrigger value={PERIOD_TYPES.YEARLY}>Annuel</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Blocs de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Statistiques de commandes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {orderStats.totalRevenue.toFixed(2)} XAF de chiffre d'affaires
            </p>
          </CardContent>
        </Card>

        {/* Statistiques de devis */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devis</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quoteStats.totalQuotes}</div>
            <p className="text-xs text-muted-foreground">
              {(quoteStats.acceptedQuotesRate * 100).toFixed(1)}% acceptés
            </p>
          </CardContent>
        </Card>

        {/* Statistiques utilisateurs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {userStats.newUsersThisMonth} nouveaux ce mois-ci
            </p>
          </CardContent>
        </Card>

        {/* Période sélectionnée */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Période</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{period}</div>
            <p className="text-xs text-muted-foreground">Vue d'ensemble</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et tableaux détaillés */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Graphique des ventes */}
        <Card>
          <CardHeader>
            <CardTitle>Ventes</CardTitle>
            <CardDescription>Évolution des ventes {period}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Chiffre d'affaires" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Produits top vendus */}
        <Card>
          <CardHeader>
            <CardTitle>Produits phares</CardTitle>
            <CardDescription>Top 5 des produits les plus vendus</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-sm">{index + 1}</span>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                    <span className="font-bold">{product.salesCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;