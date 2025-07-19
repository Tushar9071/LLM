import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
// This component ensures the theme is properly applied on initial load
const ThemeInitializer = () => {
  const {
    theme
  } = useTheme();
  useEffect(() => {
    // Force theme application on initial load
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);
  return null;
};
export default ThemeInitializer;