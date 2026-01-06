import { useMemo, useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCartMutations } from '../hooks/useCart';
import type { Product } from '../types';

const Catalog = () => {
  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: categories = [] } = useCategories();
  const { addItem } = useCartMutations();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter((p) => p.category?.slug === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Catalog</p>
          <h2 className="text-2xl font-semibold">Browse the full run of ClassXNeedle drops</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={`rounded-full border px-3 py-1.5 text-sm ${
              selectedCategory === 'all'
                ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                : 'border-slate-200 text-slate-700 hover:border-slate-300 dark:border-white/10 dark:text-slate-200'
            }`}
            onClick={() => setSelectedCategory('all')}
            type="button"
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                selectedCategory === cat.slug
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300 dark:border-white/10 dark:text-slate-200'
              }`}
              onClick={() => setSelectedCategory(cat.slug)}
              type="button"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loadingProducts ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-64 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((product: Product) => (
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
                  {product.description || 'Performance-first design with breathable tech fabrics.'}
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
                    onClick={() => addItem.mutate({ productId: product._id, quantity: 1 })}
                    type="button"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Catalog;
