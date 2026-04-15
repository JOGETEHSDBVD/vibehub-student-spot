import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CountUp from "@/components/animations/CountUp";
import TiltCard from "@/components/animations/TiltCard";
import MagneticButton from "@/components/animations/MagneticButton";
import heroBuilding from "@/assets/hero-building.png";
import BentoGallery from "@/components/BentoGallery";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, MapPin, Rocket } from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  end_time: string | null;
  image_url: string | null;
  category: string | null;
  location: string | null;
  tags: string[] | null;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const Index = () => {
  const { t } = useTranslation();
  const [authMode, setAuthMode] = useState<"signin" | "signup" | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const ctaRef = useRef<HTMLElement>(null);

  const statsRef = useRef<HTMLElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-80px" });

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, description, date, end_time, image_url, category, location, tags")
        .eq("is_published", true)
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true });
      setEvents((data as EventItem[]) ?? []);
      setEventsLoading(false);
    };
    fetchEvents();
  }, []);

  const formatDateRange = (date: string, endTime: string | null) => {
    const start = new Date(date);
    if (endTime) {
      const end = new Date(endTime);
      if (start.getMonth() === end.getMonth()) {
        return `${start.toLocaleDateString("en-US", { month: "short" })} ${start.getDate()} – ${end.getDate()}`;
      }
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }
    return start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden scroll-smooth">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section ref={heroRef} className="relative w-full h-[520px] md:h-[600px] overflow-hidden">
          <motion.img
            src={heroBuilding}
            alt="Campus building"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ y: heroY }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/60 to-foreground/30" />
          <div className="absolute bottom-12 right-12 w-10 h-10 bg-primary/40 rounded-full hidden lg:block" />

          <div className="relative z-10 h-full flex items-center px-6 lg:px-20">
            <motion.div
              className="mx-auto max-w-[1200px] w-full"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                {t("hero.badge", { count: 249 })}
              </motion.div>
              <motion.h1 variants={fadeUp} className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.05] text-primary-foreground max-w-2xl">
                {t("hero.title")}{" "}
                <span className="italic text-primary">{t("hero.titleAccent")}</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-6 text-lg text-primary-foreground/80 max-w-md leading-relaxed">
                {t("hero.subtitle")}
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/events"
                  className="bg-foreground text-primary-foreground px-8 py-4 rounded-xl font-bold text-base hover:bg-foreground/90 transition-all"
                >
                  {t("hero.exploreSchedule")}
                </Link>
                <button
                  onClick={() => setAuthMode("signup")}
                  className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/30 text-primary-foreground px-8 py-4 rounded-xl font-bold text-base hover:bg-primary-foreground/20 transition-all"
                >
                  {t("hero.hostEvent")}
                </button>
              </motion.div>
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 60L1440 60L1440 30C1200 0 960 50 720 30C480 10 240 50 0 30L0 60Z" fill="hsl(var(--background))" />
            </svg>
          </div>
        </section>

        {/* Statistics Bar */}
        <section ref={statsRef} className="px-6 lg:px-20 py-12 bg-dark-bg">
          <div className="mx-auto max-w-[1200px] grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {[
              { end: 500, suffix: "+", label: t("stats.activeMembers") },
              { end: 25, suffix: "+", label: t("stats.annualEvents") },
              { end: 15, suffix: "+", label: t("stats.skillWorkshops") },
              { end: 2000, suffix: "+", label: t("stats.participants"), display: "2k+" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                className="flex flex-col items-center text-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
              >
                <span className="text-4xl font-black text-primary">
                  {statsInView ? (
                    stat.display ? (
                      <><CountUp end={2} suffix="k+" /></>
                    ) : (
                      <CountUp end={stat.end} suffix={stat.suffix} />
                    )
                  ) : (
                    "0"
                  )}
                </span>
                <p className="text-sm font-medium text-dark-bg-foreground uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CMC Moments Bento Gallery */}
        <BentoGallery />

        {/* Upcoming Events */}
        <section className="px-6 lg:px-20 pt-16 pb-20 bg-secondary/50">
          <div className="mx-auto max-w-[1200px]">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-display text-4xl md:text-5xl mb-2 text-foreground">{t("upcomingEvents.title")}</h2>
                <p className="text-muted-foreground">{t("upcomingEvents.subtitle")}</p>
              </div>
              <Link to="/events" className="hidden md:flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
                {t("upcomingEvents.viewAll")} <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            {eventsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="h-52 bg-muted animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-muted via-muted-foreground/5 to-muted rounded-t-2xl" />
                    <div className="p-6 space-y-3">
                      <div className="h-5 w-3/4 bg-muted animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-muted via-muted-foreground/5 to-muted rounded" />
                      <div className="h-3 w-1/2 bg-muted animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-muted via-muted-foreground/5 to-muted rounded" />
                      <div className="h-3 w-full bg-muted animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-muted via-muted-foreground/5 to-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-16">
                <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-muted-foreground">{t("upcomingEvents.noEvents")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {events.slice(0, 3).map((event, i) => (
                  <TiltCard key={event.id} className="flex flex-col rounded-2xl overflow-hidden border border-border bg-card group hover:shadow-lg transition-shadow">
                    <Link to={`/events/${event.id}`} className="flex flex-col flex-1">
                      <div className="h-52 overflow-hidden bg-muted">
                        {event.image_url ? (
                          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <h4 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors text-foreground">{event.title}</h4>
                        {event.location && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                            <MapPin size={12} />
                            {event.location}
                          </div>
                        )}
                        <p className="text-sm font-semibold text-primary mt-auto">
                          {formatDateRange(event.date, event.end_time)}
                        </p>
                        {event.tags && event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {event.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary px-2.5 py-1 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  </TiltCard>
                ))}
              </div>
            )}
            <Link to="/events" className="md:hidden flex items-center justify-center gap-2 mt-8 text-sm font-bold text-primary">
              {t("upcomingEvents.viewAll")} <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef} className="mx-6 lg:mx-20 my-16 rounded-3xl px-8 py-20 md:px-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-primary animate-cta-breathe" />
          <div className="relative mx-auto max-w-xl z-10">
            <Rocket className="mx-auto h-10 w-10 text-primary-foreground/80 mb-4" />
            <h2 className="font-display text-4xl md:text-5xl text-primary-foreground mb-4">{t("cta.title")}</h2>
            <p className="text-primary-foreground/80 text-lg leading-relaxed mb-8">
              {t("cta.subtitle")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <MagneticButton
                onClick={() => setAuthMode("signup")}
                className="bg-amber-400 text-foreground px-8 py-4 rounded-full font-bold text-base hover:bg-amber-300 transition-all"
              >
                {t("cta.becomeHost")}
              </MagneticButton>
              <Link
                to="/events"
                className="bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/30 text-primary-foreground px-8 py-4 rounded-full font-bold text-base hover:bg-primary-foreground/25 transition-all"
              >
                {t("cta.browseHandbook")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <AuthModal
        isOpen={authMode !== null}
        mode={authMode ?? "signup"}
        onClose={() => setAuthMode(null)}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />
    </div>
  );
};

export default Index;
