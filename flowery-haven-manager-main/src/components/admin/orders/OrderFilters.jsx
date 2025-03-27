// src/components/admin/orders/OrderFilters.jsx
import { useState, useEffect } from "react";
import { 
  CheckCircle, 
  Clock, 
  TruckIcon, 
  AlertCircle, 
  RefreshCw,
  RotateCcw,
  Calendar,
  Filter,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import OrderService from "@/services/OrderService";
import { Checkbox } from "@/components/ui/checkbox";

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

const OrderFilters = ({ onFilterChange }) => {
  // États pour les filtres
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);
  
  // Options pour le filtre rapide de date
  const dateOptions = [
    { value: "today", label: "Aujourd'hui" },
    { value: "yesterday", label: "Hier" },
    { value: "last7days", label: "7 derniers jours" },
    { value: "last30days", label: "30 derniers jours" },
    { value: "thisMonth", label: "Ce mois-ci" },
    { value: "lastMonth", label: "Le mois dernier" },
    { value: "custom", label: "Personnalisé" }
  ];

  // Mettre à jour l'état de filtre actif
  useEffect(() => {
    const hasStatusFilter = statusFilter.length > 0;
    const hasDateFilter = dateRange.from || dateRange.to;
    const hasAmountFilter = minAmount || maxAmount;
    
    setIsFilterActive(hasStatusFilter || hasDateFilter || hasAmountFilter);
  }, [statusFilter, dateRange, minAmount, maxAmount]);

  // Appliquer les filtres et notifier le parent
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        status: statusFilter,
        dateFrom: dateRange.from ? new Date(dateRange.from).toISOString() : null,
        dateTo: dateRange.to ? new Date(dateRange.to).toISOString() : null,
        minAmount: minAmount ? parseFloat(minAmount) : null,
        maxAmount: maxAmount ? parseFloat(maxAmount) : null
      });
    }
  }, [statusFilter, dateRange, minAmount, maxAmount, onFilterChange]);

  // Gérer le changement de statut
  const handleStatusChange = (status) => {
    setStatusFilter(prevStatuses => {
      if (prevStatuses.includes(status)) {
        return prevStatuses.filter(s => s !== status);
      } else {
        return [...prevStatuses, status];
      }
    });
  };

  // Appliquer un filtre de date rapide
  const applyQuickDateFilter = (option) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let from = null;
    let to = new Date();
    to.setHours(23, 59, 59, 999);
    
    switch (option) {
      case "today":
        from = new Date(today);
        break;
      case "yesterday":
        from = new Date(today);
        from.setDate(from.getDate() - 1);
        to = new Date(from);
        to.setHours(23, 59, 59, 999);
        break;
      case "last7days":
        from = new Date(today);
        from.setDate(from.getDate() - 6);
        break;
      case "last30days":
        from = new Date(today);
        from.setDate(from.getDate() - 29);
        break;
      case "thisMonth":
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case "lastMonth":
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        to = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
        break;
      case "custom":
        // Ne rien faire, laisser l'utilisateur définir manuellement
        return;
      default:
        from = null;
        to = null;
    }
    
    setDateRange({ from: from?.toISOString().split('T')[0] || null, to: to?.toISOString().split('T')[0] || null });
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setStatusFilter([]);
    setDateRange({ from: null, to: null });
    setMinAmount("");
    setMaxAmount("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Filtres</h2>
        
        {isFilterActive && (
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Filtre par statut */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <Filter className="h-4 w-4 mr-2" />
              Statut
              {statusFilter.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {statusFilter.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="space-y-2">
              <h4 className="font-medium">Filtrer par statut</h4>
              <div className="space-y-2">
                {Object.entries(OrderService.ORDER_STATUS).map(([key, value]) => (
                  <div key={value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${value}`}
                      checked={statusFilter.includes(value)}
                      onCheckedChange={() => handleStatusChange(value)}
                    />
                    <Label htmlFor={`status-${value}`} className="flex items-center cursor-pointer">
                      <Badge 
                        variant="outline"
                        className={`${statusConfig[value]?.color || 'bg-gray-100 text-gray-800'} flex gap-1 items-center mr-2`}
                      >
                        {statusConfig[value]?.icon || <Clock className="h-4 w-4" />}
                        {statusConfig[value]?.label || value}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Filtre par date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Date
              {(dateRange.from || dateRange.to) && (
                <Badge variant="secondary" className="ml-2">
                  {dateRange.from && dateRange.to 
                    ? `${format(new Date(dateRange.from), 'dd/MM')} - ${format(new Date(dateRange.to), 'dd/MM')}`
                    : dateRange.from 
                      ? `Depuis ${format(new Date(dateRange.from), 'dd/MM')}`
                      : `Jusqu'au ${format(new Date(dateRange.to), 'dd/MM')}`
                  }
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Filtrer par date</h4>
              
              <div className="space-y-2">
                <Label>Période</Label>
                <Select onValueChange={applyQuickDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une période" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="date-from">Du</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={dateRange.from || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-to">Au</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={dateRange.to || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Filtre par montant */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <span className="mr-2">XAF</span>
              Montant
              {(minAmount || maxAmount) && (
                <Badge variant="secondary" className="ml-2">
                  {minAmount && maxAmount 
                    ? `${minAmount} - ${maxAmount} XAF`
                    : minAmount 
                      ? `Min: ${minAmount} XAF`
                      : `Max: ${maxAmount} XAF`
                  }
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Filtrer par montant</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="min-amount">Montant min</Label>
                  <Input
                    id="min-amount"
                    type="number"
                    placeholder="0"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-amount">Montant max</Label>
                  <Input
                    id="max-amount"
                    type="number"
                    placeholder="100000"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Bouton pour appliquer/réinitialiser les filtres */}
        <div className="flex space-x-2">
          {isFilterActive ? (
            <Button variant="secondary" className="w-full" onClick={resetFilters}>
              <X className="h-4 w-4 mr-2" />
              Effacer ({statusFilter.length + (dateRange.from || dateRange.to ? 1 : 0) + (minAmount || maxAmount ? 1 : 0)})
            </Button>
          ) : (
            <Button variant="outline" className="w-full" disabled>
              <Filter className="h-4 w-4 mr-2" />
              Aucun filtre
            </Button>
          )}
        </div>
      </div>
      
      {/* Affichage des filtres actifs */}
      {isFilterActive && (
        <div className="flex flex-wrap gap-2 mt-2">
          {statusFilter.map((status) => (
            <Badge 
              key={status}
              variant="secondary"
              className="flex items-center gap-1"
              onClick={() => handleStatusChange(status)}
            >
              {statusConfig[status]?.icon || <Clock className="h-3 w-3" />}
              {statusConfig[status]?.label || status}
              <X className="h-3 w-3 ml-1 cursor-pointer" />
            </Badge>
          ))}
          
          {(dateRange.from || dateRange.to) && (
            <Badge 
              variant="secondary"
              className="flex items-center gap-1"
              onClick={() => setDateRange({ from: null, to: null })}
            >
              <Calendar className="h-3 w-3" />
              {dateRange.from && dateRange.to 
                ? `${format(new Date(dateRange.from), 'dd/MM/yyyy')} - ${format(new Date(dateRange.to), 'dd/MM/yyyy')}`
                : dateRange.from 
                  ? `Depuis le ${format(new Date(dateRange.from), 'dd/MM/yyyy')}`
                  : `Jusqu'au ${format(new Date(dateRange.to), 'dd/MM/yyyy')}`
              }
              <X className="h-3 w-3 ml-1 cursor-pointer" />
            </Badge>
          )}
          
          {(minAmount || maxAmount) && (
            <Badge 
              variant="secondary"
              className="flex items-center gap-1"
              onClick={() => { setMinAmount(""); setMaxAmount(""); }}
            >
              <span>XAF</span>
              {minAmount && maxAmount 
                ? `${minAmount} - ${maxAmount} XAF`
                : minAmount 
                  ? `Min: ${minAmount} XAF`
                  : `Max: ${maxAmount} XAF`
              }
              <X className="h-3 w-3 ml-1 cursor-pointer" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderFilters;