import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeSelector() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Check initial theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Default to dark mode if nothing saved
      document.documentElement.classList.add('dark');
      setTheme('dark');
    }
  }, []);

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="flex justify-center mt-8 mb-4">
      <div className="bg-[#fcfaf7] dark:bg-slate-800 p-1.5 rounded-full flex items-center gap-1 shadow-md border border-black/10 dark:border-white/10 transition-colors">
        <button
          onClick={() => toggleTheme('light')}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            theme === 'light'
              ? 'bg-[#e6e2d6] text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <Sun size={16} />
          <span>Light</span>
        </button>
        <button
          onClick={() => toggleTheme('dark')}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            theme === 'dark'
              ? 'bg-slate-900 text-slate-100 shadow-sm'
              : 'text-slate-600 hover:text-slate-800 hover:bg-[#e6e2d6]/50'
          }`}
        >
          <Moon size={16} />
          <span>Dark</span>
        </button>
      </div>
    </div>
  );
}
