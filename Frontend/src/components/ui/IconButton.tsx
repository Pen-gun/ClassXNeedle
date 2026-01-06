import { forwardRef, type ButtonHTMLAttributes, type ElementType, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

type IconRenderable = ReactNode | ElementType;

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  icon: IconRenderable;
  label: string; // Required for accessibility
}

const variants = {
  default: 'btn-icon',
  ghost: 'hover:bg-stone-100 dark:hover:bg-white/10 rounded-lg',
  outline: 'border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-white/10 rounded-lg',
  secondary: 'bg-white dark:bg-charcoal-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-white/10 rounded-lg',
  gold: 'bg-accent-gold text-charcoal-900 hover:bg-accent-gold/90 rounded-lg',
};

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'default', size = 'md', icon, label, ...props }, ref) => {
    const renderIcon = () => {
      if (typeof icon === 'function') {
        const Icon = icon as ElementType;
        return <Icon />;
      }
      return icon;
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-colors',
          variants[variant],
          sizes[size],
          className
        )}
        aria-label={label}
        {...props}
      >
        {renderIcon()}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
