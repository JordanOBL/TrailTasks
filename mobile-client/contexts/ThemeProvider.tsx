// ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { darkTheme, lightTheme } from '../theme';

import { useAuthContext } from '../services/AuthContext';
import { useDatabase } from '@nozbe/watermelondb/react';

const ThemeContext = createContext<ThemeValueProps | undefined>(undefined);

interface ThemeValueProps {
  theme: typeof lightTheme | typeof darkTheme;
  toggleTheme: () => void | Promise<void>;
}

export const ThemeProvider = ({ children }: any) => {
  const { user } = useAuthContext();
  const db = useDatabase();

  const [themeName, setThemeName] = useState(user?.themePreference || 'dark');

  const theme = themeName === 'light' ? lightTheme : darkTheme;

  useEffect(() => {
    if (!user){
      return;
    }
    setThemeName(user.themePreference || 'dark');
  }, [user]);

  async function toggleTheme() {
    const newTheme = themeName === 'light' ? 'dark' : 'light';

    if (!user || user.themePreference === newTheme) {
      return;
    }

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

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};

