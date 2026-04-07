import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, ChevronRight, User } from "lucide-react";
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

const Events = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<PublicEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<PublicEvent[]>([]);
  const [creators, setCreators] = useState<Record<string, CreatorProfile>>({});
  const [loading, setLoading] = useState(true);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);

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

      // Fetch creator profiles
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

  const upcomingTotalPages = Math.ceil(upcomingEvents.length / EVENTS_PER_PAGE);
  const pastTotalPages = Math.ceil(pastEvents.length / EVENTS_PER_PAGE);
  const paginatedUpcoming = upcomingEvents.slice((upcomingPage - 1) * EVENTS_PER_PAGE, upcomingPage * EVENTS_PER_PAGE);
  const paginatedPast = pastEvents.slice((pastPage - 1) * EVENTS_PER_PAGE, pastPage * EVENTS_PER_PAGE);

  const renderEventCard = (e: PublicEvent, showCreator: boolean) => {
    const dt = formatDateShort(e.date);
    const creator = e.created_by ? creators[e.created_by] : null;

    return (
      <div key={e.id} className="group block">
        <Link to={`/events/${e.id}`}>
          <div className="aspect-[4/3] overflow-hidden">
            {e.image_url ? (
              <img src={e.image_url} alt={e.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
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

        {showCreator && creator && (
          <Link
            to={`/organizer/${creator.id}`}
            className="mt-3 flex items-center gap-2 group/creator"
            onClick={(e) => e.stopPropagation()}
          >
            {creator.avatar_url ? (
              <img src={creator.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover border border-dark-bg-foreground/20 group-hover/creator:border-primary transition-colors" />
            ) : (
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center border border-dark-bg-foreground/20 group-hover/creator:border-primary transition-colors">
                <User size={14} className="text-primary" />
              </div>
            )}
            <span className="text-xs text-dark-bg-foreground/50 group-hover/creator:text-primary transition-colors">
              by <span className="font-semibold">{creator.full_name ?? "Unknown"}</span>
            </span>
          </Link>
        )}
      </div>
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

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <Navbar />
      <main className="flex-1 px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="mb-10">
          <p className="text-sm text-dark-bg-foreground/50 mb-2">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="mx-2">›</span>
            <span>Events</span>
          </p>
          <h1 className="text-4xl font-bold text-dark-bg-foreground uppercase tracking-wide">
            Events
          </h1>
        </div>

        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-dark-bg-foreground/10" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 w-3/4 bg-dark-bg-foreground/10 rounded" />
                  <div className="h-3 w-1/2 bg-dark-bg-foreground/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Upcoming Events */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-dark-bg-foreground uppercase tracking-wide mb-8">
                Upcoming Events
              </h2>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDays className="mx-auto h-10 w-10 text-dark-bg-foreground/30" />
                  <p className="mt-3 text-dark-bg-foreground/50">No upcoming events yet.</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {paginatedUpcoming.map((e) => renderEventCard(e, true))}
                  </div>
                  {renderPagination(upcomingTotalPages, upcomingPage, setUpcomingPage)}
                </>
              )}
            </section>

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <section>
                <div className="border-t border-dark-bg-foreground/10 pt-10">
                  <h2 className="text-2xl font-bold text-dark-bg-foreground uppercase tracking-wide mb-8">
                    Past Events
                  </h2>
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {paginatedPast.map((e) => renderEventCard(e, true))}
                  </div>
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
