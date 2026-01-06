import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders, useOrderMutations } from '../hooks/useOrders';
import type { Order } from '../types';

// Icons
const Icons = {
  Package: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  Truck: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  ),
};

type StatusConfig = {
  color: string;
  icon: () => React.ReactElement;
  label: string;
};

const statusConfig: Record<string, StatusConfig> = {
  'Pending': { color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300', icon: Icons.Clock, label: 'Pending' },
  'Processing': { color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300', icon: Icons.Package, label: 'Processing' },
  'Shipped': { color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300', icon: Icons.Truck, label: 'Shipped' },
  'Delivered': { color: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300', icon: Icons.Check, label: 'Delivered' },
  'Cancelled': { color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300', icon: Icons.X, label: 'Cancelled' },
};

const OrderCard = ({ order, onCancel }: { order: Order; onCancel: () => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = statusConfig[order.status] || statusConfig['Pending'];
  const StatusIcon = status.icon;

  return (
    <article className="card overflow-hidden">
      {/* Order Header */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-semibold text-accent-charcoal dark:text-accent-cream">
                Order #{order._id.slice(-8).toUpperCase()}
              </h3>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                <StatusIcon />
                {status.label}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                order.isPaid 
                  ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' 
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
              }`}>
                {order.isPaid ? 'Paid' : 'Unpaid'}
              </span>
            </div>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-stone-500 dark:text-stone-400">Total</p>
              <p className="text-lg font-semibold text-accent-charcoal dark:text-accent-cream">
                ${order.orderPrice.toFixed(2)}
              </p>
            </div>
            {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
                className="px-3 py-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Quick Summary */}
        <div className="mt-4 flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1.5">
            <Icons.Package />
            {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Expand Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex items-center gap-2 text-sm text-accent-gold hover:underline"
        >
          {isExpanded ? 'Hide details' : 'View details'}
          <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <Icons.ChevronDown />
          </span>
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-white/5">
          <div className="p-4 sm:p-6 space-y-4">
            {/* Order Items */}
            <div>
              <h4 className="text-sm font-medium mb-3">Order Items</h4>
              <div className="space-y-3">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-white dark:bg-stone-900 rounded-xl p-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-100 dark:bg-white/5 shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200"
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-accent-charcoal dark:text-accent-cream truncate">
                        Product #{typeof item.productId === 'string' ? item.productId.slice(-6) : item.productId}
                      </h5>
                      <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-700">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-stone-500 dark:text-stone-400">Subtotal</span>
                <span>${order.orderPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-stone-500 dark:text-stone-400">Shipping</span>
                <span className="text-green-600 dark:text-green-400">Free</span>
              </div>
              <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-stone-200 dark:border-stone-700">
                <span>Total</span>
                <span>${order.orderPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

const Orders = () => {
  const { data: orders = [], isLoading } = useOrders();
  const { cancel } = useOrderMutations();
  const [filter, setFilter] = useState<string>('all');

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter.toLowerCase();
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent-cream dark:bg-[#0f0f0f]">
        <div className="container-wide py-12">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-40 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-cream dark:bg-[#0f0f0f]">
      {/* Page Header */}
      <section className="bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800">
        <div className="container-wide py-10 md:py-12">
          <span className="section-subtitle">Account</span>
          <h1 className="section-title mt-2">My Orders</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2">
            Track and manage your orders
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-wide">
          {orders.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center text-stone-300 dark:text-stone-600">
                <Icons.ShoppingBag />
              </div>
              <h2 className="text-2xl font-semibold mb-3">No orders yet</h2>
              <p className="text-stone-500 dark:text-stone-400 mb-8">
                You haven't placed any orders yet. Start shopping to see your orders here!
              </p>
              <Link to="/catalog" className="btn-primary">
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      filter === status
                        ? 'bg-accent-charcoal text-white dark:bg-accent-cream dark:text-accent-charcoal'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-white/10 dark:text-stone-300 dark:hover:bg-white/20'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              {/* Orders Count */}
              <p className="text-sm text-stone-500 mb-4">
                Showing <span className="font-medium text-accent-charcoal dark:text-accent-cream">{filteredOrders.length}</span> orders
              </p>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-stone-500 dark:text-stone-400">
                    No orders found with status "{filter}"
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      onCancel={() => cancel.mutate(order._id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Orders;
