import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
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
}

const EVENTS_PER_PAGE = 9;

const Events = () => {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, description, date, location, image_url, category, tags")
        .eq("is_published", true)
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true });
      setEvents((data as PublicEvent[]) ?? []);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const totalPages = Math.ceil(events.length / EVENTS_PER_PAGE);
  const paginatedEvents = events.slice((page - 1) * EVENTS_PER_PAGE, page * EVENTS_PER_PAGE);

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

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <Navbar />
      <main className="flex-1 px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-10">
          <p className="text-sm text-dark-bg-foreground/50 mb-2">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="mx-2">›</span>
            <span>Events</span>
          </p>
          <h1 className="text-4xl font-bold text-dark-bg-foreground uppercase tracking-wide">
            Upcoming Events
          </h1>
        </div>

        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] rounded-xl bg-dark-bg-foreground/10" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 w-3/4 bg-dark-bg-foreground/10 rounded" />
                  <div className="h-3 w-1/2 bg-dark-bg-foreground/10 rounded" />
                  <div className="h-3 w-1/3 bg-dark-bg-foreground/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays className="mx-auto h-12 w-12 text-dark-bg-foreground/30" />
            <p className="mt-4 text-lg text-dark-bg-foreground/60">No events available yet.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedEvents.map((e) => {
                const dt = formatDateShort(e.date);
                return (
                  <Link
                    key={e.id}
                    to={`/events/${e.id}`}
                    className="group block"
                  >
                    {/* Image */}
                    <div className="aspect-[4/3] overflow-hidden rounded-xl">
                      {e.image_url ? (
                        <img
                          src={e.image_url}
                          alt={e.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-dark-bg-foreground/10 flex items-center justify-center">
                          <CalendarDays className="h-10 w-10 text-dark-bg-foreground/20" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
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

                      {/* Tags */}
                      {e.tags && e.tags.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1.5">
                          {e.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-dark-bg-foreground/20 px-2.5 py-0.5 text-[11px] font-medium uppercase text-dark-bg-foreground/60"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-14">
                {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors ${
                      page === i + 1
                        ? "bg-primary text-primary-foreground"
                        : "text-dark-bg-foreground/60 hover:text-dark-bg-foreground"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                {totalPages > 3 && (
                  <span className="text-dark-bg-foreground/40 px-1">•••</span>
                )}
                {page < totalPages && (
                  <button
                    onClick={() => setPage(page + 1)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-dark-bg-foreground/60 hover:text-dark-bg-foreground transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Events;
