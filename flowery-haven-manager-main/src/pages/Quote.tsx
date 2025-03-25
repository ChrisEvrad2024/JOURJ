import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, CalendarPlus, FileText, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const QuotePage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();

  // Pré-remplir avec les informations de l'utilisateur si connecté
  useEffect(() => {
    if (currentUser) {
      setName(`${currentUser.firstName} ${currentUser.lastName}`);
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Vérification basique des champs
    if (!name || !email || !eventType || !description) {
      toast.error("Veuillez remplir tous les champs obligatoires", {
        description: "Nom, email, type d'événement et description sont requis"
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Simuler l'envoi du formulaire
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Réinitialiser le formulaire après succès
      setName(currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "");
      setEmail(currentUser ? currentUser.email : "");
      setPhone("");
      setEventType("");
      setEventDate(undefined);
      setBudget("");
      setDescription("");

      toast.success("Demande de devis envoyée", {
        description: "Nous vous contacterons dans les plus brefs délais"
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi du devis:", error);
      toast.error("Erreur lors de l'envoi", {
        description: "Une erreur est survenue, veuillez réessayer"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left section - Form */}
            <div className="flex-1">
              <h1 className="text-3xl font-serif mb-2">Demande de Devis</h1>
              <p className="text-muted-foreground mb-6">
                Remplissez ce formulaire pour obtenir un devis personnalisé pour votre événement floral.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet <span className="text-red-500">*</span></Label>
                    <Input 
                      id="name" 
                      placeholder="Votre nom complet" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="votre@email.fr" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input 
                      id="phone" 
                      placeholder="Votre numéro de téléphone" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-type">Type d'événement <span className="text-red-500">*</span></Label>
                    <Select
                      value={eventType}
                      onValueChange={setEventType}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="event-type">
                        <SelectValue placeholder="Sélectionner un type d'événement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mariage">Mariage</SelectItem>
                        <SelectItem value="anniversaire">Anniversaire</SelectItem>
                        <SelectItem value="entreprise">Événement d'entreprise</SelectItem>
                        <SelectItem value="deuil">Cérémonie de deuil</SelectItem>
                        <SelectItem value="decoration">Décoration</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="event-date">Date de l'événement</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${!eventDate ? "text-muted-foreground" : ""}`}
                          disabled={isSubmitting}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {eventDate ? format(eventDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={eventDate}
                          onSelect={setEventDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget approximatif</Label>
                    <Select
                      value={budget}
                      onValueChange={setBudget}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="budget">
                        <SelectValue placeholder="Sélectionner un budget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="<100">Moins de 100€</SelectItem>
                        <SelectItem value="100-300">Entre 100€ et 300€</SelectItem>
                        <SelectItem value="300-500">Entre 300€ et 500€</SelectItem>
                        <SelectItem value="500-1000">Entre 500€ et 1000€</SelectItem>
                        <SelectItem value=">1000">Plus de 1000€</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description de votre projet <span className="text-red-500">*</span></Label>
                  <Textarea 
                    id="description" 
                    placeholder="Décrivez votre projet, vos besoins et vos attentes..."
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full"></span>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> 
                      Envoyer ma demande
                    </>
                  )}
                </Button>
              </form>
            </div>
            
            {/* Right section - Info cards */}
            <div className="w-full md:w-[350px] space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarPlus className="h-5 w-5 text-primary" />
                    Délais de réponse
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Nous répondons à toutes les demandes de devis dans un délai de 
                    <span className="font-semibold"> 24 heures ouvrées</span>. Pour les événements urgents, 
                    n'hésitez pas à nous appeler.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Types de services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="bg-primary/10 text-primary h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
                      <span>Décorations florales pour mariages</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-primary/10 text-primary h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
                      <span>Arrangements pour événements d'entreprise</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-primary/10 text-primary h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
                      <span>Bouquets et compositions personnalisés</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-primary/10 text-primary h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
                      <span>Abonnements floraux pour entreprises</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-primary/10 text-primary h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
                      <span>Décorations saisonnières</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Besoin d'aide?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    N'hésitez pas à nous contacter directement si vous avez des questions spécifiques.
                  </p>
                  <div className="text-sm space-y-2">
                    <p className="flex items-center">
                      <span className="font-medium mr-2">Téléphone:</span> 
                      <a href="tel:+33123456789" className="text-primary hover:underline">01 23 45 67 89</a>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium mr-2">Email:</span> 
                      <a href="mailto:contact@chezflora.fr" className="text-primary hover:underline">contact@chezflora.fr</a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default QuotePage;