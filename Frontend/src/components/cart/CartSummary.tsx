import { Lock, MapPin, Tag, X, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

type Totals = {
  subtotal: number;
  total: number;
  shipping: number;
  discount: number;
};

type Props = {
  totals: Totals;
  coupon: string;
  couponApplied: boolean;
  address: string;
  canCheckout: boolean;
  isCartUpdating: boolean;
  isPlacingOrder: boolean;
  orderErrorMessage?: string;
  onCouponChange: (value: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  onAddressChange: (value: string) => void;
  onCheckout: () => void;
  formatPrice: (value: number) => string;
};

const CartSummary = ({
  totals,
  coupon,
  couponApplied,
  address,
  canCheckout,
  isCartUpdating,
  isPlacingOrder,
  orderErrorMessage,
  onCouponChange,
  onApplyCoupon,
  onRemoveCoupon,
  onAddressChange,
  onCheckout,
  formatPrice
}: Props) => (
  <div className="card p-6 lg:sticky lg:top-24">
    <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

    <div className="mb-6">
      <label className="text-sm text-stone-500 dark:text-stone-400 mb-2 block">Have a promo code?</label>
      {couponApplied && totals.discount > 0 ? (
        <div className="flex items-center justify-between bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <Tag className="w-5 h-5" />
            <span className="font-medium">{coupon}</span>
          </div>
          <button onClick={onRemoveCoupon} className="text-green-600 dark:text-green-400 hover:text-green-800">
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
              onChange={(e) => onCouponChange(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
              <Tag className="w-5 h-5" />
            </div>
          </div>
          <button onClick={onApplyCoupon} className="btn-ghost px-4" disabled={!coupon.trim()}>
            Apply
          </button>
        </div>
      )}
    </div>

    <div className="mb-6">
      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
        <MapPin className="w-5 h-5" />
        Shipping Address
      </label>
      <textarea
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        rows={3}
        className="input w-full resize-none"
        placeholder="Street address, city, state, ZIP code"
      />
    </div>

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
      {totals.subtotal < 100 && totals.subtotal > 0 && (
        <p className="text-xs text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-white/5 p-2 rounded-lg">
          Add {formatPrice(100 - totals.subtotal)} more for free shipping
        </p>
      )}
    </div>

    <div className="flex justify-between items-center py-4 border-t border-stone-200 dark:border-stone-700">
      <span className="font-semibold">Total</span>
      <span className="text-2xl font-bold text-accent-charcoal dark:text-accent-cream">
        {formatPrice(totals.total)}
      </span>
    </div>

    <button
      onClick={onCheckout}
      disabled={isPlacingOrder || !canCheckout}
      className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPlacingOrder ? (
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
    {isCartUpdating && address.trim() && (
      <p className="text-xs text-stone-500 dark:text-stone-400 text-center mt-2">
        Updating cart, please wait...
      </p>
    )}
    {canCheckout === false && address.trim() && !isCartUpdating && (
      <p className="text-xs text-stone-500 dark:text-stone-400 text-center mt-2">
        Select at least one in-stock item to place an order.
      </p>
    )}
    {orderErrorMessage && (
      <p className="text-xs text-red-600 dark:text-red-400 text-center mt-2">
        {orderErrorMessage}
      </p>
    )}

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
);

export default CartSummary;
