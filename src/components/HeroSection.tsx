import { ArrowRight, ClipboardList, Sparkles } from "lucide-react";
import heroBuilding from "@/assets/hero-building.jpg";

const HeroSection = () => {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
              <Sparkles size={14} className="text-accent" />
              Join the University Pulse
            </div>
            <h1 className="font-display text-5xl md:text-6xl leading-tight text-foreground">
              Connect, Create, &{" "}
              <em className="text-accent">Compete</em> at VibeHub
            </h1>
            <p className="mt-6 max-w-lg text-body-text leading-relaxed">
              The ultimate university hub for Sports, Culture, and Entrepreneurship. Join a community that vibes with your passions and fuels your ambition.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#events" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90">
                Explore Events <ArrowRight size={16} />
              </a>
              <a href="#" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-secondary">
                Take the Test <ClipboardList size={16} />
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-xl">
              <img src={heroBuilding} alt="Cité des Métiers et des Compétences de la Région Casablanca-Settat" className="h-auto w-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground">
                  Cité des Métiers et des Compétences de la région Casablanca-Settat
                </p>
              </div>
            </div>
            <div className="absolute -bottom-6 left-6 rounded-xl bg-background p-4 shadow-lg">
              <span className="block text-3xl font-bold text-accent">2026</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Membership Open</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
