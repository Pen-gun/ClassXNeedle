import { cn } from '../../lib/utils';
import type { Product } from '../../types';
import { ProductCard, type ProductCardProps } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';

export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  skeletonCount?: number;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  cardVariant?: ProductCardProps['variant'];
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  wishlistIds?: string[];
  addingToCartId?: string | null;
  className?: string;
  emptyState?: React.ReactNode;
}

const gapClasses = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
};

export function ProductGrid({
  products,
  isLoading = false,
  skeletonCount = 8,
  columns = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = 'md',
  cardVariant = 'default',
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  wishlistIds = [],
  addingToCartId,
  className,
  emptyState,
}: ProductGridProps) {
  // Build responsive grid columns class
  const gridCols = cn(
    columns.default && `grid-cols-${columns.default}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`
  );

  if (isLoading) {
    return (
      <div className={cn('grid', gridCols, gapClasses[gap], className)}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ProductCardSkeleton key={index} variant={cardVariant} />
        ))}
      </div>
    );
  }

  if (products.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={cn('grid', gridCols, gapClasses[gap], className)}>
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          variant={cardVariant}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          onQuickView={onQuickView}
          isInWishlist={wishlistIds.includes(product._id)}
          isAddingToCart={addingToCartId === product._id}
        />
      ))}
    </div>
  );
}
