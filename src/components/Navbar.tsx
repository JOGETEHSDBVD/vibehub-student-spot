import { useState } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SignInModal from "./SignInModal";
import JoinModal from "./JoinModal";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "#" },
  { label: "Events", href: "#" },
  { label: "MBTI Test", href: "#" },
  { label: "Admin", href: "/admin" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const switchToJoin = () => { setSignInOpen(false); setJoinOpen(true); };
  const switchToSignIn = () => { setJoinOpen(false); setSignInOpen(true); };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 text-primary font-bold text-lg">HL</div>
            <span className="text-xl font-bold text-foreground">VibeHub</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <a key={link.label} href={link.href} className={`text-sm font-medium transition-colors duration-200 ${i === 0 ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <User size={18} className="text-primary" />
                  <span className="font-medium">{profile?.full_name || user.email}</span>
                </div>
                <button onClick={signOut} className="flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground hover:bg-secondary">
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setSignInOpen(true)} className="rounded-full border border-primary px-5 py-2 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary/5">Sign In</button>
                <button onClick={() => setJoinOpen(true)} className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90">Join Club</button>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background px-6 pb-4">
            {navLinks.map((link, i) => (
              <a key={link.label} href={link.href} className={`block py-2 text-sm font-medium ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>{link.label}</a>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2 py-2 text-sm text-foreground">
                    <User size={18} className="text-primary" />
                    <span className="font-medium">{profile?.full_name || user.email}</span>
                  </div>
                  <button onClick={() => { setMobileOpen(false); signOut(); }} className="rounded-full border border-border px-5 py-2 text-sm font-medium text-muted-foreground">Sign Out</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setMobileOpen(false); setSignInOpen(true); }} className="rounded-full border border-primary px-5 py-2 text-sm font-medium text-primary">Sign In</button>
                  <button onClick={() => { setMobileOpen(false); setJoinOpen(true); }} className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">Join Club</button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} onSwitchToJoin={switchToJoin} />
      <JoinModal open={joinOpen} onClose={() => setJoinOpen(false)} onSwitchToSignIn={switchToSignIn} />
    </>
  );
};

export default Navbar;
