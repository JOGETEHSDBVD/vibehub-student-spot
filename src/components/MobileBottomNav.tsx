import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, Info, Brain, User, LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

interface MobileBottomNavProps {
  onAuthClick: (mode: "signin" | "signup") => void;
}

const MobileBottomNav = ({ onAuthClick }: MobileBottomNavProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { to: "/", icon: Home, label: t("nav.home") },
    { to: "/events", icon: Calendar, label: t("nav.events") },
    { to: "/about", icon: Info, label: t("nav.about") },
    { to: "/mbti-test", icon: Brain, label: t("nav.mbtiTest") },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center touch-target px-2 py-1.5 rounded-xl transition-colors ${
              isActive(item.to)
                ? "text-primary"
                : "text-muted-foreground active:text-primary"
            }`}
          >
            <item.icon size={22} strokeWidth={isActive(item.to) ? 2.5 : 1.8} />
            <span className="text-[10px] font-semibold mt-0.5 leading-tight">{item.label}</span>
          </Link>
        ))}
        {user ? (
          <Link
            to="/account"
            className={`flex flex-col items-center justify-center touch-target px-2 py-1.5 rounded-xl transition-colors ${
              location.pathname === "/account"
                ? "text-primary"
                : "text-muted-foreground active:text-primary"
            }`}
          >
            <User size={22} strokeWidth={location.pathname === "/account" ? 2.5 : 1.8} />
            <span className="text-[10px] font-semibold mt-0.5 leading-tight">{t("nav.myAccount")}</span>
          </Link>
        ) : (
          <button
            onClick={() => onAuthClick("signin")}
            className="flex flex-col items-center justify-center touch-target px-2 py-1.5 rounded-xl text-muted-foreground active:text-primary transition-colors"
          >
            <LogIn size={22} strokeWidth={1.8} />
            <span className="text-[10px] font-semibold mt-0.5 leading-tight">{t("nav.signIn")}</span>
          </button>
        )}
      </div>
      {/* Safe area spacer for iOS */}
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </nav>
  );
};

export default MobileBottomNav;
