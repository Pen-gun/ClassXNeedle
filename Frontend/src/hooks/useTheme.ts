import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'cxn-theme';

const getSystemTheme = (): 'light' | 'dark' => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) || 'system';
    setTheme(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const effective = theme === 'system' ? getSystemTheme() : theme;
    if (effective === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return {
    theme,
    setTheme
  };
};
