import { useState, useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useMe, useAuthMutations } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../hooks/useTheme';

// Icons as simple SVG components
const Icons = {
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
    </svg>
  ),
  Close: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Cart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  Instagram: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
    </svg>
  ),
  Twitter: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  Pinterest: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  ),
};

const Layout = () => {
  const { data: me } = useMe();
  const { data: cart } = useCart();
  const { logoutMutation } = useAuthMutations();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const cartItemCount = cart?.cartItem?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/catalog', label: 'Shop' },
    { to: '/orders', label: 'Orders' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Announcement Bar */}
      <div className="bg-accent-charcoal dark:bg-stone-900 text-white py-2.5 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex">
          <span className="mx-8 text-xs tracking-widest uppercase">
            ✦ Free Shipping on Orders Over $150 ✦ New Season Collection Available ✦ Complimentary Gift Wrapping ✦ Free Shipping on Orders Over $150 ✦ New Season Collection Available ✦ Complimentary Gift Wrapping ✦
          </span>
          <span className="mx-8 text-xs tracking-widest uppercase">
            ✦ Free Shipping on Orders Over $150 ✦ New Season Collection Available ✦ Complimentary Gift Wrapping ✦ Free Shipping on Orders Over $150 ✦ New Season Collection Available ✦ Complimentary Gift Wrapping ✦
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-lg shadow-elegant' 
            : 'bg-transparent'
        }`}
      >
        <div className="container-wide">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden btn-icon"
              aria-label="Open menu"
            >
              <Icons.Menu />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="relative">
                <span className="font-display text-xl lg:text-2xl font-semibold tracking-tight">
                  Class<span className="text-accent-gold">X</span>Needle
                </span>
                <span className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-accent-gold to-transparent" />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle value={theme} onChange={setTheme} />
              
              <button className="btn-icon hidden sm:flex" aria-label="Search">
                <Icons.Search />
              </button>

              {/* Cart */}
              <Link to="/cart" className="btn-icon relative">
                <Icons.Cart />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-accent-gold text-white text-xs font-semibold rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {me ? (
                <div className="relative">
                  <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="btn-icon flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center">
                      <span className="text-sm font-semibold text-accent-gold">
                        {me.fullName?.charAt(0) || me.username?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setUserMenuOpen(false)} 
                      />
                      <div className="absolute right-0 top-full mt-2 w-56 z-50 py-2 bg-white dark:bg-stone-900 rounded-xl shadow-elegant-lg border border-stone-200 dark:border-stone-800 animate-scale-in">
                        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
                          <p className="text-sm font-semibold">{me.fullName || me.username}</p>
                          <p className="text-xs text-stone-500">{me.email || 'Member'}</p>
                        </div>
                        <Link 
                          to="/orders" 
                          className="block px-4 py-2 text-sm hover:bg-stone-50 dark:hover:bg-stone-800"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          My Orders
                        </Link>
                        <button
                          onClick={() => {
                            logoutMutation.mutate();
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link to="/auth" className="btn-primary text-sm py-2 px-4 hidden sm:inline-flex">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white dark:bg-stone-900 shadow-elegant-xl animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
              <span className="font-display text-xl font-semibold">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="btn-icon">
                <Icons.Close />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => 
                    `block px-4 py-3 rounded-xl text-lg font-medium transition-colors ${
                      isActive 
                        ? 'bg-accent-gold/10 text-accent-gold' 
                        : 'hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-stone-200 dark:border-stone-800">
              {me ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-gold/10 flex items-center justify-center">
                      <span className="font-semibold text-accent-gold">
                        {me.fullName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{me.fullName}</p>
                      <p className="text-sm text-stone-500">{me.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logoutMutation.mutate();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full btn-secondary text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link 
                  to="/auth" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full btn-primary text-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-accent-charcoal dark:bg-stone-950 text-white mt-auto">
        {/* Newsletter Section */}
        <div className="border-b border-white/10">
          <div className="container-wide py-16">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <span className="section-subtitle">Stay Connected</span>
              <h3 className="font-display text-3xl md:text-4xl">Join the ClassXNeedle World</h3>
              <p className="text-stone-400">
                Subscribe for exclusive access to new collections, style guides, and member-only offers.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-stone-500 focus:outline-none focus:border-accent-gold transition-colors"
                />
                <button type="submit" className="btn-gold whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container-wide py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1 space-y-6">
              <div>
                <span className="font-display text-2xl font-semibold">
                  Class<span className="text-accent-gold">X</span>Needle
                </span>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed">
                Premium clothing crafted with precision and passion. Where timeless elegance meets modern sophistication.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-stone-400 hover:text-accent-gold transition-colors">
                  <Icons.Instagram />
                </a>
                <a href="#" className="text-stone-400 hover:text-accent-gold transition-colors">
                  <Icons.Twitter />
                </a>
                <a href="#" className="text-stone-400 hover:text-accent-gold transition-colors">
                  <Icons.Pinterest />
                </a>
              </div>
            </div>

            {/* Shop Column */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wider">Shop</h4>
              <ul className="space-y-3 text-sm text-stone-400">
                <li><Link to="/catalog" className="hover:text-accent-gold transition-colors">New Arrivals</Link></li>
                <li><Link to="/catalog" className="hover:text-accent-gold transition-colors">Bestsellers</Link></li>
                <li><Link to="/catalog" className="hover:text-accent-gold transition-colors">Collections</Link></li>
                <li><Link to="/catalog" className="hover:text-accent-gold transition-colors">Sale</Link></li>
              </ul>
            </div>

            {/* Help Column */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wider">Help</h4>
              <ul className="space-y-3 text-sm text-stone-400">
                <li><a href="#" className="hover:text-accent-gold transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-accent-gold transition-colors">Shipping Info</a></li>
                <li><a href="#" className="hover:text-accent-gold transition-colors">Returns & Exchanges</a></li>
                <li><a href="#" className="hover:text-accent-gold transition-colors">Size Guide</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3 text-sm text-stone-400">
                <li><a href="#" className="hover:text-accent-gold transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-accent-gold transition-colors">Sustainability</a></li>
                <li><a href="#" className="hover:text-accent-gold transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-accent-gold transition-colors">Press</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="container-wide py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-stone-500">
            <p>© {new Date().getFullYear()} ClassXNeedle. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

