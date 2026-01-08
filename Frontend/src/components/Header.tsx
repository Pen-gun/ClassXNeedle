import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search } from 'lucide-react';
import { useAuthMutations, useMe } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from './ThemeToggle';
import { mainNav, type NavItem } from '../lib/navigation';
import type { User } from '../types';

const Header = () => {
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

  const navLinks = mainNav;
  const handleLogout = () => logoutMutation.mutate();

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-lg shadow-elegant' : 'bg-transparent'
        }`}
      >
        <div className="container-wide">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden btn-icon"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link to="/" className="flex items-center gap-2">
              <div className="relative">
                <span className="font-display text-xl lg:text-2xl font-semibold tracking-tight">
                  Class<span className="text-accent-gold">X</span>Needle
                </span>
                <span className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-accent-gold to-transparent" />
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
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

            <div className="flex items-center gap-2">
              <ThemeToggle value={theme} onChange={setTheme} />

              <button className="btn-icon hidden sm:flex" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>

              <Link to="/cart" className="btn-icon relative">
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-accent-gold text-white text-xs font-semibold rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {me ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen((prev) => !prev)} className="btn-icon flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center">
                      <span className="text-sm font-semibold text-accent-gold">
                        {me.fullName?.charAt(0) || me.username?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 z-50 py-2 bg-white dark:bg-stone-900 rounded-xl shadow-elegant-lg border border-stone-200 dark:border-stone-800 animate-scale-in">
                        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
                          <p className="text-sm font-semibold">{me.fullName || me.username}</p>
                          <p className="text-xs text-stone-500">{me.email || 'Member'}</p>
                        </div>
                        {me.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm hover:bg-stone-50 dark:hover:bg-stone-800"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                          )}
                          <Link
                            to="/orders"
                            className="block px-4 py-2 text-sm hover:bg-stone-50 dark:hover:bg-stone-800"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            My Orders
                          </Link>
                        <button
                          onClick={() => {
                            handleLogout();
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

      <MobileMenu
        open={mobileMenuOpen}
        navLinks={navLinks}
        me={me}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={handleLogout}
      />
    </>
  );
};

type MobileMenuProps = {
  open: boolean;
  navLinks: NavItem[];
  me: User | null | undefined;
  onClose: () => void;
  onLogout: () => void;
};

const MobileMenu = ({ open, navLinks, me, onClose, onLogout }: MobileMenuProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white dark:bg-stone-900 shadow-elegant-xl animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
          <span className="font-display text-xl font-semibold">Menu</span>
          <button onClick={onClose} className="btn-icon">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-lg font-medium transition-colors ${
                  isActive ? 'bg-accent-gold/10 text-accent-gold' : 'hover:bg-stone-100 dark:hover:bg-stone-800'
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
                  <span className="font-semibold text-accent-gold">{me.fullName?.charAt(0) || 'U'}</span>
                </div>
                <div>
                  <p className="font-medium">{me.fullName}</p>
                  <p className="text-sm text-stone-500">{me.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full btn-secondary text-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/auth" onClick={onClose} className="block w-full btn-primary text-center">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
