import { Mail, X, Sparkles } from "lucide-react";

interface Props {
  open: boolean;
  email: string;
  onClose: () => void;
}

const ResetEmailSentModal = ({ open, email, onClose }: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl border border-primary/30 bg-card p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative gradient background */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors z-10">
          <X size={20} />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center space-y-5">
          {/* Animated icon */}
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 ring-4 ring-primary/10">
              <Mail className="h-9 w-9 text-primary animate-in fade-in zoom-in duration-500" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Check Your Email
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We've sent a password reset link to
            </p>
          </div>

          {/* Email badge */}
          <div className="w-full px-4 py-3 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-sm font-semibold text-primary truncate">{email}</p>
          </div>

          {/* Instructions */}
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
            Click the link in the email to reset your password. Don't forget to check your spam folder!
          </p>

          {/* CTA */}
          <button
            onClick={onClose}
            className="w-full mt-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetEmailSentModal;
