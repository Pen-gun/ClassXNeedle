import { useQuery } from '@tanstack/react-query';
import { fetchProduct } from '../lib/api';

export const useProduct = (identifier?: string) =>
  useQuery({
    queryKey: ['product', identifier],
    queryFn: () => (identifier ? fetchProduct(identifier) : Promise.resolve(null)),
    enabled: !!identifier,
    retry: false
  });
