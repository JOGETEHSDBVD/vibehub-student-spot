import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  mode: "signin" | "signup";
  onClose: () => void;
  onSwitchMode: (mode: "signin" | "signup") => void;
}

const AuthModal = ({ isOpen, mode, onClose, onSwitchMode }: AuthModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "signin") {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        toast({ title: "Sign in failed", description: error, variant: "destructive" });
      } else {
        toast({ title: "Welcome back!" });
        setEmail(""); setPassword("");
        onClose();
      }
    } else {
      const { error } = await signUp(email, password, name);
      setLoading(false);
      if (error) {
        toast({ title: "Sign up failed", description: error, variant: "destructive" });
      } else {
        toast({ title: "Compte créé !", description: "Vérifiez votre email pour continuer." });
        localStorage.setItem("onboarding_email", email);
        setEmail(""); setPassword(""); setName("");
        onClose();
        navigate("/email-verified");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] bg-card border-primary/20 p-0 overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">HL</div>
              <span className="font-display text-xl font-black tracking-tight">VibeHub</span>
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">
              {mode === "signin" ? "Welcome back" : "Join the Club"}
            </DialogTitle>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === "signin"
                ? "Sign in to access your VibeHub account"
                : "Create your account and start vibing"}
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" htmlFor="auth-name">Full Name</label>
                <input id="auth-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-lg border border-border bg-background px-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="Enter your full name" required />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" htmlFor="auth-email">Email</label>
              <input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg border border-border bg-background px-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="you@university.edu" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" htmlFor="auth-password">Password</label>
              <input id="auth-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-lg border border-border bg-background px-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder={mode === "signin" ? "Enter your password" : "Create a password"} required />
            </div>

            {mode === "signin" && (
              <button type="button" className="text-xs text-primary font-semibold self-end hover:underline">
                Forgot password?
              </button>
            )}

            <button type="submit" disabled={loading}
              className="h-12 rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-95 transition-all mt-2 disabled:opacity-50">
              {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
            </button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">or continue with</span>
              </div>
            </div>

            <button type="button"
              className="h-11 rounded-lg border border-border bg-background font-semibold text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => onSwitchMode(mode === "signin" ? "signup" : "signin")}
              className="text-primary font-bold hover:underline">
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
