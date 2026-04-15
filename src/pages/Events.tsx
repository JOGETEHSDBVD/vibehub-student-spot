import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, ChevronRight, User, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface PublicEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  image_url: string | null;
  category: string | null;
  tags: string[] | null;
  created_by: string | null;
}

interface CreatorProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

const EVENTS_PER_PAGE = 9;

const CATEGORIES = ["All", "Hackathon", "Workshop", "Social", "Conference", "Sport"];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const reveal = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const Events = () => {
  const { t } = useTranslation();
  const [upcomingEvents, setUpcomingEvents] = useState<PublicEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<PublicEvent[]>([]);
  const [creators, setCreators] = useState<Record<string, CreatorProfile>>({});
  const [loading, setLoading] = useState(true);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    const fetchEvents = async () => {
      const now = new Date().toISOString();

      const [{ data: upcoming }, { data: past }] = await Promise.all([
        supabase
          .from("events")
          .select("id, title, description, date, location, image_url, category, tags, created_by")
          .eq("is_published", true)
          .gte("date", now)
          .order("date", { ascending: true }),
        supabase
          .from("events")
          .select("id, title, description, date, location, image_url, category, tags, created_by")
          .eq("is_published", true)
          .lt("date", now)
          .order("date", { ascending: false }),
      ]);

      const allEvents = [...(upcoming ?? []), ...(past ?? [])] as PublicEvent[];
      setUpcomingEvents((upcoming as PublicEvent[]) ?? []);
      setPastEvents((past as PublicEvent[]) ?? []);

      const creatorIds = [...new Set(allEvents.map((e) => e.created_by).filter(Boolean))] as string[];
      if (creatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", creatorIds);
        const map: Record<string, CreatorProfile> = {};
        (profiles ?? []).forEach((p: any) => { map[p.id] = p; });
        setCreators(map);
      }

      setLoading(false);
    };
    fetchEvents();
  }, []);

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
      month: d.toLocaleDateString("en-US", { month: "short" }),
      day: d.getDate(),
      year: d.getFullYear(),
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
  };

  const filterEvents = (events: PublicEvent[]) => {
    if (selectedCategory === "All") return events;
    return events.filter(
      (e) => e.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  };

  const filteredUpcoming = filterEvents(upcomingEvents);
  const filteredPast = filterEvents(pastEvents);

  const upcomingTotalPages = Math.ceil(filteredUpcoming.length / EVENTS_PER_PAGE);
  const pastTotalPages = Math.ceil(filteredPast.length / EVENTS_PER_PAGE);
  const paginatedUpcoming = filteredUpcoming.slice((upcomingPage - 1) * EVENTS_PER_PAGE, upcomingPage * EVENTS_PER_PAGE);
  const paginatedPast = filteredPast.slice((pastPage - 1) * EVENTS_PER_PAGE, pastPage * EVENTS_PER_PAGE);

  useEffect(() => {
    setUpcomingPage(1);
    setPastPage(1);
  }, [selectedCategory]);

  const isPast = (e: PublicEvent) => new Date(e.date) < new Date();

  const renderEventCard = (e: PublicEvent) => {
    const dt = formatDateShort(e.date);
    const creator = e.created_by ? creators[e.created_by] : null;
    const eventIsPast = isPast(e);

    return (
      <motion.div
        key={e.id}
        layout
        variants={fadeUp}
        className="group block relative"
      >
        <Link to={eventIsPast ? `/events/past/${e.id}` : `/events/${e.id}`} className="block">
          <div className="overflow-hidden rounded-none aspect-[4/3] relative">
            {e.image_url ? (
              <img
                src={e.image_url}
                alt={e.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-dark-bg-foreground/10 flex items-center justify-center">
                <CalendarDays className="h-10 w-10 text-dark-bg-foreground/20" />
              </div>
            )}

          </div>

          <div className="mt-3 space-y-1">
            <h3 className="text-base font-bold text-dark-bg-foreground group-hover:text-primary transition-colors">
              {e.title}
            </h3>
            {e.location && (
              <p className="text-sm text-dark-bg-foreground/50 flex items-center gap-1">
                <MapPin size={13} className="shrink-0" />
                {e.location}
              </p>
            )}
            <p className="text-sm font-semibold">
              <span className="text-primary">
                {dt.weekday}, {dt.month} {dt.day}
              </span>
              <span className="text-primary"> | {dt.time}</span>
            </p>

            {e.tags && e.tags.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-1.5">
                {e.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-dark-bg-foreground/20 px-2.5 py-0.5 text-[11px] font-medium uppercase text-dark-bg-foreground/60">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>

        {creator && (
          <Link
            to={`/organizer/${creator.id}`}
            className="mt-3 flex items-center gap-2 group/creator"
            onClick={(ev) => ev.stopPropagation()}
          >
            {creator.avatar_url ? (
              <img
                src={creator.avatar_url}
                alt=""
                className="h-7 w-7 rounded-full object-cover border border-dark-bg-foreground/20 group-hover:border-primary group-hover:shadow-[0_0_8px_hsl(var(--primary)/0.4)] transition-all duration-300"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center border border-dark-bg-foreground/20 group-hover:border-primary group-hover:shadow-[0_0_8px_hsl(var(--primary)/0.4)] transition-all duration-300">
                <User size={14} className="text-primary" />
              </div>
            )}
            <span className="text-xs text-dark-bg-foreground/50 group-hover:text-primary/80 transition-colors duration-300">
              {t("events.by")} <span className="font-semibold">{creator.full_name ?? t("events.unknown")}</span>
            </span>
          </Link>
        )}
      </motion.div>
    );
  };

  const renderPagination = (totalPages: number, currentPage: number, setPage: (p: number) => void) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-2 mt-10">
        {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => (
          <button
            key={i + 1}
            onClick={() => setPage(i + 1)}
            className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors ${
              currentPage === i + 1
                ? "bg-primary text-primary-foreground"
                : "text-dark-bg-foreground/60 hover:text-dark-bg-foreground"
            }`}
          >
            {i + 1}
          </button>
        ))}
        {totalPages > 3 && <span className="text-dark-bg-foreground/40 px-1">•••</span>}
        {currentPage < totalPages && (
          <button
            onClick={() => setPage(currentPage + 1)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-dark-bg-foreground/60 hover:text-dark-bg-foreground transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    );
  };

  const renderShimmer = () => (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[4/3] bg-dark-bg-foreground/10 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-dark-bg-foreground/5 via-dark-bg-foreground/10 to-dark-bg-foreground/5 rounded-sm" />
          <div className="mt-3 space-y-2">
            <div className="h-4 w-3/4 bg-dark-bg-foreground/10 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-dark-bg-foreground/5 via-dark-bg-foreground/10 to-dark-bg-foreground/5 rounded" />
            <div className="h-3 w-1/2 bg-dark-bg-foreground/10 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-dark-bg-foreground/5 via-dark-bg-foreground/10 to-dark-bg-foreground/5 rounded" />
            <div className="h-3 w-1/3 bg-dark-bg-foreground/10 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-dark-bg-foreground/5 via-dark-bg-foreground/10 to-dark-bg-foreground/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <Navbar />
      <main className="flex-1 px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb & Header */}
        <motion.div
          className="mb-10"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.p variants={reveal} className="text-sm text-dark-bg-foreground/50 mb-2">
            <Link to="/" className="hover:text-primary transition-colors">{t("events.breadcrumbHome")}</Link>
            <span className="mx-2">›</span>
            <span>{t("events.title")}</span>
          </motion.p>
          <motion.h1 variants={reveal} className="text-4xl font-bold text-dark-bg-foreground uppercase tracking-wide">
            {t("events.title")}
          </motion.h1>
        </motion.div>

        {/* Category Pills */}
        <motion.div
          className="flex flex-wrap gap-2 mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-dark-bg-foreground/60 border-dark-bg-foreground/20 hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {loading ? (
          renderShimmer()
        ) : (
          <>
            {/* Upcoming Events */}
            <section className="mb-16">
              <motion.h2
                className="text-2xl font-bold text-dark-bg-foreground uppercase tracking-wide mb-8"
                variants={reveal}
                initial="hidden"
                animate="show"
              >
                {t("events.upcoming")}
              </motion.h2>
              {filteredUpcoming.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDays className="mx-auto h-10 w-10 text-dark-bg-foreground/30" />
                  <p className="mt-3 text-dark-bg-foreground/50">{t("upcomingEvents.noCategory")}</p>
                </div>
              ) : (
                <>
                  <motion.div
                    className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    key={`upcoming-${selectedCategory}`}
                  >
                    <AnimatePresence mode="popLayout">
                      {paginatedUpcoming.map((e) => renderEventCard(e))}
                    </AnimatePresence>
                  </motion.div>
                  {renderPagination(upcomingTotalPages, upcomingPage, setUpcomingPage)}
                </>
              )}
            </section>

            {/* Past Events */}
            {filteredPast.length > 0 && (
              <section>
                <div className="border-t border-dark-bg-foreground/10 pt-10">
                  <motion.h2
                    className="text-2xl font-bold text-dark-bg-foreground uppercase tracking-wide mb-8"
                    variants={reveal}
                    initial="hidden"
                    animate="show"
                  >
                    {t("events.past")}
                  </motion.h2>
                  <motion.div
                    className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    key={`past-${selectedCategory}`}
                  >
                    <AnimatePresence mode="popLayout">
                      {paginatedPast.map((e) => renderEventCard(e))}
                    </AnimatePresence>
                  </motion.div>
                  {renderPagination(pastTotalPages, pastPage, setPastPage)}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Events;
