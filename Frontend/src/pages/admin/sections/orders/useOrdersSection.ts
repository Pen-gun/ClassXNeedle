import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { adminCancelOrder, adminGetOrders, adminMarkOrderPaid, adminUpdateOrderStatus } from '../../../../lib/api';
import type { AdminOrder } from '../../../../types';

const useOrdersSection = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const limit = 20;

  const { data: ordersData } = useQuery({
    queryKey: ['admin', 'orders', { page, limit, status }],
    queryFn: () => adminGetOrders({ page, limit, status: status === 'all' ? undefined : status }),
    placeholderData: (previous) => previous
  });

  const orders = (ordersData?.orders ?? []) as AdminOrder[];
  const totalPages = ordersData?.pagination?.totalPages ?? 1;
  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const idMatch = order._id.toLowerCase().includes(term);
      const customerName = order.customer?.fullName || order.customer?.username || '';
      return idMatch || customerName.toLowerCase().includes(term);
    });
  }, [orders, search]);

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
    orders: filteredOrders,
    page,
    totalPages,
    setPage,
    status,
    setStatus,
    search,
    setSearch,
    updateStatus: (id: string, status: string) => updateStatusMutation.mutate({ id, status }),
    markPaid: (id: string) => markPaidMutation.mutate(id),
    cancel: (id: string) => cancelMutation.mutate(id)
  };
};

export default useOrdersSection;
