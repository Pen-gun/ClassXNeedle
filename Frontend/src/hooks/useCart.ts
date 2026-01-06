import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

  const addItem = useMutation({
    mutationFn: addCartItem,
    onSuccess: invalidate
  });

  const updateItem = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) => updateCartItem(productId, quantity),
    onSuccess: invalidate
  });

  const removeItem = useMutation({
    mutationFn: (productId: string) => removeCartItem(productId),
    onSuccess: invalidate
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
