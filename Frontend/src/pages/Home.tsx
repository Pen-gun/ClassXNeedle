import { useFeaturedProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import type { Product } from '../types';

const ProductCard = ({ product }: { product: Product }) => (
  <article className="product-card" key={product._id}>
    <div
      className="product-media"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.55)), url(${product.coverImage})`
      }}
    >
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
          {product.priceAfterDiscount && product.price && <span className="compare">${product.price}</span>}
        </span>
        <button className="text-button">Add to cart →</button>
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

  const heroProduct = products[0];

  return (
    <>
      <section className="hero hero-elevated" id="collections">
        <div className="hero-copy">
          <p className="eyebrow">ClassXNeedle Atelier</p>
          <h1>Urban performance tailoring with a clean studio finish.</h1>
          <p className="lede">
            Seasonless layers, breathable tech fabrics, and premium construction inspired by luxury sport labels.
          </p>
          <div className="hero-actions">
            <button className="solid">Shop collection</button>
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
        <div className="hero-visual spotlight">
          <div className="hero-overlay" />
          <div className="hero-image" style={{
            backgroundImage: `linear-gradient(180deg, rgba(8,10,14,0.2), rgba(8,10,14,0.6)), url(${heroProduct?.coverImage || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1400&q=80'})`
          }} />
          <div className="hero-badge">
            <p className="badge">New Capsule</p>
            <h3>{heroProduct?.name || 'Carbon Stitch Bomber'}</h3>
            <p>{heroProduct?.description || 'Structured bomber with reflective seams and modular chest pocket.'}</p>
          </div>
        </div>
      </section>

      <section className="services" id="services">
        <div className="service-card">
          <div className="service-dot" />
          <div>
            <h4>Premium materials</h4>
            <p>Technical nylons, water-repellent finishes, and articulated cuts for movement.</p>
          </div>
        </div>
        <div className="service-card">
          <div className="service-dot" />
          <div>
            <h4>Express logistics</h4>
            <p>Same-day processing, tracked shipping, and live order visibility.</p>
          </div>
        </div>
        <div className="service-card">
          <div className="service-dot" />
          <div>
            <h4>Care program</h4>
            <p>Repairs and refresh for core staples to keep them in rotation longer.</p>
          </div>
        </div>
      </section>

      <section className="categories">
        <div className="section-head">
          <div>
            <p className="eyebrow">Shop by category</p>
            <h2>Curated edits for every run of your day</h2>
          </div>
        </div>
        <div className="category-grid">
          {(categories.slice(0, 4)).map((cat) => (
            <div key={cat._id} className="category-card" style={{
              backgroundImage: `linear-gradient(180deg, rgba(10,12,16,0.2), rgba(10,12,16,0.6)), url(${cat.image || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80'})`
            }}>
              <div>
                <p className="badge subtle">Featured</p>
                <h3>{cat.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="products" id="products">
        <div className="section-head">
          <div>
            <p className="eyebrow">Bestsellers</p>
            <h2>Signature pieces refined for movement</h2>
          </div>
          <a className="ghost" href="/catalog">View catalog</a>
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

      <section className="lookbook">
        {lookbook.map((entry) => (
          <div key={entry.title} className="lookbook-card" style={{
            backgroundImage: `linear-gradient(135deg, rgba(4,5,8,0.35), rgba(4,5,8,0.65)), url(${entry.image})`
          }}>
            <div>
              <p className="badge subtle">Lookbook</p>
              <h3>{entry.title}</h3>
              <p>{entry.copy}</p>
              <button className="text-button">View story →</button>
            </div>
          </div>
        ))}
      </section>

      <section className="cta" id="cta">
        <div>
          <p className="eyebrow">Early access</p>
          <h2>Get first dibs on limited runs and collabs.</h2>
          <p className="lede">Drop alerts, fit guides, and studio notes from ClassXNeedle.</p>
          <div className="chips">
            {categories.slice(0, 6).map((cat) => (
              <span key={cat._id} className="chip">{cat.name}</span>
            ))}
          </div>
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
