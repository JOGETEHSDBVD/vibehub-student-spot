import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { questions, scaleLabels, traitLabels, QUESTIONS_PER_PAGE, TOTAL_PAGES } from "@/data/mbtiQuestions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, Send, Loader2, RotateCcw, Brain } from "lucide-react";

const API_URL = "https://your-flask-backend.com/api/personality-test";

interface TraitResult {
  trait: string;
  score: number;
  scientific_name: string;
  desc: string;
  definition: string;
}

interface TestResults {
  results: TraitResult[];
  rarity_title: string;
  rarity_color: string;
  dna_code: string;
  archetype_html: string;
  conflicts: string[];
  ai_report: string[];
}

const MBTITest = () => {
  const [started, setStarted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResults | null>(null);

  const currentQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );

  const allCurrentAnswered = currentQuestions.every((q) => answers[q.id] !== undefined);
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);
  const progressPercent = (Object.keys(answers).length / questions.length) * 100;

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const body = { answers };
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResults(data);
    } catch {
      // Fallback: calculate locally for demo
      const scores: Record<string, number> = {};
      const counts: Record<string, number> = {};
      for (const q of questions) {
        if (!scores[q.trait]) { scores[q.trait] = 0; counts[q.trait] = 0; }
        let val = answers[q.id] || 3;
        if (q.key === "-") val = 6 - val;
        scores[q.trait] += val;
        counts[q.trait] += 1;
      }
      const finalScores: Record<string, number> = {};
      for (const t in scores) {
        finalScores[t] = Math.round((scores[t] / (counts[t] * 5)) * 100);
      }

      const mockResults: TraitResult[] = Object.entries(finalScores).map(([trait, score]) => ({
        trait: traitLabels[trait] || trait,
        score,
        scientific_name: traitLabels[trait] || trait,
        desc: score >= 66 ? "Score élevé" : score <= 33 ? "Score bas" : "Score moyen",
        definition: "",
      }));

      const totalDev = Object.values(finalScores).reduce((sum, s) => sum + Math.abs(s - 50), 0);
      let rarityTitle = "👤 Common (Balanced)";
      let rarityColor = "hsl(var(--muted-foreground))";
      if (totalDev > 150) { rarityTitle = "🦄 Mythic Rare (Top 0.1%)"; rarityColor = "#7C3AED"; }
      else if (totalDev > 100) { rarityTitle = "💎 Ultra Rare (Top 5%)"; rarityColor = "#2563EB"; }
      else if (totalDev > 60) { rarityTitle = "✨ Rare (Top 15%)"; rarityColor = "#059669"; }

      setResults({
        results: mockResults,
        rarity_title: rarityTitle,
        rarity_color: rarityColor,
        dna_code: Object.keys(finalScores).map((t) => finalScores[t] >= 66 ? "H" : finalScores[t] <= 33 ? "L" : "M").join("-"),
        archetype_html: "",
        conflicts: [],
        ai_report: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setStarted(false);
    setCurrentPage(0);
    setAnswers({});
    setResults(null);
  };

  // Start screen
  if (!started && !results) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Brain className="h-12 w-12 text-primary" />
          </div>
          <h1 className="font-display text-4xl font-black text-foreground md:text-5xl">
            Test de Personnalité
          </h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            Découvrez votre profil professionnel à travers 50 questions basées sur le modèle Big Five (IPIP-50).
          </p>
          <Button onClick={() => setStarted(true)} size="lg" className="mt-8 rounded-full px-10 text-lg">
            Commencer le test
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Results screen
  if (results) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="font-display text-3xl font-black text-foreground text-center mb-2">
            Votre Profil Professionnel
          </h1>

          {/* Rarity & DNA */}
          <Card className="mb-8 overflow-hidden">
            <div className="p-6" style={{ borderLeft: `5px solid ${results.rarity_color}` }}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Rareté</p>
                  <p className="text-xl font-bold text-foreground">{results.rarity_title}</p>
                </div>
                <div className="rounded-lg bg-muted px-4 py-2">
                  <p className="text-xs text-muted-foreground">ADN Psychologique</p>
                  <p className="font-mono text-lg font-bold text-foreground">{results.dna_code}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Trait Scores */}
          <div className="space-y-4 mb-8">
            {results.results.map((r) => (
              <Card key={r.trait} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-foreground">{r.trait}</p>
                    <span className="text-sm font-bold text-primary">{r.score}%</span>
                  </div>
                  <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${r.score}%` }}
                    />
                  </div>
                  {r.desc && (
                    <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button onClick={handleRestart} variant="outline" className="rounded-full gap-2">
              <RotateCcw size={16} /> Refaire le test
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Questionnaire
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-muted-foreground">
              Page {currentPage + 1} / {TOTAL_PAGES}
            </span>
            <span className="text-sm font-semibold text-primary">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {currentQuestions.map((q, idx) => (
            <Card key={q.id} className="border-border/60">
              <CardContent className="p-6">
                <p className="mb-4 text-base font-medium text-foreground">
                  <span className="text-primary font-bold mr-2">{q.id}.</span>
                  {q.text}
                </p>
                <RadioGroup
                  value={answers[q.id]?.toString()}
                  onValueChange={(val) => handleAnswer(q.id, parseInt(val))}
                  className="flex flex-wrap gap-3"
                >
                  {scaleLabels.map((s) => (
                    <label
                      key={s.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-all ${
                        answers[q.id] === s.value
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <RadioGroupItem value={s.value.toString()} className="sr-only" />
                      {s.label}
                    </label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 0}
            className="gap-2 rounded-full"
          >
            <ArrowLeft size={16} /> Retour
          </Button>

          {currentPage < TOTAL_PAGES - 1 ? (
            <Button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!allCurrentAnswered}
              className="gap-2 rounded-full"
            >
              Suivant <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || loading}
              className="gap-2 rounded-full"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Analyse...</>
              ) : (
                <><Send size={16} /> Générer le rapport</>
              )}
            </Button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MBTITest;
