import { useMemo, useState } from 'react';
import {
  BadgePercent,
  Boxes,
  ClipboardList,
  Layers,
  LayoutDashboard,
  Package,
  ShieldCheck,
  Star,
  Tags,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthMutations, useMe } from '../../hooks/useAuth';
import OverviewSection from './sections/OverviewSection';
import ProductsSection from './sections/ProductsSection';
import CategoriesSection from './sections/CategoriesSection';
import SubCategoriesSection from './sections/SubCategoriesSection';
import BrandsSection from './sections/BrandsSection';
import CouponsSection from './sections/CouponsSection';
import OrdersSection from './sections/OrdersSection';
import UsersSection from './sections/UsersSection';
import ReviewsSection from './sections/ReviewsSection';

type SectionId =
  | 'overview'
  | 'products'
  | 'categories'
  | 'subcategories'
  | 'brands'
  | 'coupons'
  | 'orders'
  | 'users'
  | 'reviews';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const { data: me } = useMe();
  const { logoutMutation } = useAuthMutations();

  const sections = useMemo(
    () => [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'products', label: 'Products', icon: Package },
      { id: 'categories', label: 'Categories', icon: Tags },
      { id: 'subcategories', label: 'Subcategories', icon: Layers },
      { id: 'brands', label: 'Brands', icon: ShieldCheck },
      { id: 'coupons', label: 'Coupons', icon: BadgePercent },
      { id: 'orders', label: 'Orders', icon: ClipboardList },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'reviews', label: 'Reviews', icon: Star }
    ],
    []
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="w-full max-w-[260px] border-r border-white/10 bg-slate-900/70 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent-gold/20 text-accent-gold flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-stone-400">Admin</p>
              <p className="text-lg font-display">ClassXNeedle</p>
            </div>
          </div>

          <div className="mt-10 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  activeSection === section.id
                    ? 'bg-white/10 text-white'
                    : 'text-stone-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-8">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
              <p className="text-stone-400">Signed in as</p>
              <p className="font-medium">{me?.fullName || me?.username}</p>
              <button
                onClick={() => logoutMutation.mutate()}
                className="mt-4 w-full rounded-lg border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-stone-300 hover:bg-white/10"
              >
                Sign out
              </button>
              <Link to="/" className="mt-3 block text-center text-xs text-stone-400 hover:text-white">
                Return to storefront
              </Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8">
          {activeSection === 'overview' && <OverviewSection />}
          {activeSection === 'products' && <ProductsSection />}
          {activeSection === 'categories' && <CategoriesSection />}
          {activeSection === 'subcategories' && <SubCategoriesSection />}
          {activeSection === 'brands' && <BrandsSection />}
          {activeSection === 'coupons' && <CouponsSection />}
          {activeSection === 'orders' && <OrdersSection />}
          {activeSection === 'users' && <UsersSection />}
          {activeSection === 'reviews' && <ReviewsSection />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
