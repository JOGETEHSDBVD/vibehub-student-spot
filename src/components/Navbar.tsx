import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, ExternalLink, QrCode } from "lucide-react";
import { useTranslation } from "react-i18next";
import AuthModal from "@/components/AuthModal";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useScannerCheck } from "@/hooks/useScannerCheck";
import logoBlue from "@/assets/logo-blue.png";
import logoWhite from "@/assets/logo-white.png";

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<"signin" | "signup" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { isScanner } = useScannerCheck();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "#about", label: t("nav.about") },
    { to: "/events", label: t("nav.events") },
    { to: "/mbti-test", label: t("nav.mbtiTest") },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccountClick = () => {
    setAvatarOpen(false);
    if (isAdmin) {
      navigate("/admin/settings");
    } else {
      navigate("/account");
    }
  };

  const isDarkPage = location.pathname === "/events" || location.pathname.startsWith("/events/");

  return (
    <>
      <header className={`sticky top-0 z-50 w-full border-b px-8 lg:px-24 py-5 ${isDarkPage ? "border-dark-bg-foreground/10 bg-dark-bg/90 backdrop-blur-md" : "border-primary/20 bg-background/80 backdrop-blur-md"}`}>
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={isDarkPage ? logoWhite : logoBlue} alt="VibeHub Logo" className="h-12 w-auto object-contain" />
            <h2 className={`font-display text-3xl font-black tracking-tight ${isDarkPage ? "text-dark-bg-foreground" : "text-foreground"}`}>VibeHub</h2>
          </Link>
          <nav className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-base font-semibold transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                  location.pathname === link.to
                    ? "text-primary after:scale-x-100"
                    : isDarkPage ? "text-dark-bg-foreground hover:text-primary" : "text-foreground hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher isDark={isDarkPage} />
            {user ? (
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-1 text-sm font-bold uppercase tracking-wide transition-colors ${isDarkPage ? "text-dark-bg-foreground hover:text-primary" : "text-foreground hover:text-primary"}`}
                  >
                    {t("nav.organizer")}
                    <ExternalLink size={14} />
                  </Link>
                )}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setAvatarOpen(!avatarOpen)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-background hover:border-primary transition-colors overflow-hidden"
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <User size={20} className="text-foreground" />
                    )}
                  </button>
                  {avatarOpen && (
                    <div className="absolute right-0 top-12 w-60 rounded-xl border border-border bg-background shadow-lg py-2 z-50">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || user.email}</p>
                      </div>
                      <button
                        onClick={handleAccountClick}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <User size={18} />
                        {t("nav.myAccount")}
                      </button>
                      {(isAdmin || isScanner) && (
                        <button
                          onClick={() => { setAvatarOpen(false); navigate("/my-account/scanner"); }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                          <QrCode size={18} />
                          {t("nav.qrScanner")}
                        </button>
                      )}
                      <button
                        onClick={() => { setAvatarOpen(false); signOut(); }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <LogOut size={18} />
                        {t("nav.logOut")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <button onClick={() => setAuthMode("signin")}
                  className="border border-primary text-primary px-6 py-2.5 rounded-full font-bold text-base hover:bg-primary/10 transition-all">
                  {t("nav.signIn")}
                </button>
                <button onClick={() => setAuthMode("signup")}
                  className="bg-primary hover:bg-primary/80 text-primary-foreground px-8 py-2.5 rounded-full font-bold text-base transition-all">
                  {t("nav.joinClub")}
                </button>
              </>
            )}
          </div>
          <div className="md:hidden flex items-center gap-3">
            <LanguageSwitcher isDark={isDarkPage} />
            <button className={isDarkPage ? "text-dark-bg-foreground" : "text-foreground"} onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background px-6 pb-4 mt-4">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                className={`block py-2 text-sm font-medium ${location.pathname === link.to ? "text-primary" : "text-muted-foreground"}`}>
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2 py-2 text-sm text-foreground">
                    <User size={18} className="text-primary" />
                    <span className="font-medium">{profile?.full_name || user.email}</span>
                  </div>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-1 py-2 text-sm font-bold uppercase text-foreground">
                      {t("nav.organizer")} <ExternalLink size={14} />
                    </Link>
                  )}
                  <button onClick={() => { setMobileOpen(false); handleAccountClick(); }}
                    className="flex items-center gap-2 py-2 text-sm font-medium text-foreground">
                    <User size={16} /> {t("nav.myAccount")}
                  </button>
                  {(isAdmin || isScanner) && (
                    <button onClick={() => { setMobileOpen(false); navigate("/my-account/scanner"); }}
                      className="flex items-center gap-2 py-2 text-sm font-medium text-foreground">
                      <QrCode size={16} /> {t("nav.qrScanner")}
                    </button>
                  )}
                  <button onClick={() => { setMobileOpen(false); signOut(); }}
                    className="rounded-full border border-border px-5 py-2 text-sm font-medium text-muted-foreground">{t("nav.logOut")}</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setMobileOpen(false); setAuthMode("signin"); }}
                    className="rounded-full border border-primary px-5 py-2 text-sm font-medium text-primary">{t("nav.signIn")}</button>
                  <button onClick={() => { setMobileOpen(false); setAuthMode("signup"); }}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">{t("nav.joinClub")}</button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={authMode !== null}
        mode={authMode ?? "signin"}
        onClose={() => setAuthMode(null)}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />
    </>
  );
};

export default Navbar;
