import { createContext, useCallback, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const theme = 'light';

  const setTheme = useCallback(() => {
    try { localStorage.setItem('maielectro-theme', 'light'); } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme('light');
  }, [setTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    try { localStorage.setItem('maielectro-theme', 'light'); } catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: false }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
