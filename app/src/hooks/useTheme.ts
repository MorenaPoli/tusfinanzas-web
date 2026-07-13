import { useState, useEffect } from 'react';

export type ThemeType = 'neon' | 'emerald' | 'sapphire' | 'cyber';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    return (localStorage.getItem('tusfinanzas_theme') as ThemeType) || 'neon';
  });

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    root.classList.remove('theme-neon', 'theme-emerald', 'theme-sapphire', 'theme-cyber');
    // Add current theme class
    root.classList.add(`theme-${theme}`);
    // Persist
    localStorage.setItem('tusfinanzas_theme', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  return { theme, setTheme };
}
