import { lazy, Suspense, useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Layout from './components/Layout';
import './App.css';

const HomePage = lazy(() => import('./pages/Home'));
const CatalogPage = lazy(() => import('./pages/Catalog'));
const AuthPage = lazy(() => import('./pages/Auth'));
const CartPage = lazy(() => import('./pages/Cart'));
const OrdersPage = lazy(() => import('./pages/Orders'));

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
      path: '/',
      element: <Layout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<div className="page-loading">Loading…</div>}>
              <HomePage />
            </Suspense>
          )
        },
        {
          path: '/catalog',
          element: (
            <Suspense fallback={<div className="page-loading">Loading catalog…</div>}>
              <CatalogPage />
            </Suspense>
          )
        },
        {
          path: '/auth',
          element: (
            <Suspense fallback={<div className="page-loading">Loading auth…</div>}>
              <AuthPage />
            </Suspense>
          )
        },
        {
          path: '/cart',
          element: (
            <Suspense fallback={<div className="page-loading">Loading cart…</div>}>
              <CartPage />
            </Suspense>
          )
        },
        {
          path: '/orders',
          element: (
            <Suspense fallback={<div className="page-loading">Loading orders…</div>}>
              <OrdersPage />
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
