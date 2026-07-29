import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useStudio } from "../lib/store";
import { Sun, Moon } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/gallery", label: "Gallery" },
  { to: "/abstract", label: "Abstract" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const STUDIO = useStudio();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b-2 border-primary/20">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="font-[family-name:var(--font-display)] text-2xl md:text-3xl text-primary leading-none hover:scale-105 transition-transform"
        >
          {STUDIO.name.split(" ")[0]}
        </Link>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:flex gap-8 text-xs uppercase tracking-[0.25em] font-medium items-center">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeProps={{ className: "text-primary" }}
                inactiveProps={{
                  className: "text-primary/60 hover:text-primary transition-colors",
                }}
                activeOptions={{ exact: true }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Elegant Artist-Style Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border-2 border-primary/20 hover:border-primary text-primary transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            className="md:hidden text-primary text-2xl leading-none flex items-center justify-center p-1 cursor-pointer"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {open ? "×" : "≡"}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-primary/20 px-6 py-4 flex flex-col gap-4 text-sm uppercase tracking-[0.25em] bg-background">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-primary">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
