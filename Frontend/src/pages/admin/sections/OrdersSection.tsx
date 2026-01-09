import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminCancelOrder, adminGetOrders, adminMarkOrderPaid, adminUpdateOrderStatus } from '../../../lib/api';
import type { AdminOrder } from '../../../types';
import SectionShell from '../SectionShell';
import { formatCurrency } from '../utils';

const OrdersSection = () => {
  const qc = useQueryClient();
  const { data: ordersData } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () => adminGetOrders({ page: 1, limit: 100 })
  });

  const orders = ordersData?.orders ?? [];

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

  return (
    <SectionShell title="Orders" subtitle="Track and fulfill customer orders.">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-medium">Order list</h3>
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <OrderRow
              key={order._id}
              order={order}
              onStatus={(status) => updateStatusMutation.mutate({ id: order._id, status })}
              onPaid={() => markPaidMutation.mutate(order._id)}
              onCancel={() => cancelMutation.mutate(order._id)}
            />
          ))}
          {orders.length === 0 && <p className="text-stone-400">No orders found.</p>}
        </div>
      </div>
    </SectionShell>
  );
};

const OrderRow = ({
  order,
  onStatus,
  onPaid,
  onCancel
}: {
  order: AdminOrder;
  onStatus: (status: string) => void;
  onPaid: () => void;
  onCancel: () => void;
}) => {
  const [status, setStatus] = useState(order.status);

  return (
    <div className="rounded-xl bg-black/30 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Order #{order._id.slice(-6)}</p>
          <p className="text-xs text-stone-400">
            {order.customer?.fullName || order.customer?.username} - {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="text-sm">{formatCurrency(order.orderPrice)}</div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-stone-400">
        <span>Status: {order.status}</span>
        <span>Paid: {order.isPaid ? 'Yes' : 'No'}</span>
        <span>Items: {order.orderItems.length}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select
          className="input bg-white/10 text-white text-xs"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="Pending">Pending</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <button
          onClick={() => onStatus(status)}
          className="btn-secondary text-xs border-white/30 text-white/90 hover:bg-white/10 hover:text-white"
        >
          Update status
        </button>
        {!order.isPaid && (
          <button onClick={onPaid} className="btn-gold text-xs">
            Mark paid
          </button>
        )}
        {order.status !== 'Cancelled' && (
          <button onClick={onCancel} className="btn-ghost text-xs text-red-400 hover:text-red-200">
            Cancel order
          </button>
        )}
      </div>
    </div>
  );
};

export default OrdersSection;
