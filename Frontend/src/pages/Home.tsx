import { Link } from 'react-router-dom';
import { useFeaturedProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCartMutations } from '../hooks/useCart';
import { useRequireAuth } from '../hooks/useAuth';
import type { Product, Category } from '../types';

// Icons
const Icons = {
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
  Star: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-accent-gold">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
  ),
  Truck: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  Heart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  Cart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
};

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
  <Link to={`/catalog?category=${category.slug}`} className="group relative aspect-[4/5] overflow-hidden rounded-2xl">
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

      {/* Newsletter CTA */}
      <section className="section bg-gradient-hero text-white">
        <div className="container-narrow text-center">
          <span className="text-accent-gold text-sm uppercase tracking-widest">Stay Updated</span>
          <h2 className="font-display text-3xl md:text-4xl mt-4 mb-6">Join Our Community</h2>
          <p className="text-stone-300 mb-8 max-w-md mx-auto">
            Subscribe to get early access to new collections, exclusive offers, and style inspiration.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-stone-400 focus:outline-none focus:border-accent-gold transition-colors"
            />
            <button type="submit" className="btn-gold px-6 py-3.5 whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
