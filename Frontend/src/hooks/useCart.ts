import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Cart } from '../types';
import { addCartItem, applyCoupon, clearCart, fetchCart, removeCartItem, removeCoupon, updateCartItem } from '../lib/api';

export const useCart = () =>
  useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    retry: false
  });

export const useCartMutations = () => {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['cart'] });
  };

  const isCart = (value: unknown): value is Cart => {
    if (!value || typeof value !== 'object') return false;
    return 'cartItem' in value && 'totalCartPrice' in value;
  };

  const applyDiscount = (cart: Cart, totalCartPrice: number) => {
    if (cart.priceAfterDiscount === undefined || cart.totalCartPrice <= 0) {
      return undefined;
    }
    const rate = cart.priceAfterDiscount / cart.totalCartPrice;
    return Math.max(0, totalCartPrice * rate);
  };

  const addItem = useMutation({
    mutationFn: addCartItem,
    onSuccess: invalidate
  });

  const updateItem = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) => updateCartItem(productId, quantity),
    onMutate: async ({ productId, quantity }) => {
      await qc.cancelQueries({ queryKey: ['cart'] });
      const previous = qc.getQueryData<Cart | null>(['cart']);
      if (!previous) return { previous };
      const existing = previous.cartItem.find((item) => item.productId._id === productId);
      if (!existing || existing.quantity === quantity) return { previous };
      const delta = quantity - existing.quantity;
      const nextItems = previous.cartItem.map((item) =>
        item.productId._id === productId ? { ...item, quantity } : item
      );
      const nextTotal = Math.max(0, previous.totalCartPrice + delta * existing.price);
      const nextCart: Cart = {
        ...previous,
        cartItem: nextItems,
        totalCartPrice: nextTotal,
        priceAfterDiscount: applyDiscount(previous, nextTotal)
      };
      qc.setQueryData(['cart'], nextCart);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        qc.setQueryData(['cart'], context.previous);
      }
    },
    onSuccess: (data) => {
      if (isCart(data)) {
        qc.setQueryData(['cart'], data);
      }
    }
  });

  const removeItem = useMutation({
    mutationFn: (productId: string) => removeCartItem(productId),
    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: ['cart'] });
      const previous = qc.getQueryData<Cart | null>(['cart']);
      if (!previous) return { previous };
      const existing = previous.cartItem.find((item) => item.productId._id === productId);
      if (!existing) return { previous };
      const nextItems = previous.cartItem.filter((item) => item.productId._id !== productId);
      const nextTotal = Math.max(0, previous.totalCartPrice - existing.quantity * existing.price);
      const nextCart: Cart = {
        ...previous,
        cartItem: nextItems,
        totalCartPrice: nextTotal,
        priceAfterDiscount: applyDiscount(previous, nextTotal)
      };
      qc.setQueryData(['cart'], nextCart);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        qc.setQueryData(['cart'], context.previous);
      }
    },
    onSuccess: (data) => {
      if (isCart(data)) {
        qc.setQueryData(['cart'], data);
      }
    }
  });

  const clear = useMutation({
    mutationFn: clearCart,
    onSuccess: invalidate
  });

  const apply = useMutation({
    mutationFn: applyCoupon,
    onSuccess: invalidate
  });

  const dropCoupon = useMutation({
    mutationFn: removeCoupon,
    onSuccess: invalidate
  });

  return { addItem, updateItem, removeItem, clear, apply, dropCoupon };
};
