'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-xl bg-secondary border border-border/60 opacity-0" />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="ios-press relative w-8 h-8 rounded-xl bg-secondary border border-border/60
        flex items-center justify-center hover:bg-muted overflow-hidden"
      aria-label="تبديل الوضع"
    >
      <span className="absolute transition-all duration-300"
        style={{ transform: isDark ? 'translateY(0) rotate(0deg)' : 'translateY(-20px) rotate(90deg)', opacity: isDark ? 1 : 0 }}>
        <Sun className="w-3.5 h-3.5 text-foreground/70" />
      </span>
      <span className="absolute transition-all duration-300"
        style={{ transform: isDark ? 'translateY(20px) rotate(-90deg)' : 'translateY(0) rotate(0deg)', opacity: isDark ? 0 : 1 }}>
        <Moon className="w-3.5 h-3.5 text-foreground/70" />
      </span>
    </button>
  );
}
