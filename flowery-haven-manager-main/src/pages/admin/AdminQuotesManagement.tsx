// src/pages/admin/AdminQuotesManagement.tsx
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
  CalendarClock
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
import { QuoteService } from "@/services";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

// Status mapping for displaying appropriate UI
const statusConfig = {
  pending: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800",
    icon: <ClockIcon className="h-4 w-4" />
  },
  in_progress: {
    label: "En cours",
    color: "bg-blue-100 text-blue-800",
    icon: <RefreshCw className="h-4 w-4" />
  },
  sent: {
    label: "Devis envoyé",
    color: "bg-purple-100 text-purple-800",
    icon: <Send className="h-4 w-4" />
  },
  accepted: {
    label: "Accepté",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="h-4 w-4" />
  },
  declined: {
    label: "Refusé",
    color: "bg-red-100 text-red-800",
    icon: <AlertCircle className="h-4 w-4" />
  },
  expired: {
    label: "Expiré",
    color: "bg-gray-100 text-gray-800",
    icon: <CalendarClock className="h-4 w-4" />
  },
  completed: {
    label: "Complété",
    color: "bg-teal-100 text-teal-800",
    icon: <CheckCircle className="h-4 w-4" />
  }
};

// Quote types mapping
const quoteTypeConfig = {
  event: {
    label: "Événement",
    color: "bg-blue-100 text-blue-800"
  },
  corporate: {
    label: "Entreprise",
    color: "bg-green-100 text-green-800"
  },
  decoration: {
    label: "Décoration",
    color: "bg-purple-100 text-purple-800"
  },
  custom: {
    label: "Personnalisé",
    color: "bg-orange-100 text-orange-800"
  }
};
const AdminQuotesManagement = () => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [showQuoteDetails, setShowQuoteDetails] = useState(false);
    const [showUpdateStatus, setShowUpdateStatus] = useState(false);
    const [newStatus, setNewStatus] = useState("");
    const [statusNote, setStatusNote] = useState("");
    const [showCreateProposal, setShowCreateProposal] = useState(false);
    
    // Proposal form fields
    const [proposalAmount, setProposalAmount] = useState("");
    const [proposalDescription, setProposalDescription] = useState("");
    const [proposalItems, setProposalItems] = useState([{ name: "", quantity: 1, price: "" }]);
    const [proposalValidUntil, setProposalValidUntil] = useState(
      new Date(new Date().setDate(new Date().getDate() + 14)) // Default: 14 days from now
    );
    const [proposalTerms, setProposalTerms] = useState(
      "Ce devis est valable jusqu'à la date d'expiration indiquée. Les prix sont en euros (€) et incluent la TVA."
    );
    
    // Load quotes
    useEffect(() => {
      const fetchQuotes = async () => {
        try {
          setLoading(true);
          
          // Apply filters
          const filters = {};
          if (statusFilter !== "all") filters.status = statusFilter;
          if (typeFilter !== "all") filters.type = typeFilter;
          
          const allQuotes = await QuoteService.getAllQuotes(filters);
          setQuotes(allQuotes);
        } catch (error) {
          console.error("Error fetching quotes:", error);
          toast.error("Erreur lors du chargement des devis");
        } finally {
          setLoading(false);
        }
      };
  
      fetchQuotes();
    }, [statusFilter, typeFilter]);
  
    // Filter quotes by search query
    const filteredQuotes = quotes.filter(quote => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      
      // Search by quote id, customer name, contact info, type
      return (
        (quote.id && quote.id.toString().toLowerCase().includes(query)) ||
        (quote.contactName && quote.contactName.toLowerCase().includes(query)) ||
        (quote.contactEmail && quote.contactEmail.toLowerCase().includes(query)) ||
        (quote.contactPhone && quote.contactPhone.toLowerCase().includes(query)) ||
        (quote.type && quote.type.toLowerCase().includes(query)) ||
        (quote.title && quote.title.toLowerCase().includes(query))
      );
    });
  
    // Format date helper
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    };

    // View quote details
  const handleViewQuote = (quote) => {
    setSelectedQuote(quote);
    setShowQuoteDetails(true);
  };

  // Open update status dialog
  const handleUpdateStatusClick = (quote) => {
    setSelectedQuote(quote);
    setNewStatus(quote.status);
    setStatusNote("");
    setShowUpdateStatus(true);
  };

  // Create proposal
  const handleCreateProposalClick = (quote) => {
    setSelectedQuote(quote);
    
    // Initialize with default values
    setProposalAmount("");
    setProposalDescription(`Devis pour ${quote.title || 'votre projet'}`);
    setProposalItems([{ name: "", quantity: 1, price: "" }]);
    setProposalValidUntil(new Date(new Date().setDate(new Date().getDate() + 14)));
    setProposalTerms("Ce devis est valable jusqu'à la date d'expiration indiquée. Les prix sont en euros (€) et incluent la TVA.");
    
    setShowCreateProposal(true);
  };

  // Add item to proposal
  const handleAddItem = () => {
    setProposalItems([...proposalItems, { name: "", quantity: 1, price: "" }]);
  };

  // Remove item from proposal
  const handleRemoveItem = (index) => {
    const newItems = [...proposalItems];
    newItems.splice(index, 1);
    setProposalItems(newItems);
  };

  // Update item in proposal
  const handleUpdateItem = (index, field, value) => {
    const newItems = [...proposalItems];
    newItems[index][field] = value;
    setProposalItems(newItems);
  };

  // Calculate proposal total
  const calculateTotal = () => {
    return proposalItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };

  // Submit proposal
  const handleSubmitProposal = async () => {
    if (!selectedQuote) return;
    
    try {
      // Validate form
      if (!proposalDescription || proposalItems.some(item => !item.name || !item.price)) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
      
      // Calculate total if amount not manually set
      const total = proposalAmount ? parseFloat(proposalAmount) : calculateTotal();
      
      // Create proposal data
      const proposalData = {
        amount: total,
        description: proposalDescription,
        items: proposalItems,
        validUntil: proposalValidUntil.toISOString(),
        termsAndConditions: proposalTerms
      };
      
      // Send proposal
      await QuoteService.addProposal(selectedQuote.id, proposalData);
      
      // Reload quotes
      const filters = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (typeFilter !== "all") filters.type = typeFilter;
      const updatedQuotes = await QuoteService.getAllQuotes(filters);
      setQuotes(updatedQuotes);
      
      toast.success("Proposition de devis envoyée avec succès");
      setShowCreateProposal(false);
    } catch (error) {
      console.error("Error submitting proposal:", error);
      toast.error("Erreur lors de l'envoi de la proposition");
    }
  };

  // Submit status update
  const handleUpdateStatus = async () => {
    if (!selectedQuote || !newStatus) return;
    
    try {
      // Update status
      await QuoteService.updateQuoteStatus(selectedQuote.id, newStatus, statusNote);
      
      // Reload quotes
      const filters = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (typeFilter !== "all") filters.type = typeFilter;
      const updatedQuotes = await QuoteService.getAllQuotes(filters);
      setQuotes(updatedQuotes);
      
      toast.success("Statut mis à jour avec succès");
      setShowUpdateStatus(false);
    } catch (error) {
      console.error("Error updating quote status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  // Loading state
  if (loading && quotes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Devis</h1>
            <p className="text-muted-foreground">Gérez les demandes de devis personnalisés.</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Devis</h1>
          <p className="text-muted-foreground">Gérez les demandes de devis personnalisés.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un devis..."
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
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="sent">Devis envoyé</SelectItem>
                  <SelectItem value="accepted">Accepté</SelectItem>
                  <SelectItem value="declined">Refusé</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                  <SelectItem value="completed">Complété</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="event">Événement</SelectItem>
                  <SelectItem value="corporate">Entreprise</SelectItem>
                  <SelectItem value="decoration">Décoration</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
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
                  <TableHead>Référence</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.length > 0 ? (
                  filteredQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">
                        #{quote.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{quote.contactName}</div>
                          <div className="text-xs text-muted-foreground">{quote.contactEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={`${quoteTypeConfig[quote.type]?.color || 'bg-gray-100 text-gray-800'}`}
                        >
                          {quoteTypeConfig[quote.type]?.label || quote.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(quote.createdAt)}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline"
                          className={`${statusConfig[quote.status]?.color || 'bg-gray-100 text-gray-800'} flex gap-1 items-center mx-auto`}
                        >
                          {statusConfig[quote.status]?.icon || <ClockIcon className="h-4 w-4" />}
                          {statusConfig[quote.status]?.label || quote.status}
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
                            <DropdownMenuItem onClick={() => handleViewQuote(quote)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatusClick(quote)}>
                              <FileEdit className="mr-2 h-4 w-4" />
                              Mettre à jour statut
                            </DropdownMenuItem>
                            {(quote.status === "pending" || quote.status === "in_progress") && (
                              <DropdownMenuItem onClick={() => handleCreateProposalClick(quote)}>
                                <Send className="mr-2 h-4 w-4" />
                                Créer proposition
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Aucun devis trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Affichage de {filteredQuotes.length} sur {quotes.length} devis
          </div>
        </CardFooter>
      </Card>
      {/* Quote Details Dialog */}
      <Dialog open={showQuoteDetails} onOpenChange={setShowQuoteDetails}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Détails du devis</DialogTitle>
            <DialogDescription>
              {selectedQuote && `Référence #${selectedQuote.id} • ${formatDate(selectedQuote?.createdAt)}`}
            </DialogDescription>
          </DialogHeader>

          {selectedQuote && (
            <div className="space-y-4">
              {/* Status and actions */}
              <div className="flex justify-between items-center">
                <Badge 
                  variant="outline"
                  className={`${statusConfig[selectedQuote.status]?.color || 'bg-gray-100 text-gray-800'} flex gap-1 items-center`}
                >
                  {statusConfig[selectedQuote.status]?.icon || <ClockIcon className="h-4 w-4" />}
                  {statusConfig[selectedQuote.status]?.label || selectedQuote.status}
                </Badge>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleUpdateStatusClick(selectedQuote)}
                  >
                    <FileEdit className="mr-2 h-4 w-4" />
                    Statut
                  </Button>
                  
                  {(selectedQuote.status === "pending" || selectedQuote.status === "in_progress") && (
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleCreateProposalClick(selectedQuote)}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Proposer
                    </Button>
                  )}
                </div>
              </div>

              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Détails</TabsTrigger>
                  <TabsTrigger value="customer">Client</TabsTrigger>
                  {selectedQuote.proposal && (
                    <TabsTrigger value="proposal">Proposition</TabsTrigger>
                  )}
                  <TabsTrigger value="history">Historique</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  {/* Quote details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Informations générales</h3>
                      <div className="text-sm p-3 bg-muted/50 rounded-lg space-y-2">
                        <p>
                          <span className="font-medium">Titre:</span>{" "}
                          {selectedQuote.title || "Non spécifié"}
                        </p>
                        <p>
                          <span className="font-medium">Type:</span>{" "}
                          <Badge 
                            variant="outline"
                            className={`${quoteTypeConfig[selectedQuote.type]?.color || 'bg-gray-100 text-gray-800'} ml-1`}
                          >
                            {quoteTypeConfig[selectedQuote.type]?.label || selectedQuote.type}
                          </Badge>
                        </p>
                        {selectedQuote.eventDate && (
                          <p>
                            <span className="font-medium">Date de l'événement:</span>{" "}
                            {formatDate(selectedQuote.eventDate)}
                          </p>
                        )}
                        {selectedQuote.budget && (
                          <p>
                            <span className="font-medium">Budget:</span>{" "}
                            {selectedQuote.budget}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Dates</h3>
                      <div className="text-sm p-3 bg-muted/50 rounded-lg space-y-2">
                        <p>
                          <span className="font-medium">Créé le:</span>{" "}
                          {formatDate(selectedQuote.createdAt)}
                        </p>
                        <p>
                          <span className="font-medium">Mis à jour le:</span>{" "}
                          {formatDate(selectedQuote.updatedAt)}
                        </p>
                        {selectedQuote.status === "accepted" && selectedQuote.acceptedAt && (
                          <p>
                            <span className="font-medium">Accepté le:</span>{" "}
                            {formatDate(selectedQuote.acceptedAt)}
                          </p>
                        )}
                        {selectedQuote.status === "declined" && selectedQuote.declinedAt && (
                          <p>
                            <span className="font-medium">Refusé le:</span>{" "}
                            {formatDate(selectedQuote.declinedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Description du projet</h3>
                    <div className="text-sm p-3 bg-muted/50 rounded-lg">
                      {selectedQuote.description || "Aucune description fournie."}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="customer" className="space-y-4">
                  {/* Customer info */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Informations client</h3>
                    <div className="text-sm p-3 bg-muted/50 rounded-lg space-y-2">
                      <p>
                        <span className="font-medium">Nom:</span>{" "}
                        {selectedQuote.contactName}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        <a href={`mailto:${selectedQuote.contactEmail}`} className="text-primary hover:underline">
                          {selectedQuote.contactEmail}
                        </a>
                      </p>
                      {selectedQuote.contactPhone && (
                        <p>
                          <span className="font-medium">Téléphone:</span>{" "}
                          <a href={`tel:${selectedQuote.contactPhone}`} className="text-primary hover:underline">
                            {selectedQuote.contactPhone}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Customer notes */}
                  {selectedQuote.notes && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Notes client</h3>
                      <div className="text-sm p-3 bg-muted/50 rounded-lg">
                        {selectedQuote.notes}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {selectedQuote.proposal && (
                  <TabsContent value="proposal" className="space-y-4">
                    {/* Proposal details */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Détails de la proposition</h3>
                      <div className="text-sm p-3 bg-muted/50 rounded-lg space-y-2">
                        <p>
                          <span className="font-medium">Montant total:</span>{" "}
                          {selectedQuote.proposal.amount?.toFixed(2) || "0.00"} €
                        </p>
                        <p>
                          <span className="font-medium">Valide jusqu'au:</span>{" "}
                          {formatDate(selectedQuote.proposal.validUntil)}
                        </p>
                        <TabsContent value="customer" className="space-y-4">
                  {/* Customer info */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Informations client</h3>
                    <div className="text-sm p-3 bg-muted/50 rounded-lg space-y-2">
                      <p>
                        <span className="font-medium">Nom:</span>{" "}
                        {selectedQuote.contactName}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        <a href={`mailto:${selectedQuote.contactEmail}`} className="text-primary hover:underline">
                          {selectedQuote.contactEmail}
                        </a>
                      </p>
                      {selectedQuote.contactPhone && (
                        <p>
                          <span className="font-medium">Téléphone:</span>{" "}
                          <a href={`tel:${selectedQuote.contactPhone}`} className="text-primary hover:underline">
                            {selectedQuote.contactPhone}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Customer notes */}
                  {selectedQuote.notes && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Notes client</h3>
                      <div className="text-sm p-3 bg-muted/50 rounded-lg">
                        {selectedQuote.notes}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {selectedQuote.proposal && (
                  <TabsContent value="proposal" className="space-y-4">
                    {/* Proposal details */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Détails de la proposition</h3>
                      <div className="text-sm p-3 bg-muted/50 rounded-lg space-y-2">
                        <p>
                          <span className="font-medium">Montant total:</span>{" "}
                          {selectedQuote.proposal.amount?.toFixed(2) || "0.00"} €
                        </p>
                        <p>
                          <span className="font-medium">Valide jusqu'au:</span>{" "}
                          {formatDate(selectedQuote.proposal.validUntil)}
                        </p>
                        <p>
                          <span className="font-medium">Description:</span>{" "}
                          {selectedQuote.proposal.description}
                        </p>
                      </div>
                    </div>

                    {/* Proposal items */}
                    {selectedQuote.proposal.items && selectedQuote.proposal.items.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Éléments du devis</h3>
                        <div className="rounded-md border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Désignation</TableHead>
                                <TableHead className="text-center w-24">Quantité</TableHead>
                                <TableHead className="text-right w-24">Prix</TableHead>
                                <TableHead className="text-right w-32">Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedQuote.proposal.items.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell className="text-center">{item.quantity}</TableCell>
                                  <TableCell className="text-right">{parseFloat(item.price).toFixed(2)} €</TableCell>
                                  <TableCell className="text-right">{(item.quantity * item.price).toFixed(2)} €</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {/* Terms & conditions */}
                    {selectedQuote.proposal.termsAndConditions && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Conditions générales</h3>
                        <div className="text-sm p-3 bg-muted/50 rounded-lg">
                          {selectedQuote.proposal.termsAndConditions}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                )}

<TabsContent value="history" className="space-y-4">
                  {/* Status history */}
                  {selectedQuote.statusHistory && selectedQuote.statusHistory.length > 0 ? (
                    <div className="space-y-4">
                      {selectedQuote.statusHistory.map((status, index) => (
                        <div key={index} className="relative pl-8 pb-4">
                          {/* Status timeline connector */}
                          {index < selectedQuote.statusHistory.length - 1 && (
                            <div className="absolute left-3 top-3 h-full w-px bg-muted-foreground/30"></div>
                          )}
                          
                          {/* Status badge */}
                          <div className="absolute left-0 top-0 h-6 w-6 rounded-full bg-background flex items-center justify-center border">
                            {statusConfig[status.status]?.icon || <ClockIcon className="h-3 w-3" />}
                          </div>
                          
                          {/* Status info */}
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">
                                {statusConfig[status.status]?.label || status.status}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(status.date).toLocaleString('fr-FR')}
                              </span>
                            </div>
                            {status.notes && (
                              <p className="text-sm text-muted-foreground">{status.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun historique disponible</p>
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
              {selectedQuote && `Devis #${selectedQuote.id}`}
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
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="sent">Devis envoyé</SelectItem>
                  <SelectItem value="accepted">Accepté</SelectItem>
                  <SelectItem value="declined">Refusé</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                  <SelectItem value="completed">Complété</SelectItem>
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
      {/* Create Proposal Dialog */}
      <Dialog open={showCreateProposal} onOpenChange={setShowCreateProposal}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Créer une proposition de devis</DialogTitle>
            <DialogDescription>
              {selectedQuote && `Pour la demande #${selectedQuote.id} de ${selectedQuote.contactName}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Description générale de la proposition"
                value={proposalDescription}
                onChange={(e) => setProposalDescription(e.target.value)}
                className="min-h-[80px]"
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Éléments du devis</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                  Ajouter un élément
                </Button>
              </div>

              <div className="space-y-4">
                {proposalItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-6">
                      <Input
                        placeholder="Désignation"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qté"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Prix €"
                        value={item.price}
                        onChange={(e) => handleUpdateItem(index, 'price', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center h-full">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleRemoveItem(index)}
                        disabled={proposalItems.length === 1}
                      >
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-muted/50 p-3 rounded-lg flex justify-between">
                <span className="font-medium">Total:</span>
                <span>{calculateTotal().toFixed(2)} €</span>
              </div>

              <div className="space-y-2">
                <Label>Montant total (optionnel)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Laisser vide pour utiliser le total calculé"
                  value={proposalAmount}
                  onChange={(e) => setProposalAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Laissez ce champ vide pour utiliser le total calculé automatiquement, ou entrez une valeur personnalisée.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valide jusqu'au</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {proposalValidUntil ? format(proposalValidUntil, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={proposalValidUntil}
                      onSelect={(date) => setProposalValidUntil(date)}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Conditions générales</Label>
              <Textarea
                value={proposalTerms}
                onChange={(e) => setProposalTerms(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateProposal(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmitProposal}>
              Envoyer la proposition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminQuotesManagement;