import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const CartEmptyState = () => (
  <div className="text-center py-16 max-w-md mx-auto">
    <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center text-stone-300 dark:text-stone-600">
      <ShoppingBag className="w-16 h-16" />
    </div>
    <h2 className="text-2xl font-semibold mb-3">Your cart is empty</h2>
    <p className="text-stone-500 dark:text-stone-400 mb-8">
      Looks like you have not added anything to your cart yet. Start shopping to fill it up.
    </p>
    <Link to="/catalog" className="btn-primary">
      Start Shopping
    </Link>
  </div>
);

export default CartEmptyState;
