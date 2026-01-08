import { Link, Outlet } from 'react-router-dom';
import { useMe } from '../hooks/useAuth';
import Header from './Header';
import Footer from './Footer';
import { LayoutDashboard } from 'lucide-react';


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

export default Layout;
