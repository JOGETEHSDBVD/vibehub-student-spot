import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import logoCmc from "@/assets/logo-cmc.png";

const EmailVerified = () => {
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const savedRef = useRef(false);

  useEffect(() => {
    // Listen for auth state change — this fires reliably after hash token exchange
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user?.email_confirmed_at && !savedRef.current) {
        savedRef.current = true;
        setSaving(true);

        // Save pending onboarding data via RPC now that we have a valid session
        const raw = localStorage.getItem("onboarding_data");
        if (raw) {
          try {
            const data = JSON.parse(raw);
            const { error } = await supabase.rpc("update_own_profile", {
              _member_type: data.member_type,
              _pole: data.pole,
              _filiere: data.filiere,
            });
            if (!error) {
              localStorage.removeItem("onboarding_data");
              localStorage.removeItem("onboarding_email");
            }
          } catch {
            // silent
          }
        }

        await refreshProfile();
        setSaving(false);
        setVerified(true);
      }
    });

    // Fallback: if no auth event fires within 4s (e.g., user already verified),
    // show verified state anyway
    const fallback = setTimeout(() => {
      if (!savedRef.current) {
        savedRef.current = true;
        setVerified(true);
      }
    }, 4000);

    // Also check immediately if user is already authenticated
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.email_confirmed_at && !savedRef.current) {
        savedRef.current = true;
        setSaving(true);

        const raw = localStorage.getItem("onboarding_data");
        if (raw) {
          try {
            const data = JSON.parse(raw);
            const { error } = await supabase.rpc("update_own_profile", {
              _member_type: data.member_type,
              _pole: data.pole,
              _filiere: data.filiere,
            });
            if (!error) {
              localStorage.removeItem("onboarding_data");
              localStorage.removeItem("onboarding_email");
            }
          } catch {
            // silent
          }
        }

        await refreshProfile();
        setSaving(false);
        setVerified(true);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallback);
    };
  }, [refreshProfile]);

  const handleAccessPlatform = async () => {
    // Try one more time to save pending data if it still exists
    const raw = localStorage.getItem("onboarding_data");
    if (raw) {
      try {
        const data = JSON.parse(raw);
        await supabase.rpc("update_own_profile", {
          _member_type: data.member_type,
          _pole: data.pole,
          _filiere: data.filiere,
        });
        localStorage.removeItem("onboarding_data");
        localStorage.removeItem("onboarding_email");
      } catch {
        // silent
      }
    }

    const latestProfile = await refreshProfile();

    // If profile has member_type → home, otherwise → onboarding
    if (latestProfile?.member_type) {
      navigate("/", { replace: true });
    } else {
      navigate("/onboarding", { replace: true });
    }
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
              onClick={handleAccessPlatform}
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
