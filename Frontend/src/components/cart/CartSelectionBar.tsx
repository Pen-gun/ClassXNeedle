import { Trash2 } from 'lucide-react';
import type { CartLineItem } from './types';

type Props = {
  inStockItems: CartLineItem[];
  selectedIds: Record<string, boolean>;
  onToggleAll: () => void;
  onClear: () => void;
};

const CartSelectionBar = ({ inStockItems, selectedIds, onToggleAll, onClear }: Props) => {
  const allSelected =
    inStockItems.length > 0 && inStockItems.every((item) => selectedIds[item.productId._id]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button
        onClick={onToggleAll}
        className="text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
        type="button"
      >
        {allSelected ? 'Deselect all' : 'Select all'}
      </button>
      <button
        onClick={onClear}
        className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
        type="button"
      >
        <Trash2 className="w-4 h-4" />
        Clear all
      </button>
    </div>
  );
};

export default CartSelectionBar;
