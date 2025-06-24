// ThemeProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useAuthContext } from '../services/AuthContext';
import { lightTheme, darkTheme } from '../theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { user } = useAuthContext();
  const db = useDatabase();

  const [themeName, setThemeName] = useState(user?.themePreference || 'dark');

  const theme = themeName === 'light' ? lightTheme : darkTheme;

  useEffect(() => {
    if (!user) return;
    setThemeName(user.themePreference || 'dark');
  }, [user]);

  async function toggleTheme() {
    const newTheme = themeName === 'light' ? 'dark' : 'light';
    console.log('newTheme', newTheme)
    console.log('user theme', user.themePreference)

    if (!user || user.themePreference === newTheme) return;

    await db.write(async () => {
      await user.update(u => {
        u.themePreference = newTheme;
      });
    });

    setThemeName(newTheme);
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

