import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CartEmptyState,
  CartItemRow,
  CartPageHeader,
  CartSelectionBar,
  CartSummary,
  OutOfStockList,
  type CartLineItem
} from '../components/cart';
import { useCart, useCartMutations } from '../hooks/useCart';
import { useOrderMutations } from '../hooks/useOrders';
import { formatPrice } from '../lib/utils';

const Cart = () => {
  const { data: cart, isLoading } = useCart();
  const { updateItem, removeItem, clear, apply, dropCoupon } = useCartMutations();
  const { create } = useOrderMutations();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [address, setAddress] = useState('');
  const [selectionDefault, setSelectionDefault] = useState(true);
  const [selectionOverrides, setSelectionOverrides] = useState<Record<string, boolean>>({});

  const items: CartLineItem[] = cart?.cartItem ?? [];
  const inStockItems = useMemo(
    () =>
      items.filter((item) => {
        const stockQty = item.productId.quantity;
        return stockQty === undefined || stockQty > 0;
      }),
    [items]
  );
  const outOfStockItems = useMemo(
    () =>
      items.filter((item) => {
        const stockQty = item.productId.quantity;
        return stockQty !== undefined && stockQty <= 0;
      }),
    [items]
  );
  const selectedIds = useMemo(() => {
    const next: Record<string, boolean> = {};
    for (const item of inStockItems) {
      const id = item.productId._id;
      const stockQty = item.productId.quantity;
      if (stockQty !== undefined && item.quantity > stockQty) {
        next[id] = false;
        continue;
      }
      next[id] = selectionOverrides[id] ?? selectionDefault;
    }
    return next;
  }, [inStockItems, selectionDefault, selectionOverrides]);

  const selectedInStockItems = inStockItems.filter((item) => selectedIds[item.productId._id]);

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
      <CartPageHeader itemCount={items.length} />

      <section className="section">
        <div className="container-wide">
          {items.length === 0 ? (
            <CartEmptyState />
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <CartSelectionBar
                  inStockItems={inStockItems}
                  selectedIds={selectedIds}
                  onToggleAll={() => {
                    const allSelected =
                      inStockItems.length > 0 &&
                      inStockItems.every((item) => selectedIds[item.productId._id]);
                    if (allSelected) {
                      setSelectionDefault(false);
                      setSelectionOverrides({});
                      return;
                    }
                    setSelectionDefault(true);
                    setSelectionOverrides({});
                  }}
                  onClear={() => clear.mutate()}
                />

                {inStockItems.length === 0 && (
                  <div className="card p-6 text-center text-stone-500 dark:text-stone-400">
                    All items are currently out of stock. Please check back soon.
                  </div>
                )}

                {inStockItems.map((item) => (
                  <CartItemRow
                    key={item.productId._id}
                    item={item}
                    selected={!!selectedIds[item.productId._id]}
                    selectionDisabled={
                      item.productId.quantity !== undefined && item.quantity > item.productId.quantity
                    }
                    incrementDisabled={
                      item.productId.quantity !== undefined && item.quantity >= item.productId.quantity
                    }
                    stockWarning={
                      item.productId.quantity !== undefined && item.quantity > item.productId.quantity
                        ? `Only ${item.productId.quantity} left in stock`
                        : undefined
                    }
                    onToggleSelected={(checked) => {
                      const id = item.productId._id;
                      setSelectionOverrides((prev) => {
                        if (checked === selectionDefault) {
                          if (!(id in prev)) {
                            return prev;
                          }
                          const next = { ...prev };
                          delete next[id];
                          return next;
                        }
                        if (prev[id] === checked) {
                          return prev;
                        }
                        return { ...prev, [id]: checked };
                      });
                    }}
                    onIncrement={() => updateItem.mutate({ productId: item.productId._id, quantity: item.quantity + 1 })}
                    onDecrement={() => {
                      if (item.quantity <= 1) return;
                      const stockQty = item.productId.quantity;
                      let nextQuantity = item.quantity - 1;
                      if (stockQty !== undefined && nextQuantity > stockQty) {
                        nextQuantity = stockQty;
                      }
                      if (nextQuantity < 1 || nextQuantity === item.quantity) return;
                      updateItem.mutate({ productId: item.productId._id, quantity: nextQuantity });
                    }}
                    onRemove={() => removeItem.mutate(item.productId._id)}
                    formatPrice={formatPrice}
                  />
                ))}

                {/* Continue Shopping */}
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 text-sm text-accent-gold hover:underline mt-4"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <CartSummary
                  totals={totals}
                  coupon={coupon}
                  couponApplied={couponApplied}
                  address={address}
                  canCheckout={address.trim().length > 0 && selectedInStockItems.length > 0}
                  isPlacingOrder={create.isPending}
                  onCouponChange={setCoupon}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={handleRemoveCoupon}
                  onAddressChange={setAddress}
                  onCheckout={handleCheckout}
                  formatPrice={formatPrice}
                />
              </div>
            </div>
          )}

          <OutOfStockList
            items={outOfStockItems}
            onRemove={(productId) => removeItem.mutate(productId)}
          />
        </div>
      </section>
    </div>
  );
};

export default Cart;

