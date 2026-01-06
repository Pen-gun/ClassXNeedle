import { useFeaturedProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import type { Product } from '../types';

const collectionDrops = [
  {
    title: 'Studio/REPL Capsule',
    description: 'Tech-inspired silhouettes with reflective piping and modular pockets.',
    badge: 'Reactive fabrics',
    cta: 'Explore the capsule',
    accent: 'repl-card'
  },
  {
    title: 'GraphQL Read-Only Lane',
    description: 'Browse products, carts, and orders with a single query.',
    badge: 'Instant preview',
    cta: 'Inspect schema',
    accent: 'glow-card'
  }
];

const ProductCard = ({ product }: { product: Product }) => (
  <article className="product-card" key={product._id}>
    <div
      className="product-media"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.4)), url(${product.coverImage})`
      }}
    >
      <div className="product-accent" />
      {product.category?.name && <span className="pill">{product.category.name}</span>}
    </div>
    <div className="product-info">
      <div>
        <h3>{product.name}</h3>
        <p>{product.description || 'Engineered staples built to move with you.'}</p>
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
);

const Home = () => {
  const { data: products = [], isLoading: loadingProducts } = useFeaturedProducts();
  const { data: categories = [], isLoading: loadingCategories } = useCategories();

  return (
    <>
      <section className="hero" id="collections">
        <div className="hero-copy">
          <p className="eyebrow">Techwear for kinetic people</p>
          <h1>Build your look like a Repl — fast, modular, expressive.</h1>
          <p className="lede">
            Layerable silhouettes, breathable performance fabrics, and bold gradients. Designed for teams that ship,
            remix, and move.
          </p>
          <div className="hero-actions">
            <button className="solid">Shop the drop</button>
            <button className="ghost">View lookbook</button>
          </div>
          <div className="metrics">
            <div>
              <span className="metric-number">24h</span>
              <span className="metric-label">dispatch window</span>
            </div>
            <div>
              <span className="metric-number">4.9</span>
              <span className="metric-label">community rating</span>
            </div>
            <div>
              <span className="metric-number">15k</span>
              <span className="metric-label">orders shipped</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="orb" />
          <div className="card-stack">
            {collectionDrops.map((drop) => (
              <div key={drop.title} className={`feature-card ${drop.accent}`}>
                <div className="badge">{drop.badge}</div>
                <h3>{drop.title}</h3>
                <p>{drop.description}</p>
                <button className="text-button">{drop.cta} →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pillars" id="services">
        <div className="pillar-card">
          <div className="dot pink" />
          <h4>Fabric lab</h4>
          <p>Moisture-wicking, four-way stretch, and reflective trims tuned for nighttime city runs.</p>
        </div>
        <div className="pillar-card">
          <div className="dot teal" />
          <h4>Express ops</h4>
          <p>Same-day dispatch on core pieces. Live order tracking via REST + GraphQL.</p>
        </div>
        <div className="pillar-card">
          <div className="dot amber" />
          <h4>Care & repair</h4>
          <p>Lifetime stitch guarantee and easy returns. Keep your kit in rotation longer.</p>
        </div>
      </section>

      <section className="products" id="products">
        <div className="section-head">
          <div>
            <p className="eyebrow">Featured grid</p>
            <h2>Engineered staples that flex with your day</h2>
          </div>
          <a className="ghost" href="/catalog">View all products</a>
        </div>

        {loadingProducts ? (
          <div className="product-grid">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="product-card skeleton" />
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard product={product} key={product._id} />
            ))}
          </div>
        )}
      </section>

      <section className="cta" id="cta">
        <div>
          <p className="eyebrow">Early access</p>
          <h2>Get first dibs on limited runs and collabs.</h2>
          <p className="lede">Drop alerts, fit guides, and behind-the-scenes from the ClassXNeedle studio.</p>
          {!loadingCategories && (
            <div className="chips">
              {categories.map((cat) => (
                <span key={cat._id} className="chip">{cat.name}</span>
              ))}
            </div>
          )}
        </div>
        <form className="cta-form">
          <input type="email" placeholder="you@crew.dev" />
          <button type="submit" className="solid">Join the list</button>
        </form>
      </section>
    </>
  );
};

export default Home;
