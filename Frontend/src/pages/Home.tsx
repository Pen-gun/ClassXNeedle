import { useFeaturedProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCartMutations } from '../hooks/useCart';
import { useRequireAuth } from '../hooks/useAuth';
import type { Product } from '../types';

const ProductCard = ({ product, onAdd }: { product: Product; onAdd: (id: string) => void }) => (
  <article
    className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
    key={product._id}
  >
    <div
      className="relative h-52 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.45)), url(${product.coverImage})`
      }}
    >
      {product.category?.name && (
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
          {product.category.name}
        </span>
      )}
    </div>
    <div className="space-y-2 p-4">
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {product.description || 'Engineered staples built to move with you.'}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold">
          ${product.priceAfterDiscount ?? product.price ?? 0}
          {product.priceAfterDiscount && product.price && (
            <span className="ml-2 text-sm font-normal text-slate-500 line-through">
              ${product.price}
            </span>
          )}
        </span>
        <button
          className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          onClick={() => onAdd(product._id)}
          type="button"
        >
          Add to cart
        </button>
      </div>
    </div>
  </article>
);

const lookbook = [
  {
    title: 'Night Run',
    copy: 'Reflective piping, breathable layers, built for late city laps.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80'
  },
  {
    title: 'Studio Shift',
    copy: 'Monochrome tailoring with modular pockets for carry.',
    image: 'https://images.unsplash.com/photo-1521572153540-5102f3aa7c59?auto=format&fit=crop&w=1400&q=80'
  }
];

const Home = () => {
  const { data: products = [], isLoading: loadingProducts } = useFeaturedProducts();
  const { data: categories = [] } = useCategories();
  const { addItem } = useCartMutations();
  const requireAuth = useRequireAuth();

  const heroProduct = products[0];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 gradient-hero shadow-card dark:border-white/10">
        <div className="grid items-center gap-6 p-8 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300">ClassXNeedle Atelier</p>
            <h1 className="text-4xl font-bold text-white lg:text-5xl">Urban performance tailoring with a clean studio finish.</h1>
            <p className="text-slate-200">
              Seasonless layers, breathable tech fabrics, and premium construction inspired by luxury sport labels.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow">
                Shop collection
              </button>
              <button className="rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white">
                View lookbook
              </button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-200">
              <div>
                <p className="text-2xl font-bold text-white">24h</p>
                <p>dispatch window</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">4.9</p>
                <p>community rating</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">15k</p>
                <p>orders shipped</p>
              </div>
            </div>
          </div>
          <div className="relative flex min-h-[360px] items-end overflow-hidden rounded-2xl border border-white/10">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(8,10,14,0.35), rgba(8,10,14,0.65)), url(${heroProduct?.coverImage || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1400&q=80'})`
              }}
            />
            <div className="relative z-10 m-4 rounded-2xl bg-black/50 p-4 text-white backdrop-blur">
              <p className="text-xs uppercase tracking-[0.25em]">New Capsule</p>
              <h3 className="text-xl font-semibold">{heroProduct?.name || 'Carbon Stitch Bomber'}</h3>
              <p className="text-sm text-slate-200">{heroProduct?.description || 'Structured bomber with reflective seams and modular chest pocket.'}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="grid gap-3 md:grid-cols-3">
        {['Premium materials', 'Express logistics', 'Care program'].map((title, idx) => (
          <div key={title} className="glass rounded-2xl p-4">
            <div className="h-10 w-10 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-semibold">
              {idx + 1}
            </div>
            <h4 className="mt-2 text-lg font-semibold">{title}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {idx === 0 && 'Technical nylons, water-repellent finishes, and articulated cuts for movement.'}
              {idx === 1 && 'Same-day processing, tracked shipping, and live order visibility.'}
              {idx === 2 && 'Repairs and refresh for core staples to keep them in rotation longer.'}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Shop by category</p>
            <h2 className="text-2xl font-semibold">Curated edits for every run of your day</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((cat) => (
            <div
              key={cat._id}
              className="relative h-44 overflow-hidden rounded-2xl border border-slate-200/80 bg-cover bg-center shadow-sm dark:border-white/10"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(10,12,16,0.2), rgba(10,12,16,0.6)), url(${cat.image || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80'})`
              }}
            >
              <div className="absolute inset-0 flex items-end p-3">
                <div className="rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white">{cat.name}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="products" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Bestsellers</p>
            <h2 className="text-2xl font-semibold">Signature pieces refined for movement</h2>
          </div>
        </div>
        {loadingProducts ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-64 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                product={product}
                key={product._id}
                onAdd={(id) => {
                  if (!requireAuth()) return;
                  addItem.mutate({ productId: id, quantity: 1 });
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {lookbook.map((entry) => (
          <div
            key={entry.title}
            className="relative min-h-[240px] overflow-hidden rounded-2xl border border-slate-200/80 bg-cover bg-center shadow-sm dark:border-white/10"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(4,5,8,0.35), rgba(4,5,8,0.65)), url(${entry.image})`
            }}
          >
            <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
              <p className="text-xs uppercase tracking-[0.25em]">Lookbook</p>
              <h3 className="text-xl font-semibold">{entry.title}</h3>
              <p className="text-sm text-slate-200">{entry.copy}</p>
              <button className="mt-2 text-sm font-semibold underline underline-offset-4">View story →</button>
            </div>
          </div>
        ))}
      </section>

      <section id="cta" className="grid gap-4 rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Early access</p>
          <h2 className="text-2xl font-semibold">Get first dibs on limited runs and collabs.</h2>
          <p className="text-slate-500 dark:text-slate-300">Drop alerts, fit guides, and studio notes from ClassXNeedle.</p>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 6).map((cat) => (
              <span key={cat._id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                {cat.name}
              </span>
            ))}
          </div>
        </div>
        <form className="flex flex-col gap-3 lg:flex-row">
          <input
            type="email"
            placeholder="you@crew.dev"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-3 text-sm dark:border-white/10 dark:bg-white/5"
          />
          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow dark:bg-white dark:text-slate-900">
            Join the list
          </button>
        </form>
      </section>
    </div>
  );
};

export default Home;
