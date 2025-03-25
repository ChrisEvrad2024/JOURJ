
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Product } from "@/types/product";
import { Trash2, Plus, X } from "lucide-react";

// Form validation schema
const productFormSchema = z.object({
  name: z.string().min(3, {
    message: "Le nom du produit doit contenir au moins 3 caractères",
  }),
  description: z.string().min(10, {
    message: "La description doit contenir au moins 10 caractères",
  }),
  price: z.coerce.number().positive({
    message: "Le prix doit être un nombre positif",
  }),
  stock: z.coerce.number().int().nonnegative({
    message: "Le stock doit être un nombre entier positif ou zéro",
  }),
  category: z.string({
    required_error: "Veuillez sélectionner une catégorie",
  }),
  sku: z.string().optional(),
  weight: z.coerce.number().positive().optional(),
  popular: z.boolean().default(false),
  featured: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product: Product | null;
  categories: { id: string; name: string }[];
  onSubmit: (product: Product) => void;
  onCancel: () => void;
}

export function ProductForm({ product, categories, onSubmit, onCancel }: ProductFormProps) {
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [imageUrl, setImageUrl] = useState("");

  // Setup form with default values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      stock: product?.stock || 0,
      category: product?.category || "",
      sku: product?.sku || "",
      weight: product?.weight || 0,
      popular: product?.popular || false,
      featured: product?.featured || false,
    },
  });

  // Form submission handler
  const handleFormSubmit = (values: ProductFormValues) => {
    // Create new product object
    const updatedProduct: Product = {
      id: product?.id || `prod-${Date.now()}`,
      name: values.name,
      description: values.description,
      price: values.price,
      stock: values.stock,
      images: images,
      category: values.category,
      popular: values.popular,
      featured: values.featured,
      sku: values.sku,
      weight: values.weight,
    };

    onSubmit(updatedProduct);
  };

  // Add image to the list
  const handleAddImage = () => {
    if (imageUrl && !images.includes(imageUrl)) {
      setImages([...images, imageUrl]);
      setImageUrl("");
    }
  };

  // Remove image from the list
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du produit</FormLabel>
                  <FormControl>
                    <Input placeholder="Bouquet de roses rouges" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix (XAF)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU (Référence)</FormLabel>
                  <FormControl>
                    <Input placeholder="SKU-12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poids (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description détaillée du produit..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Images du produit</Label>
              <div className="flex space-x-2">
                <Input
                  type="url"
                  placeholder="URL de l'image"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddImage}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product image ${index + 1}`}
                      className="h-24 w-full object-cover rounded-md border"
                      onError={(e) => {
                        // If image fails to load, set a placeholder
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-80"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="popular"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Produit populaire</FormLabel>
                      <FormDescription>
                        Marquer ce produit comme populaire
                      </FormDescription>
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

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Produit en vedette</FormLabel>
                      <FormDescription>
                        Mettre ce produit en avant sur la page d'accueil
                      </FormDescription>
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
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            {product ? "Mettre à jour" : "Créer le produit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
