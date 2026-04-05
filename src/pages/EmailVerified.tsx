import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import logoCmc from "@/assets/logo-cmc.png";

const EmailVerified = () => {
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savePendingOnboarding = async (userId: string) => {
      const raw = localStorage.getItem("onboarding_data");
      if (!raw) return;
      try {
        const data = JSON.parse(raw);
        setSaving(true);
        await supabase.rpc("update_own_profile", {
          _member_type: data.member_type,
          _pole: data.pole,
          _filiere: data.filiere,
        });
        localStorage.removeItem("onboarding_data");
        localStorage.removeItem("onboarding_email");
        await refreshProfile();
      } catch {
        // silent
      } finally {
        setSaving(false);
      }
    };

    if (user) {
      savePendingOnboarding(user.id).then(() => {
        setVerified(true);
        setProfileReady(true);
      });
    } else {
      const hasPendingOnboarding = !!localStorage.getItem("onboarding_data");
      if (hasPendingOnboarding) return;

      const timer = setTimeout(() => setVerified(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleAccessPlatform = async () => {
    // Ensure profile is fresh before navigating so the guard doesn't redirect
    if (user) {
      await refreshProfile();
    }
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--dark-bg))] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(174,72%,40%,0.08),transparent_70%)]" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        <img src={logoCmc} alt="CMC" className="h-12 w-auto mb-10 opacity-90" />

        <div className={`flex h-20 w-20 items-center justify-center rounded-full mb-6 transition-all duration-700 ${verified ? "bg-primary/20" : "bg-muted-foreground/10"}`}>
          {verified ? (
            <CheckCircle className="h-10 w-10 text-primary animate-in fade-in zoom-in duration-500" />
          ) : (
            <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-[hsl(var(--dark-bg-foreground))] mb-3 transition-all duration-500">
          {verified ? "Email vérifié !" : "Vérification en cours..."}
        </h1>

        <p className="text-muted-foreground text-sm leading-relaxed mb-8 transition-all duration-500">
          {verified
            ? "Votre compte est maintenant actif. Bienvenue sur la plateforme !"
            : "Merci de patienter quelques instants pendant que nous vérifions votre email..."}
        </p>

        {verified && (
            <button
              onClick={() => navigate("/", { replace: true })}
              className="px-8 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              Accéder à la plateforme
            </button>
          )}
      </div>
    </div>
  );
};

export default EmailVerified;
