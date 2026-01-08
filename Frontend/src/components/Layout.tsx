import { Link, Outlet } from 'react-router-dom';
import { useMe } from '../hooks/useAuth';
import Header from './Header';
import Footer from './Footer';

type HeaderProps = {
  scrolled: boolean;
  navLinks: NavItem[];
  cartItemCount: number;
  me: User | null | undefined;
  userMenuOpen: boolean;
  onOpenMenu: () => void;
  onToggleUserMenu: () => void;
  onCloseUserMenu: () => void;
  onLogout: () => void;
  theme: Theme;
  setTheme: (value: Theme) => void;
};

type MobileMenuProps = {
  open: boolean;
  navLinks: NavItem[];
  me: User | null | undefined;
  onClose: () => void;
  onLogout: () => void;
};

const Layout = () => {
  const { data: me } = useMe();

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
      {me && <AdminButton />}
    </div>
  );
};

const AnnouncementBar = () => (
  <div className="bg-accent-charcoal dark:bg-stone-900 text-white py-2.5 overflow-hidden">
    <div className="animate-marquee whitespace-nowrap flex">
      <span className="mx-8 text-xs tracking-widest uppercase">
        ?? Free Shipping on Orders Over Rs. 150 ?? New Season Collection Available ?? Complimentary Gift Wrapping ?? Free Shipping on Orders Over Rs. 150 ?? New Season Collection Available ?? Complimentary Gift Wrapping ??
      </span>
      <span className="mx-8 text-xs tracking-widest uppercase">
        ?? Free Shipping on Orders Over Rs. 150 ?? New Season Collection Available ?? Complimentary Gift Wrapping ?? Free Shipping on Orders Over Rs. 150 ?? New Season Collection Available ?? Complimentary Gift Wrapping ??
      </span>
    </div>
  </div>
);

const AdminButton = () => (
  <Link
    to="/admin"
    className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-accent-gold px-5 py-3 text-sm font-semibold text-black shadow-[0_20px_40px_rgba(201,169,98,0.35)] transition hover:-translate-y-0.5 hover:bg-amber-400"
  >
    Admin Console
  </Link>
);

export default Layout;
