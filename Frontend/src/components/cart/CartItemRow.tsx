import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CartLineItem } from './types';

type Props = {
  item: CartLineItem;
  selected: boolean;
  selectionDisabled?: boolean;
  incrementDisabled?: boolean;
  decrementDisabled?: boolean;
  onToggleSelected: (checked: boolean) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  stockWarning?: string;
  formatPrice: (value: number) => string;
};

const CartItemRow = ({
  item,
  selected,
  selectionDisabled,
  incrementDisabled,
  decrementDisabled,
  onToggleSelected,
  onIncrement,
  onDecrement,
  onRemove,
  stockWarning,
  formatPrice
}: Props) => (
  <article className="card p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
    <div className="flex items-start gap-3">
      <label className="flex items-center gap-2 text-sm text-stone-500">
        <input
          type="checkbox"
          checked={selected}
          disabled={selectionDisabled}
          onChange={(e) => onToggleSelected(e.target.checked)}
          className="h-4 w-4 rounded border-stone-300 text-accent-gold focus:ring-accent-gold/40 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </label>
      <Link
        to={`/product/${item.productId.slug}`}
        className="w-full sm:w-32 h-40 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-stone-100 dark:bg-white/5"
      >
        <img
          src={item.productId.coverImage || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300'}
          alt={item.productId.name}
          className="w-full h-full object-cover"
        />
      </Link>
    </div>

    <div className="flex-1 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">{item.productId.slug}</p>
            <Link to={`/product/${item.productId.slug}`} className="font-semibold text-accent-charcoal dark:text-accent-cream text-lg hover:underline">
              {item.productId.name}
            </Link>
            {item.productId.category?.name && (
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                {item.productId.category.name}
              </p>
            )}
          </div>
          <button
            onClick={onRemove}
            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between mt-4">
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
            <button
              onClick={onDecrement}
              disabled={decrementDisabled || item.quantity <= 1}
              className="w-9 h-9 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 h-9 flex items-center justify-center text-sm font-medium border-x border-stone-200 dark:border-stone-700">
              {item.quantity}
            </span>
            <button
              onClick={onIncrement}
              disabled={incrementDisabled}
              className="w-9 h-9 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {stockWarning && (
            <p className="text-xs font-medium text-red-600 dark:text-red-400">{stockWarning}</p>
          )}
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold text-accent-charcoal dark:text-accent-cream">
            {formatPrice(item.price * item.quantity)}
          </p>
          <p className="text-xs text-stone-500">{formatPrice(item.price)} each</p>
        </div>
      </div>
    </div>
  </article>
);

export default CartItemRow;
