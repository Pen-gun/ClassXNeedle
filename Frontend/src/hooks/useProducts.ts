import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchFeaturedProducts, fetchProducts } from '../lib/api';
import type { Pagination, Product } from '../types';

export const useFeaturedProducts = () =>
  useQuery({
    queryKey: ['featured-products'],
    queryFn: fetchFeaturedProducts
  });

export const useProducts = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: string;
}) =>
  useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    select: (data): { products: Product[]; pagination: Pagination } => data
  });

export const useInfiniteProducts = (params?: {
  limit?: number;
  search?: string;
  category?: string;
  sort?: string;
}) =>
  useInfiniteQuery({
    queryKey: ['products', 'infinite', params],
    queryFn: ({ pageParam }) =>
      fetchProducts({
        ...params,
        page: pageParam as number
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const current = lastPage.pagination.currentPage;
      const total = lastPage.pagination.totalPages;
      return current < total ? current + 1 : undefined;
    }
  });
