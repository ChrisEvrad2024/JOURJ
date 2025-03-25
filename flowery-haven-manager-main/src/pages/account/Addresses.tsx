
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, MoreVertical, PenLine, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

// Define address type
type Address = {
  id: string;
  nickname: string;
  type: "shipping" | "billing";
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
};

// Mock addresses data
const initialAddresses: Address[] = [
  {
    id: "addr-1",
    nickname: "Domicile",
    type: "shipping",
    firstName: "Jean",
    lastName: "Dupont",
    addressLine1: "123 Rue de Paris",
    addressLine2: "Apt 4B",
    city: "Paris",
    postalCode: "75001",
    country: "France",
    phone: "0123456789",
    isDefault: true,
  },
  {
    id: "addr-2",
    nickname: "Bureau",
    type: "shipping",
    firstName: "Jean",
    lastName: "Dupont",
    addressLine1: "45 Avenue des Champs-Élysées",
    addressLine2: "Étage 3",
    city: "Paris",
    postalCode: "75008",
    country: "France",
    phone: "0123456789",
    isDefault: false,
  },
  {
    id: "addr-3",
    nickname: "Facturation",
    type: "billing",
    firstName: "Jean",
    lastName: "Dupont",
    addressLine1: "123 Rue de Paris",
    addressLine2: "Apt 4B",
    city: "Paris",
    postalCode: "75001",
    country: "France",
    phone: "0123456789",
    isDefault: true,
  },
];

// Address form schema
const addressFormSchema = z.object({
  nickname: z.string().min(1, "Le nom est requis"),
  type: z.enum(["shipping", "billing"]),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom de famille est requis"),
  addressLine1: z.string().min(1, "L'adresse est requise"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "La ville est requise"),
  postalCode: z.string().min(1, "Le code postal est requis"),
  country: z.string().min(1, "Le pays est requis"),
  phone: z.string().min(1, "Le téléphone est requis"),
  isDefault: z.boolean().default(false),
});

const Addresses = () => {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Initialize the form
  const form = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      nickname: "",
      type: "shipping",
      firstName: "",
      lastName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
      country: "France",
      phone: "",
      isDefault: false,
    },
  });

  // Open dialog for adding a new address
  const handleAddAddress = () => {
    form.reset({
      nickname: "",
      type: "shipping",
      firstName: "",
      lastName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
      country: "France",
      phone: "",
      isDefault: false,
    });
    setEditingAddress(null);
    setOpenDialog(true);
  };

  // Open dialog for editing an existing address
  const handleEditAddress = (address: Address) => {
    form.reset({
      nickname: address.nickname,
      type: address.type,
      firstName: address.firstName,
      lastName: address.lastName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setEditingAddress(address);
    setOpenDialog(true);
  };

  // Handle address deletion
  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
    toast.success("Adresse supprimée", {
      description: "L'adresse a été supprimée avec succès.",
    });
  };

  // Handle form submission
  const onSubmit = (data: z.infer<typeof addressFormSchema>) => {
    // Check if this is a default address
    if (data.isDefault) {
      setAddresses(addresses.map((addr) => {
        if (addr.type === data.type && (!editingAddress || addr.id !== editingAddress.id)) {
          return { ...addr, isDefault: false };
        }
        return addr;
      }));
    }

    if (editingAddress) {
      // Update existing address
      setAddresses(addresses.map((addr) => {
        if (addr.id === editingAddress.id) {
          return { 
            id: addr.id,
            nickname: data.nickname,
            type: data.type,
            firstName: data.firstName,
            lastName: data.lastName,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2 || "",
            city: data.city,
            postalCode: data.postalCode,
            country: data.country,
            phone: data.phone,
            isDefault: data.isDefault
          };
        }
        return addr;
      }));
      toast.success("Adresse mise à jour", {
        description: "Vos modifications ont été enregistrées.",
      });
    } else {
      // Add new address
      const newAddress: Address = {
        id: `addr-${Date.now()}`,
        nickname: data.nickname,
        type: data.type,
        firstName: data.firstName,
        lastName: data.lastName,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || "",
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
        isDefault: data.isDefault
      };
      setAddresses([...addresses, newAddress]);
      toast.success("Adresse ajoutée", {
        description: "La nouvelle adresse a été ajoutée avec succès.",
      });
    }

    setOpenDialog(false);
  };

  // Get shipping and billing addresses
  const shippingAddresses = addresses.filter((addr) => addr.type === "shipping");
  const billingAddresses = addresses.filter((addr) => addr.type === "billing");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mes adresses</h1>
        <p className="text-muted-foreground">
          Gérez vos adresses de livraison et de facturation.
        </p>
      </div>

      {/* Shipping Addresses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Adresses de livraison</h2>
          <Button size="sm" onClick={handleAddAddress}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une adresse
          </Button>
        </div>

        {shippingAddresses.length === 0 ? (
          <Alert>
            <AlertDescription>
              Vous n'avez pas encore ajouté d'adresse de livraison.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {shippingAddresses.map((address) => (
              <AddressCard 
                key={address.id} 
                address={address} 
                onEdit={() => handleEditAddress(address)}
                onDelete={() => handleDeleteAddress(address.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Billing Addresses */}
      <div className="space-y-4 pt-6 border-t">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Adresses de facturation</h2>
        </div>

        {billingAddresses.length === 0 ? (
          <Alert>
            <AlertDescription>
              Vous n'avez pas encore ajouté d'adresse de facturation.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {billingAddresses.map((address) => (
              <AddressCard 
                key={address.id} 
                address={address} 
                onEdit={() => handleEditAddress(address)} 
                onDelete={() => handleDeleteAddress(address.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Address Form Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Modifier l'adresse" : "Ajouter une adresse"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress 
                ? "Modifiez les informations de l'adresse ci-dessous." 
                : "Remplissez les informations pour ajouter une nouvelle adresse."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'adresse</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Domicile, Bureau..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'adresse</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="shipping">Livraison</SelectItem>
                        <SelectItem value="billing">Facturation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="addressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complément d'adresse</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code postal</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Adresse par défaut</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Définir comme adresse par défaut pour ce type
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Annuler</Button>
                </DialogClose>
                <Button type="submit">
                  {editingAddress ? "Mettre à jour" : "Ajouter"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Address Card Component
const AddressCard = ({ 
  address, 
  onEdit, 
  onDelete 
}: { 
  address: Address; 
  onEdit: () => void; 
  onDelete: () => void;
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{address.nickname}</CardTitle>
            <CardDescription>
              {address.isDefault && `Adresse ${address.type === 'shipping' ? 'de livraison' : 'de facturation'} par défaut`}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <PenLine className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer cette adresse ? Cette action ne peut pas être annulée.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete}>
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-1">
          <p>{address.firstName} {address.lastName}</p>
          <p>{address.addressLine1}</p>
          {address.addressLine2 && <p>{address.addressLine2}</p>}
          <p>{address.postalCode} {address.city}</p>
          <p>{address.country}</p>
          <p className="pt-1">{address.phone}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full" onClick={onEdit}>
          Modifier
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Addresses;
