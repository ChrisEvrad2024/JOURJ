import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// BlogCategory interface
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  featured: boolean;
}

// Form validation schema
const blogCategoryFormSchema = z.object({
  name: z.string().min(3, {
    message: "Le nom de la catégorie doit contenir au moins 3 caractères",
  }),
  slug: z.string().min(3, {
    message: "Le slug doit contenir au moins 3 caractères",
  }).regex(/^[a-z0-9-]+$/, {
    message: "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets",
  }),
  description: z.string().min(10, {
    message: "La description doit contenir au moins 10 caractères",
  }),
  featured: z.boolean().default(false),
});

type BlogCategoryFormValues = z.infer<typeof blogCategoryFormSchema>;

interface BlogCategoryFormProps {
  category: BlogCategory | null;
  onSubmit: (category: BlogCategory) => void;
  onCancel: () => void;
}

export function BlogCategoryForm({ category, onSubmit, onCancel }: BlogCategoryFormProps) {
  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Setup form with default values
  const form = useForm<BlogCategoryFormValues>({
    resolver: zodResolver(blogCategoryFormSchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      description: category?.description || "",
      featured: category?.featured || false,
    },
  });

  // Watch name field to auto-generate slug
  const nameValue = form.watch("name");
  
  // Auto-generate slug when name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only auto-generate slug if it's empty or if we're creating a new category
    if (!category || !form.getValues("slug")) {
      const slugValue = generateSlug(e.target.value);
      form.setValue("slug", slugValue);
    }
  };

  // Form submission handler
  const handleFormSubmit = (values: BlogCategoryFormValues) => {
    // Create new category object
    const updatedCategory: BlogCategory = {
      id: category?.id || `blog-cat-${Date.now()}`,
      name: values.name,
      slug: values.slug,
      description: values.description,
      featured: values.featured,
    };

    onSubmit(updatedCategory);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la catégorie</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Conseils d'entretien" 
                  {...field} 
                  onChange={(e) => {
                    field.onChange(e);
                    handleNameChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="conseils-entretien" {...field} />
              </FormControl>
              <FormDescription>
                Utilisé pour l'URL (exemple: monsite.com/blog/categorie/<strong>{field.value || 'slug'}</strong>)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description de la catégorie..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Catégorie en vedette</FormLabel>
                <FormDescription>
                  Mettre cette catégorie en avant sur la page blog
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

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            {category ? "Mettre à jour" : "Créer la catégorie"}
          </Button>
        </div>
      </form>
    </Form>
  );
}