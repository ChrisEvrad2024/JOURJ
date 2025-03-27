// src/pages/admin/AdminOrderDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Clock, 
  TruckIcon, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  FileText,
  Printer,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  CreditCard,
  Edit,
  Send,
  Calendar,
  Download,
  RotateCcw
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import OrderService from "@/services/OrderService";
import AdminService from "@/services/AdminService";

// Configuration des statuts pour l'affichage
const statusConfig = {
  pending: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <Clock className="h-4 w-4" />
  },
  processing: {
    label: "En traitement",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <RefreshCw className="h-4 w-4" />
  },
  shipped: {
    label: "Expédiée",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: <TruckIcon className="h-4 w-4" />
  },
  delivered: {
    label: "Livrée",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="h-4 w-4" />
  },
  cancelled: {
    label: "Annulée",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <AlertCircle className="h-4 w-4" />
  },
  refunded: {
    label: "Remboursée",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: <RotateCcw className="h-4 w-4" />
  }
};
const AdminOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTrackingDialog, setShowTrackingDialog] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [showRefundDialog, setShowRefundDialog] = useState(false);
    const [showNoteDialog, setShowNoteDialog] = useState(false);
    
    // États pour les formulaires
    const [trackingInfo, setTrackingInfo] = useState({
      carrier: "",
      trackingNumber: "",
      trackingUrl: ""
    });
    
    const [statusUpdate, setStatusUpdate] = useState({
      status: "",
      notes: ""
    });
    
    const [refundInfo, setRefundInfo] = useState({
      reason: "",
      amount: ""
    });
    
    const [noteInfo, setNoteInfo] = useState({
      message: "",
      isInternal: true
    });
  
    // Charger les détails de la commande
    useEffect(() => {
      const fetchOrderDetails = async () => {
        try {
          setLoading(true);
          const orderData = await OrderService.getOrderById(id);
          
          if (!orderData) {
            toast.error("Commande introuvable");
            navigate("/admin/orders");
            return;
          }
          
          setOrder(orderData);
          
          // Préremplir les formulaires
          if (orderData.tracking) {
            setTrackingInfo({
              carrier: orderData.tracking.carrier || "",
              trackingNumber: orderData.tracking.trackingNumber || "",
              trackingUrl: orderData.tracking.trackingUrl || ""
            });
          }
          
          setStatusUpdate({
            status: orderData.status,
            notes: ""
          });
          
          setRefundInfo({
            reason: "",
            amount: orderData.total.toFixed(2)
          });
        } catch (error) {
          console.error("Erreur lors du chargement des détails de la commande:", error);
          toast.error("Impossible de charger les détails de la commande");
          navigate("/admin/orders");
        } finally {
          setLoading(false);
        }
      };
  
      if (id) {
        fetchOrderDetails();
      }
    }, [id, navigate]);

    // Formater la date
  const formatDate = (dateString, includeTime = true) => {
    if (!dateString) return "N/A";
    
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Gérer le changement de statut
  const handleStatusChange = async () => {
    try {
      await OrderService.updateOrderStatus(id, statusUpdate.status, statusUpdate.notes);
      
      // Mettre à jour l'ordre local
      setOrder(prev => ({
        ...prev,
        status: statusUpdate.status,
        statusHistory: [...(prev.statusHistory || []), {
          status: statusUpdate.status,
          date: new Date().toISOString(),
          notes: statusUpdate.notes
        }]
      }));
      
      setShowStatusDialog(false);
      toast.success(`Statut mis à jour: ${statusConfig[statusUpdate.status].label}`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error("Impossible de mettre à jour le statut");
    }
  };
  
  // Gérer l'ajout d'informations de suivi
  const handleAddTracking = async () => {
    try {
      await OrderService.addTrackingInfo(id, {
        carrier: trackingInfo.carrier,
        trackingNumber: trackingInfo.trackingNumber,
        trackingUrl: trackingInfo.trackingUrl
      });
      
      // Mettre à jour l'ordre local
      setOrder(prev => ({
        ...prev,
        tracking: {
          carrier: trackingInfo.carrier,
          trackingNumber: trackingInfo.trackingNumber,
          trackingUrl: trackingInfo.trackingUrl,
          addedAt: new Date().toISOString()
        },
        // Si la commande n'est pas encore expédiée, mettre à jour son statut
        status: prev.status === 'pending' || prev.status === 'processing' ? 'shipped' : prev.status,
        statusHistory: prev.status === 'pending' || prev.status === 'processing' 
          ? [...(prev.statusHistory || []), {
              status: 'shipped',
              date: new Date().toISOString(),
              notes: `Expédié avec ${trackingInfo.carrier} (${trackingInfo.trackingNumber})`
            }]
          : prev.statusHistory
      }));
      
      setShowTrackingDialog(false);
      toast.success("Informations de suivi ajoutées");
    } catch (error) {
      console.error("Erreur lors de l'ajout des informations de suivi:", error);
      toast.error("Impossible d'ajouter les informations de suivi");
    }
  };
  // Gérer le remboursement
  const handleRefund = async () => {
    try {
      if (!refundInfo.reason) {
        toast.error("Veuillez indiquer une raison pour le remboursement");
        return;
      }
      
      await OrderService.refundOrder(id, refundInfo.reason, parseFloat(refundInfo.amount));
      
      // Mettre à jour l'ordre local
      setOrder(prev => ({
        ...prev,
        status: 'refunded',
        refundAmount: parseFloat(refundInfo.amount),
        refundReason: refundInfo.reason,
        refundedAt: new Date().toISOString(),
        statusHistory: [...(prev.statusHistory || []), {
          status: 'refunded',
          date: new Date().toISOString(),
          notes: `Remboursement de ${refundInfo.amount} XAF - Raison: ${refundInfo.reason}`
        }]
      }));
      
      setShowRefundDialog(false);
      toast.success("Commande remboursée avec succès");
    } catch (error) {
      console.error("Erreur lors du remboursement:", error);
      toast.error("Impossible de rembourser la commande");
    }
  };
  
  // Gérer l'ajout d'une note
  const handleAddNote = async () => {
    try {
      if (!noteInfo.message) {
        toast.error("Veuillez saisir un message");
        return;
      }
      
      await OrderService.addOrderNote(id, noteInfo.message, noteInfo.isInternal);
      
      // Mettre à jour l'ordre local
      setOrder(prev => ({
        ...prev,
        notes: [...(prev.notes || []), {
          message: noteInfo.message,
          isInternal: noteInfo.isInternal,
          createdAt: new Date().toISOString()
        }]
      }));
      
      setShowNoteDialog(false);
      setNoteInfo({ message: "", isInternal: true });
      toast.success("Note ajoutée avec succès");
    } catch (error) {
      console.error("Erreur lors de l'ajout de la note:", error);
      toast.error("Impossible d'ajouter la note");
    }
  };
  
  // Générer et télécharger une facture
  const handleGenerateInvoice = async () => {
    try {
      const invoiceBlob = await AdminService.generateInvoice(id);
      const url = URL.createObjectURL(invoiceBlob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `facture-${id}.txt`; // Dans une vraie application, ce serait .pdf
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Facture générée pour la commande #${id}`);
    } catch (error) {
      console.error("Erreur lors de la génération de la facture:", error);
      toast.error("Impossible de générer la facture");
    }
  };

  // Envoyer un e-mail au client
  const handleSendEmail = async (type) => {
    try {
      await AdminService.sendOrderEmail(id, type);
      toast.success(`E-mail de ${type} envoyé au client`);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'e-mail:", error);
      toast.error("Impossible d'envoyer l'e-mail");
    }
  };
  
  // Marquer une commande comme livrée
  const handleMarkAsDelivered = async () => {
    try {
      await OrderService.markAsDelivered(id, "Marqué comme livré par l'administrateur");
      
      // Mettre à jour l'ordre local
      setOrder(prev => ({
        ...prev,
        status: 'delivered',
        deliveredAt: new Date().toISOString(),
        statusHistory: [...(prev.statusHistory || []), {
          status: 'delivered',
          date: new Date().toISOString(),
          notes: "Marqué comme livré par l'administrateur"
        }]
      }));
      
      toast.success("Commande marquée comme livrée");
    } catch (error) {
      console.error("Erreur lors du marquage comme livré:", error);
      toast.error("Impossible de marquer la commande comme livrée");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded-md w-1/3"></div>
          <div className="h-10 bg-muted rounded-md w-2/3"></div>
          <div className="h-40 bg-muted rounded-md w-full"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 mb-6"
          onClick={() => navigate("/admin/orders")}
        >
          <ArrowLeft size={16} />
          Retour à la liste des commandes
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
              <a href="/admin/orders">Voir toutes les commandes</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Tableau de bord</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/orders">Commandes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>{order.id}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <h1 className="text-2xl font-bold tracking-tight">
            Commande #{order.id}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant="outline"
              className={`${statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'} flex gap-1 items-center`}
            >
              {statusConfig[order.status]?.icon || <Clock className="h-4 w-4" />}
              {statusConfig[order.status]?.label || order.status}
            </Badge>
            <span className="text-muted-foreground">
              Passée le {formatDate(order.createdAt)}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate("/admin/orders")}
          >
            <ArrowLeft size={16} />
            Retour aux commandes
          </Button>
          
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleGenerateInvoice}
          >
            <FileText className="h-4 w-4" />
            Générer facture
          </Button>
          
          <Button 
            variant="default"
            className="flex items-center gap-2"
            onClick={() => handleSendEmail('confirmation')}
          >
            <Send className="h-4 w-4" />
            Contacter client
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Informations principales */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Détails de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                {/* Informations de la commande */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Informations</p>
                  <div className="text-sm space-y-1">
                    <div className="flex gap-2 items-center">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Date: {formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span>Paiement: {order.paymentMethod}</span>
                    </div>
                    {order.shippingMethod && (
                      <div className="flex gap-2 items-center">
                        <TruckIcon className="h-4 w-4 text-muted-foreground" />
                        <span>Livraison: {order.shippingMethod.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Suivi de la commande */}
                {order.tracking && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Suivi de livraison</p>
                    <div className="text-sm space-y-1">
                      <div className="flex gap-2 items-center">
                        <TruckIcon className="h-4 w-4 text-muted-foreground" />
                        <span>Transporteur: {order.tracking.carrier}</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>Numéro: {order.tracking.trackingNumber}</span>
                      </div>
                      {order.tracking.trackingUrl && (
                        <a 
                          href={order.tracking.trackingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:underline inline-flex items-center"
                        >
                          <span>Suivre le colis</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Statut */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Statut</p>
                  <div className="flex flex-col gap-2">
                    <Badge 
                      variant="outline"
                      className={`${statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'} flex gap-1 items-center self-start`}
                    >
                      {statusConfig[order.status]?.icon || <Clock className="h-4 w-4" />}
                      {statusConfig[order.status]?.label || order.status}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="self-start"
                      onClick={() => setShowStatusDialog(true)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Changer le statut
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              {/* Historique des statuts */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Historique</p>
                  <ol className="relative border-l border-muted space-y-4">
                    {order.statusHistory.map((statusItem, index) => (
                      <li key={index} className="ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-background">
                          {statusConfig[statusItem.status]?.icon || <Clock className="h-4 w-4" />}
                        </span>
                        <div className="ml-2">
                          <h3 className="flex items-center text-sm font-semibold">
                            {statusConfig[statusItem.status]?.label || statusItem.status}
                            {index === 0 && (
                              <span className="bg-primary text-primary-foreground text-xs font-medium mr-2 px-2.5 py-0.5 rounded ml-3">
                                Récent
                              </span>
                            )}
                          </h3>
                          <time className="block text-xs font-normal leading-none text-muted-foreground">
                            {formatDate(statusItem.date)}
                          </time>
                          {statusItem.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {statusItem.notes}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowTrackingDialog(true)}
                >
                  {order.tracking ? "Modifier suivi" : "Ajouter suivi"}
                </Button>
                {order.status === 'shipped' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleMarkAsDelivered}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marquer comme livrée
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {order.status !== 'cancelled' && order.status !== 'refunded' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => {
                        setStatusUpdate({
                          status: 'cancelled',
                          notes: ""
                        });
                        setShowStatusDialog(true);
                      }}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-orange-500 hover:text-orange-600"
                      onClick={() => setShowRefundDialog(true)}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Rembourser
                    </Button>
                  </>
                )}
              </div>
            </CardFooter>
          </Card>
          {/* Articles commandés */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Articles commandés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
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
                        <p className="font-medium">{item.name}</p>
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
                      {item.sku && (
                        <p className="text-xs text-muted-foreground mt-1">
                          SKU: {item.sku}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Notes sur la commande */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Notes sur la commande</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowNoteDialog(true)}
                >
                  Ajouter une note
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {order.notes && order.notes.length > 0 ? (
                <div className="space-y-4">
                  {order.notes.map((note, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium">
                          {note.isInternal ? "Note interne" : "Note client"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(note.createdAt)}
                        </p>
                      </div>
                      <p className="text-sm mt-2">{note.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Aucune note pour cette commande.</p>
              )}
              {order.notes && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setShowNoteDialog(true)}
                >
                  Ajouter une note
                </Button>
              )}
            </CardContent>
          </Card>
          {/* Adresse de facturation */}
          {order.billingAddress && order.billingAddress !== order.shippingAddress && (
            <Card>
              <CardHeader className="pb-3">
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
        </div>
        
        <div className="space-y-6">
          {/* Récapitulatif de la commande */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
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
                {/* Informations de remboursement */}
                {order.status === 'refunded' && (
                  <div className="mt-4 p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <div className="flex items-center gap-2 text-orange-600">
                      <RotateCcw className="h-4 w-4" />
                      <p className="text-sm font-medium">Commande remboursée</p>
                    </div>
                    <div className="mt-2 text-sm">
                      <p><span className="font-medium">Montant:</span> {order.refundAmount?.toFixed(2) || order.total?.toFixed(2)} XAF</p>
                      <p><span className="font-medium">Date:</span> {formatDate(order.refundedAt)}</p>
                      <p><span className="font-medium">Raison:</span> {order.refundReason || "Non spécifiée"}</p>
                    </div>
                  </div>
                )}
                
                {/* Informations d'annulation */}
                {order.status === 'cancelled' && (
                  <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <p className="text-sm font-medium">Commande annulée</p>
                    </div>
                    {order.cancellationReason && (
                      <p className="mt-2 text-sm">
                        <span className="font-medium">Raison:</span> {order.cancellationReason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <Button className="w-full" onClick={handleGenerateInvoice}>
                  <FileText className="h-4 w-4 mr-2" />
                  Télécharger la facture
                </Button>
              </div>
            </CardFooter>
          </Card>
          {/* Informations client */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.shippingAddress && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  </div>
                  
                  {order.shippingAddress.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${order.shippingAddress.email}`} className="text-primary hover:underline">
                        {order.shippingAddress.email}
                      </a>
                    </div>
                  )}
                  
                  {order.shippingAddress.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${order.shippingAddress.phone}`} className="hover:underline">
                        {order.shippingAddress.phone}
                      </a>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => handleSendEmail('confirmation')}
                >
                  <Send className="h-3 w-3" />
                  Email
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/admin/customers/${order.userId}`)}
                >
                  Voir le profil
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Adresse de livraison */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Adresse de livraison</CardTitle>
            </CardHeader>
            <CardContent>
              {order.shippingAddress && (
                <div className="space-y-1">
                  <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Dialogues modaux */}
      
      {/* Dialogue de changement de statut */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Changer le statut de la commande</DialogTitle>
            <DialogDescription>
              Mettez à jour le statut de la commande et ajoutez des notes optionnelles.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Statut
              </Label>
              <select
                id="status"
                value={statusUpdate.status}
                onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {Object.entries(OrderService.ORDER_STATUS).map(([key, value]) => (
                  <option key={value} value={value}>{statusConfig[value]?.label || value}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={statusUpdate.notes}
                onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Ajoutez des notes concernant ce changement de statut..."
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>Annuler</Button>
            <Button onClick={handleStatusChange}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue d'ajout de suivi */}
      <Dialog open={showTrackingDialog} onOpenChange={setShowTrackingDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Informations de suivi</DialogTitle>
            <DialogDescription>
              Ajoutez ou modifiez les informations de suivi de la commande.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="carrier" className="text-right">
                Transporteur
              </Label>
              <Input
                id="carrier"
                value={trackingInfo.carrier}
                onChange={(e) => setTrackingInfo(prev => ({ ...prev, carrier: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trackingNumber" className="text-right">
                N° de suivi
              </Label>
              <Input
                id="trackingNumber"
                value={trackingInfo.trackingNumber}
                onChange={(e) => setTrackingInfo(prev => ({ ...prev, trackingNumber: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trackingUrl" className="text-right">
                URL de suivi
              </Label>
              <Input
                id="trackingUrl"
                value={trackingInfo.trackingUrl}
                onChange={(e) => setTrackingInfo(prev => ({ ...prev, trackingUrl: e.target.value }))}
                className="col-span-3"
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTrackingDialog(false)}>Annuler</Button>
            <Button onClick={handleAddTracking}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialogue de remboursement */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rembourser la commande</DialogTitle>
            <DialogDescription>
              Effectuez un remboursement total ou partiel pour cette commande.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Montant (XAF)
              </Label>
              <Input
                id="amount"
                type="number"
                value={refundInfo.amount}
                onChange={(e) => setRefundInfo(prev => ({ ...prev, amount: e.target.value }))}
                className="col-span-3"
                min="0"
                max={order.total}
                step="0.01"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Raison
              </Label>
              <Textarea
                id="reason"
                value={refundInfo.reason}
                onChange={(e) => setRefundInfo(prev => ({ ...prev, reason: e.target.value }))}
                className="col-span-3"
                rows={3}
                placeholder="Indiquez la raison du remboursement..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>Annuler</Button>
            <Button onClick={handleRefund} variant="destructive">Rembourser</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue d'ajout de note */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter une note</DialogTitle>
            <DialogDescription>
              Ajoutez une note interne ou visible par le client.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note-type" className="text-right">
                Type de note
              </Label>
              <select
                id="note-type"
                value={noteInfo.isInternal ? "internal" : "customer"}
                onChange={(e) => setNoteInfo(prev => ({ ...prev, isInternal: e.target.value === "internal" }))}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="internal">Note interne (admin seulement)</option>
                <option value="customer">Note client (visible par le client)</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="message" className="text-right">
                Message
              </Label>
              <Textarea
                id="message"
                value={noteInfo.message}
                onChange={(e) => setNoteInfo(prev => ({ ...prev, message: e.target.value }))}
                className="col-span-3"
                rows={4}
                placeholder="Saisissez votre note..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>Annuler</Button>
            <Button onClick={handleAddNote}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrderDetail;