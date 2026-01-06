import { NavLink, Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="page">
      <header className="nav">
        <div className="logo-mark">ClassXNeedle</div>
        <nav>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/catalog">Catalog</NavLink>
          <a href="#services">Services</a>
          <a href="#cta">Join</a>
        </nav>
        <div className="nav-actions">
          <button className="ghost">Login</button>
          <button className="solid">Start Session</button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <div>REST + GraphQL backend. Secure auth, carts, orders, and reviews ready to ship.</div>
        <div className="footer-links">
          <a href="#">Support</a>
          <a href="#">Shipping</a>
          <a href="#">Privacy</a>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
