'use client';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

const THEME_STORAGE_KEY = 'theme-mode';

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeModeContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  effectiveScheme: ColorSchemeName;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [effectiveScheme, setEffectiveScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setThemeModeState(saved);
        if (saved === 'system') {
          Appearance.setColorScheme(null);
          setEffectiveScheme(Appearance.getColorScheme());
        } else {
          Appearance.setColorScheme(saved);
          setEffectiveScheme(saved);
        }
      }
    });
  }, []);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setEffectiveScheme(colorScheme ?? 'light');
    });
    return () => sub.remove();
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    if (mode === 'system') {
      Appearance.setColorScheme(null);
    } else {
      Appearance.setColorScheme(mode);
    }
  }, []);

  const value: ThemeModeContextValue = {
    themeMode,
    setThemeMode,
    effectiveScheme: themeMode === 'system' ? effectiveScheme : themeMode,
  };

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeContextValue {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
}
