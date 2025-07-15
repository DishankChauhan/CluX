"use client";

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export function ThemeInitializer() {
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    // Force light theme on first load if no theme is set
    if (theme === 'system' || !theme) {
      setTheme('light');
    }
  }, [setTheme, theme]);

  return null;
}
