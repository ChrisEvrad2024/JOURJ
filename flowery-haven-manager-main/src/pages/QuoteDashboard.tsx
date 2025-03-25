// src/pages/QuoteDashboard.tsx
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle,
  Send,
  RefreshCw,
  AlertCircle,
  CalendarClock,
  FileText,
  PlusCircle,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { QuoteService } from "@/services";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell
} from "@/components/ui/table";

// Status mapping for displaying appropriate UI
const statusConfig = {
  pending: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="h-4 w-4" />
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

const QuoteDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isQuoteDetailsOpen, setIsQuoteDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchQuotes = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userQuotes = await QuoteService.getUserQuotes();
        setQuotes(userQuotes);
      } catch (error) {
        console.error("Erreur lors du chargement des devis:", error);
        toast.error("Impossible de charger vos devis");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [currentUser]);

  // Filter quotes based on active tab
  const filteredQuotes = activeTab === "all" 
    ? quotes 
    : quotes.filter(quote => quote.status === activeTab);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  };

  // Handle view quote details
  const handleViewQuoteDetails = (quote) => {
    setSelectedQuote(quote);
    setIsQuoteDetailsOpen(true);
  };

  // Handle accepting a quote
  const handleAcceptQuote = async (quoteId) => {
    try {
      await QuoteService.acceptQuote(quoteId, "Devis accepté par le client via le tableau de bord");
      
      // Refresh quotes
      const userQuotes = await QuoteService.getUserQuotes();
      setQuotes(userQuotes);
      
      toast.success("Devis accepté", {
        description: "Votre acceptation a été enregistrée avec succès"
      });
      
      // Close dialog
      setIsQuoteDetailsOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'acceptation du devis:", error);
      toast.error("Impossible d'accepter le devis");
    }
  };

  // Handle declining a quote
  const handleDeclineQuote = async (quoteId) => {
    try {
      await QuoteService.declineQuote(quoteId, "Devis refusé par le client via le tableau de bord");
      
      // Refresh quotes
      const userQuotes = await QuoteService.getUserQuotes();
      setQuotes(userQuotes);
      
      toast.success("Devis refusé", {
        description: "Votre refus a été enregistré avec succès"
      });
      
      // Close dialog
      setIsQuoteDetailsOpen(false);
    } catch (error) {
      console.error("Erreur lors du refus du devis:", error);
      toast.error("Impossible de refuser le devis");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-serif mb-2">Mes devis</h1>
              <p className="text-muted-foreground">
                Consultez et gérez vos demandes de devis personnalisés.
              </p>
            </div>
            
            <Button onClick={() => navigate("/quote")} className="shrink-0">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouvelle demande
            </Button>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">Tous ({quotes.length})</TabsTrigger>
              <TabsTrigger value="pending">En attente ({quotes.filter(q => q.status === "pending").length})</TabsTrigger>
              <TabsTrigger value="sent">Reçus ({quotes.filter(q => q.status === "sent").length})</TabsTrigger>
              <TabsTrigger value="accepted">Acceptés ({quotes.filter(q => q.status === "accepted").length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-muted rounded-lg"></div>
                  ))}
                </div>
              ) : filteredQuotes.length > 0 ? (
                filteredQuotes.map((quote) => (
                  <Card key={quote.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 pb-3">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {quote.title || `Devis #${quote.id}`}
                          </CardTitle>
                          <CardDescription>
                            Créé le {formatDate(quote.createdAt)}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant="outline"
                          className={`${statusConfig[quote.status]?.color || 'bg-gray-100 text-gray-800'} flex gap-1 items-center mt-2 md:mt-0`}
                        >
                          {statusConfig[quote.status]?.icon || <Clock className="h-4 w-4" />}
                          {statusConfig[quote.status]?.label || quote.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Type</p>
                          <p className="text-sm text-muted-foreground">
                            {quote.type === "event" ? "Événement" :
                             quote.type === "corporate" ? "Entreprise" :
                             quote.type === "decoration" ? "Décoration" :
                             quote.type === "custom" ? "Personnalisé" : quote.type}
                          </p>
                        </div>
                        {quote.eventDate && (
                          <div>
                            <p className="text-sm font-medium">Date de l'événement</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(quote.eventDate)}
                            </p>
                          </div>
                        )}
                        {quote.budget && (
                          <div>
                            <p className="text-sm font-medium">Budget</p>
                            <p className="text-sm text-muted-foreground">
                              {quote.budget}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div className="md:max-w-md mb-4 md:mb-0">
                          <p className="text-sm line-clamp-2">
                            {quote.description || "Aucune description fournie."}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {quote.status === "sent" && (
                            <>
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeclineQuote(quote.id)}
                              >
                                Refuser
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleAcceptQuote(quote.id)}
                              >
                                Accepter
                              </Button>
                            </>
                          )}
                          <Button 
                            variant={quote.status === "sent" ? "secondary" : "default"}
                            size="sm"
                            onClick={() => handleViewQuoteDetails(quote)}
                          >
                            Détails
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">Aucun devis trouvé</h3>
                    <p className="text-muted-foreground mt-1 text-center">
                      Vous n'avez pas encore de devis dans cette catégorie.
                    </p>
                    <Button asChild className="mt-4">
                      <Link to="/quote">Demander un devis</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Quote Details Dialog */}
      <Dialog open={isQuoteDetailsOpen} onOpenChange={setIsQuoteDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Détails du devis</DialogTitle>
            <DialogDescription>
              {selectedQuote && (selectedQuote.title || `Devis #${selectedQuote.id}`)}
            </DialogDescription>
          </DialogHeader>

          {selectedQuote && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex justify-between items-center">
                <Badge 
                  variant="outline"
                  className={`${statusConfig[selectedQuote.status]?.color || 'bg-gray-100 text-gray-800'} flex gap-1 items-center`}
                >
                  {statusConfig[selectedQuote.status]?.icon || <Clock className="h-4 w-4" />}
                  {statusConfig[selectedQuote.status]?.label || selectedQuote.status}
                </Badge>
                
                {selectedQuote.status === "sent" && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeclineQuote(selectedQuote.id)}
                    >
                      Refuser
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleAcceptQuote(selectedQuote.id)}
                    >
                      Accepter
                    </Button>
                  </div>
                )}
              </div>

              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Détails</TabsTrigger>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  {selectedQuote.proposal && (
                    <TabsTrigger value="proposal">Proposition</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  {/* Quote details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Informations générales</h3>
                      <div className="text-sm p-3 bg-muted/50 rounded-lg space-y-2">
                        <p>
                          <span className="font-medium">Type:</span>{" "}
                          {selectedQuote.type === "event" ? "Événement" :
                           selectedQuote.type === "corporate" ? "Entreprise" :
                           selectedQuote.type === "decoration" ? "Décoration" :
                           selectedQuote.type === "custom" ? "Personnalisé" : selectedQuote.type}
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
                          <span className="font-medium">Dernière mise à jour:</span>{" "}
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

                  {/* Contact info */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Vos informations de contact</h3>
                    <div className="text-sm p-3 bg-muted/50 rounded-lg space-y-2">
                      <p>
                        <span className="font-medium">Nom:</span>{" "}
                        {selectedQuote.contactName}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {selectedQuote.contactEmail}
                      </p>
                      {selectedQuote.contactPhone && (
                        <p>
                          <span className="font-medium">Téléphone:</span>{" "}
                          {selectedQuote.contactPhone}
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="description" className="space-y-4">
                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Description de votre demande</h3>
                    <div className="text-sm p-3 bg-muted/50 rounded-lg whitespace-pre-line">
                      {selectedQuote.description || "Aucune description fournie."}
                    </div>
                  </div>
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
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default QuoteDashboard;