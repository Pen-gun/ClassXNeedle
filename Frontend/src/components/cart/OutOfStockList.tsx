import { Trash2 } from 'lucide-react';
import type { CartLineItem } from './types';

type Props = {
  items: CartLineItem[];
  onRemove: (productId: string) => void;
};

const OutOfStockList = ({ items, onRemove }: Props) => {
  if (items.length === 0) return null;

  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold text-stone-600 dark:text-stone-300 mb-4">
        Out of stock items
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
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
                onClick={() => onRemove(item.productId._id)}
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
  );
};

export default OutOfStockList;
