import { NavLink, Outlet } from 'react-router-dom';
import { useMe, useAuthMutations } from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../hooks/useTheme';

const Layout = () => {
  const { data: me } = useMe();
  const { logoutMutation } = useAuthMutations();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#07080c] dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
                ClassXNeedle
              </div>
              <nav className="flex items-center gap-2 text-sm">
                <NavLink to="/" end className="rounded-full px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-white/10">Home</NavLink>
                <NavLink to="/catalog" className="rounded-full px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-white/10">Catalog</NavLink>
                <NavLink to="/cart" className="rounded-full px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-white/10">Cart</NavLink>
                <NavLink to="/orders" className="rounded-full px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-white/10">Orders</NavLink>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle value={theme} onChange={setTheme} />
              {me ? (
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-slate-900 px-3 py-1 text-sm text-white dark:bg-white dark:text-slate-900">
                    {me.fullName || me.username}
                  </div>
                  <button
                    onClick={() => logoutMutation.mutate()}
                    className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <NavLink to="/auth" className="rounded-full bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700">
                  Login / Register
                </NavLink>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>REST + GraphQL. Auth, carts, orders, coupons wired to backend.</span>
            <span>Secure cookies enabled</span>
          </div>
        </header>

        <main className="space-y-8">
          <Outlet />
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
          <div>Built for the ClassXNeedle brand experience.</div>
          <div className="flex gap-3">
            <a href="#" className="hover:text-slate-800 dark:hover:text-white">Support</a>
            <a href="#" className="hover:text-slate-800 dark:hover:text-white">Shipping</a>
            <a href="#" className="hover:text-slate-800 dark:hover:text-white">Privacy</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
