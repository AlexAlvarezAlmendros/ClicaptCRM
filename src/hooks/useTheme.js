import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "leadflow-theme";
const THEMES = ["light", "dark", "system"];

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredPreference() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && THEMES.includes(stored)) return stored;
  } catch {
    // localStorage not available
  }
  return "system";
}

function applyTheme(resolved) {
  document.documentElement.setAttribute("data-theme", resolved);
}

/**
 * Theme hook managing light/dark/system preference.
 * Persists to localStorage and applies data-theme attribute.
 */
export function useTheme() {
  const [preference, setPreference] = useState(getStoredPreference);

  const resolvedTheme =
    preference === "system" ? getSystemTheme() : preference;

  // Apply theme on mount and when preference changes
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Listen for system theme changes when in "system" mode
  useEffect(() => {
    if (preference !== "system") return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(getSystemTheme());

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [preference]);

  const setTheme = useCallback((newTheme) => {
    if (!THEMES.includes(newTheme)) return;
    setPreference(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // ignore
    }
  }, []);

  return {
    theme: preference,       // "light" | "dark" | "system"
    resolvedTheme,           // "light" | "dark"
    setTheme,
    isDark: resolvedTheme === "dark",
  };
}
