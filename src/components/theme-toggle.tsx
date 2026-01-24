import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  variant?: 'icon' | 'full';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'full') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className={cn('gap-2', className)}
      >
        {isDark ? (
          <>
            <Sun className="h-4 w-4" />
            <span>Tema Claro</span>
          </>
        ) : (
          <>
            <Moon className="h-4 w-4" />
            <span>Tema Escuro</span>
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={className}
      title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
