import { useState, useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search, Instagram, Twitter, PinIcon } from 'lucide-react';
import { useMe, useAuthMutations } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../hooks/useTheme';

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
            ✦ Free Shipping on Orders Over Rs. 150 ✦ New Season Collection Available ✦ Complimentary Gift Wrapping ✦ Free Shipping on Orders Over Rs. 150 ✦ New Season Collection Available ✦ Complimentary Gift Wrapping ✦
          </span>
          <span className="mx-8 text-xs tracking-widest uppercase">
            ✦ Free Shipping on Orders Over Rs. 150 ✦ New Season Collection Available ✦ Complimentary Gift Wrapping ✦ Free Shipping on Orders Over Rs. 150 ✦ New Season Collection Available ✦ Complimentary Gift Wrapping ✦
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
              <Menu className="w-6 h-6" />
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
                <Search className="w-5 h-5" />
              </button>

              {/* Cart */}
              <Link to="/cart" className="btn-icon relative">
                <ShoppingBag className="w-5 h-5" />
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
                <X className="w-6 h-6" />
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
                  <Instagram  />
                </a>
                <a href="#" className="text-stone-400 hover:text-accent-gold transition-colors">
                  <Twitter  />
                </a>
                <a href="#" className="text-stone-400 hover:text-accent-gold transition-colors">
                  <PinIcon  />
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
