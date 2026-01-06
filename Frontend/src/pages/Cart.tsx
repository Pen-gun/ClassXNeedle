import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart, useCartMutations } from '../hooks/useCart';
import { useOrderMutations } from '../hooks/useOrders';

// Icons
const Icons = {
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  Minus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
    </svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Tag: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  ),
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  Truck: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  Refresh: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  MapPin: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

interface CartItemType {
  productId: {
    _id: string;
    name: string;
    slug: string;
    coverImage?: string;
    category?: { name: string };
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

  const totals = useMemo(() => {
    const subtotal = cart?.totalCartPrice || 0;
    const discounted = cart?.priceAfterDiscount ?? subtotal;
    const shipping = subtotal > 100 ? 0 : 9.99;
    return { subtotal, total: discounted + shipping, shipping, discount: subtotal - discounted };
  }, [cart]);

  const items: CartItemType[] = cart?.cartItem ?? [];

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
    create.mutate({ address });
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
                <Icons.ShoppingBag />
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
                {/* Clear Cart Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => clear.mutate()}
                    className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                    type="button"
                  >
                    <Icons.Trash />
                    Clear all
                  </button>
                </div>

                {items.map((item) => (
                  <article 
                    key={item.productId._id} 
                    className="card p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6"
                  >
                    {/* Product Image */}
                    <div className="w-full sm:w-32 h-40 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-stone-100 dark:bg-white/5">
                      <img
                        src={item.productId.coverImage || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300'}
                        alt={item.productId.name}
                        className="w-full h-full object-cover"
                      />
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
                            <Icons.Trash />
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
                            <Icons.Minus />
                          </button>
                          <span className="w-10 h-9 flex items-center justify-center text-sm font-medium border-x border-stone-200 dark:border-stone-700">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItem.mutate({ productId: item.productId._id, quantity: item.quantity + 1 })}
                            className="w-9 h-9 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
                          >
                            <Icons.Plus />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-accent-charcoal dark:text-accent-cream">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-xs text-stone-500">
                            ${item.price.toFixed(2)} each
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
                          <Icons.Tag />
                          <span className="font-medium">{coupon}</span>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-green-600 dark:text-green-400 hover:text-green-800"
                        >
                          <Icons.X />
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
                            <Icons.Tag />
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
                      <Icons.MapPin />
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
                      <span>${totals.subtotal.toFixed(2)}</span>
                    </div>
                    {totals.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600 dark:text-green-400">Discount</span>
                        <span className="text-green-600 dark:text-green-400">-${totals.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-500 dark:text-stone-400">Shipping</span>
                      <span>
                        {totals.shipping === 0 ? (
                          <span className="text-green-600 dark:text-green-400">Free</span>
                        ) : (
                          `$${totals.shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    {totals.subtotal < 100 && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-white/5 p-2 rounded-lg">
                        💡 Add ${(100 - totals.subtotal).toFixed(2)} more for free shipping
                      </p>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center py-4 border-t border-stone-200 dark:border-stone-700">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-accent-charcoal dark:text-accent-cream">
                      ${totals.total.toFixed(2)}
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={create.isPending || !address.trim()}
                    className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icons.Lock />
                    {create.isPending ? 'Processing...' : 'Place Order'}
                  </button>

                  {!address.trim() && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-2">
                      Please enter a shipping address to continue
                    </p>
                  )}

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-700">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="space-y-1">
                        <div className="w-10 h-10 mx-auto rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center text-stone-500 dark:text-stone-400">
                          <Icons.Shield />
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Secure Payment</p>
                      </div>
                      <div className="space-y-1">
                        <div className="w-10 h-10 mx-auto rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center text-stone-500 dark:text-stone-400">
                          <Icons.Truck />
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Fast Delivery</p>
                      </div>
                      <div className="space-y-1">
                        <div className="w-10 h-10 mx-auto rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center text-stone-500 dark:text-stone-400">
                          <Icons.Refresh />
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Easy Returns</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Cart;
