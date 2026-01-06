import './App.css';

type Product = {
  name: string;
  price: number;
  tag?: string;
  accent: string;
  image: string;
};

type Drop = {
  title: string;
  description: string;
  badge: string;
  cta: string;
  accent: string;
};

const featuredProducts: Product[] = [
  { name: 'Carbon Stitch Bomber', price: 180, tag: 'New Drop', accent: 'linear-gradient(135deg, #ff8bd1, #6b5dff)', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80' },
  { name: 'Nocturne Cargo Set', price: 140, tag: 'Bestseller', accent: 'linear-gradient(135deg, #8cf0ff, #6b9bff)', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80' },
  { name: 'Signal Tech Hoodie', price: 125, accent: 'linear-gradient(135deg, #f6d365, #fda085)', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80' },
  { name: 'Chromatic Knit', price: 110, tag: 'Limited', accent: 'linear-gradient(135deg, #9eff8c, #59d2d2)', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80' }
];

const collectionDrops: Drop[] = [
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

function App() {
  return (
    <div className="page">
      <header className="nav">
        <div className="logo-mark">ClassXNeedle</div>
        <nav>
          <a href="#collections">Collections</a>
          <a href="#products">Featured</a>
          <a href="#services">Services</a>
          <a href="#cta">Join</a>
        </nav>
        <div className="nav-actions">
          <button className="ghost">Login</button>
          <button className="solid">Start Session</button>
        </div>
      </header>

      <main>
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
            <button className="ghost">View all products</button>
          </div>

          <div className="product-grid">
            {featuredProducts.map((product) => (
              <article className="product-card" key={product.name}>
                <div className="product-media" style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.4)), url(${product.image})` }}>
                  <div className="product-accent" style={{ backgroundImage: product.accent }} />
                  {product.tag && <span className="pill">{product.tag}</span>}
                </div>
                <div className="product-info">
                  <div>
                    <h3>{product.name}</h3>
                    <p>Air mesh lining · Hidden zip · Secure pocketing</p>
                  </div>
                  <div className="price-row">
                    <span className="price">${product.price}</span>
                    <button className="text-button">Add to cart →</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="cta" id="cta">
          <div>
            <p className="eyebrow">Early access</p>
            <h2>Get first dibs on limited runs and collabs.</h2>
            <p className="lede">Drop alerts, fit guides, and behind-the-scenes from the ClassXNeedle studio.</p>
          </div>
          <form className="cta-form">
            <input type="email" placeholder="you@crew.dev" />
            <button type="submit" className="solid">Join the list</button>
          </form>
        </section>
      </main>

      <footer className="footer">
        <div>Built with a REST+GraphQL backend. Secure auth, carts, orders, and reviews ready to ship.</div>
        <div className="footer-links">
          <a href="#">Support</a>
          <a href="#">Shipping</a>
          <a href="#">Privacy</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
