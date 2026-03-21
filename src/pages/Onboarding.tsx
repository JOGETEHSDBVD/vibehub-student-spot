import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Mail, RefreshCw, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoCmc from "@/assets/logo-cmc.png";

const POLES = [
  { id: "digital", label: "💻 Digital & Développement informatique", filieres: ["Infrastructure digitale", "Réseaux informatiques", "Intelligence Artificielle"] },
  { id: "industrie", label: "🏭 Industrie", filieres: ["Maintenance industrielle", "Électricité industrielle", "Électromécanique", "Génie industriel"] },
  { id: "gestion", label: "💼 Gestion & Commerce", filieres: ["Gestion des entreprises", "Commerce / vente", "Comptabilité"] },
  { id: "tourisme", label: "🏨 Tourisme & Hôtellerie", filieres: ["Réception d'hôtel", "Cuisine", "Service restauration"] },
  { id: "agriculture", label: "🌾 Agriculture", filieres: ["Production agricole", "Agroalimentaire"] },
  { id: "services", label: "👨‍👩‍👧‍👦 Services à la personne", filieres: ["Petite enfance", "Aide sociale", "Services à domicile"] },
  { id: "btp", label: "🏗️ BTP", filieres: ["Dessin bâtiment", "Construction", "Topographie"] },
];

const ROLES = [
  { id: "1ere_annee", label: "1ère Année" },
  { id: "2eme_annee", label: "2ème Année" },
  { id: "administration", label: "Administration" },
  { id: "trainer", label: "Formateur" },
];

type Step = "role" | "pole" | "filiere" | "verify-email";

const Onboarding = () => {
  const [step, setStep] = useState<Step>("role");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedPole, setSelectedPole] = useState<string | null>(null);
  const [selectedFiliere, setSelectedFiliere] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const [signupEmail, setSignupEmail] = useState<string | null>(null);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isStudent = selectedRole === "1ere_annee" || selectedRole === "2eme_annee";

  // Listen for email confirmation while on verify-email step
  useEffect(() => {
    if (step !== "verify-email") return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user?.email_confirmed_at) {
        // Save pending onboarding data
        const raw = localStorage.getItem("onboarding_data");
        if (raw) {
          try {
            const data = JSON.parse(raw);
            supabase.rpc("update_own_profile", {
              _member_type: data.member_type,
              _pole: data.pole,
              _filiere: data.filiere,
            }).then(() => {
              localStorage.removeItem("onboarding_data");
              refreshProfile();
            });
          } catch {}
        }
        setEmailConfirmed(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [step]);

  const handleNext = async () => {
    if (step === "role") {
      if (!selectedRole) return;
      if (isStudent) {
        setStep("pole");
      } else {
        await saveProfile();
      }
    } else if (step === "pole") {
      if (!selectedPole) return;
      setStep("filiere");
    } else if (step === "filiere") {
      if (!selectedFiliere) return;
      await saveProfile();
    }
  };

  const handleBack = () => {
    if (step === "filiere") {
      setSelectedFiliere(null);
      setStep("pole");
    } else if (step === "pole") {
      setSelectedPole(null);
      setStep("role");
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    const pole = selectedPole ? POLES.find(p => p.id === selectedPole) : null;
    const onboardingData = {
      member_type: selectedRole,
      pole: pole?.label ?? null,
      filiere: selectedFiliere ?? null,
    };
    localStorage.setItem("onboarding_data", JSON.stringify(onboardingData));

    // Capture the email for the verify screen
    const storedEmail = localStorage.getItem("onboarding_email");
    if (storedEmail) setSignupEmail(storedEmail);

    if (!user) {
      setSaving(false);
      setStep("verify-email");
      return;
    }
    const { error } = await supabase.rpc("update_own_profile", {
      _member_type: selectedRole,
      _pole: pole?.label ?? null,
      _filiere: selectedFiliere ?? null,
    });

    setSaving(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      localStorage.removeItem("onboarding_data");
      refreshProfile();
      setStep("verify-email");
    }
  };

  const handleResendEmail = async () => {
    const email = signupEmail || user?.email || localStorage.getItem("onboarding_email");
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

  const currentFilieres = selectedPole
    ? POLES.find(p => p.id === selectedPole)?.filieres ?? []
    : [];

  const canProceed =
    (step === "role" && selectedRole) ||
    (step === "pole" && selectedPole) ||
    (step === "filiere" && selectedFiliere);

  const stepTitle = {
    role: "Quel est votre statut ?",
    pole: "Choisissez votre pôle",
    filiere: "Choisissez votre filière",
    "verify-email": "",
  };

  const stepNumber = step === "role" ? 1 : step === "pole" ? 2 : 3;
  const totalSteps = isStudent ? 3 : 1;

  if (step === "verify-email") {
    const displayEmail = signupEmail || user?.email || localStorage.getItem("onboarding_email") || "";
    return (
      <div className="min-h-screen bg-[hsl(var(--dark-bg))] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(174,72%,40%,0.08),transparent_70%)]" />
        <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
          <img src={logoCmc} alt="CMC" className="h-12 w-auto mb-10 opacity-90" />

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 mb-6">
            <Mail className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-[hsl(var(--dark-bg-foreground))] mb-3">
            Vérifiez votre email
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-2">
            Un email de vérification a été envoyé à
          </p>
          <p className="text-primary font-medium text-sm mb-6">
            {displayEmail}
          </p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--dark-bg))] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(174,72%,40%,0.08),transparent_70%)]" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        <img src={logoCmc} alt="CMC" className="h-12 w-auto mb-12 opacity-90" />

        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i + 1 <= stepNumber ? "w-8 bg-primary" : "w-8 bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-[hsl(var(--dark-bg-foreground))] text-center mb-2">
          {stepTitle[step]}
        </h1>
        <p className="text-muted-foreground text-sm mb-10 text-center">
          {step === "role" && "Cela nous aide à personnaliser votre expérience"}
          {step === "pole" && "Sélectionnez le domaine qui correspond à votre formation"}
          {step === "filiere" && "Précisez votre spécialité"}
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {step === "role" &&
            ROLES.map((role) => (
              <OptionChip
                key={role.id}
                label={role.label}
                selected={selectedRole === role.id}
                onClick={() => setSelectedRole(role.id)}
              />
            ))}
          {step === "pole" &&
            POLES.map((pole) => (
              <OptionChip
                key={pole.id}
                label={pole.label}
                selected={selectedPole === pole.id}
                onClick={() => setSelectedPole(pole.id)}
              />
            ))}
          {step === "filiere" &&
            currentFilieres.map((f) => (
              <OptionChip
                key={f}
                label={f}
                selected={selectedFiliere === f}
                onClick={() => setSelectedFiliere(f)}
              />
            ))}
        </div>

        <div className="flex items-center gap-3">
          {step !== "role" && (
            <button
              onClick={handleBack}
              className="px-6 py-2.5 rounded-full text-sm font-medium text-[hsl(var(--dark-bg-foreground))] border border-muted-foreground/30 hover:bg-muted-foreground/10 transition-colors"
            >
              Retour
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed || saving}
            className="px-8 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Enregistrement..." : step === "filiere" || !isStudent ? "Terminer" : "Suivant"}
          </button>
        </div>
      </div>
    </div>
  );
};

const OptionChip = ({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
      selected
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
        : "bg-muted-foreground/15 text-[hsl(var(--dark-bg-foreground))] hover:bg-muted-foreground/25"
    }`}
  >
    {selected && <Check size={16} />}
    {label}
  </button>
);

export default Onboarding;
