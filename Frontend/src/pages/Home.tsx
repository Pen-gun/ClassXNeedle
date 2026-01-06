import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, ShieldCheck, Sparkles, Heart, ShoppingBag } from 'lucide-react';
import { useFeaturedProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCartMutations } from '../hooks/useCart';
import { useRequireAuth } from '../hooks/useAuth';
import type { Product, Category } from '../types';

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
          <Icons.Heart />
        </button>

        <button
          onClick={() => onAdd(product._id)}
          className="quick-add-btn btn-primary text-sm py-2.5 px-5 flex items-center gap-2"
        >
          <Icons.Cart />
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
              <Icons.Star />
              <span className="text-sm text-stone-500">{product.ratingsAverage.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2">
          {product.description || 'Premium quality crafted with attention to detail'}
        </p>

        <div className="flex items-center gap-2 pt-1">
          <span className="price text-lg">${product.priceAfterDiscount ?? product.price ?? 0}</span>
          {hasDiscount && <span className="price-original">${product.price}</span>}
        </div>
      </div>
    </article>
  );
};

// Category Card Component
const CategoryCard = ({ category }: { category: Category }) => (
  <Link to={`/catalog/${category.slug}`} className="group relative aspect-[4/5] overflow-hidden rounded-2xl">
    <img
      src={category.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600'}
      alt={category.name}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      loading="lazy"
    />
    <div className="category-overlay absolute inset-0" />
    <div className="absolute inset-0 flex flex-col justify-end p-6">
      <span className="text-white/70 text-sm uppercase tracking-wider mb-1">Explore</span>
      <h3 className="text-white text-xl font-display font-semibold">{category.name}</h3>
      <div className="mt-3 flex items-center gap-2 text-white text-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        Shop Now <Icons.ArrowRight />
      </div>
    </div>
  </Link>
);

// Features data
const features = [
  { icon: <Icons.Truck />, title: 'Free Shipping', description: 'On orders over $150' },
  { icon: <Icons.Shield />, title: 'Secure Payment', description: '100% secure checkout' },
  { icon: <Icons.Sparkles />, title: 'Premium Quality', description: 'Finest materials' },
  { icon: <Icons.Heart />, title: 'Easy Returns', description: '30-day returns' },
];

const Home = () => {
  const { data: products = [], isLoading: loadingProducts } = useFeaturedProducts();
  const { data: categories = [] } = useCategories();
  const { addItem } = useCartMutations();
  const requireAuth = useRequireAuth();

  const handleAddToCart = (productId: string) => {
    if (!requireAuth()) return;
    addItem.mutate({ productId, quantity: 1 });
  };

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center gradient-hero overflow-hidden">
        <div className="gradient-hero-overlay absolute inset-0" />
        
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent-gold/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="container-wide relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8 text-white animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
                <span className="text-sm tracking-wider uppercase">New Collection 2026</span>
              </div>
              
              <h1 className="font-display text-display-lg lg:text-display-xl text-balance">
                Elegance
                <span className="block text-accent-gold">Redefined</span>
              </h1>
              
              <p className="text-lg text-stone-300 max-w-lg leading-relaxed">
                Discover our curated collection of premium clothing where timeless design meets contemporary sophistication.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/catalog" className="btn-gold text-base px-8 py-4 btn-shine">
                  Shop Collection
                </Link>
                <button className="btn border-2 border-white/30 text-white px-8 py-4 hover:bg-white/10 transition-all">
                  Our Story
                </button>
              </div>

              <div className="flex flex-wrap gap-8 pt-4">
                <div>
                  <p className="text-3xl font-display font-semibold text-accent-gold">15K+</p>
                  <p className="text-sm text-stone-400">Happy Customers</p>
                </div>
                <div>
                  <p className="text-3xl font-display font-semibold text-accent-gold">500+</p>
                  <p className="text-sm text-stone-400">Premium Products</p>
                </div>
                <div>
                  <p className="text-3xl font-display font-semibold text-accent-gold">4.9</p>
                  <p className="text-sm text-stone-400">Customer Rating</p>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-elegant-xl">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
                  alt="Featured Collection"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 glass-dark rounded-2xl p-5">
                  <p className="text-accent-gold text-xs uppercase tracking-widest mb-1">Featured</p>
                  <h3 className="text-white font-display text-xl font-semibold">
                    {products[0]?.name || 'Signature Collection'}
                  </h3>
                  <p className="text-stone-300 text-sm mt-1 line-clamp-2">
                    {products[0]?.description || 'Premium craftsmanship meets modern design'}
                  </p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-full h-full border-2 border-accent-gold/30 rounded-3xl -z-10" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white dark:bg-stone-900 border-y border-stone-200 dark:border-stone-800">
        <div className="container-wide py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-gold/10 flex items-center justify-center text-accent-gold shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{feature.title}</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section bg-accent-cream dark:bg-[#0f0f0f]">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="section-subtitle">Curated Collections</span>
              <h2 className="section-title mt-2">Shop by Category</h2>
            </div>
            <Link to="/catalog" className="btn-ghost flex items-center gap-2 text-sm">
              View All Categories <Icons.ArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 stagger-children">
            {categories.slice(0, 4).map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section bg-white dark:bg-stone-950">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="section-subtitle">Best Sellers</span>
              <h2 className="section-title mt-2">Featured Products</h2>
            </div>
            <Link to="/catalog" className="btn-ghost flex items-center gap-2 text-sm">
              View All Products <Icons.ArrowRight />
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="skeleton aspect-product rounded-2xl" />
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} onAdd={handleAddToCart} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lookbook Section */}
      <section className="section bg-accent-cream dark:bg-[#0f0f0f]">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative aspect-[4/5] md:aspect-auto md:row-span-2 rounded-3xl overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000"
                alt="New Season"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="image-overlay" />
              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                <span className="text-accent-gold text-sm uppercase tracking-widest mb-2">New Season</span>
                <h3 className="text-white font-display text-3xl md:text-4xl font-semibold mb-4">
                  Spring/Summer<br />Collection
                </h3>
                <Link to="/catalog" className="btn-gold w-fit">Discover Now</Link>
              </div>
            </div>

            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"
                alt="Essentials"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="image-overlay" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <span className="text-white/70 text-sm uppercase tracking-wider mb-1">Essential</span>
                <h3 className="text-white font-display text-2xl font-semibold">Everyday Basics</h3>
                <Link to="/catalog" className="mt-3 text-white flex items-center gap-2 text-sm hover:text-accent-gold transition-colors">
                  Shop Now <Icons.ArrowRight />
                </Link>
              </div>
            </div>

            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800"
                alt="Limited Edition"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="image-overlay" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <span className="text-accent-gold text-sm uppercase tracking-wider mb-1">Limited Edition</span>
                <h3 className="text-white font-display text-2xl font-semibold">Exclusive Pieces</h3>
                <Link to="/catalog" className="mt-3 text-white flex items-center gap-2 text-sm hover:text-accent-gold transition-colors">
                  Shop Now <Icons.ArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="section bg-white dark:bg-stone-950">
        <div className="container-narrow text-center">
          <span className="section-subtitle">Our Philosophy</span>
          <h2 className="section-title mt-2 mb-6">Crafted with Passion</h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl mx-auto">
            At ClassXNeedle, we believe that great style is timeless. Every piece in our collection 
            is thoughtfully designed and crafted with premium materials to ensure you look and feel exceptional.
          </p>
          <div className="divider max-w-xs mx-auto my-10">
            <span className="text-accent-gold">✦</span>
          </div>
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto">
            <div>
              <p className="text-4xl font-display font-semibold text-accent-gold">10+</p>
              <p className="text-sm text-stone-500 mt-1">Years Experience</p>
            </div>
            <div>
              <p className="text-4xl font-display font-semibold text-accent-gold">100%</p>
              <p className="text-sm text-stone-500 mt-1">Authentic Quality</p>
            </div>
            <div>
              <p className="text-4xl font-display font-semibold text-accent-gold">50+</p>
              <p className="text-sm text-stone-500 mt-1">Countries Shipped</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
