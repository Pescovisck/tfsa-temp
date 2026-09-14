import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

function updateDOMTheme(mode: ThemeMode) {
  if (typeof window === 'undefined') return;
  const isDark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('tf_theme') as ThemeMode | null;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
    return 'system';
  });

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('tf_theme', newTheme);
    updateDOMTheme(newTheme);
  }, []);

  useEffect(() => {
    updateDOMTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const current = (localStorage.getItem('tf_theme') as ThemeMode) || 'system';
      if (current === 'system') {
        updateDOMTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  return { theme, setTheme };
}

