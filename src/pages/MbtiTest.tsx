import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  type Lang,
  questions,
  scaleLabels,
  uiText,
  scalableTitles,
  resultsText,
  traitDefinitions,
  adviceDb,
  combos,
  conflicts,
  TRAITS_ORDER,
  calculateScores,
  getLevel,
  getDnaCode,
  getRarity,
} from "@/data/mbtiData";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, Brain, RotateCcw } from "lucide-react";

const QUESTIONS_PER_PAGE = 5;

const MbtiTest = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"lang" | "test" | "result">("lang");
  const [lang, setLang] = useState<Lang>("en");
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const pageQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  const allPageAnswered = pageQuestions.every((q) => answers[q.id] !== undefined);
  const allAnswered = answeredCount === questions.length;

  const results = useMemo(() => {
    if (step !== "result") return null;
    const scores = calculateScores(answers);
    const levels: Record<string, string> = {};
    const traitResults = TRAITS_ORDER.map((trait) => {
      const lvl = getLevel(scores[trait]);
      levels[trait] = lvl;
      return {
        trait,
        traitLabel: scalableTitles[trait][lang],
        score: scores[trait],
        archetype: resultsText[trait][lvl][lang],
        definition: traitDefinitions[trait][lvl][lang],
      };
    });

    const dnaCode = getDnaCode(scores);
    const rarity = getRarity(scores);

    // Find conflict
    const conflict = conflicts.find((c) => c.cond(scores));

    // Find archetype combo (only if no conflict)
    let archetypeText: string | null = null;
    if (!conflict) {
      const combo = combos.find((c) => c.cond(scores));
      if (combo) {
        archetypeText = adviceDb[combo.name]?.[lang] ?? null;
      }
    }

    // Strategy blocks
    const strategyTitles: Record<Lang, string[]> = {
      en: ["Social Strategy", "Team Dynamics", "Execution Style", "Stress Response", "Innovation Approach"],
      fr: ["Stratégie Sociale", "Dynamique d'Équipe", "Style d'Exécution", "Réponse au Stress", "Approche de l'Innovation"],
      ar: ["الاستراتيجية الاجتماعية", "ديناميكية الفريق", "أسلوب التنفيذ", "الاستجابة للضغوط", "منهجية الابتكار"],
    };

    const strategies = TRAITS_ORDER.map((trait, idx) => ({
      title: strategyTitles[lang][idx],
      text: adviceDb[trait]?.[levels[trait]]?.[lang] ?? "",
    }));

    return { scores, traitResults, dnaCode, rarity, conflict, archetypeText, strategies };
  }, [step, answers, lang]);

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleRestart = () => {
    setStep("lang");
    setCurrentPage(0);
    setAnswers({});
  };

  // Language selection
  if (step === "lang") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-primary/5">
        <Navbar />
        <div className="flex items-center justify-center py-20 px-4">
          <div className="w-full max-w-lg bg-card rounded-2xl shadow-xl p-8 text-center">
            <div className="mx-auto mb-6 w-16 h-16 rounded-xl bg-primary flex items-center justify-center">
              <Brain className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Professional Personality Assessment</h1>
            <p className="text-muted-foreground mb-2 text-sm">50 questions · 5 dimensions · Deep psychological insights</p>
            <p className="text-muted-foreground mb-8 text-sm">
              Select your language to begin your professional personality analysis. This assessment reveals your strengths, hidden conflicts, and personal strategy.
            </p>

            <div className="space-y-3">
              {([
                { code: "en" as Lang, flag: "US", title: "Professional Personality Assessment", sub: "English" },
                { code: "fr" as Lang, flag: "FR", title: "Évaluation Professionnelle de Personnalité", sub: "Français" },
                { code: "ar" as Lang, flag: "MA", title: "التقييم المهني للشخصية", sub: "العربية" },
              ]).map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setStep("test"); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <span className="text-sm font-bold text-muted-foreground w-8">{l.flag}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{l.title}</p>
                    <p className="text-xs text-muted-foreground">{l.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Test questions
  if (step === "test") {
    const isLastPage = currentPage === totalPages - 1;
    const dir = lang === "ar" ? "rtl" : "ltr";

    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-primary/5" dir={dir}>
        <Navbar />
        <div className="max-w-2xl mx-auto py-10 px-4">
          <h1 className="text-2xl font-bold text-center text-foreground">{uiText[lang].title}</h1>
          <p className="text-center text-muted-foreground text-sm mb-6">
            {lang === "en" ? "Page" : lang === "fr" ? "Page" : "صفحة"} {currentPage + 1} {lang === "ar" ? "من" : lang === "fr" ? "sur" : "of"} {totalPages}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>{answeredCount} / {questions.length}</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="mb-8 h-2" />

          <div className="space-y-6">
            {pageQuestions.map((q, idx) => (
              <div key={q.id} className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <p className="font-medium text-foreground mb-4">
                  {currentPage * QUESTIONS_PER_PAGE + idx + 1}. {q[lang]}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleAnswer(q.id, val)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all min-w-[90px] ${
                        answers[q.id] === val
                          ? "bg-primary/10 text-primary border-primary shadow-sm"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {scaleLabels[val][lang]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 0}
            >
              {uiText[lang].back}
            </Button>

            {isLastPage ? (
              <Button
                onClick={() => setStep("result")}
                disabled={!allAnswered}
                className="bg-primary text-primary-foreground"
              >
                {uiText[lang].submit}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!allPageAnswered}
                className="bg-primary text-primary-foreground"
              >
                {uiText[lang].next}
              </Button>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Results
  if (step === "result" && results) {
    const dir = lang === "ar" ? "rtl" : "ltr";

    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-primary/5" dir={dir}>
        <Navbar />
        <div className="max-w-2xl mx-auto py-10 px-4">
          <h1 className="text-2xl font-bold text-center text-foreground mb-8">{uiText[lang].result_title}</h1>

          {/* DNA + Rarity */}
          <div className="bg-card rounded-xl border border-border p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{lang === "ar" ? "الشفرة الجينية" : "DNA Code"}</p>
              <p className="font-mono font-bold text-lg text-foreground">{results.dnaCode}</p>
            </div>
            <span
              className="px-3 py-1.5 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: results.rarity.color }}
            >
              {results.rarity.title}
            </span>
          </div>

          {/* Radar Chart (simple bar fallback) */}
          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <div className="space-y-4">
              {results.traitResults.map((t) => (
                <div key={t.trait}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm text-foreground">{t.traitLabel}</span>
                    <span className="text-xs font-medium text-muted-foreground">{t.score}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${t.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conflict or Archetype */}
          {results.conflict && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 mb-6">
              <p className="font-bold text-destructive mb-2">⚔️ Internal Conflict: {results.conflict.name}</p>
              <p className="text-sm text-foreground/80">{results.conflict.text[lang]}</p>
            </div>
          )}

          {results.archetypeText && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6">
              <p className="text-sm text-foreground/80">{results.archetypeText}</p>
            </div>
          )}

          {/* AI Strategy */}
          <h2 className="text-xl font-bold text-foreground mb-4">{uiText[lang].advice_title}</h2>
          <div className="space-y-4 mb-6">
            {results.strategies.map((s, idx) => (
              <div key={idx} className="bg-card rounded-xl border border-border border-l-4 border-l-primary p-5">
                <p className="font-bold text-foreground mb-2">📌 {s.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>

          {/* Trait Breakdown */}
          <div className="space-y-4 mb-8">
            {results.traitResults.map((t) => (
              <div key={t.trait} className="bg-card rounded-xl border border-border p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-foreground">{t.traitLabel}</h3>
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {t.archetype}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground italic mb-3">"{t.definition}"</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Score Analysis</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${t.score}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground">{t.score}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button onClick={handleRestart} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              {uiText[lang].restart}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return null;
};

export default MbtiTest;
