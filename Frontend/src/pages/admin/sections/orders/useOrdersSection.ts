import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminCancelOrder, adminGetOrders, adminMarkOrderPaid, adminUpdateOrderStatus } from '../../../../lib/api';
import type { AdminOrder } from '../../../../types';

const useOrdersSection = () => {
  const qc = useQueryClient();
  const { data: ordersData } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () => adminGetOrders({ page: 1, limit: 100 })
  });

  const orders = (ordersData?.orders ?? []) as AdminOrder[];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminUpdateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
  });
  const markPaidMutation = useMutation({
    mutationFn: adminMarkOrderPaid,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
  });
  const cancelMutation = useMutation({
    mutationFn: adminCancelOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
  });

  return {
    orders,
    updateStatus: (id: string, status: string) => updateStatusMutation.mutate({ id, status }),
    markPaid: (id: string) => markPaidMutation.mutate(id),
    cancel: (id: string) => cancelMutation.mutate(id)
  };
};

export default useOrdersSection;
