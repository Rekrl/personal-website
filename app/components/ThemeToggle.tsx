"use client";

export const THEME_CHANGE_EVENT = "themechange";

function toggleTheme() {
  const root = document.documentElement;
  const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: next }));
}

export default function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className="text-muted-3 hover:text-cyan transition-colors text-xs tracking-widest uppercase border border-border px-3 py-1.5 cursor-pointer"
    >
      <span className="theme-label-dark">light</span>
      <span className="theme-label-light">dark</span>
    </button>
  );
}
