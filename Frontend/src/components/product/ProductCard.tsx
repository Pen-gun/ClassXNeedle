import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, IconButton } from '../ui';
import { cn, formatPrice, calculateDiscount } from '../../lib/utils';
import type { Product } from '../../types';

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  isInWishlist?: boolean;
  isAddingToCart?: boolean;
  className?: string;
  /** Show quick action buttons on hover */
  showActions?: boolean;
  /** Card size variant */
  variant?: 'default' | 'compact' | 'featured';
}

export function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  isInWishlist = false,
  isAddingToCart = false,
  className,
  showActions = true,
  variant = 'default',
}: ProductCardProps) {
  const discount = calculateDiscount(product.price ?? 0, product.priceAfterDiscount ?? 0);
  const hasDiscount = discount > 0;
  const isOutOfStock = product.stock === 0;
  
  // Use name or title for display
  const productName = product.name || product.title || 'Untitled Product';
  const rating = product.ratingsAverage ?? product.ratingAvg ?? 0;
  const ratingCount = product.ratingQty ?? 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock && onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToWishlist?.(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const imageHeight = {
    default: 'aspect-[3/4]',
    compact: 'aspect-square',
    featured: 'aspect-[4/5]',
  }[variant];

  return (
    <Link
      to={`/product/${product.slug}`}
      className={cn(
        'group block bg-white dark:bg-charcoal-800 rounded-lg overflow-hidden',
        'shadow-sm hover:shadow-xl transition-all duration-500',
        'border border-gray-100 dark:border-charcoal-700',
        className
      )}
    >
      {/* Image Container */}
      <div className={cn('relative overflow-hidden', imageHeight)}>
        <img
          src={product.coverImage || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'}
          alt={productName}
          className={cn(
            'w-full h-full object-cover transition-transform duration-700',
            'group-hover:scale-105',
            isOutOfStock && 'opacity-50'
          )}
          loading="lazy"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <Badge variant="danger" size="sm">
              -{discount}%
            </Badge>
          )}
          {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
            <Badge variant="warning" size="sm">
              Only {product.stock} left
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="default" size="sm">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div
            className={cn(
              'absolute top-3 right-3 flex flex-col gap-2',
              'opacity-0 group-hover:opacity-100 transition-all duration-300',
              'translate-x-2 group-hover:translate-x-0'
            )}
          >
            <IconButton
              icon={Heart}
              label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              variant={isInWishlist ? 'gold' : 'secondary'}
              size="sm"
              onClick={handleAddToWishlist}
              className={cn(
                'bg-white/90 dark:bg-charcoal-800/90 backdrop-blur-sm',
                isInWishlist && 'text-red-500'
              )}
            />
            {onQuickView && (
              <IconButton
                icon={Eye}
                label="Quick view"
                variant="secondary"
                size="sm"
                onClick={handleQuickView}
                className="bg-white/90 dark:bg-charcoal-800/90 backdrop-blur-sm"
              />
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        {showActions && !isOutOfStock && (
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={cn(
              'absolute bottom-0 left-0 right-0',
              'bg-charcoal-900/95 dark:bg-charcoal-700/95 backdrop-blur-sm',
              'text-white py-3 px-4',
              'flex items-center justify-center gap-2',
              'translate-y-full group-hover:translate-y-0',
              'transition-transform duration-300',
              'hover:bg-accent-gold hover:text-charcoal-900',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'text-sm font-medium tracking-wide'
            )}
          >
            <ShoppingBag className="h-4 w-4" />
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className={cn('p-4', variant === 'compact' && 'p-3')}>
        {/* Brand */}
        {product.brand && (
          <p className="text-xs font-medium text-accent-gold uppercase tracking-wider mb-1">
            {typeof product.brand === 'object' ? product.brand.name : product.brand}
          </p>
        )}

        {/* Title */}
        <h3
          className={cn(
            'font-medium text-charcoal-800 dark:text-cream-50',
            'group-hover:text-accent-gold transition-colors duration-300',
            'line-clamp-2',
            variant === 'compact' ? 'text-sm' : 'text-base'
          )}
        >
          {productName}
        </h3>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <Star className="h-3.5 w-3.5 fill-accent-gold text-accent-gold" />
            <span className="text-sm font-medium text-charcoal-700 dark:text-cream-200">
              {rating.toFixed(1)}
            </span>
            {ratingCount > 0 && (
              <span className="text-xs text-charcoal-400">
                ({ratingCount})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span
            className={cn(
              'font-semibold text-charcoal-900 dark:text-cream-50',
              variant === 'compact' ? 'text-base' : 'text-lg'
            )}
          >
            {formatPrice(product.priceAfterDiscount ?? product.price ?? 0)}
          </span>
          {hasDiscount && product.price && (
            <span className="text-sm text-charcoal-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
