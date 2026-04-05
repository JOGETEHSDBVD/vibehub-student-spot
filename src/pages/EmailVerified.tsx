import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Mail, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logoCmc from "@/assets/logo-cmc.png";

const EmailVerified = () => {
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const { user, refreshSession, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const handledRef = useRef(false);

  const displayEmail = user?.email || localStorage.getItem("onboarding_email") || "";

  useEffect(() => {
    // Listen for auth state changes (fires when user clicks verification link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user?.email_confirmed_at && !handledRef.current) {
        handledRef.current = true;
        setVerified(true);
      }
    });

    // Also check immediately if user is already verified
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email_confirmed_at && !handledRef.current) {
        handledRef.current = true;
        setVerified(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleContinue = async () => {
    // Refresh session to get latest user state
    await refreshSession();
    const latestProfile = await refreshProfile();
    localStorage.removeItem("onboarding_email");

    if (latestProfile?.member_type) {
      navigate("/", { replace: true });
    } else {
      navigate("/onboarding", { replace: true });
    }
  };

  const handleResendEmail = async () => {
    const email = user?.email || localStorage.getItem("onboarding_email");
    if (!email) {
      toast({ title: "Erreur", description: "Adresse email introuvable.", variant: "destructive" });
      return;
    }
    setResending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email envoyé !", description: "Un nouvel email de vérification a été envoyé." });
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--dark-bg))] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(174,72%,40%,0.08),transparent_70%)]" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        <img src={logoCmc} alt="CMC" className="h-12 w-auto mb-10 opacity-90" />

        <div className={`flex h-20 w-20 items-center justify-center rounded-full mb-6 transition-all duration-700 ${verified ? "bg-primary/20" : "bg-primary/15"}`}>
          {verified ? (
            <CheckCircle className="h-10 w-10 text-primary animate-in fade-in zoom-in duration-500" />
          ) : (
            <Mail className="h-10 w-10 text-primary" />
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-[hsl(var(--dark-bg-foreground))] mb-3 transition-all duration-500">
          {verified ? "Email vérifié !" : "Vérifiez votre email"}
        </h1>

        {verified ? (
          <>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              Votre email est confirmé. Finalisez votre profil pour accéder à la plateforme.
            </p>
            <button
              onClick={handleContinue}
              className="px-8 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              Continuer
            </button>
          </>
        ) : (
          <>
            <p className="text-muted-foreground text-sm leading-relaxed mb-2">
              Un email de vérification a été envoyé à
            </p>
            <p className="text-primary font-medium text-sm mb-6">{displayEmail}</p>
            <p className="text-muted-foreground text-xs leading-relaxed mb-8">
              Cliquez sur le lien dans l'email pour activer votre compte. Vérifiez votre dossier spam si vous ne le trouvez pas.
            </p>
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="px-8 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Retour à l'accueil
              </button>
              <button
                onClick={handleResendEmail}
                disabled={resending}
                className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium text-muted-foreground border border-muted-foreground/30 hover:bg-muted-foreground/10 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={14} className={resending ? "animate-spin" : ""} />
                {resending ? "Envoi en cours..." : "Renvoyer l'email"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerified;
