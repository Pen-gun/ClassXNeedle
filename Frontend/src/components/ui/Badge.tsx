import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gold' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
  leftIcon?: ReactNode;
}

const variants = {
  default: 'bg-stone-100 text-stone-700 dark:bg-white/10 dark:text-stone-300',
  gold: 'badge-gold',
  success: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  outline: 'border border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-400',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export const Badge = ({
  children,
  className,
  variant = 'default',
  size = 'sm',
  leftIcon,
  ...props
}: BadgeProps) => {
  return (
    <span
      className={cn(
        'badge inline-flex items-center gap-1 font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
    </span>
  );
};
