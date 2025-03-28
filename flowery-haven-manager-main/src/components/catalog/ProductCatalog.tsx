import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Filter,
  Search,
  Grid3X3,
  List,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";
import ProductService from "@/services/ProductService";
import { Product } from "@/types/product";
import ProductCard from "@/components/shared/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductCatalogProps {
  className?: string;
  defaultCategory?: string;
  showFilters?: boolean;
  initialFilters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    featured?: boolean;
  };
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({
  className = "",
  defaultCategory,
  showFilters = true,
  initialFilters = {},
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // États de filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || defaultCategory || ""
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>("featured");

  // Obtention des filtres depuis l'URL
  useEffect(() => {
    const category = searchParams.get("category") || defaultCategory || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");
    const featured = searchParams.get("featured");
    const sort = searchParams.get("sort") || "featured";

    setSelectedCategory(category);
    if (minPrice && maxPrice) {
      setPriceRange([Number(minPrice), Number(maxPrice)]);
    }
    setInStockOnly(inStock === "true");
    setFeaturedOnly(featured === "true");
    setSortBy(sort);
  }, [searchParams, defaultCategory]);

  // Charger les produits et catégories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Charger les catégories
        const categoriesData = await ProductService.getAllCategories();
        setCategories(categoriesData);

        // Charger les produits
        const allProducts = await ProductService.getAllProducts();
        setProducts(allProducts);
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Application des filtres
  const filteredProducts = products
    .filter((product) => {
      // Filtre par recherche
      const matchesSearch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtre par catégorie
      const matchesCategory =
        selectedCategory === "" || product.category === selectedCategory;

      // Filtre par prix
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      // Filtre par stock
      const matchesStock =
        !inStockOnly || product.stock === undefined || product.stock > 0;

      // Filtre par mise en avant
      const matchesFeatured = !featuredOnly || product.featured === true;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesStock &&
        matchesFeatured
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "featured":
          // Tri par produits en vedette, puis populaires, puis par nom
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  // Prix min et max des produits (pour le slider)
  const minProductPrice = Math.min(...products.map((p) => p.price));
  const maxProductPrice = Math.max(...products.map((p) => p.price));

  // Mise à jour de l'URL avec les filtres
  const updateSearchParams = () => {
    const params = new URLSearchParams();

    if (selectedCategory) params.set("category", selectedCategory);
    if (priceRange[0] > minProductPrice)
      params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < maxProductPrice)
      params.set("maxPrice", priceRange[1].toString());
    if (inStockOnly) params.set("inStock", "true");
    if (featuredOnly) params.set("featured", "true");
    if (sortBy !== "featured") params.set("sort", sortBy);

    setSearchParams(params);
  };

  // Mise à jour des filtres
  const applyFilters = () => {
    updateSearchParams();
    setIsMobileFiltersOpen(false);
  };

  // Réinitialisation des filtres
  const resetFilters = () => {
    setSelectedCategory("");
    setPriceRange([minProductPrice, maxProductPrice]);
    setInStockOnly(false);
    setFeaturedOnly(false);
    setSortBy("featured");
    setSearchParams({});
  };

  // Obtenir le nom de la catégorie
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "";
  };

  // Filtres actifs
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    if (priceRange[0] > minProductPrice || priceRange[1] < maxProductPrice)
      count++;
    if (inStockOnly) count++;
    if (featuredOnly) count++;
    if (sortBy !== "featured") count++;
    return count;
  };

  // Rendu des filtres desktop
  const renderDesktopFilters = () => {
    if (!showFilters) return null;

    return (
      <div className="hidden lg:block lg:w-64 space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Catégories</h3>
          <div className="space-y-1">
            <Button
              variant={selectedCategory === "" ? "secondary" : "ghost"}
              className="w-full justify-start text-left"
              onClick={() => {
                setSelectedCategory("");
                updateSearchParams();
              }}
            >
              Toutes les catégories
            </Button>

            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "secondary" : "ghost"
                }
                className="w-full justify-start text-left"
                onClick={() => {
                  setSelectedCategory(category.id);
                  updateSearchParams();
                }}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-lg">Prix</h3>
          <div className="px-2">
            <Slider
              value={priceRange}
              min={minProductPrice}
              max={maxProductPrice}
              step={10}
              onValueChange={(value) =>
                setPriceRange(value as [number, number])
              }
              onValueCommit={updateSearchParams}
            />
            <div className="flex justify-between mt-2 text-sm">
              <span>{priceRange[0]} XAF</span>
              <span>{priceRange[1]} XAF</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-lg">Disponibilité</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="stock-filter"
                checked={inStockOnly}
                onCheckedChange={(checked) => {
                  setInStockOnly(checked === true);
                  updateSearchParams();
                }}
              />
              <Label htmlFor="stock-filter">En stock uniquement</Label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-lg">Options</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured-filter"
                checked={featuredOnly}
                onCheckedChange={(checked) => {
                  setFeaturedOnly(checked === true);
                  updateSearchParams();
                }}
              />
              <Label htmlFor="featured-filter">Produits en vedette</Label>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={resetFilters}
        >
          Réinitialiser les filtres
        </Button>
      </div>
    );
  };

  // Rendu des produits avec squelettes de chargement
  const renderProducts = () => {
    if (loading) {
      return (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${
            viewMode === "list" ? "lg:grid-cols-1" : ""
          }`}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full aspect-[3/4] rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <h3 className="text-lg font-medium">Aucun produit trouvé</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Essayez de modifier vos filtres pour obtenir plus de résultats.
          </p>
          <Button variant="outline" className="mt-4" onClick={resetFilters}>
            Réinitialiser les filtres
          </Button>
        </div>
      );
    }

    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${
          viewMode === "list" ? "lg:grid-cols-1" : ""
        }`}
      >
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      {/* Barre d'outils (recherche, tri, mode de vue) */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="relative w-full md:w-auto md:flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            {showFilters && (
              <Sheet
                open={isMobileFiltersOpen}
                onOpenChange={setIsMobileFiltersOpen}
              >
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="lg:hidden flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filtres
                    {getActiveFiltersCount() > 0 && (
                      <Badge className="ml-1">{getActiveFiltersCount()}</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-sm">
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                    <SheetDescription>
                      Affinez votre recherche avec les filtres ci-dessous
                    </SheetDescription>
                  </SheetHeader>

                  <div className="py-4 space-y-6">
                    <Accordion
                      type="single"
                      collapsible
                      defaultValue="category"
                    >
                      <AccordionItem value="category">
                        <AccordionTrigger>Catégories</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-1 mt-2">
                            <Button
                              variant={
                                selectedCategory === "" ? "secondary" : "ghost"
                              }
                              className="w-full justify-start text-left"
                              onClick={() => setSelectedCategory("")}
                            >
                              Toutes les catégories
                            </Button>

                            {categories.map((category) => (
                              <Button
                                key={category.id}
                                variant={
                                  selectedCategory === category.id
                                    ? "secondary"
                                    : "ghost"
                                }
                                className="w-full justify-start text-left"
                                onClick={() => setSelectedCategory(category.id)}
                              >
                                {category.name}
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="price">
                        <AccordionTrigger>Prix</AccordionTrigger>
                        <AccordionContent>
                          <div className="px-2 mt-6 mb-2">
                            <Slider
                              value={priceRange}
                              min={minProductPrice}
                              max={maxProductPrice}
                              step={10}
                              onValueChange={(value) =>
                                setPriceRange(value as [number, number])
                              }
                            />
                            <div className="flex justify-between mt-2 text-sm">
                              <span>{priceRange[0]} XAF</span>
                              <span>{priceRange[1]} XAF</span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="availability">
                        <AccordionTrigger>Disponibilité</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 mt-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="mobile-stock-filter"
                                checked={inStockOnly}
                                onCheckedChange={(checked) =>
                                  setInStockOnly(checked === true)
                                }
                              />
                              <Label htmlFor="mobile-stock-filter">
                                En stock uniquement
                              </Label>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="options">
                        <AccordionTrigger>Options</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 mt-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="mobile-featured-filter"
                                checked={featuredOnly}
                                onCheckedChange={(checked) =>
                                  setFeaturedOnly(checked === true)
                                }
                              />
                              <Label htmlFor="mobile-featured-filter">
                                Produits en vedette
                              </Label>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  <SheetFooter>
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <Button variant="outline" onClick={resetFilters}>
                        Réinitialiser
                      </Button>
                      <Button onClick={applyFilters}>Appliquer</Button>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            )}

            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value);
                updateSearchParams();
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Recommandés</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                <SelectItem value="name-asc">Nom A-Z</SelectItem>
                <SelectItem value="name-desc">Nom Z-A</SelectItem>
              </SelectContent>
            </Select>

            <div className="border rounded-md hidden md:flex">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-r-none"
                onClick={() => setViewMode("grid")}
                title="Vue grille"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-l-none"
                onClick={() => setViewMode("list")}
                title="Vue liste"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filtres actifs */}
        {getActiveFiltersCount() > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Filtres:</span>

            {selectedCategory && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {getCategoryName(selectedCategory)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSelectedCategory("");
                    updateSearchParams();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {(priceRange[0] > minProductPrice ||
              priceRange[1] < maxProductPrice) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Prix: {priceRange[0]} - {priceRange[1]} XAF
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setPriceRange([minProductPrice, maxProductPrice]);
                    updateSearchParams();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {inStockOnly && (
              <Badge variant="secondary" className="flex items-center gap-1">
                En stock
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setInStockOnly(false);
                    updateSearchParams();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {featuredOnly && (
              <Badge variant="secondary" className="flex items-center gap-1">
                En vedette
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setFeaturedOnly(false);
                    updateSearchParams();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="ml-auto"
            >
              Réinitialiser tout
            </Button>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="flex gap-8">
        {/* Filtres desktop */}
        {renderDesktopFilters()}

        {/* Grille des produits */}
        <div className="flex-1">
          {/* Résultats de la recherche */}
          {searchQuery && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} résultat(s) pour "{searchQuery}"
              </p>
            </div>
          )}

          {/* Produits */}
          {renderProducts()}
        </div>
      </div>
    </div>
  );
};

// Icône X
const X = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export default ProductCatalog;
