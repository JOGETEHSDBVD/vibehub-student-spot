import { useState, useMemo } from "react";
import { X, Eye, EyeOff, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "At least 1 uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "At least 1 lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "At least 1 number", test: (p: string) => /\d/.test(p) },
  { label: "At least 1 special character (!@#$%^&*)", test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

const JoinModal = ({ open, onClose, onSwitchToSignIn }: Props) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const allPasswordValid = useMemo(() => passwordRules.every((r) => r.test(password)), [password]);
  const formValid = firstName.trim() && lastName.trim() && emailValid && allPasswordValid;

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) return;
    setLoading(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      toast({ title: "Sign up failed", description: error, variant: "destructive" });
    } else {
      toast({ title: "Compte créé !", description: "Complétez votre profil pour continuer." });
      setFirstName(""); setLastName(""); setEmail(""); setPassword("");
      onClose();
      navigate("/onboarding");
    }
  };

  const inputBase = "w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md rounded-2xl border border-primary/30 bg-background p-8 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"><X size={20} /></button>

        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary font-bold text-sm">HL</div>
          <span className="text-lg font-bold text-foreground">VibeHub</span>
        </div>

        <h2 className="text-2xl font-bold text-foreground">Join the Club</h2>
        <p className="mt-1 text-sm text-muted-foreground">Create your account and start vibing</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* Name fields - 2 col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className={inputBase} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className={inputBase} required />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder="you@university.edu"
              className={inputBase}
              required
            />
            {emailTouched && email && !emailValid && (
              <p className="mt-1 text-xs text-destructive">Please enter a valid email address</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className={`${inputBase} pr-10`}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password checklist */}
            <AnimatePresence>
              {password.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 space-y-1 overflow-hidden"
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
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading || !formValid}
            animate={formValid ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-all duration-300 ${
              formValid
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                : "bg-primary/40 text-primary-foreground/60 cursor-not-allowed"
            }`}
          >
            {loading ? "Creating account..." : "Create Account"}
          </motion.button>
        </form>

        <div className="my-5 flex items-center gap-3"><div className="h-px flex-1 bg-border" /><span className="text-xs text-muted-foreground">or continue with</span><div className="h-px flex-1 bg-border" /></div>

        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-secondary">
          <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
          Google
        </button>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button onClick={onSwitchToSignIn} className="font-medium text-primary hover:underline">Sign in</button>
        </p>
      </motion.div>
    </div>
  );
};

export default JoinModal;
