// src/pages/account/OrderHistory.tsx
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  ChevronRight, 
  Package, 
  TruckIcon, 
  CheckCircle,
  Clock,
  AlertCircle,
  ShoppingBag,
  FileText,
  RefreshCw
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
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

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
    icon: <RefreshCw className="h-4 w-4" />
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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  
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

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleInitiateCancelOrder = (order) => {
    setOrderToCancel(order);
    setCancelReason("");
    setShowCancelDialog(true);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    
    try {
      await cancelOrder(orderToCancel.id, cancelReason);
      setShowCancelDialog(false);
      setOrderToCancel(null);
      
      // Affiche un message de confirmation
      toast.success("Commande annulée", {
        description: "Votre commande a été annulée avec succès."
      });
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast.error("Erreur d'annulation", {
        description: "Une erreur est survenue lors de l'annulation de la commande."
      });
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
          <p className="text-red-500">
            Une erreur est survenue lors du chargement de vos commandes.
          </p>
          <p className="text-muted-foreground mt-2">{error}</p>
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
                      <CardTitle className="text-base">Commande #{order.orderNumber || order.id}</CardTitle>
                      <CardDescription>
                        {formatDate(order.createdAt)} • {order.items?.length || 0} article{(order.items?.length || 0) > 1 ? 's' : ''}
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
                  {/* Order items - max 3 visible */}
                  <div className="space-y-4">
                    {(order.items || []).slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                          {item.productImage ? (
                            <img 
                              src={item.productImage} 
                              alt={item.name || item.productName} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name || item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantité: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.price?.toFixed(2) || '0.00'} XAF</p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show indication if there are more items */}
                    {(order.items?.length || 0) > 3 && (
                      <div className="text-center text-sm text-muted-foreground pt-2">
                        + {order.items.length - 3} autre{order.items.length - 3 > 1 ? 's' : ''} article{order.items.length - 3 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* Order summary and actions */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold">Total: {order.total?.toFixed(2) || '0.00'} XAF</p>
                      
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewOrderDetails(order)}
                      >
                        Détails
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                      {(order.status === "pending" || order.status === "processing") && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleInitiateCancelOrder(order)}
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
                  <ShoppingBag className="h-6 w-6 text-muted-foreground" />
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

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
            <DialogDescription>
              {selectedOrder && `Commande #${selectedOrder.orderNumber || selectedOrder.id} • ${formatDate(selectedOrder?.createdAt)}`}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center">
                <Badge 
                  variant="outline"
                  className={`${statusConfig[selectedOrder.status]?.color || 'bg-gray-100 text-gray-800'} flex gap-1 items-center`}
                >
                  {statusConfig[selectedOrder.status]?.icon || <Clock className="h-4 w-4" />}
                  {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                </Badge>
              </div>

              {/* Status History */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Historique du statut</h4>
                  <div className="space-y-2">
                    {selectedOrder.statusHistory.map((status, index) => (
                      <div key={index} className="text-sm flex items-start">
                        <div className="w-24 flex-shrink-0 text-muted-foreground">
                          {new Date(status.date).toLocaleDateString()}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">{statusConfig[status.status]?.label || status.status}</span>
                          {status.notes && <p className="text-muted-foreground text-xs mt-0.5">{status.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Order items */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Articles commandés</h4>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div className="flex items-start gap-2">
                        <span className="font-medium">{item.quantity}x</span>
                        <span>{item.name || item.productName}</span>
                      </div>
                      <div className="font-medium">
                        {(item.price * item.quantity)?.toFixed(2) || '0.00'} XAF
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order totals */}
              <div className="space-y-2 bg-muted p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Sous-total:</span>
                  <span>{selectedOrder.subtotal?.toFixed(2) || '0.00'} XAF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Frais de livraison:</span>
                  <span>{selectedOrder.shippingCost?.toFixed(2) || '0.00'} XAF</span>
                </div>
                {selectedOrder.taxAmount && (
                  <div className="flex justify-between text-sm">
                    <span>TVA:</span>
                    <span>{selectedOrder.taxAmount?.toFixed(2) || '0.00'} XAF</span>
                  </div>
                )}
                <Separator className="my-1" />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{selectedOrder.total?.toFixed(2) || '0.00'} XAF</span>
                </div>
              </div>

              {/* Shipping address */}
              {selectedOrder.shippingAddress && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Adresse de livraison</h4>
                  <div className="text-sm">
                    <p className="font-medium">{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                    <p>{selectedOrder.shippingAddress.address1}</p>
                    {selectedOrder.shippingAddress.address2 && <p>{selectedOrder.shippingAddress.address2}</p>}
                    <p>{selectedOrder.shippingAddress.postalCode} {selectedOrder.shippingAddress.city}</p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                    {selectedOrder.shippingAddress.phone && <p>Tél: {selectedOrder.shippingAddress.phone}</p>}
                  </div>
                </div>
              )}

              {/* Payment method */}
              {selectedOrder.paymentMethod && (
                <div className="text-sm">
                  <span className="font-medium">Méthode de paiement:</span> {selectedOrder.paymentMethod}
                </div>
              )}

              {/* Tracking info */}
              {selectedOrder.tracking && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Informations de suivi</h4>
                  <div className="text-sm">
                    <p>Transporteur: {selectedOrder.tracking.carrier}</p>
                    <p>Numéro de suivi: {selectedOrder.tracking.number}</p>
                    {selectedOrder.tracking.url && (
                      <a 
                        href={selectedOrder.tracking.url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center mt-1"
                      >
                        <TruckIcon className="h-3 w-3 mr-1" />
                        Suivre votre colis en ligne
                      </a>
                    )}
                  </div>
                </div>
              )}

              <DialogFooter>
                {(selectedOrder.status === "pending" || selectedOrder.status === "processing") && (
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      setShowOrderDetails(false);
                      handleInitiateCancelOrder(selectedOrder);
                    }}
                  >
                    Annuler la commande
                  </Button>
                )}
                <Button onClick={() => setShowOrderDetails(false)}>Fermer</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Annuler la commande</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison de l'annulation de votre commande.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Textarea
              placeholder="Raison de l'annulation (facultatif)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Note: L'annulation d'une commande est définitive. Si vous souhaitez les mêmes produits ultérieurement, vous devrez passer une nouvelle commande.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleCancelOrder}>
              Confirmer l'annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderHistory;