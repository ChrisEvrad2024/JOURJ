// src/components/admin/orders/OrdersTable.jsx
import { useState } from "react";
import { 
  CheckCircle, 
  Clock, 
  TruckIcon, 
  AlertCircle, 
  RefreshCw,
  MoreHorizontal,
  Search,
  FileText,
  Eye,
  Edit,
  Download,
  Printer,
  Ban,
  RotateCcw
} from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import OrderService from "@/services/OrderService";

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

const OrdersTable = ({ orders, onStatusChange, onRefresh }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrer les commandes en fonction de la recherche
  const filteredOrders = orders.filter(order => {
    if (!searchTerm.trim()) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    
    // Recherche par ID, client, email, etc.
    return (
      order.id.toLowerCase().includes(searchTermLower) ||
      (order.shippingAddress?.firstName?.toLowerCase().includes(searchTermLower)) ||
      (order.shippingAddress?.lastName?.toLowerCase().includes(searchTermLower)) ||
      (order.shippingAddress?.email?.toLowerCase().includes(searchTermLower)) ||
      (order.status.toLowerCase().includes(searchTermLower))
    );
  });

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculer le total des articles d'une commande
  const getTotalItems = (order) => {
    return order.items.reduce((acc, item) => acc + item.quantity, 0);
  };

  // Obtenir le nom du client
  const getCustomerName = (order) => {
    if (!order.shippingAddress) return "Client inconnu";
    return `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;
  };

  // Naviguer vers les détails de la commande
  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // Changer le statut d'une commande
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await OrderService.updateOrderStatus(orderId, newStatus);
      toast.success(`Statut mis à jour: ${statusConfig[newStatus].label}`);
      if (onStatusChange) onStatusChange(orderId, newStatus);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  // Générer une facture
  const handleGenerateInvoice = async (orderId) => {
    try {
      // Dans un cas réel, cela appellerait un service pour générer une facture PDF
      toast.success(`Génération de la facture pour la commande #${orderId}`);
      // Ajouter ici la logique pour générer et télécharger une facture
    } catch (error) {
      toast.error("Erreur lors de la génération de la facture");
    }
  };

  // Envoyer un email de confirmation
  const handleSendConfirmationEmail = async (orderId) => {
    try {
      // Dans un cas réel, cela appellerait un service pour envoyer un email
      toast.success("Email de confirmation envoyé avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'envoi de l'email de confirmation");
    }
  };

  return (
    <div className="space-y-4">
      {/* Recherche */}
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par ID, client, email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tableau des commandes */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Commande</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{getCustomerName(order)}</span>
                      <span className="text-xs text-muted-foreground">
                        {order.shippingAddress?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{order.total.toFixed(2)} XAF</TableCell>
                  <TableCell>{getTotalItems(order)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={`${statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'} flex gap-1 items-center`}
                    >
                      {statusConfig[order.status]?.icon || <Clock className="h-4 w-4" />}
                      {statusConfig[order.status]?.label || order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewOrder(order.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir les détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleGenerateInvoice(order.id)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Générer la facture
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendConfirmationEmail(order.id)}>
                          <Printer className="h-4 w-4 mr-2" />
                          Envoyer confirmation
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          disabled={order.status === 'delivered' || order.status === 'cancelled' || order.status === 'refunded'}
                          onClick={() => handleStatusChange(order.id, OrderService.ORDER_STATUS.PROCESSING)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />
                          Marquer en traitement
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          disabled={order.status === 'delivered' || order.status === 'cancelled' || order.status === 'refunded'}
                          onClick={() => handleStatusChange(order.id, OrderService.ORDER_STATUS.SHIPPED)}
                        >
                          <TruckIcon className="h-4 w-4 mr-2 text-purple-500" />
                          Marquer comme expédiée
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          disabled={order.status === 'delivered' || order.status === 'cancelled' || order.status === 'refunded' || order.status === 'pending'}
                          onClick={() => handleStatusChange(order.id, OrderService.ORDER_STATUS.DELIVERED)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Marquer comme livrée
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          disabled={order.status === 'cancelled' || order.status === 'refunded' || order.status === 'delivered'}
                          onClick={() => handleStatusChange(order.id, OrderService.ORDER_STATUS.CANCELLED)}
                          className="text-red-500"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Annuler la commande
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          disabled={order.status === 'refunded' || order.status === 'cancelled'}
                          onClick={() => handleStatusChange(order.id, OrderService.ORDER_STATUS.REFUNDED)}
                          className="text-orange-500"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Marquer comme remboursée
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  {searchTerm ? "Aucune commande ne correspond à votre recherche" : "Aucune commande trouvée"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrdersTable;