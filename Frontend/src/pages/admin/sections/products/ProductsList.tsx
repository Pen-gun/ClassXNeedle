import type { AdminProduct } from '../../../../types';
import { formatCurrency } from '../../utils';

type Props = {
  products: AdminProduct[];
  onEdit: (product: AdminProduct) => void;
  onDelete: (id: string) => void;
};

const ProductsList = ({ products, onEdit, onDelete }: Props) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
    <h3 className="text-lg font-medium">Inventory list</h3>
    <div className="mt-4 space-y-3">
      {products.map((product) => (
        <div
          key={product._id}
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-black/30 px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium">{product.name}</p>
            <p className="text-xs text-stone-400">
              {product.category?.name || 'Uncategorized'} - Qty {product.quantity ?? 0}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>{formatCurrency(product.price)}</span>
            <button
              onClick={() => onEdit(product)}
              className="btn-ghost text-xs text-white/80 hover:text-white bg-white/5 hover:bg-white/10"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(product._id)}
              className="btn-ghost text-xs text-red-400 hover:text-red-200"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
      {products.length === 0 && <p className="text-stone-400">No products added yet.</p>}
    </div>
  </div>
);

export default ProductsList;
