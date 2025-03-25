import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/shared/ProductCard';
import { Filter } from 'lucide-react';
import { ProductService } from '@/services';

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const categoryParam = searchParams.get('category');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Charger les catégories
        const categoriesData = await ProductService.getAllCategories();
        setCategories(categoriesData);
        
        // Charger les produits selon la catégorie sélectionnée
        if (categoryParam) {
          const filteredProducts = await ProductService.getProductsByCategory(categoryParam);
          setProducts(filteredProducts);
        } else {
          const allProducts = await ProductService.getAllProducts();
          setProducts(allProducts);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [categoryParam]);
  
  const handleCategoryChange = (categoryId: string) => {
    setSearchParams({ category: categoryId });
  };
  
  const clearFilters = () => {
    setSearchParams({});
  };
  
  // État pour le filtre de prix
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' });
  
  // Fonction pour filtrer par prix
  const handlePriceFilter = () => {
    let filtered = [...products];
    if (priceFilter.min) {
      filtered = filtered.filter(product => product.price >= parseFloat(priceFilter.min));
    }
    if (priceFilter.max) {
      filtered = filtered.filter(product => product.price <= parseFloat(priceFilter.max));
    }
    setProducts(filtered);
  };
  
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="section-container">
          <div className="text-center mb-16 animate-fade-up">
            <h1 className="section-title">Notre Collection</h1>
            <p className="section-subtitle max-w-2xl mx-auto">
              Parcourez notre sélection de fleurs fraîches, bouquets, plantes et décorations.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse">
                <p>Chargement des produits...</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Mobile filter toggle */}
              <button 
                className="lg:hidden flex items-center justify-center gap-2 w-full py-3 border border-border rounded-md mb-4"
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              >
                <Filter size={18} />
                Filtrer les produits
              </button>
              
              {/* Sidebar filters */}
              <aside className={`lg:w-1/4 ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
                <div className="sticky top-24 bg-white p-6 rounded-lg border border-border">
                  <h3 className="font-serif text-xl mb-4">Catégories</h3>
                  <ul className="space-y-2">
                    <li>
                      <button 
                        className={`w-full text-left py-2 px-3 rounded-md transition-colors ${
                          !categoryParam ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                        }`}
                        onClick={clearFilters}
                      >
                        Tous les produits
                      </button>
                    </li>
                    {categories.map((category) => (
                      <li key={category.id}>
                        <button 
                          className={`w-full text-left py-2 px-3 rounded-md transition-colors ${
                            categoryParam === category.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                          }`}
                          onClick={() => handleCategoryChange(category.id)}
                        >
                          {category.name}
                        </button>
                      </li>
                    ))}
                  </ul>
  
                  <div className="border-t border-border my-6 pt-6">
                    <h3 className="font-serif text-xl mb-4">Prix</h3>
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <input 
                        type="number" 
                        placeholder="Min" 
                        className="w-full border border-border rounded-md p-2"
                        value={priceFilter.min}
                        onChange={(e) => setPriceFilter({...priceFilter, min: e.target.value})}
                      />
                      <span>à</span>
                      <input 
                        type="number" 
                        placeholder="Max" 
                        className="w-full border border-border rounded-md p-2"
                        value={priceFilter.max}
                        onChange={(e) => setPriceFilter({...priceFilter, max: e.target.value})}
                      />
                    </div>
                    <button 
                      className="w-full bg-muted py-2 rounded-md hover:bg-muted/80 transition-colors"
                      onClick={handlePriceFilter}
                    >
                      Appliquer
                    </button>
                  </div>
                </div>
              </aside>
              
              {/* Products grid */}
              <div className="lg:w-3/4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                
                {products.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground">Aucun produit trouvé.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Catalog;