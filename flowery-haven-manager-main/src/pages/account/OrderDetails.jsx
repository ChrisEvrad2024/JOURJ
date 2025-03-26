// src/pages/account/OrderDetails.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Clock, 
  TruckIcon, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  FileClock,
  ShoppingCart
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useOrders } from "@/hooks/useOrders";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Configuration des statuts pour l'affichage
const statusConfig = {
  pending: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="h-4 w-4" />
  },
  processing: {
    label: "En traitement",
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
    icon: <RefreshCw className="h-4 w-4" />
  }
};

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  
  const { getOrderById, cancelOrder, reorderItems } = useOrders();
  
  // Récupérer les détails de la commande
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderDetails = await getOrderById(id);
        setOrder(orderDetails);
      } catch (error) {
        console.error("Erreur lors de la récupération de la commande:", error);
        toast.error("Erreur", {
          description: "Impossible de charger les détails de la commande."
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id, getOrderById]);

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Gérer l'annulation de commande
  const handleCancelOrder = async () => {
    try {
      await cancelOrder(id, cancelReason);
      setShowCancelDialog(false);
      toast.success("Commande annulée", {
        description: "Votre commande a été annulée avec succès."
      });
      
      // Mettre à jour l'état local pour refléter l'annulation
      setOrder(prev => ({
        ...prev,
        status: 'cancelled',
        cancellationReason: cancelReason
      }));
    } catch (error) {
      console.error("Erreur lors de l'annulation de la commande:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'annulation de la commande."
      });
    }
  };

  // Commander à nouveau les articles
  const handleReorder = async () => {
    try {
      if (!order || !order.items || order.items.length === 0) {
        throw new Error("Impossible de commander à nouveau: articles manquants");
      }
      
      await reorderItems(order.items);
      toast.success("Articles ajoutés au panier", {
        description: "Les articles ont été ajoutés à votre panier."
      });
      
      // Rediriger vers le panier
      navigate("/cart");
    } catch (error) {
      console.error("Erreur lors de la recommande:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'ajout des articles au panier."
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 mb-6"
          onClick={() => navigate("/account/orders")}
        >
          <ArrowLeft size={16} />
          Retour aux commandes
        </Button>
        
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-md w-1/3"></div>
          <div className="h-64 bg-muted rounded-md w-full"></div>
          <div className="h-36 bg-muted rounded-md w-full"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 mb-6"
          onClick={() => navigate("/account/orders")}
        >
          <ArrowLeft size={16} />
          Retour aux commandes
        </Button>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Commande introuvable</h3>
            <p className="text-muted-foreground mt-1 text-center">
              La commande que vous recherchez n'existe pas ou a été supprimée.
            </p>
            <Button asChild className="mt-4">
              <Link to="/account/orders">Voir mes commandes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 w-fit"
          onClick={() => navigate("/account/orders")}
        >
          <ArrowLeft size={16} />
          Retour aux commandes
        </Button>
        
        <div className="flex gap-2">
          {(order.status === "delivered" || order.status === "shipped") && (
            <Button 
              variant="outline" 
              onClick={handleReorder}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Commander à nouveau
            </Button>
          )}
          
          {(order.status === "pending" || order.status === "processing") && (
            <Button 
              variant="destructive"
              onClick={() => setShowCancelDialog(true)}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Annuler la commande
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-2xl font-serif">Commande #{order.orderNumber || order.id}</h1>
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline"
            className={`${statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'} flex gap-1 items-center`}
          >
            {statusConfig[order.status]?.icon || <Clock className="h-4 w-4" />}
            {statusConfig[order.status]?.label || order.status}
          </Badge>
          <span className="text-muted-foreground">Passée le {formatDate(order.createdAt)}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Récapitulatif de la commande */}
          <Card>
            <CardHeader>
              <CardTitle>Articles commandés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                      {item.productImage ? (
                        <img 
                          src={item.productImage} 
                          alt={item.name || item.productName} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="font-medium">{item.name || item.productName}</p>
                        <p className="font-medium text-right">{(item.price * item.quantity).toFixed(2)} XAF</p>
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-sm text-muted-foreground">
                          Quantité: {item.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.price?.toFixed(2) || '0.00'} XAF / unité
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <Button asChild variant="outline" size="sm">
                <Link to="/catalog">Continuer vos achats</Link>
              </Button>
              
              {(order.status === "delivered" || order.status === "shipped") && (
                <Button size="sm" onClick={handleReorder}>
                  Commander à nouveau
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {/* Suivi de la commande */}
          {order.tracking && (
            <Card>
              <CardHeader>
                <CardTitle>Suivi de livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TruckIcon className="h-4 w-4 text-primary" />
                    <span className="font-medium">Transporteur:</span>
                    <span>{order.tracking.carrier}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="font-medium">Numéro de suivi:</span>
                    <span>{order.tracking.number}</span>
                  </div>
                  
                  {order.tracking.url && (
                    <a 
                      href={order.tracking.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="mt-4 inline-block"
                    >
                      <Button variant="outline">
                        Suivre mon colis
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Historique de statut */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historique de la commande</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="relative border-l border-muted">
                  {order.statusHistory.map((statusItem, index) => (
                    <li key={index} className="mb-6 ml-6">
                      <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-background">
                        {statusConfig[statusItem.status]?.icon || <FileClock className="h-4 w-4" />}
                      </span>
                      <div className="ml-2">
                        <h3 className="flex items-center mb-1 text-sm font-semibold">
                          {statusConfig[statusItem.status]?.label || statusItem.status}
                          {index === 0 && (
                            <span className="bg-primary text-white text-xs font-medium mr-2 px-2.5 py-0.5 rounded ml-3">
                              Récent
                            </span>
                          )}
                        </h3>
                        <time className="block mb-2 text-xs font-normal leading-none text-muted-foreground">
                          {formatDate(statusItem.date)}
                        </time>
                        {statusItem.notes && (
                          <p className="text-sm text-muted-foreground">
                            {statusItem.notes}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Récapitulatif des montants */}
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{order.subtotal?.toFixed(2) || '0.00'} XAF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frais de livraison</span>
                  <span>{order.shippingCost?.toFixed(2) || '0.00'} XAF</span>
                </div>
                {order.taxAmount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TVA</span>
                    <span>{order.taxAmount.toFixed(2)} XAF</span>
                  </div>
                )}
                
                <Separator className="my-2" />
                
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{order.total?.toFixed(2) || '0.00'} XAF</span>
                </div>
                
                <div className="pt-2 text-xs text-muted-foreground">
                  Payé par {order.paymentMethod || 'carte bancaire'}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Adresse de livraison */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle>Adresse de livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && (
                    <p className="pt-2 text-sm">
                      <span className="font-medium">Tél:</span> {order.shippingAddress.phone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Adresse de facturation */}
          {order.billingAddress && order.billingAddress !== order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle>Adresse de facturation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{order.billingAddress.firstName} {order.billingAddress.lastName}</p>
                  <p>{order.billingAddress.address1}</p>
                  {order.billingAddress.address2 && <p>{order.billingAddress.address2}</p>}
                  <p>{order.billingAddress.postalCode} {order.billingAddress.city}</p>
                  <p>{order.billingAddress.country}</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Informations complémentaires */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Date de commande</p>
                    <p className="text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                
                {order.shippingMethod && (
                  <div className="flex items-start gap-2">
                    <TruckIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Mode de livraison</p>
                      <p className="text-muted-foreground">{order.shippingMethod.name || order.shippingMethod}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Paiement</p>
                    <p className="text-muted-foreground">{order.paymentMethod || 'Carte bancaire'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Boîte de dialogue d'annulation de commande */}
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

export default OrderDetails;