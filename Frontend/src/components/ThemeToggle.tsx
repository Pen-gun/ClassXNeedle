import type { ReactElement } from 'react';
import type { Theme } from '../hooks/useTheme';

type Props = {
  value: Theme;
  onChange: (theme: Theme) => void;
};

const Icons = {
  Sun: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ),
  Moon: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  ),
  System: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
    </svg>
  ),
};

const ThemeToggle = ({ value, onChange }: Props) => {
  const options: { icon: ReactElement; value: Theme; label: string }[] = [
    { icon: <Icons.Sun />, value: 'light', label: 'Light' },
    { icon: <Icons.Moon />, value: 'dark', label: 'Dark' },
    { icon: <Icons.System />, value: 'system', label: 'System' },
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
