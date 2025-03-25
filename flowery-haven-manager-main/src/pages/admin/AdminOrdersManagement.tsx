// src/pages/admin/AdminOrdersManagement.tsx
import { useState, useEffect } from "react";
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
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  FileEdit, 
  Send,
  ClockIcon,
  CalendarIcon,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  User,
  Package,
  Truck
} from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { OrderService } from "@/services";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Status mapping for displaying appropriate UI
const statusConfig = {
  pending: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800",
    icon: <ClockIcon className="h-4 w-4" />
  },
  processing: {
    label: "En traitement",
    color: "bg-blue-100 text-blue-800",
    icon: <RefreshCw className="h-4 w-4" />
  },
  shipped: {
    label: "Expédié",
    color: "bg-purple-100 text-purple-800",
    icon: <Truck className="h-4 w-4" />
  },
  delivered: {
    label: "Livré",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="h-4 w-4" />
  },
  cancelled: {
    label: "Annulé",
    color: "bg-red-100 text-red-800",
    icon: <AlertCircle className="h-4 w-4" />
  },
  refunded: {
    label: "Remboursé",
    color: "bg-gray-100 text-gray-800",
    icon: <RefreshCw className="h-4 w-4" />
  }
};

const AdminOrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  
  // Load orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Apply filters
        const filters = {};
        if (statusFilter !== "all") filters.status = statusFilter;
        
        const allOrders = await OrderService.getAllOrders(filters);
        setOrders(allOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Erreur lors du chargement des commandes");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter]);

  // Filter orders by search query
  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    // Search by order id, customer name, contact info
    return (
      (order.id && order.id.toString().toLowerCase().includes(query)) ||
      (order.customerName && order.customerName.toLowerCase().includes(query)) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(query)) ||
      (order.orderNumber && order.orderNumber.toLowerCase().includes(query))
    );
  });

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  };

  // View order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Open update status dialog
  const handleUpdateStatusClick = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote("");
    setShowUpdateStatus(true);
  };

  // Submit status update
  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    try {
      // Update status
      await OrderService.updateOrderStatus(selectedOrder.id, newStatus, statusNote);
      
      // Reload orders
      const filters = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      const updatedOrders = await OrderService.getAllOrders(filters);
      setOrders(updatedOrders);
      
      toast.success("Statut mis à jour avec succès");
      setShowUpdateStatus(false);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  // Loading state
  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
            <p className="text-muted-foreground">Gérez les commandes de produits.</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
          <p className="text-muted-foreground">Gérez les commandes de produits.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher une commande..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="processing">En traitement</SelectItem>
                  <SelectItem value="shipped">Expédié</SelectItem>
                  <SelectItem value="delivered">Livré</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="refunded">Remboursé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.orderNumber || order.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{order.customerName}</div>
                          <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>{order.total?.toFixed(2) || "0.00"} €</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline"
                          className={`${statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'} flex gap-1 items-center mx-auto`}
                        >
                          {statusConfig[order.status]?.icon || <ClockIcon className="h-4 w-4" />}
                          {statusConfig[order.status]?.label || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatusClick(order)}>
                              <FileEdit className="mr-2 h-4 w-4" />
                              Mettre à jour statut
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Aucune commande trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Affichage de {filteredOrders.length} sur {orders.length} commandes
          </div>
        </CardFooter>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
            <DialogDescription>
              {selectedOrder && `Commande #${selectedOrder.orderNumber || selectedOrder.id} • ${formatDate(selectedOrder?.createdAt)}`}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Status and actions */}
              <div className="flex justify-between items-center">
                <Badge 
                  variant="outline"
                  className={`${statusConfig[selectedOrder.status]?.color || 'bg-gray-100 text-gray-800'} flex gap-1 items-center`}
                >
                  {statusConfig[selectedOrder.status]?.icon || <ClockIcon className="h-4 w-4" />}
                  {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                </Badge>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleUpdateStatusClick(selectedOrder)}
                  >
                    <FileEdit className="mr-2 h-4 w-4" />
                    Statut
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Détails</TabsTrigger>
                  <TabsTrigger value="customer">Client</TabsTrigger>
                  <TabsTrigger value="items">Articles</TabsTrigger>
                  <TabsTrigger value="shipping">Livraison</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  {/* Order details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Informations générales</h3>
                      <div className="text-sm p-3 bg-muted/50 rounded-lg space-y-2">
                        <p>
                          <span className="font-medium">Numéro de commande:</span>{" "}
                          {selectedOrder.orderNumber || selectedOrder.id}
                        </p>
                        <p>
                          <span className="font-medium">Date:</span>{" "}
                          {formatDate(selectedOrder.createdAt)}
                        </p>
                        <p>
                          <span className="font-medium">Mode de paiement:</span>{" "}
                          {selectedOrder.paymentMethod || "Non spécifié"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Montants</h3>
                      <div className="text-sm p-3 bg-muted/50 rounded-lg space-y-2">
                        <p>
                          <span className="font-medium">Sous-total:</span>{" "}
                          {selectedOrder.subtotal?.toFixed(2) || "0.00"} €
                        </p>
                        <p>
                          <span className="font-medium">Frais de livraison:</span>{" "}
                          {selectedOrder.shippingFee?.toFixed(2) || "0.00"} €
                        </p>
                        {selectedOrder.discount > 0 && (
                          <p>
                            <span className="font-medium">Remise:</span>{" "}
                            -{selectedOrder.discount?.toFixed(2) || "0.00"} €
                          </p>
                        )}
                        <Separator className="my-1" />
                        <p className="font-medium">
                          Total: {selectedOrder.total?.toFixed(2) || "0.00"} €
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Notes</h3>
                      <div className="text-sm p-3 bg-muted/50 rounded-lg">
                        {selectedOrder.notes}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="customer" className="space-y-4">
                  {/* Customer info */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Informations client</h3>
                    <div className="text-sm p-3 bg-muted/50 rounded-lg space-y-2">
                      <p>
                        <span className="font-medium">Nom:</span>{" "}
                        {selectedOrder.customerName}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        <a href={`mailto:${selectedOrder.customerEmail}`} className="text-primary hover:underline">
                          {selectedOrder.customerEmail}
                        </a>
                      </p>
                      {selectedOrder.customerPhone && (
                        <p>
                          <span className="font-medium">Téléphone:</span>{" "}
                          <a href={`tel:${selectedOrder.customerPhone}`} className="text-primary hover:underline">
                            {selectedOrder.customerPhone}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Billing Address */}
                  {selectedOrder.billingAddress && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Adresse de facturation</h3>
                      <div className="text-sm p-3 bg-muted/50 rounded-lg">
                        <p>{selectedOrder.billingAddress.line1}</p>
                        {selectedOrder.billingAddress.line2 && <p>{selectedOrder.billingAddress.line2}</p>}
                        <p>{selectedOrder.billingAddress.postalCode} {selectedOrder.billingAddress.city}</p>
                        <p>{selectedOrder.billingAddress.country || "France"}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="items" className="space-y-4">
                  {/* Order items */}
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produit</TableHead>
                            <TableHead className="text-center w-24">Quantité</TableHead>
                            <TableHead className="text-right w-24">Prix</TableHead>
                            <TableHead className="text-right w-32">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedOrder.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div>
                                  <div>{item.name}</div>
                                  {item.variant && <div className="text-xs text-muted-foreground">{item.variant}</div>}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">{item.quantity}</TableCell>
                              <TableCell className="text-right">{parseFloat(item.price).toFixed(2)} €</TableCell>
                              <TableCell className="text-right">{(item.quantity * item.price).toFixed(2)} €</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun article trouvé</p>
                  )}
                </TabsContent>

                <TabsContent value="shipping" className="space-y-4">
                  {/* Shipping info */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Informations de livraison</h3>
                    <div className="text-sm p-3 bg-muted/50 rounded-lg space-y-2">
                      <p>
                        <span className="font-medium">Mode de livraison:</span>{" "}
                        {selectedOrder.shippingMethod || "Standard"}
                      </p>
                      {selectedOrder.trackingNumber && (
                        <p>
                          <span className="font-medium">Numéro de suivi:</span>{" "}
                          {selectedOrder.trackingNumber}
                        </p>
                      )}
                      {selectedOrder.estimatedDelivery && (
                        <p>
                          <span className="font-medium">Livraison estimée:</span>{" "}
                          {formatDate(selectedOrder.estimatedDelivery)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {selectedOrder.shippingAddress && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Adresse de livraison</h3>
                      <div className="text-sm p-3 bg-muted/50 rounded-lg">
                        <p>{selectedOrder.shippingAddress.line1}</p>
                        {selectedOrder.shippingAddress.line2 && <p>{selectedOrder.shippingAddress.line2}</p>}
                        <p>{selectedOrder.shippingAddress.postalCode} {selectedOrder.shippingAddress.city}</p>
                        <p>{selectedOrder.shippingAddress.country || "France"}</p>
                      </div>
                    </div>
                  )}

                  {/* Delivery instructions */}
                  {selectedOrder.deliveryInstructions && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Instructions de livraison</h3>
                      <div className="text-sm p-3 bg-muted/50 rounded-lg">
                        {selectedOrder.deliveryInstructions}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={showUpdateStatus} onOpenChange={setShowUpdateStatus}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mettre à jour le statut</DialogTitle>
            <DialogDescription>
              {selectedOrder && `Commande #${selectedOrder.orderNumber || selectedOrder.id}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Choisir un nouveau statut</h3>
              <Select
                value={newStatus}
                onValueChange={setNewStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="processing">En traitement</SelectItem>
                  <SelectItem value="shipped">Expédié</SelectItem>
                  <SelectItem value="delivered">Livré</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="refunded">Remboursé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optionnel)</label>
              <Textarea
                placeholder="Ajouter des notes sur la mise à jour du statut"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateStatus(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateStatus}>
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrdersManagement;