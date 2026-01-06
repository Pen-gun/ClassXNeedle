import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <div className={cn('text-center py-16 max-w-md mx-auto', className)}>
      {icon && (
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center text-stone-300 dark:text-stone-600">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-stone-500 dark:text-stone-400 mb-6">{description}</p>
      )}
      {action && (
        action.href ? (
          <Link to={action.href}>
            <Button variant="primary">{action.label}</Button>
          </Link>
        ) : (
          <Button variant="primary" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </div>
  );
};
