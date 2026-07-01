import { useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark" | "auto";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "auto";
    const stored = localStorage.getItem("theme-preference");
    return (stored as Theme) || "auto";
  });

  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Aplicar tema al documento
  const applyTheme = useCallback(() => {
    const html = document.documentElement;
    const effectiveTheme = theme === "auto" ? systemTheme : theme;

    if (effectiveTheme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [theme, systemTheme]);

  // Monitorear cambios en preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Aplicar tema cuando cambia
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  // Cambiar tema
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme-preference", newTheme);
  }, []);

  // Obtener tema actual
  const getEffectiveTheme = useCallback((): "light" | "dark" => {
    return theme === "auto" ? systemTheme : theme;
  }, [theme, systemTheme]);

  return {
    theme,
    setTheme,
    effectiveTheme: getEffectiveTheme(),
    systemTheme,
  };
}
