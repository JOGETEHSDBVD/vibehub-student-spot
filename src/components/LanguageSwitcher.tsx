import { useTranslation } from "react-i18next";

interface LanguageSwitcherProps {
  isDark?: boolean;
}

const LanguageSwitcher = ({ isDark = false }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("fr") ? "fr" : "en";

  const toggle = (lang: "en" | "fr") => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className={`flex items-center rounded-full border text-sm font-semibold overflow-hidden ${isDark ? "border-dark-bg-foreground/30" : "border-border"}`}>
      <button
        onClick={() => toggle("en")}
        className={`px-3 py-1.5 transition-colors ${
          current === "en"
            ? "bg-primary text-primary-foreground"
            : isDark ? "text-dark-bg-foreground/60 hover:text-dark-bg-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => toggle("fr")}
        className={`px-3 py-1.5 transition-colors ${
          current === "fr"
            ? "bg-primary text-primary-foreground"
            : isDark ? "text-dark-bg-foreground/60 hover:text-dark-bg-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
