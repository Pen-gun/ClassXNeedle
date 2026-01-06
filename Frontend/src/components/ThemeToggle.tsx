import type { Theme } from '../hooks/useTheme';

type Props = {
  value: Theme;
  onChange: (theme: Theme) => void;
};

const ThemeToggle = ({ value, onChange }: Props) => {
  const options: { label: string; value: Theme }[] = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' }
  ];

  return (
    <div className="inline-flex rounded-full border border-slate-200/80 bg-white/60 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-100">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 transition ${
            value === opt.value
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-full shadow'
              : 'hover:bg-slate-100 dark:hover:bg-white/20'
          }`}
          type="button"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
