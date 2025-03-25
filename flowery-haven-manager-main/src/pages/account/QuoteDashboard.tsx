import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  Clock, 
  CheckCircle, 
  X, 
  FileText, 
  Send, 
  ChevronRight, 
  PlusCircle 
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuotes } from '@/hooks/useQuotes';
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
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

// Configuration des états de devis pour l'affichage
const quoteStatusConfig = {
  pending: {
    label: "En attente",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: <Clock className="h-4 w-4" />
  },
  in_progress: {
    label: "En cours",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <Clock className="h-4 w-4" />
  },
  sent: {
    label: "Devis envoyé",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: <Send className="h-4 w-4" />
  },
  accepted: {
    label: "Accepté",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: <CheckCircle className="h-4 w-4" />
  },
  declined: {
    label: "Refusé",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: <X className="h-4 w-4" />
  },
  expired: {
    label: "Expiré",
    color: "bg-gray-50 text-gray-700 border-gray-200",
    icon: <Clock className="h-4 w-4" />
  },
  completed: {
    label: "Terminé",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: <CheckCircle className="h-4 w-4" />
  }
};

const QuoteDashboard = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showQuoteDetails, setShowQuoteDetails] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  
  const { quotes, loading, error, acceptQuote, declineQuote } = useQuotes();
  
  // Filtrer les devis en fonction de l'onglet actif
  const filteredQuotes = activeTab === 'all' 
    ? quotes 
    : quotes.filter(quote => quote.status === activeTab);
  
  // Formatter une date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPP', { locale: fr });
    } catch (e) {
      return dateString || 'Date non spécifiée';
    }
  };
  
  // Afficher les détails d'un devis
  const handleViewQuoteDetails = (quote) => {
    setSelectedQuote(quote);
    setShowQuoteDetails(true);
  };
  
  // Accepter un devis
  const handleAcceptQuote = async (quoteId) => {
    try {
      const success = await acceptQuote(quoteId);
      
      if (success) {
        toast.success("Devis accepté", {
          description: "Le devis a été accepté avec succès."
        });
        setShowQuoteDetails(false);
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'acceptation du devis."
      });
    }
  };
  
  // Ouvrir le dialogue de refus de devis
  const handleInitiateDeclineQuote = (quoteId) => {
    setDeclineReason('');
    setShowDeclineDialog(true);
  };
  
  // Refuser un devis
  const handleDeclineQuote = async () => {
    if (!selectedQuote) return;
    
    try {
      if (!declineReason) {
        toast.error("Veuillez indiquer une raison", {
          description: "Une raison est requise pour refuser le devis."
        });
        return;
      }
      
      const success = await declineQuote(selectedQuote.id, declineReason);
      
      if (success) {
        toast.success("Devis refusé", {
          description: "Le devis a été refusé."
        });
        setShowDeclineDialog(false);
        setShowQuoteDetails(false);
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors du refus du devis."
      });
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif">Mes devis</h1>
          <p className="text-muted-foreground">
            Chargement de vos devis...
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
          <h1 className="text-2xl font-serif">Mes devis</h1>
          <p className="text-red-500">
            Une erreur est survenue lors du chargement de vos devis.
          </p>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif">Mes devis</h1>
          <p className="text-muted-foreground">
            Consultez et gérez vos demandes de devis personnalisés.
          </p>
        </div>
        
        <Button asChild>
          <Link to="/quote" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Demander un devis
          </Link>
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
          {filteredQuotes.length > 0 ? (
            filteredQuotes.map((quote) => (
              <Card key={quote.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{quote.title || `Devis ${quote.type}`}</CardTitle>
                      <CardDescription>
                        Demande effectuée le {formatDate(quote.createdAt)}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${quoteStatusConfig[quote.status]?.color || 'bg-gray-50 text-gray-700'} flex items-center gap-1`}
                    >
                      {quoteStatusConfig[quote.status]?.icon || <Clock className="h-4 w-4" />}
                      {quoteStatusConfig[quote.status]?.label || quote.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type d'événement</p>
                      <p className="font-medium capitalize">{quote.type || 'Non spécifié'}</p>
                    </div>
                    {quote.eventDate && (
                      <div>
                        <p className="text-muted-foreground">Date d'événement</p>
                        <p className="font-medium">{formatDate(quote.eventDate)}</p>
                      </div>
                    )}
                    {quote.budget && (
                      <div>
                        <p className="text-muted-foreground">Budget</p>
                        <p className="font-medium">{quote.budget}</p>
                      </div>
                    )}
                  </div>
                  
                  {quote.status === 'sent' && quote.proposal && (
                    <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
                      <p className="font-medium">Proposition reçue: {quote.proposal.amount?.toFixed(2) || '0,00'} XAF</p>
                      <p className="text-sm text-blue-700">
                        Valable jusqu'au {formatDate(quote.proposal.validUntil)}
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0 flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewQuoteDetails(quote)}
                  >
                    Voir détails
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                  
                  {quote.status === 'sent' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setSelectedQuote(quote);
                          handleInitiateDeclineQuote();
                        }}
                      >
                        Refuser
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleAcceptQuote(quote.id)}
                      >
                        Accepter
                      </Button>
                    </div>
                  )}
                </CardFooter>
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
      
      {/* Dialogue de détails du devis */}
      <Dialog open={showQuoteDetails} onOpenChange={setShowQuoteDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedQuote?.title || 'Détails du devis'}</DialogTitle>
            <DialogDescription>
              Demande effectuée le {selectedQuote ? formatDate(selectedQuote.createdAt) : ''}
            </DialogDescription>
          </DialogHeader>
          
          {selectedQuote && (
            <div className="space-y-4">
              {/* Badge de statut */}
              <div className="flex items-center">
                <Badge 
                  variant="outline" 
                  className={`${quoteStatusConfig[selectedQuote.status]?.color || 'bg-gray-50 text-gray-700'} flex items-center gap-1`}
                >
                  {quoteStatusConfig[selectedQuote.status]?.icon || <Clock className="h-4 w-4" />}
                  {quoteStatusConfig[selectedQuote.status]?.label || selectedQuote.status}
                </Badge>
              </div>
              
              {/* Informations principales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Type d'événement</h4>
                  <p className="capitalize">{selectedQuote.type || 'Non spécifié'}</p>
                </div>
                {selectedQuote.eventDate && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Date d'événement</h4>
                    <p>{formatDate(selectedQuote.eventDate)}</p>
                  </div>
                )}
                {selectedQuote.budget && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Budget</h4>
                    <p>{selectedQuote.budget}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium mb-1">Contact</h4>
                  <p>{selectedQuote.contactName || 'Non spécifié'}</p>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-muted-foreground whitespace-pre-line">{selectedQuote.description}</p>
              </div>
              
              {/* Proposition reçue */}
              {selectedQuote.status === 'sent' && selectedQuote.proposal && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="text-base font-medium">Proposition de devis</h4>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Validité: {formatDate(selectedQuote.proposal.validUntil)}
                      </Badge>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h3 className="text-lg font-medium text-blue-900">{selectedQuote.proposal.amount?.toFixed(2) || '0,00'} XAF</h3>
                      <p className="text-blue-700 mt-1">{selectedQuote.proposal.description}</p>
                      
                      {selectedQuote.proposal.items && selectedQuote.proposal.items.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <h5 className="text-sm font-medium text-blue-900">Détails de la proposition</h5>
                          {selectedQuote.proposal.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.name || 'Élément'} x{item.quantity || 1}</span>
                              <span>{item.price?.toFixed(2) || '0,00'} XAF</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {selectedQuote.proposal.termsAndConditions && (
                        <div className="mt-3 text-xs text-blue-600">
                          <p>{selectedQuote.proposal.termsAndConditions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              {/* Historique des statuts */}
              {selectedQuote.statusHistory && selectedQuote.statusHistory.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Historique des statuts</h4>
                    <div className="space-y-2">
                      {selectedQuote.statusHistory.map((status, index) => (
                        <div key={index} className="text-sm flex items-start">
                          <div className="w-24 flex-shrink-0 text-muted-foreground">
                            {formatDate(status.date)}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium">{quoteStatusConfig[status.status]?.label || status.status}</span>
                            {status.notes && <p className="text-muted-foreground text-xs mt-0.5">{status.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          <DialogFooter className="flex justify-between items-center">
            <Button variant="secondary" onClick={() => setShowQuoteDetails(false)}>
              Fermer
            </Button>
            
            {selectedQuote && selectedQuote.status === 'sent' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    handleInitiateDeclineQuote();
                  }}
                >
                  Refuser
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleAcceptQuote(selectedQuote.id)}
                >
                  Accepter
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de refus de devis */}
      <AlertDialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refuser le devis</AlertDialogTitle>
            <AlertDialogDescription>
              Veuillez indiquer la raison pour laquelle vous refusez ce devis.
              {selectedQuote && (
                <p className="mt-2 font-medium">
                  Devis: {selectedQuote.title || `Devis ${selectedQuote.type}`}
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <label htmlFor="declineReason" className="block text-sm font-medium mb-2">
              Raison du refus <span className="text-red-500">*</span>
            </label>
            <textarea
              id="declineReason"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Veuillez préciser pourquoi vous refusez ce devis..."
              rows={3}
              required
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeclineQuote}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Confirmer le refus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuoteDashboard;