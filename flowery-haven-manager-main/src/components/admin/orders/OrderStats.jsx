// src/components/admin/orders/OrderStats.jsx
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
  LineChart, 
  BarChart, 
  PieChart, 
  Line, 
  Bar, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { 
  CreditCard, 
  TrendingUp, 
  Package, 
  Activity,
  Users,
  Calendar,
  RefreshCw,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderService from "@/services/OrderService";
import { toast } from "sonner";

const OrderStats = ({ orders, period = "month" }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const stats = await OrderService.getOrderStats(period);
        setOrderStats(stats);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
        toast.error("Impossible de charger les statistiques");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [period]);

  // Couleurs pour les graphiques
  const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", 
    "#82CA9D", "#FF6B6B", "#6B66FF", "#FFC857", "#6C757D"
  ];

  // Formatter XAF pour l'affichage
  const formatXAF = (value) => {
    return `${value.toLocaleString()} XAF`;
  };

  // Formatter la date pour l'affichage
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  // Données pour le graphique des commandes par statut
  const prepareStatusChartData = () => {
    if (!orderStats || !orderStats.ordersByStatus) return [];
    
    return Object.entries(orderStats.ordersByStatus).map(([status, count], index) => ({
      name: status,
      value: count,
      color: COLORS[index % COLORS.length]
    }));
  };

  // Données pour le graphique des ventes par jour
  const prepareDailySalesData = () => {
    if (!orderStats || !orderStats.dailySales) return [];
    
    return orderStats.dailySales.map(item => ({
      name: formatDate(item.date),
      revenue: item.revenue,
      orders: item.orders
    }));
  };

  // Rendre un graphique des commandes par statut
  const renderStatusChart = () => {
    const data = prepareStatusChartData();
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, "Commandes"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Rendre un graphique des ventes par jour
  const renderDailySalesChart = () => {
    const data = prepareDailySalesData();
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" orientation="left" stroke="#0088FE" />
          <YAxis yAxisId="right" orientation="right" stroke="#00C49F" />
          <Tooltip formatter={(value, name) => [
            name === 'revenue' ? formatXAF(value) : value,
            name === 'revenue' ? 'Chiffre d\'affaires' : 'Commandes'
          ]} />
          <Legend />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            name="Commandes"
            stroke="#00C49F"
            activeDot={{ r: 8 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            name="Chiffre d'affaires"
            stroke="#0088FE"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Rendre le top des produits vendus
  const renderTopProductsChart = () => {
    if (!orderStats || !orderStats.topProducts) return null;
    
    const data = orderStats.topProducts.map((product, index) => ({
      name: product.name,
      value: product.quantity,
      color: COLORS[index % COLORS.length]
    }));
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => [value, "Quantité vendue"]} />
          <Legend />
          <Bar dataKey="value" name="Quantité vendue">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-md w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-muted rounded-md"></div>
            <div className="h-24 bg-muted rounded-md"></div>
            <div className="h-24 bg-muted rounded-md"></div>
          </div>
          <div className="h-80 bg-muted rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orderStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* KPI: Total des commandes */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total des commandes</p>
                      <h3 className="text-2xl font-bold">{orderStats.totalOrders}</h3>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KPI: Chiffre d'affaires */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Chiffre d'affaires</p>
                      <h3 className="text-2xl font-bold">{formatXAF(orderStats.totalRevenue)}</h3>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KPI: Panier moyen */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Panier moyen</p>
                      <h3 className="text-2xl font-bold">{formatXAF(orderStats.avgOrderValue)}</h3>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="sales">Ventes</TabsTrigger>
              <TabsTrigger value="products">Produits</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Graphique des commandes par statut */}
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition des commandes</CardTitle>
                    <CardDescription>
                      Répartition des commandes par statut sur la période
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderStatusChart()}
                  </CardContent>
                </Card>

                {/* Graphique des ventes quotidiennes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ventes quotidiennes</CardTitle>
                    <CardDescription>
                      Évolution des ventes sur la période
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderDailySalesChart()}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sales" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Évolution des ventes</CardTitle>
                  <CardDescription>
                    Analyse détaillée des ventes sur la période
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  {renderDailySalesChart()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Produits les plus vendus</CardTitle>
                  <CardDescription>
                    Top 5 des produits les plus vendus sur la période
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  {renderTopProductsChart()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default OrderStats;