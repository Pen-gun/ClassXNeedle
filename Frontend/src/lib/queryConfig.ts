/**
 * TanStack Query Optimized Configuration
 * Centralized query settings for optimal caching and performance
 */

import { QueryClient } from '@tanstack/react-query';

// ===========================================
// OPTIMIZED QUERY CLIENT
// ===========================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh (5 minutes default)
      staleTime: 1000 * 60 * 5,
      
      // Cache time - how long inactive data stays in cache (30 minutes)
      gcTime: 1000 * 60 * 30,
      
      // Retry failed requests with exponential backoff
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors (client errors)
        const errorObj = error as { status?: number };
        if (errorObj?.status && errorObj.status >= 400 && errorObj.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch settings
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      
      // Network mode - 'online' only fetches when online
      networkMode: 'online',
    },
    mutations: {
      retry: false,
      networkMode: 'online',
    },
  },
});

// ===========================================
// QUERY KEY FACTORY
// ===========================================

export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },

  // Products
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    search: (query: string) =>
      [...queryKeys.products.all, 'search', query] as const,
  },

  // Categories
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: () => [...queryKeys.categories.lists()] as const,
    detail: (id: string) =>
      [...queryKeys.categories.all, 'detail', id] as const,
    subCategories: (categoryId: string) =>
      [...queryKeys.categories.all, categoryId, 'subCategories'] as const,
  },

  // Cart
  cart: {
    all: ['cart'] as const,
    items: () => [...queryKeys.cart.all, 'items'] as const,
    summary: () => [...queryKeys.cart.all, 'summary'] as const,
  },

  // Orders
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.orders.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.orders.all, 'detail', id] as const,
  },

  // Reviews
  reviews: {
    all: ['reviews'] as const,
    byProduct: (productId: string) =>
      [...queryKeys.reviews.all, 'product', productId] as const,
    byUser: () => [...queryKeys.reviews.all, 'user'] as const,
  },

  // Brands
  brands: {
    all: ['brands'] as const,
    list: () => [...queryKeys.brands.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.brands.all, 'detail', id] as const,
  },

  // Coupons
  coupons: {
    all: ['coupons'] as const,
    validate: (code: string) =>
      [...queryKeys.coupons.all, 'validate', code] as const,
  },
} as const;

// ===========================================
// PREFETCH UTILITIES
// ===========================================

/**
 * Prefetch product details for hover preview
 */
export const prefetchProduct = async (productId: string, fetchFn: () => Promise<unknown>) => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.products.detail(productId),
    queryFn: fetchFn,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Invalidate all product queries (useful after mutations)
 */
export const invalidateProducts = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
};

/**
 * Invalidate cart queries
 */
export const invalidateCart = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
};

/**
 * Invalidate order queries
 */
export const invalidateOrders = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
};

// ===========================================
// OPTIMISTIC UPDATE HELPERS
// ===========================================

/**
 * Helper for optimistic cart updates
 */
export const optimisticCartUpdate = <T>(  updateFn: (oldData: T | undefined) => T
) => ({  onMutate: async () => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: queryKeys.cart.all });

    // Snapshot previous value
    const previousCart = queryClient.getQueryData(queryKeys.cart.items());

    // Optimistically update
    queryClient.setQueryData(queryKeys.cart.items(), (old: T | undefined) =>
      updateFn(old)
    );

    return { previousCart };
  },
  onError: (_err: unknown, _newData: unknown, context: { previousCart?: T } | undefined) => {
    // Rollback on error
    if (context?.previousCart) {
      queryClient.setQueryData(queryKeys.cart.items(), context.previousCart);
    }
  },
  onSettled: () => {
    // Refetch after mutation
    queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
  },
});

// ===========================================
// CACHE MANAGEMENT
// ===========================================

/**
 * Clear all cache (useful for logout)
 */
export const clearAllCache = () => {
  queryClient.clear();
};

/**
 * Clear user-specific cache (keep public data like products)
 */
export const clearUserCache = () => {
  queryClient.removeQueries({ queryKey: queryKeys.auth.all });
  queryClient.removeQueries({ queryKey: queryKeys.cart.all });
  queryClient.removeQueries({ queryKey: queryKeys.orders.all });
  queryClient.removeQueries({ queryKey: queryKeys.reviews.byUser() });
};

/**
 * Get cache size (for debugging)
 */
export const getCacheSize = () => {
  const cache = queryClient.getQueryCache().getAll();
  return {
    totalQueries: cache.length,
    staleQueries: cache.filter((q) => q.isStale()).length,
    activeQueries: cache.filter((q) => q.state.status === 'pending').length,
  };
};

export default queryClient;
