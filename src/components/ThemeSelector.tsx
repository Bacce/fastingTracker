import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeSelector() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  useEffect(() => {
    // Check initial theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Default to auto mode if nothing saved
      setTheme('auto');
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (currentTheme: 'light' | 'dark' | 'auto') => {
      const isDark = 
        currentTheme === 'dark' || 
        (currentTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(theme);

    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('auto');
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const toggleTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const inactiveClass = "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-[#e6e2d6]/50 dark:hover:bg-slate-700/50";

  return (
    <div className="flex justify-center mt-8 mb-4">
      <div className="bg-[#fcfaf7] dark:bg-slate-800 p-1.5 rounded-full flex items-center gap-1 shadow-md border border-black/10 dark:border-white/10 transition-colors">
        <button
          onClick={() => toggleTheme('light')}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            theme === 'light'
              ? 'bg-[#e6e2d6] text-slate-900 shadow-sm'
              : inactiveClass
          }`}
        >
          <Sun size={16} />
          <span>Light</span>
        </button>
        <button
          onClick={() => toggleTheme('auto')}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            theme === 'auto'
              ? 'bg-[#e6e2d6] dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
              : inactiveClass
          }`}
        >
          <Monitor size={16} />
          <span>Auto</span>
        </button>
        <button
          onClick={() => toggleTheme('dark')}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            theme === 'dark'
              ? 'bg-slate-900 text-slate-100 shadow-sm'
              : inactiveClass
          }`}
        >
          <Moon size={16} />
          <span>Dark</span>
        </button>
      </div>
    </div>
  );
}
