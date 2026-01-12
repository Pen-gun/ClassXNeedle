import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

type Props = {
  rating?: number;
  count?: number;
  max?: number;
  className?: string;
};

const RatingStars = ({ rating = 0, count, max = 5, className }: Props) => {
  const filled = Math.round(rating);

  return (
    <div className={cn('flex items-center gap-1 text-accent-gold', className)}>
      {Array.from({ length: max }).map((_, index) => (
        <Star
          key={index}
          className={cn('h-4 w-4', index < filled ? 'fill-accent-gold' : 'text-stone-300 dark:text-stone-600')}
        />
      ))}
      {typeof count === 'number' && count > 0 && (
        <span className="text-xs text-stone-500 dark:text-stone-400">({count})</span>
      )}
    </div>
  );
};

export default RatingStars;
