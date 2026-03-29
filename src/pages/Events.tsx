import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
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

const Events = () => {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);

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

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
      month: d.toLocaleDateString("en-US", { month: "short" }),
      day: d.getDate(),
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground">Upcoming Events</h1>
          <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
            Discover and participate in our upcoming Sports, Culture, and Entrepreneurship events.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] rounded-xl bg-muted" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                  <div className="h-3 w-1/3 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-lg text-muted-foreground">No events available yet.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => {
              const dt = formatDateShort(e.date);
              return (
                <Link
                  key={e.id}
                  to={`/events/${e.id}`}
                  className="group block"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border">
                    {e.image_url ? (
                      <img
                        src={e.image_url}
                        alt={e.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="mt-3 space-y-1">
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {e.title}
                    </h3>
                    {e.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin size={13} className="shrink-0" />
                        {e.location}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-primary">
                      {dt.weekday}, {dt.month} {dt.day} | {dt.time}
                    </p>

                    {/* Tags */}
                    {e.tags && e.tags.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1.5">
                        {e.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium uppercase text-muted-foreground"
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
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Events;
