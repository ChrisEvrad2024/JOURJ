// src/pages/admin/AdminOrdersManagement.jsx
import { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  RefreshCw,
  Filter,
  Plus,
  Upload,
  BarChart3
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import OrderService from "@/services/OrderService";
import OrdersTable from "@/components/admin/orders/OrdersTable";
import OrderFilters from "@/components/admin/orders/OrderFilters";
import OrderStats from "@/components/admin/orders/OrderStats";

const AdminOrdersManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [statsPeriod, setStatsPeriod] = useState("month");
  const [filters, setFilters] = useState({
    status: [],
    dateFrom: null,
    dateTo: null,
    minAmount: null,
    maxAmount: null
  });

  // Charger les commandes
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const fetchedOrders = await OrderService.getAllOrders();
        setOrders(fetchedOrders);
        setFilteredOrders(fetchedOrders);
      } catch (error) {
        console.error("Erreur lors du chargement des commandes:", error);
        toast.error("Impossible de charger les commandes");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    let result = [...orders];

    // Filtre par statut
    if (filters.status && filters.status.length > 0) {
      result = result.filter(order => filters.status.includes(order.status));
    }

    // Filtre par date
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter(order => new Date(order.createdAt) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Fin de journée
      result = result.filter(order => new Date(order.createdAt) <= toDate);
    }

    // Filtre par montant
    if (filters.minAmount) {
      result = result.filter(order => order.total >= filters.minAmount);
    }

    if (filters.maxAmount) {
      result = result.filter(order => order.total <= filters.maxAmount);
    }

    // Filtre par onglet actif (si ce n'est pas "all")
    if (activeTab !== "all") {
      result = result.filter(order => order.status === activeTab);
    }

    setFilteredOrders(result);
  }, [filters, orders, activeTab]);

  // Rafraîchir les commandes
  const handleRefresh = async () => {
    try {
      setLoading(true);
      toast.info("Rafraîchissement des commandes...");
      const refreshedOrders = await OrderService.getAllOrders();
      setOrders(refreshedOrders);
      toast.success("Commandes rafraîchies avec succès");
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des commandes:", error);
      toast.error("Impossible de rafraîchir les commandes");
    } finally {
      setLoading(false);
    }
  };

  // Exporter les commandes au format CSV
  const handleExportCSV = () => {
    try {
      const csvContent = OrderService.exportOrdersToCsv(filteredOrders);
      
      // Créer un Blob avec le contenu CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Créer un lien pour télécharger le fichier
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `commandes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Export CSV réussi");
    } catch (error) {
      console.error("Erreur lors de l'export CSV:", error);
      toast.error("Impossible d'exporter les commandes");
    }
  };

  // Gérer le changement de statut d'une commande
  const handleOrderStatusChange = (orderId, newStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus } 
          : order
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des commandes</h1>
          <Breadcrumb className="text-sm text-muted-foreground mt-1">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Tableau de bord</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/orders">Commandes</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Rafraîchir
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button variant="default" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Générer rapport
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">
              Toutes ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              En attente ({orders.filter(o => o.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="processing">
              En traitement ({orders.filter(o => o.status === 'processing').length})
            </TabsTrigger>
            <TabsTrigger value="shipped">
              Expédiées ({orders.filter(o => o.status === 'shipped').length})
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Livrées ({orders.filter(o => o.status === 'delivered').length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Annulées ({orders.filter(o => o.status === 'cancelled').length})
            </TabsTrigger>
          </TabsList>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab("stats")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistiques
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <TabsContent value="stats">
              <OrderStats orders={orders} period={statsPeriod} />
            </TabsContent>
            
            <TabsContent value="all" className="space-y-4">
              <OrderFilters onFilterChange={setFilters} />
              <OrdersTable 
                orders={filteredOrders} 
                onStatusChange={handleOrderStatusChange}
                onRefresh={handleRefresh}
              />
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              <OrderFilters onFilterChange={setFilters} />
              <OrdersTable 
                orders={filteredOrders} 
                onStatusChange={handleOrderStatusChange}
                onRefresh={handleRefresh}
              />
            </TabsContent>
            
            <TabsContent value="processing" className="space-y-4">
              <OrderFilters onFilterChange={setFilters} />
              <OrdersTable 
                orders={filteredOrders} 
                onStatusChange={handleOrderStatusChange}
                onRefresh={handleRefresh}
              />
            </TabsContent>
            
            <TabsContent value="shipped" className="space-y-4">
              <OrderFilters onFilterChange={setFilters} />
              <OrdersTable 
                orders={filteredOrders} 
                onStatusChange={handleOrderStatusChange}
                onRefresh={handleRefresh}
              />
            </TabsContent>
            
            <TabsContent value="delivered" className="space-y-4">
              <OrderFilters onFilterChange={setFilters} />
              <OrdersTable 
                orders={filteredOrders} 
                onStatusChange={handleOrderStatusChange}
                onRefresh={handleRefresh}
              />
            </TabsContent>
            
            <TabsContent value="cancelled" className="space-y-4">
              <OrderFilters onFilterChange={setFilters} />
              <OrdersTable 
                orders={filteredOrders} 
                onStatusChange={handleOrderStatusChange}
                onRefresh={handleRefresh}
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default AdminOrdersManagement;