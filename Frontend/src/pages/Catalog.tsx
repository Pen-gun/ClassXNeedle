import { useMemo, useState } from 'react';
import { useFeaturedProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import type { Product } from '../types';

const Catalog = () => {
  const { data: products = [], isLoading: loadingProducts } = useFeaturedProducts();
  const { data: categories = [] } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter((p) => p.category?.slug === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <section className="products" style={{ marginTop: 16 }}>
      <div className="section-head">
        <div>
          <p className="eyebrow">Catalog</p>
          <h2>Browse the full run of ClassXNeedle drops</h2>
        </div>
        <div className="chip-row">
          <button
            className={`chip ${selectedCategory === 'all' ? 'chip-active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`chip ${selectedCategory === cat.slug ? 'chip-active' : ''}`}
              onClick={() => setSelectedCategory(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loadingProducts ? (
        <div className="product-grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="product-card skeleton" />
          ))}
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((product: Product) => (
            <article className="product-card" key={product._id}>
              <div
                className="product-media"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.45)), url(${product.coverImage})`
                }}
              >
                {product.category?.name && <span className="pill">{product.category.name}</span>}
              </div>
              <div className="product-info">
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.description || 'Performance-first design with breathable tech fabrics.'}</p>
                </div>
                <div className="price-row">
                  <span className="price">
                    ${product.priceAfterDiscount ?? product.price ?? 0}
                    {product.priceAfterDiscount && product.price && (
                      <span className="compare">${product.price}</span>
                    )}
                  </span>
                  <button className="text-button">Add to cart →</button>
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
