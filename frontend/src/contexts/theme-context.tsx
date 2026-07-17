import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Theme = "dark" | "light";
export type FontStyle = "inter" | "system" | "serif";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  font: FontStyle;
  setFont: (font: FontStyle) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const FONT_CLASS: Record<FontStyle, string | null> = {
  inter: null,
  system: "font-system",
  serif: "font-serif",
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("blogcms.theme") as Theme) ?? "dark");
  const [font, setFont] = useState<FontStyle>(() => (localStorage.getItem("blogcms.font") as FontStyle) ?? "inter");

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("blogcms.theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.remove("font-system", "font-serif");
    const cls = FONT_CLASS[font];
    if (cls) document.documentElement.classList.add(cls);
    localStorage.setItem("blogcms.font", font);
  }, [font]);

  const value = useMemo(
    () => ({ theme, toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")), font, setFont }),
    [theme, font]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}