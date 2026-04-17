import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, Info, Brain, User, LogIn, LogOut, QrCode } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useScannerCheck } from "@/hooks/useScannerCheck";
import { useAdminCheck } from "@/hooks/useAdminCheck";

interface MobileBottomNavProps {
  onAuthClick: (mode: "signin" | "signup") => void;
}

const MobileBottomNav = ({ onAuthClick }: MobileBottomNavProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

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
    <>
      {/* Popup menu overlay */}
      {showMenu && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-foreground/30 backdrop-blur-sm"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="absolute bottom-[76px] right-4 w-52 rounded-xl border border-border bg-background shadow-xl py-2 animate-in slide-in-from-bottom-2 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              to="/account"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground active:bg-muted transition-colors touch-target"
            >
              <User size={18} />
              {t("nav.myAccount")}
            </Link>
            <div className="mx-3 border-t border-border" />
            <button
              onClick={() => {
                setShowMenu(false);
                signOut();
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-destructive active:bg-destructive/10 transition-colors touch-target"
            >
              <LogOut size={18} />
              {t("nav.logOut")}
            </button>
          </div>
        </div>
      )}

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
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`flex flex-col items-center justify-center touch-target px-2 py-1.5 rounded-xl transition-colors ${
                location.pathname === "/account" || showMenu
                  ? "text-primary"
                  : "text-muted-foreground active:text-primary"
              }`}
            >
              <User size={22} strokeWidth={location.pathname === "/account" || showMenu ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold mt-0.5 leading-tight">{t("nav.myAccount")}</span>
            </button>
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
    </>
  );
};

export default MobileBottomNav;
