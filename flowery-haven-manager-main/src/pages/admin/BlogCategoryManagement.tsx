import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
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
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Eye,
  FileText,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BlogCategoryForm, BlogCategory } from "@/components/admin/BlogCategoryForm";

// Sample blog categories for demonstration purposes
const sampleBlogCategories: BlogCategory[] = [
  {
    id: "blog-cat-1",
    name: "Conseils d'entretien",
    slug: "conseils-entretien",
    description: "Conseils et astuces pour prendre soin de vos plantes et fleurs.",
    featured: true,
  },
  {
    id: "blog-cat-2",
    name: "Mariages",
    slug: "mariages",
    description: "Idées et inspirations florales pour votre mariage.",
    featured: true,
  },
  {
    id: "blog-cat-3",
    name: "Saisons",
    slug: "saisons",
    description: "Les meilleures plantes et fleurs pour chaque saison.",
    featured: false,
  },
  {
    id: "blog-cat-4",
    name: "Art floral",
    slug: "art-floral",
    description: "Découvrez l'art de l'arrangement floral et ses techniques.",
    featured: false,
  },
  {
    id: "blog-cat-5",
    name: "Nouveautés",
    slug: "nouveautes",
    description: "Les dernières tendances et nouveautés dans le monde des fleurs.",
    featured: true,
  },
  {
    id: "blog-cat-6",
    name: "Événements",
    slug: "evenements",
    description: "Décorations florales pour vos événements spéciaux.",
    featured: false,
  },
  {
    id: "blog-cat-7",
    name: "Plantes d'intérieur",
    slug: "plantes-interieur",
    description: "Tout savoir sur les plantes d'intérieur et leur entretien.",
    featured: false,
  }
];

const BlogCategoryManagement = () => {
  const [categories, setCategories] = useState<BlogCategory[]>(sampleBlogCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [viewingCategory, setViewingCategory] = useState<BlogCategory | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [blogCountsByCategory, setBlogCountsByCategory] = useState<Record<string, number>>({});
  
  useEffect(() => {
    // In a real application, we would fetch this data from the API
    // For demonstration, we'll simulate blog counts per category
    const mockBlogCounts: Record<string, number> = {};
    categories.forEach(cat => {
      mockBlogCounts[cat.id] = Math.floor(Math.random() * 10);
    });
    setBlogCountsByCategory(mockBlogCounts);
  }, [categories]);
  
  // Filter categories based on search query
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // View category details
  const handleViewCategory = (category: BlogCategory) => {
    setViewingCategory(category);
    setIsViewDialogOpen(true);
  };
  
  // Handle category deletion
  const handleDeleteCategory = (categoryId: string) => {
    // Check if category has any blog posts
    if (blogCountsByCategory[categoryId] > 0) {
      toast.error("Impossible de supprimer cette catégorie", {
        description: "Cette catégorie contient des articles. Veuillez d'abord supprimer ou déplacer ces articles."
      });
      return;
    }
    
    setCategories(categories.filter(category => category.id !== categoryId));
    toast.success("Catégorie supprimée", {
      description: "La catégorie a été supprimée avec succès."
    });
  };

  // Handle edit category
  const handleEditCategory = (category: BlogCategory) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };
  
  // Handle adding new category
  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  // Handle save category
  const handleSaveCategory = (category: BlogCategory) => {
    if (editingCategory) {
      // Update existing category
      setCategories(categories.map(c => c.id === category.id ? category : c));
      toast.success("Catégorie mise à jour", {
        description: "La catégorie a été mise à jour avec succès."
      });
    } else {
      // Add new category
      setCategories([...categories, category]);
      toast.success("Catégorie ajoutée", {
        description: "La catégorie a été ajoutée avec succès."
      });
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catégories de blog</h1>
          <p className="text-muted-foreground">Gérez les catégories pour les articles de blog.</p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une catégorie
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher une catégorie..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="text-center">Articles</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs truncate">
                      {category.description}
                    </TableCell>
                    <TableCell className="text-center">
                      {category.featured ? (
                        <Badge variant="default">En vedette</Badge>
                      ) : (
                        <Badge variant="outline">Standard</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {blogCountsByCategory[category.id] || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewCategory(category)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCategories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Aucune catégorie trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Affichage de {filteredCategories.length} sur {categories.length} catégories
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Précédent</Button>
            <Button variant="outline" size="sm" disabled>Suivant</Button>
          </div>
        </CardFooter>
      </Card>

      {/* Category Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Modifier une catégorie' : 'Ajouter une catégorie'}
            </DialogTitle>
          </DialogHeader>
          <BlogCategoryForm 
            category={editingCategory}
            onSubmit={handleSaveCategory}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* View Category Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {viewingCategory?.name}
            </DialogTitle>
          </DialogHeader>
          
          {viewingCategory && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Slug</h3>
                <p className="bg-muted px-2 py-1 rounded text-sm font-mono">{viewingCategory.slug}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <p>{viewingCategory.description}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Statut</h3>
                <p>
                  {viewingCategory.featured ? (
                    <Badge variant="default">En vedette</Badge>
                  ) : (
                    <Badge variant="outline">Standard</Badge>
                  )}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Articles associés</h3>
                <p className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {blogCountsByCategory[viewingCategory.id] || 0} articles dans cette catégorie
                </p>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button onClick={() => setIsViewDialogOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BlogCategoryManagement;