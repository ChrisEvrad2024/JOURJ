// src/pages/account/OrderHistory.jsx
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  ChevronRight, 
  Package, 
  TruckIcon, 
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "../../hooks/useOrders";
import { useAuth } from "../../contexts/AuthContext";

// Status mapping for displaying appropriate UI
const statusConfig = {
  pending: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="h-4 w-4" />
  },
  processing: {
    label: "En cours de traitement",
    color: "bg-blue-100 text-blue-800",
    icon: <Clock className="h-4 w-4" />
  },
  shipped: {
    label: "Expédiée",
    color: "bg-purple-100 text-purple-800",
    icon: <TruckIcon className="h-4 w-4" />
  },
  delivered: {
    label: "Livrée",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="h-4 w-4" />
  },
  cancelled: {
    label: "Annulée",
    color: "bg-red-100 text-red-800",
    icon: <AlertCircle className="h-4 w-4" />
  },
  refunded: {
    label: "Remboursée",
    color: "bg-orange-100 text-orange-800",
    icon: <AlertCircle className="h-4 w-4" />
  }
};

const OrderHistory = () => {
  const [searchParams] = useSearchParams();
  const highlightedOrderId = searchParams.get("highlight");
  const [activeTab, setActiveTab] = useState("all");
  const { currentUser } = useAuth();
  
  const {
    orders,
    loading,
    error,
    cancelOrder
  } = useOrders();
  
  // Filter orders based on active tab
  const filteredOrders = activeTab === "all" 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  // Format date to French locale
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId);
    } catch (error) {
      console.error("Failed to cancel order:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif">Mes commandes</h1>
          <p className="text-muted-foreground">
            Chargement de vos commandes...
          </p>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif">Mes commandes</h1>
          <p className="text-muted-foreground text-red-500">
            Une erreur est survenue lors du chargement de vos commandes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif">Mes commandes</h1>
        <p className="text-muted-foreground">
          Consultez et suivez l'historique de vos commandes.
        </p>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Toutes ({orders.length})</TabsTrigger>
          <TabsTrigger value="processing">En cours ({orders.filter(o => o.status === "processing").length})</TabsTrigger>
          <TabsTrigger value="delivered">Livrées ({orders.filter(o => o.status === "delivered").length})</TabsTrigger>
          <TabsTrigger value="cancelled">Annulées ({orders.filter(o => o.status === "cancelled").length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <Card 
                key={order.id} 
                className={`overflow-hidden transition-all ${
                  highlightedOrderId === order.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardHeader className="bg-muted/50 py-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-base">Commande #{order.orderNumber}</CardTitle>
                      <CardDescription>
                        {formatDate(order.createdAt)} • {order.items.length} article{order.items.length > 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 md:mt-0">
                      <Badge 
                        variant="outline"
                        className={`${statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'} flex gap-1 items-center`}
                      >
                        {statusConfig[order.status]?.icon || <Clock className="h-4 w-4" />}
                        {statusConfig[order.status]?.label || order.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  {/* Order items */}
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex items-start space-x-4">
                        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                          <img 
                            src={item.productImage} 
                            alt={item.productName} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantité: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.price.toFixed(2)} €</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* Order summary and actions */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold">Total: {order.total.toFixed(2)} €</p>
                      
                      {order.tracking && (
                        <a 
                          href={order.tracking.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center mt-1"
                        >
                          <Package className="h-3 w-3 mr-1" />
                          Suivre colis {order.tracking.carrier} ({order.tracking.number})
                        </a>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 mt-4 md:mt-0">
                      <Button variant="outline" size="sm">
                        Détails
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                      {(order.status === "pending" || order.status === "processing") && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          Annuler
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Aucune commande trouvée</h3>
                <p className="text-muted-foreground mt-1 text-center">
                  Vous n'avez pas encore de commandes dans cette catégorie.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/catalog">Commencer vos achats</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderHistory;