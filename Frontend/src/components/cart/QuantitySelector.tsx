import { Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { IconButton } from '../ui';

export interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: {
    container: 'gap-1',
    input: 'w-8 h-7 text-sm',
    button: 'sm' as const,
  },
  md: {
    container: 'gap-2',
    input: 'w-12 h-9 text-base',
    button: 'sm' as const,
  },
  lg: {
    container: 'gap-2',
    input: 'w-14 h-11 text-lg',
    button: 'md' as const,
  },
};

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  isLoading = false,
  size = 'md',
  className,
}: QuantitySelectorProps) {
  const styles = sizeClasses[size];

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const canDecrement = value > min && !disabled && !isLoading;
  const canIncrement = value < max && !disabled && !isLoading;

  return (
    <div
      className={cn(
        'flex items-center',
        styles.container,
        className
      )}
    >
      <IconButton
        icon={Minus}
        label="Decrease quantity"
        variant="outline"
        size={styles.button}
        onClick={handleDecrement}
        disabled={!canDecrement}
        className={cn(
          'border-charcoal-200 dark:border-charcoal-600',
          !canDecrement && 'opacity-50 cursor-not-allowed'
        )}
      />

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleInputChange}
        disabled={disabled || isLoading}
        className={cn(
          'text-center font-medium',
          'border border-charcoal-200 dark:border-charcoal-600 rounded-md',
          'bg-white dark:bg-charcoal-800',
          'text-charcoal-900 dark:text-cream-50',
          'focus:outline-none focus:ring-2 focus:ring-accent-gold/50 focus:border-accent-gold',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          styles.input
        )}
        aria-label="Quantity"
      />

      <IconButton
        icon={Plus}
        label="Increase quantity"
        variant="outline"
        size={styles.button}
        onClick={handleIncrement}
        disabled={!canIncrement}
        className={cn(
          'border-charcoal-200 dark:border-charcoal-600',
          !canIncrement && 'opacity-50 cursor-not-allowed'
        )}
      />
    </div>
  );
}
