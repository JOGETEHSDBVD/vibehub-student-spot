import { useState } from "react";
import { Menu, X } from "lucide-react";
import SignInModal from "./SignInModal";
import JoinModal from "./JoinModal";

const navLinks = ["Home", "About", "Events", "MBTI Test", "Admin"];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

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
              <a key={link} href="#" className={`text-sm font-medium transition-colors duration-200 ${i === 0 ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {link}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => setSignInOpen(true)} className="rounded-full border border-primary px-5 py-2 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary/5">Sign In</button>
            <button onClick={() => setJoinOpen(true)} className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90">Join Club</button>
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background px-6 pb-4">
            {navLinks.map((link, i) => (
              <a key={link} href="#" className={`block py-2 text-sm font-medium ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>{link}</a>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <button onClick={() => { setMobileOpen(false); setSignInOpen(true); }} className="rounded-full border border-primary px-5 py-2 text-sm font-medium text-primary">Sign In</button>
              <button onClick={() => { setMobileOpen(false); setJoinOpen(true); }} className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">Join Club</button>
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
