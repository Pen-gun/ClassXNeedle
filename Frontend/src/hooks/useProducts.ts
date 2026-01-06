import { useQuery } from '@tanstack/react-query';
import { fetchFeaturedProducts } from '../lib/api';

export const useFeaturedProducts = () =>
  useQuery({
    queryKey: ['featured-products'],
    queryFn: fetchFeaturedProducts
  });
