import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Package,
  Image as ImageIcon,
  Check,
  X,
} from "lucide-react";
import ProductService from "@/services/ProductService";
import { Category } from "@/components/admin/CategoryForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { toast } from "sonner";

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Charger les catégories et les produits
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const categoriesData = await ProductService.getAllCategories();
        const productsData = await ProductService.getAllProducts();

        setCategories(categoriesData);
        setProducts(productsData);
      } catch (error) {
        console.error("Erreur lors du chargement des catégories:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Ajouter une nouvelle catégorie
  const handleAddCategory = () => {
    setCurrentCategory(null);
    setShowCategoryForm(true);
  };

  // Éditer une catégorie existante
  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setShowCategoryForm(true);
  };

  // Supprimer une catégorie
  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;

    try {
      // Vérifier si la catégorie est utilisée par des produits
      const productsWithCategory = products.filter(
        (product) => product.category === confirmDelete
      );

      if (productsWithCategory.length > 0) {
        toast.error(
          `Impossible de supprimer cette catégorie car elle est utilisée par ${productsWithCategory.length} produit(s)`
        );
        setConfirmDelete(null);
        return;
      }

      await ProductService.deleteCategory(confirmDelete);

      // Rafraîchir la liste des catégories
      setCategories(
        categories.filter((category) => category.id !== confirmDelete)
      );

      toast.success("Catégorie supprimée avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression de la catégorie:", error);
      toast.error("Erreur lors de la suppression de la catégorie");
    } finally {
      setConfirmDelete(null);
    }
  };

  // Soumettre le formulaire de catégorie
  const handleCategorySubmit = async (categoryData: Category) => {
    try {
      if (currentCategory) {
        // Mettre à jour une catégorie existante
        await ProductService.updateCategory(currentCategory.id, categoryData);

        // Mettre à jour la liste des catégories
        setCategories(
          categories.map((c) =>
            c.id === currentCategory.id ? { ...c, ...categoryData } : c
          )
        );

        toast.success("Catégorie mise à jour avec succès");
      } else {
        // Ajouter une nouvelle catégorie
        const newCategory = await ProductService.addCategory(categoryData);

        // Ajouter la nouvelle catégorie à la liste
        setCategories([...categories, newCategory]);

        toast.success("Catégorie ajoutée avec succès");
      }

      // Fermer le formulaire
      setShowCategoryForm(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la catégorie:", error);
      toast.error("Erreur lors de l'enregistrement de la catégorie");
    }
  };

  // Compter les produits par catégorie
  const getProductCountByCategory = (categoryId: string) => {
    return products.filter((product) => product.category === categoryId).length;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Gestion des Catégories</CardTitle>
              <CardDescription>
                Organisez vos produits en créant et gérant des catégories
              </CardDescription>
            </div>
            <Button
              onClick={handleAddCategory}
              className="sm:self-end whitespace-nowrap"
            >
              <Plus className="mr-2 h-4 w-4" /> Ajouter une catégorie
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Catégories
                  </p>
                  <h3 className="text-2xl font-bold">{categories.length}</h3>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Package className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Catégories avec Produits
                  </p>
                  <h3 className="text-2xl font-bold">
                    {
                      categories.filter(
                        (category) => getProductCountByCategory(category.id) > 0
                      ).length
                    }
                  </h3>
                </div>
                <div className="bg-green-500/10 p-3 rounded-full">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tableau de catégories */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">
                    Aucune catégorie trouvée
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Commencez par ajouter une catégorie pour organiser vos
                    produits.
                  </p>
                  <Button onClick={handleAddCategory} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" /> Ajouter une catégorie
                  </Button>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Image</TableHead>
                        <TableHead>Nom de la catégorie</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Produits</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>
                            <div className="w-12 h-12 rounded-md border overflow-hidden bg-muted">
                              {category.image ? (
                                <img
                                  src={category.image}
                                  alt={category.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "/placeholder.svg";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {category.name}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {category.description}
                          </TableCell>
                          <TableCell>
                            <Badge>
                              {getProductCountByCategory(category.id)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditCategory(category)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Modifier</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => setConfirmDelete(category.id)}
                                disabled={
                                  getProductCountByCategory(category.id) > 0
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Supprimer</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogue de suppression */}
      <Dialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action
              est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Formulaire de catégorie */}
      <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {currentCategory
                ? "Modifier la catégorie"
                : "Ajouter une catégorie"}
            </DialogTitle>
            <DialogDescription>
              {currentCategory
                ? "Modifiez les informations de la catégorie ci-dessous."
                : "Entrez les informations de la nouvelle catégorie."}
            </DialogDescription>
          </DialogHeader>

          <CategoryForm
            category={currentCategory}
            onSubmit={handleCategorySubmit}
            onCancel={() => setShowCategoryForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
