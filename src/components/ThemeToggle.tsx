import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  variant?: 'header' | 'footer' | 'pill';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'header', className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800'
            : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100 shadow-sm'
        } ${className}`}
        title={isDark ? 'Ganti ke Mode Terang (Light Mode)' : 'Ganti ke Mode Gelap (Dark Mode)'}
        aria-label="Ganti mode tampilan tema"
      >
        {isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Mode Gelap</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mode Terang</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-lg border transition-all duration-200 ${
        isDark
          ? 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-amber-300 hover:text-amber-200 hover:border-slate-700'
          : 'bg-white hover:bg-slate-100 border-slate-300 text-amber-600 hover:text-amber-700 shadow-xs'
      } ${className}`}
      title={isDark ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
      aria-label={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
      )}
      <span className="sr-only">
        {isDark ? 'Mode Terang' : 'Mode Gelap'}
      </span>
    </button>
  );
};
