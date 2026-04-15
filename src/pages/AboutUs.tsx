import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Palette, Dumbbell, Lightbulb } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FadeIn = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

const pillars = [
  { icon: Palette, title: "Cultural", text: "Broadening intellectual depth and global perspectives." },
  { icon: Dumbbell, title: "Athletic", text: "Building unyielding discipline, resilience, and physical capability." },
  { icon: Lightbulb, title: "Entrepreneurial", text: "Translating raw ideas into scalable, real-world realities." },
];

const AboutUs = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* Hero */}
    <section className="pt-32 pb-16 text-center px-6">
      <FadeIn>
        <span className="text-primary text-sm font-bold uppercase tracking-[0.3em]">About Us</span>
        <h1 className="mt-4 font-display text-4xl md:text-6xl text-foreground leading-tight">
          Built for Builders
        </h1>
        <p className="mt-4 text-muted-foreground max-w-lg mx-auto text-lg">
          A clean system for people who want to get things done.
        </p>
      </FadeIn>
    </section>

    {/* Our Story — text left, image right */}
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <span className="text-primary text-xs font-bold uppercase tracking-[0.3em]">01</span>
          <h2 className="mt-3 font-display text-3xl md:text-4xl text-foreground">Our Story</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed text-base">
            We noticed a gap. People have the drive to build, connect, and grow, but the tools we use to organize ourselves are often chaotic. VibeHub was created as a clean, centralized space to bring ideas and people together without the friction. It is a reliable system that makes collaboration smooth and effortless.
          </p>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="w-full aspect-[4/3] rounded-2xl bg-muted flex items-center justify-center">
            <span className="text-muted-foreground/40 text-sm">Image placeholder</span>
          </div>
        </FadeIn>
      </div>
    </section>

    {/* The Big Five — image left, text right */}
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div className="w-full aspect-[4/3] rounded-2xl bg-muted flex items-center justify-center">
            <span className="text-muted-foreground/40 text-sm">Image placeholder</span>
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <span className="text-primary text-xs font-bold uppercase tracking-[0.3em]">02</span>
          <h2 className="mt-3 font-display text-3xl md:text-4xl text-foreground">The Big Five</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed text-base">
            We integrated the Big Five personality model because we believe in the power of self-awareness. It maps how you naturally approach challenges. We use this data to help you navigate, pointing you toward the projects, roles, and teams that naturally fit how you operate.
          </p>
        </FadeIn>
      </div>
    </section>

    {/* The Pillars — 3-column grid */}
    <section className="max-w-5xl mx-auto px-6 py-20">
      <FadeIn className="text-center mb-14">
        <span className="text-primary text-xs font-bold uppercase tracking-[0.3em]">03</span>
        <h2 className="mt-3 font-display text-3xl md:text-4xl text-foreground">The Pillars</h2>
      </FadeIn>
      <div className="grid md:grid-cols-3 gap-8">
        {pillars.map((p, i) => (
          <FadeIn key={p.title} delay={i * 0.1} className="text-center p-8 rounded-2xl border border-border bg-card">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-5">
              <p.icon size={28} />
            </div>
            <h3 className="font-display text-xl text-foreground">{p.title}</h3>
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{p.text}</p>
          </FadeIn>
        ))}
      </div>
    </section>

    {/* Our Vision — centered */}
    <section className="max-w-3xl mx-auto px-6 py-28 text-center">
      <FadeIn>
        <span className="text-primary text-xs font-bold uppercase tracking-[0.3em]">04</span>
        <h2 className="mt-3 font-display text-3xl md:text-4xl text-foreground">Our Vision</h2>
        <p className="mt-8 text-muted-foreground leading-relaxed text-base md:text-lg">
          Our vision is strictly practical: to provide a clean, centralized infrastructure for real-world execution. We use behavioral data to align individuals with the right teams and projects, eliminating friction and wasted effort. We built a system where the focus remains entirely on getting the work done.
        </p>
      </FadeIn>
    </section>

    <Footer />
  </div>
);

export default AboutUs;
