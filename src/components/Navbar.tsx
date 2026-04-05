import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, ExternalLink, Ticket } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import logoClub from "@/assets/logo-club.png";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "#about", label: "About" },
  { to: "/events", label: "Events" },
  { to: "#", label: "MBTI Test" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<"signin" | "signup" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const dropdownRef = useRef<HTMLDivElement>(null);

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
            <img src={logoClub} alt="Club Logo" className="h-12 w-auto object-contain" />
            <h2 className={`font-display text-3xl font-black tracking-tight ${isDarkPage ? "text-dark-bg-foreground" : "text-foreground"}`}>VibeHub</h2>
          </Link>
          <nav className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`text-base font-semibold transition-colors ${
                  location.pathname === link.to
                    ? "text-primary"
                    : isDarkPage ? "text-dark-bg-foreground hover:text-primary" : "text-foreground hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-1 text-sm font-bold uppercase tracking-wide transition-colors ${isDarkPage ? "text-dark-bg-foreground hover:text-primary" : "text-foreground hover:text-primary"}`}
                  >
                    I'm an Organizer
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
                        My account
                      </button>
                      <button
                        onClick={() => { setAvatarOpen(false); signOut(); }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <LogOut size={18} />
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <button onClick={() => setAuthMode("signin")}
                  className="border border-primary text-primary px-6 py-2.5 rounded-full font-bold text-base hover:bg-primary/10 transition-all">
                  Sign In
                </button>
                <button onClick={() => setAuthMode("signup")}
                  className="bg-accent hover:bg-accent/80 text-accent-foreground px-8 py-2.5 rounded-full font-bold text-base transition-all">
                  Join Club
                </button>
              </>
            )}
          </div>
          <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background px-6 pb-4 mt-4">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.to} onClick={() => setMobileOpen(false)}
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
                      I'm an Organizer <ExternalLink size={14} />
                    </Link>
                  )}
                  <button onClick={() => { setMobileOpen(false); handleAccountClick(); }}
                    className="flex items-center gap-2 py-2 text-sm font-medium text-foreground">
                    <User size={16} /> My account
                  </button>
                  <button onClick={() => { setMobileOpen(false); signOut(); }}
                    className="rounded-full border border-border px-5 py-2 text-sm font-medium text-muted-foreground">Log out</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setMobileOpen(false); setAuthMode("signin"); }}
                    className="rounded-full border border-primary px-5 py-2 text-sm font-medium text-primary">Sign In</button>
                  <button onClick={() => { setMobileOpen(false); setAuthMode("signup"); }}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">Join Club</button>
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
