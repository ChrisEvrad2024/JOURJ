// src/pages/admin/AdminSettings.tsx
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
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Settings, 
  Bell, 
  ShoppingCart, 
  Lock, 
  Mail, 
  CreditCard 
} from "lucide-react";
import { toast } from "sonner";
import { SettingsService } from "@/services";

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    // Paramètres généraux
    siteName: "",
    siteDescription: "",
    maintenanceMode: false,
    
    // Paramètres de notification
    emailNotifications: {
      orderConfirmation: true,
      quoteUpdates: true,
      newsletterSignups: true
    },
    
    // Paramètres de paiement
    currency: "EUR",
    taxRate: 0,
    
    // Paramètres de sécurité
    requireStrongPasswords: true,
    maxLoginAttempts: 5
  });

  // Charger les paramètres existants
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const currentSettings = await SettingsService.getAllSettings();
        setSettings(currentSettings);
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error);
        toast.error("Impossible de charger les paramètres");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Mettre à jour un paramètre spécifique
  const updateSetting = (category, key, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [category]: {
        ...(prevSettings[category] || {}),
        [key]: value
      }
    }));
  };

  // Enregistrer les paramètres
  const handleSaveSettings = async () => {
    try {
      await SettingsService.updateSettings(settings);
      toast.success("Paramètres mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error);
      toast.error("Impossible de sauvegarder les paramètres");
    }
  };

  // État de chargement
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
            <p className="text-muted-foreground">Configuration de votre plateforme</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">Configuration de votre plateforme</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" /> Général
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="payments">
            <ShoppingCart className="mr-2 h-4 w-4" /> Paiements
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="mr-2 h-4 w-4" /> Sécurité
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="mr-2 h-4 w-4" /> Email
          </TabsTrigger>
        </TabsList>

        {/* Paramètres généraux */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres généraux</CardTitle>
              <CardDescription>Configuration de base de votre site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Nom du site</Label>
                <Input 
                  value={settings.siteName}
                  onChange={(e) => setSettings(prev => ({...prev, siteName: e.target.value}))}
                  placeholder="Entrez le nom de votre site"
                />
              </div>
              <div className="grid gap-2">
                <Label>Description du site</Label>
                <Input 
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({...prev, siteDescription: e.target.value}))}
                  placeholder="Brève description de votre site"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenance-mode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings(prev => ({...prev, maintenanceMode: checked}))}
                />
                <Label htmlFor="maintenance-mode">Mode maintenance</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres de notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de notifications</CardTitle>
              <CardDescription>Configurer les notifications automatiques</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Confirmation de commande</Label>
                <Switch
                  checked={settings.emailNotifications.orderConfirmation}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', 'orderConfirmation', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Mises à jour de devis</Label>
                <Switch
                  checked={settings.emailNotifications.quoteUpdates}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', 'quoteUpdates', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Inscriptions à la newsletter</Label>
                <Switch
                  checked={settings.emailNotifications.newsletterSignups}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', 'newsletterSignups', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres de paiement */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de paiement</CardTitle>
              <CardDescription>Configuration financière</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Devise</Label>
                <Select 
                  value={settings.currency}
                  onValueChange={(value) => setSettings(prev => ({...prev, currency: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une devise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">Euro (XAF)</SelectItem>
                    <SelectItem value="USD">Dollar US ($)</SelectItem>
                    <SelectItem value="GBP">Livre Sterling (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Taux de TVA (%)</Label>
                <Input 
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings(prev => ({...prev, taxRate: parseFloat(e.target.value)}))}
                  placeholder="Entrez le taux de TVA"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres de sécurité */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de sécurité</CardTitle>
              <CardDescription>Configuration de la sécurité du compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Exiger des mots de passe forts</Label>
                <Switch
                  checked={settings.requireStrongPasswords}
                  onCheckedChange={(checked) => setSettings(prev => ({...prev, requireStrongPasswords: checked}))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Nombre maximal de tentatives de connexion</Label>
                <Input 
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings(prev => ({...prev, maxLoginAttempts: parseInt(e.target.value)}))}
                  placeholder="Nombre de tentatives avant blocage"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres email */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres Email</CardTitle>
              <CardDescription>Configuration de l'envoi d'emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Email d'expédition</Label>
                <Input 
                  placeholder="Email utilisé pour l'envoi des notifications"
                />
              </div>
              <div className="grid gap-2">
                <Label>Serveur SMTP</Label>
                <Input 
                  placeholder="Adresse du serveur SMTP"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end mt-6">
        <Button onClick={handleSaveSettings}>
          Enregistrer les paramètres
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;