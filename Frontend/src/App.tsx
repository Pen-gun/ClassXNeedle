import { lazy, Suspense, useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import './App.css';

const HomePage = lazy(() => import('./pages/Home'));
const CatalogPage = lazy(() => import('./pages/Catalog'));
const AuthPage = lazy(() => import('./pages/Auth'));
const AdminLoginPage = lazy(() => import('./pages/AdminLogin'));
const AdminDashboardPage = lazy(() => import('./pages/AdminPage'));
const CartPage = lazy(() => import('./pages/Cart'));
const OrdersPage = lazy(() => import('./pages/Orders'));

// Professional loading component
const PageLoader = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <div className="w-10 h-10 mx-auto mb-4 border-3 border-accent-gold border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-stone-500 dark:text-stone-400">{message}</p>
    </div>
  </div>
);

const App = () => {
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false
      }
    }
  }), []);

  const router = useMemo(() => createBrowserRouter([
    {
      path: '/admin',
      element: (
        <Suspense fallback={<PageLoader message="Loading admin access..." />}>
          <AdminLoginPage />
        </Suspense>
      )
    },
    {
      path: '/admin/dashboard',
      element: (
        <Suspense fallback={<PageLoader message="Loading admin dashboard..." />}>
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        </Suspense>
      )
    },
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<PageLoader />}>
              <HomePage />
            </Suspense>
          )
        },
        {
          path: '/catalog/:category?',
          element: (
            <Suspense fallback={<PageLoader message="Loading catalog..." />}>
              <CatalogPage />
            </Suspense>
          )
        },
        {
          path: '/auth',
          element: (
            <Suspense fallback={<PageLoader message="Loading..." />}>
              <AuthPage />
            </Suspense>
          )
        },
        {
          path: '/cart',
          element: (
            <Suspense fallback={<PageLoader message="Loading cart..." />}>
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            </Suspense>
          )
        },
        {
          path: '/orders',
          element: (
            <Suspense fallback={<PageLoader message="Loading orders..." />}>
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            </Suspense>
          )
        }
      ]
    }
  ]), []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
};

export default App;
