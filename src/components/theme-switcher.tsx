import { useEffect, useState } from "react";
import { useThemeContext } from "@/routes/__root";

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeContext();
  const [mounted, setMounted] = useState(false);

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-card/50 p-1 backdrop-blur-sm">
      <button
        onClick={() => setTheme("light")}
        aria-label="Modo claro"
        title="Modo claro"
        className={`relative z-10 flex items-center justify-center rounded-full p-2 transition-all ${
          theme === "light"
            ? "bg-primary text-primary-foreground shadow-soft"
            : "text-foreground/70 hover:text-foreground"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="currentColor"
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <button
        onClick={() => setTheme("auto")}
        aria-label="Automático"
        title="Automático"
        className={`relative z-10 flex items-center justify-center rounded-full p-2 transition-all ${
          theme === "auto"
            ? "bg-primary text-primary-foreground shadow-soft"
            : "text-foreground/70 hover:text-foreground"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="currentColor"
        >
          <path d="M12 3v1m0 16v1M4.22 4.22l.707.707m10.606 10.606l.707.707M1 12h1m16 0h1M4.22 19.78l.707-.707m10.606-10.606l.707-.707M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </button>
      <button
        onClick={() => setTheme("dark")}
        aria-label="Modo oscuro"
        title="Modo oscuro"
        className={`relative z-10 flex items-center justify-center rounded-full p-2 transition-all ${
          theme === "dark"
            ? "bg-primary text-primary-foreground shadow-soft"
            : "text-foreground/70 hover:text-foreground"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="currentColor"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>
    </div>
  );
}
