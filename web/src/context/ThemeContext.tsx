'use client';

/**
 * ThemeContext - Sistema de Temas CondoTech
 * Projeto: CondoTech (isolado)
 *
 * Suporta 3 modos:
 * - light: Tema claro
 * - dark: Tema escuro
 * - system: Segue preferencia do sistema
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: ResolvedTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'condotech-theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function getStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') return getSystemTheme();
  return mode;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');
  const [mounted, setMounted] = useState(false);

  // Inicializa no mount
  useEffect(() => {
    const mode = getStoredMode();
    setThemeModeState(mode);
    setResolvedTheme(resolveTheme(mode));
    setMounted(true);
  }, []);

  // Aplica tema no documento
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Transicao suave
    root.setAttribute('data-theme-transitioning', 'true');
    root.setAttribute('data-theme', resolvedTheme);

    // Salva preferencia
    localStorage.setItem(STORAGE_KEY, themeMode);

    // Remove classe de transicao
    const timeout = setTimeout(() => {
      root.removeAttribute('data-theme-transitioning');
    }, 350);

    return () => clearTimeout(timeout);
  }, [resolvedTheme, themeMode, mounted]);

  // Escuta mudancas do sistema
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (themeMode === 'system') {
        setResolvedTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted, themeMode]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    setResolvedTheme(resolveTheme(mode));
  }, []);

  const toggleTheme = useCallback(() => {
    const newMode: ThemeMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    setThemeModeState(newMode);
    setResolvedTheme(newMode);
  }, [resolvedTheme]);

  const value: ThemeContextType = {
    theme: resolvedTheme,
    themeMode,
    setThemeMode,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
  };

  // Evita flash de tema errado
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Fallback para SSR
    return {
      theme: 'dark',
      themeMode: 'system',
      setThemeMode: () => {},
      toggleTheme: () => {},
      isDark: true,
    };
  }
  return context;
}
