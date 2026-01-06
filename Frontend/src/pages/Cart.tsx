import { useMemo, useState } from 'react';
import { useCart, useCartMutations } from '../hooks/useCart';
import { useOrderMutations } from '../hooks/useOrders';

const Cart = () => {
  const { data: cart, isLoading } = useCart();
  const { updateItem, removeItem, clear, apply, dropCoupon } = useCartMutations();
  const { create } = useOrderMutations();
  const [coupon, setCoupon] = useState('');
  const [address, setAddress] = useState('');

  const totals = useMemo(() => {
    const subtotal = cart?.totalCartPrice || 0;
    const discounted = cart?.priceAfterDiscount ?? subtotal;
    return { subtotal, total: discounted };
  }, [cart]);

  const handleCheckout = () => {
    if (!address.trim()) return;
    create.mutate({ address });
  };

  if (isLoading) {
    return <div className="mt-6 text-sm text-slate-500">Loading cart…</div>;
  }

  if (!cart || cart.cartItem.length === 0) {
    return <div className="mt-6 text-sm text-slate-500">Your cart is empty.</div>;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your Cart</h2>
        <button
          onClick={() => clear.mutate()}
          className="text-sm text-red-500 hover:text-red-600"
          type="button"
        >
          Clear cart
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {cart.cartItem.map((item) => (
            <div key={item.productId._id} className="glass rounded-2xl p-4 flex gap-4 items-center">
              <div
                className="h-20 w-20 rounded-xl bg-cover bg-center"
                style={{ backgroundImage: `url(${item.productId.coverImage})` }}
              />
              <div className="flex-1">
                <p className="text-sm text-slate-500">{item.productId.slug}</p>
                <h3 className="font-semibold text-lg">{item.productId.name}</h3>
                <p className="text-sm text-slate-500">Unit: ${item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-2 py-1 rounded-full border border-slate-200 dark:border-white/10"
                  onClick={() => updateItem.mutate({ productId: item.productId._id, quantity: Math.max(1, item.quantity - 1) })}
                  type="button"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  className="px-2 py-1 rounded-full border border-slate-200 dark:border-white/10"
                  onClick={() => updateItem.mutate({ productId: item.productId._id, quantity: item.quantity + 1 })}
                  type="button"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeItem.mutate(item.productId._id)}
                className="text-sm text-red-500 hover:text-red-600"
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="glass rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold text-lg">Summary</h3>
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>After discount</span>
            <span>${totals.total.toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Coupon code"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
            />
            <button
              type="button"
              onClick={() => apply.mutate(coupon)}
              className="rounded-lg bg-slate-900 px-3 py-2 text-white dark:bg-white dark:text-slate-900"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => dropCoupon.mutate()}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10"
            >
              Remove
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Shipping address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
              placeholder="Street, city, country"
            />
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            className="w-full rounded-lg bg-brand-600 px-3 py-2 font-semibold text-white hover:bg-brand-700"
          >
            Place order
          </button>
        </div>
      </div>
    </section>
  );
};

export default Cart;
