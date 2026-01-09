import type { ReactElement } from 'react';
import type { Theme } from '../hooks/useTheme';
import { Sun, Moon, Computer } from 'lucide-react';

type Props = {
  value: Theme;
  onChange: (theme: Theme) => void;
};

const ThemeToggle = ({ value, onChange }: Props) => {
  const options: { icon: ReactElement; value: Theme; label: string }[] = [
    { icon: <Sun className='w-4 h-4' />, value: 'light', label: 'Light' },
    { icon: <Moon className='w-4 h-4' />, value: 'dark', label: 'Dark' },
    { icon: <Computer className='w-4 h-4' />, value: 'system', label: 'System' },
  ];

  return (
    <div className="flex items-center p-1 rounded-full bg-stone-100 dark:bg-white/10 border border-stone-200/50 dark:border-white/5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`relative p-2 rounded-full transition-all duration-300 ${
            value === opt.value
              ? 'bg-white dark:bg-stone-800 text-accent-gold shadow-sm'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-white'
          }`}
          type="button"
          aria-label={opt.label}
          title={opt.label}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
