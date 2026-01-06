import { cn } from '../../lib/utils';
import { Skeleton } from '../ui';

export interface ProductCardSkeletonProps {
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export function ProductCardSkeleton({
  variant = 'default',
  className,
}: ProductCardSkeletonProps) {
  const imageHeight = {
    default: 'aspect-[3/4]',
    compact: 'aspect-square',
    featured: 'aspect-[4/5]',
  }[variant];

  return (
    <div
      className={cn(
        'bg-white dark:bg-charcoal-800 rounded-lg overflow-hidden',
        'border border-gray-100 dark:border-charcoal-700',
        className
      )}
    >
      {/* Image Skeleton */}
      <Skeleton
        variant="rectangular"
        className={cn('w-full', imageHeight)}
      />

      {/* Content Skeleton */}
      <div className={cn('p-4', variant === 'compact' && 'p-3')}>
        {/* Brand */}
        <Skeleton variant="text" className="w-16 h-3 mb-2" />

        {/* Title */}
        <Skeleton variant="text" className="w-full h-5 mb-1" />
        <Skeleton variant="text" className="w-2/3 h-5 mb-3" />

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Skeleton variant="circular" className="w-4 h-4" />
          <Skeleton variant="text" className="w-12 h-4" />
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <Skeleton variant="text" className="w-20 h-6" />
          <Skeleton variant="text" className="w-14 h-4" />
        </div>
      </div>
    </div>
  );
}
