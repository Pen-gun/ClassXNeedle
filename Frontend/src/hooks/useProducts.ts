import { useQuery } from '@tanstack/react-query';
import { fetchFeaturedProducts, fetchProducts } from '../lib/api';

export const useFeaturedProducts = () =>
  useQuery({
    queryKey: ['featured-products'],
    queryFn: fetchFeaturedProducts
  });

export const useProducts = () =>
  useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });
