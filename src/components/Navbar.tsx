import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "#about", label: "About" },
  { to: "/events", label: "Events" },
  { to: "#", label: "MBTI Test" },
  { to: "/admin", label: "Admin" },
];

const Navbar = () => {
  const location = useLocation();
  const [authMode, setAuthMode] = useState<"signin" | "signup" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/80 backdrop-blur-md px-8 lg:px-24 py-5">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xl">HL</div>
            <h2 className="font-display text-3xl font-black tracking-tight text-foreground">VibeHub</h2>
          </Link>
          <nav className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`text-base font-semibold transition-colors ${
                  location.pathname === link.to
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <User size={18} className="text-primary" />
                  <span className="font-medium">{profile?.full_name || user.email}</span>
                </div>
                <button onClick={signOut}
                  className="flex items-center gap-1 border border-border text-muted-foreground px-6 py-2.5 rounded-full font-bold text-sm hover:bg-secondary transition-all">
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setAuthMode("signin")}
                  className="border border-primary text-primary px-6 py-2.5 rounded-full font-bold text-base hover:bg-primary/10 transition-all">
                  Sign In
                </button>
                <button onClick={() => setAuthMode("signup")}
                  className="bg-primary hover:bg-primary/80 text-primary-foreground px-8 py-2.5 rounded-full font-bold text-base transition-all">
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
                  <button onClick={() => { setMobileOpen(false); signOut(); }}
                    className="rounded-full border border-border px-5 py-2 text-sm font-medium text-muted-foreground">Sign Out</button>
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
