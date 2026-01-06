import { useOrders, useOrderMutations } from '../hooks/useOrders';

const Orders = () => {
  const { data: orders = [], isLoading } = useOrders();
  const { cancel } = useOrderMutations();

  if (isLoading) return <div className="mt-6 text-sm text-slate-500">Loading orders…</div>;

  if (!orders.length) return <div className="mt-6 text-sm text-slate-500">No orders yet.</div>;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">My Orders</h2>
      </div>
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order._id} className="glass rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Placed {new Date(order.createdAt).toLocaleDateString()}</p>
              <h3 className="font-semibold text-lg">Order #{order._id.slice(-6)}</h3>
              <p className="text-sm text-slate-500">
                {order.orderItems.length} items · ${order.orderPrice} · {order.status}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-sm ${
                order.isPaid ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
              }`}>
                {order.isPaid ? 'Paid' : 'Unpaid'}
              </span>
              {order.status !== 'Cancelled' && (
                <button
                  onClick={() => cancel.mutate(order._id)}
                  className="text-sm text-red-500 hover:text-red-600"
                  type="button"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Orders;
