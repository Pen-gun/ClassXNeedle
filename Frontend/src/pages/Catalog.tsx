import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, LayoutGrid, List, Star, Heart, ShoppingBag, X, Search, CheckCircle2 } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCartMutations } from '../hooks/useCart';
import { useRequireAuth } from '../hooks/useAuth';
import { formatPrice } from '../lib/utils';
import type { Product } from '../types';

// Product Card Component
const ProductCard = ({ product, onAdd }: { product: Product; onAdd: (id: string) => void }) => {
  const hasDiscount = product.priceAfterDiscount && product.price && product.priceAfterDiscount < product.price;
  const discountPercent = hasDiscount 
    ? Math.round((1 - (product.priceAfterDiscount! / product.price!)) * 100) 
    : 0;

  return (
    <article className="product-card group">
      <div className="product-image">
        <img
          src={product.coverImage || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        <div className="product-hover-overlay" />

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <span className="badge-gold">-{discountPercent}%</span>
          )}
          {product.category?.name && (
            <span className="badge bg-white/90 dark:bg-black/70 text-stone-700 dark:text-white backdrop-blur-sm">
              {product.category.name}
            </span>
          )}
        </div>

        <button 
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 text-stone-600 dark:text-white"
          aria-label="Add to wishlist"
        >
          <Heart className="w-5 h-5" />
        </button>

        <button
          onClick={() => onAdd(product._id)}
          className="quick-add-btn btn-primary text-sm py-2.5 px-5 flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          Add to Cart
        </button>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-accent-charcoal dark:text-accent-cream line-clamp-2 group-hover:text-accent-gold transition-colors">
            {product.name}
          </h3>
          {product.ratingsAverage && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-4 h-4 text-accent-gold fill-accent-gold" />
              <span className="text-sm text-stone-500">{product.ratingsAverage.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2">
          {product.description || 'Premium quality crafted with attention to detail'}
        </p>

        <div className="flex items-center gap-2 pt-1">
          <span className="price text-lg">{formatPrice(product.priceAfterDiscount ?? product.price ?? 0)}</span>
          {hasDiscount && <span className="price-original">{formatPrice(product.price ?? 0)}</span>}
        </div>
      </div>
    </article>
  );
};

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

const Catalog = () => {
  const { category: categoryParam } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: categories = [] } = useCategories();
  const { addItem } = useCartMutations();
  const requireAuth = useRequireAuth();
  
  const selectedCategory = categoryParam || 'all';
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [toast, setToast] = useState<string | null>(null);

  const handleCategoryChange = (slug: string) => {
    if (slug === 'all') {
      navigate('/catalog');
    } else {
      navigate(`/catalog/${slug}`);
    }
  };

  const filtered = useMemo(() => {
    let result = products;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category?.slug === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }
    
    // Sort
    switch (sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'popular':
        result = [...result].sort((a, b) => (b.ratingsAverage || 0) - (a.ratingsAverage || 0));
        break;
      default:
        break;
    }
    
    return result;
  }, [products, selectedCategory, sortBy, searchQuery]);

  const handleAddToCart = (productId: string) => {
    if (!requireAuth()) return;
    addItem.mutate(
      { productId, quantity: 1 },
      { onSuccess: () => setToast('Added to cart') }
    );
  };

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  return (
    <div className="min-h-screen bg-accent-cream dark:bg-[#0f0f0f]">
      {/* Page Header */}
      <section className="bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800">
        <div className="container-wide py-12 md:py-16">
          <div className="text-center">
            <span className="section-subtitle">Our Collection</span>
            <h1 className="section-title mt-2">Shop All Products</h1>
            <p className="text-stone-500 dark:text-stone-400 mt-4 max-w-2xl mx-auto">
              Discover our curated selection of premium clothing and accessories, 
              designed for the modern individual who values quality and style.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="sticky top-16 lg:top-20 z-30 bg-white/95 dark:bg-stone-950/95 backdrop-blur-lg border-b border-stone-200 dark:border-stone-800">
        <div className="container-wide py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 input"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                <Search className="w-5 h-5" />
              </div>
            </div>

            {/* Desktop Category Pills */}
            <div className="hidden lg:flex items-center gap-2 flex-nowrap">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-accent-charcoal text-white dark:bg-accent-cream dark:text-accent-charcoal'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-white/10 dark:text-stone-300 dark:hover:bg-white/20'
                }`}
                onClick={() => handleCategoryChange('all')}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.slug
                      ? 'bg-accent-charcoal text-white dark:bg-accent-cream dark:text-accent-charcoal'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-white/10 dark:text-stone-300 dark:hover:bg-white/20'
                  }`}
                  onClick={() => handleCategoryChange(cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden btn-ghost flex items-center gap-2"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </button>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input py-2.5 px-4 pr-10 bg-transparent cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center border border-stone-200 dark:border-stone-700 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-colors rounded-lg ${
                    viewMode === 'grid' 
                      ? 'bg-accent-charcoal text-white dark:bg-accent-cream dark:text-accent-charcoal' 
                      : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-white/10'
                  }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-colors rounded-lg ${
                    viewMode === 'list' 
                      ? 'bg-accent-charcoal text-white dark:bg-accent-cream dark:text-accent-charcoal' 
                      : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-white/10'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div className="lg:hidden mt-4 pt-4 border-t border-stone-200 dark:border-stone-800">
              <p className="text-sm font-medium mb-3">Categories</p>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1.5 rounded-full text-sm ${
                    selectedCategory === 'all'
                      ? 'bg-accent-charcoal text-white dark:bg-accent-cream dark:text-accent-charcoal'
                      : 'bg-stone-100 text-stone-600 dark:bg-white/10 dark:text-stone-300'
                  }`}
                  onClick={() => handleCategoryChange('all')}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      selectedCategory === cat.slug
                        ? 'bg-accent-charcoal text-white dark:bg-accent-cream dark:text-accent-charcoal'
                        : 'bg-stone-100 text-stone-600 dark:bg-white/10 dark:text-stone-300'
                    }`}
                    onClick={() => handleCategoryChange(cat.slug)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="section">
        <div className="container-wide">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-stone-500">
              Showing <span className="font-medium text-accent-charcoal dark:text-accent-cream">{filtered.length}</span> products
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => handleCategoryChange('all')}
                className="flex items-center gap-1 text-sm text-accent-gold hover:underline"
              >
                Clear filter <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {loadingProducts ? (
            <div className={`grid gap-4 lg:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
              {Array.from({ length: 12 }).map((_, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="skeleton aspect-product rounded-2xl" />
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-stone-100 dark:bg-white/10 flex items-center justify-center">
                <Search className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-stone-500 dark:text-stone-400 mb-6">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <button
                onClick={() => {
                  handleCategoryChange('all');
                  setSearchQuery('');
                }}
                className="btn-primary"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className={`grid gap-4 lg:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 max-w-3xl'}`}>
              {filtered.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAdd={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      {toast && (
        <div className="toast toast-success">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};

export default Catalog;
