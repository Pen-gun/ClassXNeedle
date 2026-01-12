import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useProduct } from '../hooks/useProduct';
import { useCartMutations } from '../hooks/useCart';
import { useRequireAuth } from '../hooks/useAuth';
import { DEFAULT_PRODUCT_IMAGE } from '../lib/constants';
import { formatPrice } from '../lib/utils';
import RatingStars from '../components/product/RatingStars';

const ProductPage = () => {
  const { slug } = useParams();
  const { data: product, isLoading } = useProduct(slug);
  const { addItem } = useCartMutations();
  const requireAuth = useRequireAuth();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    if (!product) return;
    setSelectedSize(product.size?.[0] ?? '');
    setSelectedColor(product.color?.[0] ?? '');
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!requireAuth()) return;
    if (product.quantity !== undefined && product.quantity <= 0) return;
    if (!selectedSize || !selectedColor) return;
    addItem.mutate({ productId: product._id, quantity: 1, size: selectedSize, color: selectedColor });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent-cream dark:bg-[#0f0f0f]">
        <div className="container-wide py-12">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="skeleton aspect-product rounded-3xl" />
            <div className="space-y-4">
              <div className="skeleton h-6 w-2/3 rounded" />
              <div className="skeleton h-4 w-1/3 rounded" />
              <div className="skeleton h-20 w-full rounded" />
              <div className="skeleton h-12 w-40 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-accent-cream dark:bg-[#0f0f0f]">
        <div className="container-wide py-16 text-center">
          <h1 className="text-2xl font-semibold text-accent-charcoal dark:text-accent-cream">Product not found</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2">
            The product you are looking for does not exist.
          </p>
          <Link to="/catalog" className="btn-gold mt-6 inline-flex">
            Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  const price = product.priceAfterDiscount ?? product.price ?? 0;
  const hasDiscount = product.priceAfterDiscount && product.price && product.priceAfterDiscount < product.price;
  const sizeOptions = product.size ?? [];
  const colorOptions = product.color ?? [];
  const selectedVariant = product.variants?.find(
    (variant) => variant.size === selectedSize && variant.color === selectedColor
  );
  const variantStock = selectedVariant?.quantity ?? (product.variants?.length ? 0 : product.quantity);
  const inStock = variantStock === undefined || variantStock > 0;

  return (
    <div className="min-h-screen bg-accent-cream dark:bg-[#0f0f0f]">
      <section className="section">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="rounded-3xl overflow-hidden bg-white dark:bg-stone-900 shadow-elegant">
              <img
                src={product.coverImage || DEFAULT_PRODUCT_IMAGE}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-6">
              <div>
                {product.category?.name && (
                  <p className="text-xs uppercase tracking-[0.2em] text-accent-gold">{product.category.name}</p>
                )}
                <h1 className="text-3xl md:text-4xl font-display text-accent-charcoal dark:text-accent-cream mt-2">
                  {product.name}
                </h1>
                <div className="mt-3">
                  <RatingStars rating={product.ratingsAverage ?? product.ratingAvg ?? 0} count={product.ratingQty ?? 0} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xl font-semibold text-accent-charcoal dark:text-accent-cream">
                  {formatPrice(price)}
                </span>
                {hasDiscount && product.price && (
                  <span className="text-sm text-stone-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
                {!inStock && (
                  <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300">
                    Out of stock
                  </span>
                )}
              </div>

              {product.description && (
                <p className="text-stone-600 dark:text-stone-400">{product.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-stone-500 dark:text-stone-400">
                {product.brand && typeof product.brand === 'object' && (
                  <span>Brand: {product.brand.name}</span>
                )}
                {product.gender && <span>Gender: {product.gender}</span>}
                {product.material && <span>Material: {product.material}</span>}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-300">Size</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          selectedSize === size
                            ? 'border-accent-gold bg-accent-gold/10 text-accent-charcoal dark:text-accent-cream'
                            : 'border-stone-200 text-stone-500 hover:border-stone-300 dark:border-stone-700 dark:text-stone-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-300">Color</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          selectedColor === color
                            ? 'border-accent-gold bg-accent-gold/10 text-accent-charcoal dark:text-accent-cream'
                            : 'border-stone-200 text-stone-500 hover:border-stone-300 dark:border-stone-700 dark:text-stone-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {variantStock !== undefined && (
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {variantStock > 0 ? `${variantStock} left for this variant` : 'This variant is out of stock'}
                </p>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock || addItem.isPending || !selectedSize || !selectedColor}
                  className="btn-gold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {addItem.isPending ? 'Adding...' : 'Add to cart'}
                </button>
                <Link to="/catalog" className="btn-ghost">
                  Back to catalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductPage;
