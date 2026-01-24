import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'vinculo-erp-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Verificar localStorage primeiro
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    // Verificar preferência do sistema
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    // Atualizar classe no documento para CSS global
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook para obter classes de tema dinamicamente
// Usa classes semânticas do Tailwind que funcionam com variáveis CSS
export function useThemeClasses() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return {
    theme,
    isDark,
    // Backgrounds - usando classes semânticas
    bgPrimary: 'bg-background',
    bgSecondary: 'bg-muted',
    bgTertiary: 'bg-secondary',
    bgCard: 'bg-card',
    bgSidebar: 'bg-sidebar',
    bgHeader: 'bg-background',
    bgHover: 'hover:bg-muted',
    bgActive: 'bg-accent',
    bgInput: 'bg-input',
    // Borders
    borderPrimary: 'border-border',
    borderSecondary: 'border-border',
    // Text
    textPrimary: 'text-foreground',
    textSecondary: 'text-muted-foreground',
    textTertiary: 'text-muted-foreground',
    textMuted: 'text-muted-foreground',
    // Status colors - always have good contrast
    textSuccess: isDark ? 'text-emerald-400' : 'text-emerald-600',
    textError: isDark ? 'text-red-400' : 'text-red-600',
    textWarning: isDark ? 'text-amber-400' : 'text-amber-600',
    textInfo: isDark ? 'text-blue-400' : 'text-blue-600',
    // Status backgrounds
    bgSuccess: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
    bgError: isDark ? 'bg-red-500/10' : 'bg-red-50',
    bgWarning: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
    bgInfo: isDark ? 'bg-blue-500/10' : 'bg-blue-50',
    // Active menu items
    menuActive: 'bg-accent text-accent-foreground',
    menuInactive: 'text-muted-foreground hover:bg-muted',
    // Buttons
    buttonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    buttonSecondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    buttonOutline: 'border-border text-foreground hover:bg-accent',
    // Tables
    tableHeader: 'bg-muted',
    tableRow: 'hover:bg-muted/50',
    tableRowAlt: 'bg-muted/30',
    // Cards
    cardBg: 'bg-card border-border',
    cardHeader: 'border-border',
    // Scrollbar
    scrollbar: isDark ? 'scrollbar-dark' : 'scrollbar-light',
  };
}
