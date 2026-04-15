import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LanguageSwitcherProps {
  isDark?: boolean;
}

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

const LanguageSwitcher = ({ isDark = false }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = i18n.language?.startsWith("fr") ? "fr" : "en";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-center h-10 w-10 rounded-full border transition-colors ${
          isDark
            ? "border-dark-bg-foreground/30 text-dark-bg-foreground hover:border-primary hover:text-primary"
            : "border-border text-muted-foreground hover:border-primary hover:text-primary"
        }`}
      >
        <Globe size={20} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-44 rounded-xl border border-border bg-background shadow-lg py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                current === lang.code
                  ? "text-primary bg-primary/5"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
