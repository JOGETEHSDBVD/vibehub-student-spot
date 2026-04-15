import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ResetEmailSentModal from "@/components/ResetEmailSentModal";
import { Eye, EyeOff, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
  isOpen: boolean;
  mode: "signin" | "signup";
  onClose: () => void;
  onSwitchMode: (mode: "signin" | "signup") => void;
}

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "At least 1 uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "At least 1 lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "At least 1 number", test: (p: string) => /\d/.test(p) },
  { label: "At least 1 special character (!@#$%^&*)", test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

const AuthModal = ({ isOpen, mode, onClose, onSwitchMode }: AuthModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const allPasswordValid = useMemo(() => passwordRules.every((r) => r.test(password)), [password]);
  const signupFormValid = firstName.trim() && lastName.trim() && emailValid && allPasswordValid;

  const inputClass = "h-11 rounded-lg border border-border bg-background px-4 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/40 focus:border-primary";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && !signupFormValid) return;
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
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const { error } = await signUp(email, password, fullName);
      setLoading(false);
      if (error) {
        toast({ title: "Sign up failed", description: error, variant: "destructive" });
      } else {
        toast({ title: "Compte créé !", description: "Vérifiez votre email pour continuer." });
        localStorage.setItem("onboarding_email", email);
        setEmail(""); setPassword(""); setFirstName(""); setLastName("");
        onClose();
        navigate("/email-verified");
      }
    }
  };

  return (
    <>
    <ResetEmailSentModal open={resetSent} email={email} onClose={() => setResetSent(false)} />
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] bg-card border-primary/20 p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold" htmlFor="auth-first">First Name</label>
                  <input id="auth-first" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass} placeholder="First name" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold" htmlFor="auth-last">Last Name</label>
                  <input id="auth-last" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                    className={inputClass} placeholder="Last name" required />
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" htmlFor="auth-email">Email</label>
              <input id="auth-email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                className={inputClass}
                placeholder="you@university.edu" required />
              {emailTouched && email && !emailValid && (
                <p className="text-xs text-destructive">Please enter a valid email address</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" htmlFor="auth-password">Password</label>
              <div className="relative">
                <input id="auth-password" type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} w-full pr-10`}
                  placeholder={mode === "signin" ? "Enter your password" : "Create a password"} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password checklist for signup */}
              {mode === "signup" && (
                <AnimatePresence>
                  {password.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1 space-y-1 overflow-hidden"
                    >
                      {passwordRules.map((rule, i) => {
                        const passed = rule.test(password);
                        return (
                          <li key={i} className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${passed ? "text-primary" : "text-muted-foreground"}`}>
                            {passed ? <Check size={12} className="shrink-0" /> : <span className="w-3 h-3 rounded-full border border-current shrink-0" />}
                            {rule.label}
                          </li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              )}
            </div>

            {mode === "signin" && (
              <button type="button" onClick={async () => {
                if (!email) { toast({ title: "Please enter your email first", variant: "destructive" }); return; }
                const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
                if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
                else { onClose(); setResetSent(true); }
              }} className="text-xs text-primary font-semibold self-end hover:underline">
                Forgot password?
              </button>
            )}

            <motion.button
              type="submit"
              disabled={loading || (mode === "signup" && !signupFormValid)}
              animate={mode === "signup" && signupFormValid ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={`h-12 rounded-lg font-bold text-sm shadow-lg mt-2 transition-all duration-300 ${
                mode === "signin" || signupFormValid
                  ? "bg-primary text-primary-foreground shadow-primary/20 hover:brightness-95"
                  : "bg-primary/40 text-primary-foreground/60 cursor-not-allowed"
              } disabled:opacity-50`}
            >
              {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
            </motion.button>

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
    </>
  );
};

export default AuthModal;
