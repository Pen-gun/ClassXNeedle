import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, Tag, ShieldCheck, Truck, RefreshCw, ShoppingBag, Lock, MapPin, X } from 'lucide-react';
import { useCart, useCartMutations } from '../hooks/useCart';
import { useOrderMutations } from '../hooks/useOrders';
import { formatPrice } from '../lib/utils';

interface CartItemType {
  productId: {
    _id: string;
    name: string;
    slug: string;
    coverImage?: string;
    category?: { name: string };
    quantity?: number;
  };
  quantity: number;
  price: number;
}

const Cart = () => {
  const { data: cart, isLoading } = useCart();
  const { updateItem, removeItem, clear, apply, dropCoupon } = useCartMutations();
  const { create } = useOrderMutations();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [address, setAddress] = useState('');
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  const items: CartItemType[] = cart?.cartItem ?? [];
  const inStockItems = items.filter(
    (item) => item.productId.quantity === undefined || item.productId.quantity > 0
  );
  const outOfStockItems = items.filter(
    (item) => item.productId.quantity !== undefined && item.productId.quantity <= 0
  );
  const selectedInStockItems = inStockItems.filter((item) => selectedIds[item.productId._id]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const next: Record<string, boolean> = {};
      for (const item of inStockItems) {
        const id = item.productId._id;
        next[id] = prev[id] ?? true;
      }
      return next;
    });
  }, [inStockItems]);

  const totals = useMemo(() => {
    const subtotalAll = cart?.totalCartPrice || 0;
    const subtotal = selectedInStockItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountRate = subtotalAll > 0 && cart?.priceAfterDiscount
      ? cart.priceAfterDiscount / subtotalAll
      : 1;
    const discounted = subtotal * discountRate;
    const shipping = subtotal === 0 ? 0 : subtotal > 100 ? 0 : 9.99;
    return { subtotal, total: discounted + shipping, shipping, discount: subtotal - discounted };
  }, [cart, selectedInStockItems]);

  const handleApplyCoupon = () => {
    if (coupon.trim()) {
      apply.mutate(coupon);
      setCouponApplied(true);
    }
  };

  const handleRemoveCoupon = () => {
    dropCoupon.mutate();
    setCoupon('');
    setCouponApplied(false);
  };

  const handleCheckout = () => {
    if (!address.trim()) return;
    if (selectedInStockItems.length === 0) return;
    if (!window.confirm('Are you sure you want to place this order?')) return;
    create.mutate({
      address,
      items: selectedInStockItems.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity
      }))
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent-cream dark:bg-[#0f0f0f]">
        <div className="container-wide py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-32 rounded-2xl" />
              ))}
            </div>
            <div className="skeleton h-96 rounded-2xl" />
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
          <span className="section-subtitle">Shopping</span>
          <h1 className="section-title mt-2">Your Cart</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-wide">
          {items.length === 0 ? (
            /* Empty Cart State */
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center text-stone-300 dark:text-stone-600">
                <ShoppingBag className="w-16 h-16" />
              </div>
              <h2 className="text-2xl font-semibold mb-3">Your cart is empty</h2>
              <p className="text-stone-500 dark:text-stone-400 mb-8">
                Looks like you haven't added anything to your cart yet. 
                Start shopping to fill it up!
              </p>
              <Link to="/catalog" className="btn-primary">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {/* Selection & Clear */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      const allSelected = inStockItems.length > 0 && inStockItems.every((item) => selectedIds[item.productId._id]);
                      if (allSelected) {
                        setSelectedIds({});
                      } else {
                        const next: Record<string, boolean> = {};
                        inStockItems.forEach((item) => {
                          next[item.productId._id] = true;
                        });
                        setSelectedIds(next);
                      }
                    }}
                    className="text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                    type="button"
                  >
                    {inStockItems.length > 0 && inStockItems.every((item) => selectedIds[item.productId._id])
                      ? 'Deselect all'
                      : 'Select all'}
                  </button>
                  <button
                    onClick={() => clear.mutate()}
                    className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear all
                  </button>
                </div>

                {inStockItems.length === 0 && (
                  <div className="card p-6 text-center text-stone-500 dark:text-stone-400">
                    All items are currently out of stock. Please check back soon.
                  </div>
                )}

                {inStockItems.map((item) => (
                  <article 
                    key={item.productId._id} 
                    className="card p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6"
                  >
                    {/* Product Image */}
                    <div className="flex items-start gap-3">
                      <label className="flex items-center gap-2 text-sm text-stone-500">
                        <input
                          type="checkbox"
                          checked={!!selectedIds[item.productId._id]}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelectedIds((prev) => ({ ...prev, [item.productId._id]: checked }));
                          }}
                          className="h-4 w-4 rounded border-stone-300 text-accent-gold focus:ring-accent-gold/40"
                        />
                      </label>
                      <div className="w-full sm:w-32 h-40 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-stone-100 dark:bg-white/5">
                        <img
                          src={item.productId.coverImage || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300'}
                          alt={item.productId.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">
                              {item.productId.slug}
                            </p>
                            <h3 className="font-semibold text-accent-charcoal dark:text-accent-cream text-lg">
                              {item.productId.name}
                            </h3>
                            {item.productId.category?.name && (
                              <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                                {item.productId.category.name}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem.mutate(item.productId._id)}
                            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
                          <button
                            onClick={() => item.quantity > 1 && updateItem.mutate({ productId: item.productId._id, quantity: item.quantity - 1 })}
                            disabled={item.quantity <= 1}
                            className="w-9 h-9 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 h-9 flex items-center justify-center text-sm font-medium border-x border-stone-200 dark:border-stone-700">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItem.mutate({ productId: item.productId._id, quantity: item.quantity + 1 })}
                            className="w-9 h-9 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-accent-charcoal dark:text-accent-cream">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <p className="text-xs text-stone-500">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}

                {/* Continue Shopping */}
                <Link 
                  to="/catalog" 
                  className="inline-flex items-center gap-2 text-sm text-accent-gold hover:underline mt-4"
                >
                  ← Continue Shopping
                </Link>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="card p-6 lg:sticky lg:top-24">
                  <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

                  {/* Coupon Input */}
                  <div className="mb-6">
                    <label className="text-sm text-stone-500 dark:text-stone-400 mb-2 block">
                      Have a promo code?
                    </label>
                    {couponApplied && totals.discount > 0 ? (
                      <div className="flex items-center justify-between bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                          <Tag className="w-5 h-5" />
                          <span className="font-medium">{coupon}</span>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-green-600 dark:text-green-400 hover:text-green-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Enter code"
                            className="input pl-10 w-full"
                            value={coupon}
                            onChange={(e) => setCoupon(e.target.value)}
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                            <Tag className="w-5 h-5" />
                          </div>
                        </div>
                        <button 
                          onClick={handleApplyCoupon}
                          className="btn-ghost px-4"
                          disabled={!coupon.trim()}
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Shipping Address */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Shipping Address
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      className="input w-full resize-none"
                      placeholder="Street address, city, state, ZIP code"
                    />
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 py-4 border-t border-stone-200 dark:border-stone-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-500 dark:text-stone-400">Subtotal</span>
                      <span>{formatPrice(totals.subtotal)}</span>
                    </div>
                    {totals.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600 dark:text-green-400">Discount</span>
                        <span className="text-green-600 dark:text-green-400">-{formatPrice(totals.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-500 dark:text-stone-400">Shipping</span>
                      <span>
                        {totals.shipping === 0 ? (
                          <span className="text-green-600 dark:text-green-400">Free</span>
                        ) : (
                          formatPrice(totals.shipping)
                        )}
                      </span>
                    </div>
                    {totals.subtotal < 100 && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-white/5 p-2 rounded-lg">
                        💡 Add {formatPrice(100 - totals.subtotal)} more for free shipping
                      </p>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center py-4 border-t border-stone-200 dark:border-stone-700">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-accent-charcoal dark:text-accent-cream">
                      {formatPrice(totals.total)}
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={create.isPending || !address.trim() || selectedInStockItems.length === 0}
                    className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {create.isPending ? (
                      <>
                        <span className="loading-spinner" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Place Order
                      </>
                    )}
                  </button>

                  {!address.trim() && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-2">
                      Please enter a shipping address to continue
                    </p>
                  )}
                  {selectedInStockItems.length === 0 && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 text-center mt-2">
                      Select at least one in-stock item to place an order.
                    </p>
                  )}

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-700">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="space-y-1">
                        <div className="w-10 h-10 mx-auto rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center text-stone-500 dark:text-stone-400">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Secure Payment</p>
                      </div>
                      <div className="space-y-1">
                        <div className="w-10 h-10 mx-auto rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center text-stone-500 dark:text-stone-400">
                          <Truck className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Fast Delivery</p>
                      </div>
                      <div className="space-y-1">
                        <div className="w-10 h-10 mx-auto rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center text-stone-500 dark:text-stone-400">
                          <RefreshCw className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Easy Returns</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}

            {outOfStockItems.length > 0 && (
              <div className="mt-10">
                <h3 className="text-lg font-semibold text-stone-600 dark:text-stone-300 mb-4">
                  Out of stock items
                </h3>
                <div className="space-y-3">
                  {outOfStockItems.map((item) => (
                    <article
                      key={item.productId._id}
                      className="card p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 opacity-60"
                    >
                      <div className="w-full sm:w-32 h-40 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-stone-100 dark:bg-white/5">
                        <img
                          src={item.productId.coverImage || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300'}
                          alt={item.productId.name}
                          className="w-full h-full object-cover grayscale"
                        />
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">
                            {item.productId.slug}
                          </p>
                          <h3 className="font-semibold text-accent-charcoal dark:text-accent-cream text-lg">
                            {item.productId.name}
                          </h3>
                          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                            Out of stock
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem.mutate(item.productId._id)}
                          className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
        </div>
      </section>
    </div>
  );
};

export default Cart;
