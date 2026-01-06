import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelOrderApi, createOrder, fetchOrders } from '../lib/api';

export const useOrders = () =>
  useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    retry: false
  });

export const useOrderMutations = () => {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: createOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] })
  });

  const cancel = useMutation({
    mutationFn: (orderId: string) => cancelOrderApi(orderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] })
  });

  return { create, cancel };
};
