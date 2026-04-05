import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
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
  { id: "agroalimentaire", label: "🍽️ Agroalimentaire / Industrie Alimentaire", filieres: ["Transformation alimentaire", "Contrôle qualité alimentaire"] },
  { id: "genie_mecanique", label: "⚙️ Génie Mécanique", filieres: ["Fabrication mécanique", "Construction métallique", "Usinage"] },
  { id: "electricite_auto", label: "⚡ Électricité & Automatisation", filieres: ["Électricité de maintenance", "Automatisation industrielle", "Froid et climatisation"] },
  { id: "genie_energetique", label: "🔋 Génie Énergétique", filieres: ["Énergie renouvelable", "Thermique industrielle", "Efficacité énergétique"] },
];

const ROLES = [
  { id: "1ere_annee", label: "1ère Année" },
  { id: "2eme_annee", label: "2ème Année" },
  { id: "administration", label: "Administration" },
  { id: "trainer", label: "Formateur" },
];

type Step = "role" | "pole" | "filiere";

const Onboarding = () => {
  const [step, setStep] = useState<Step>("role");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedPole, setSelectedPole] = useState<string | null>(null);
  const [selectedFiliere, setSelectedFiliere] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const needsPole = selectedRole === "1ere_annee" || selectedRole === "2eme_annee" || selectedRole === "trainer";
  const needsFiliere = selectedRole === "2eme_annee";

  const handleNext = async () => {
    if (step === "role") {
      if (!selectedRole) return;
      if (needsPole) {
        setStep("pole");
      } else {
        await saveProfile();
      }
    } else if (step === "pole") {
      if (!selectedPole) return;
      if (needsFiliere) {
        setStep("filiere");
      } else {
        await saveProfile();
      }
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

    if (!user) {
      toast({ title: "Erreur", description: "Vous devez être connecté.", variant: "destructive" });
      setSaving(false);
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
      await refreshProfile();
      navigate("/", { replace: true });
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

  const stepNumber = step === "role" ? 1 : step === "pole" ? 2 : step === "filiere" ? 3 : 1;
  const totalSteps = needsFiliere ? 3 : needsPole ? 2 : 1;

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
            {saving ? "Enregistrement..." : step === "filiere" || (step === "pole" && !needsFiliere) || !needsPole ? "Terminer" : "Suivant"}
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
