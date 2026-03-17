import { useEffect, useState } from "react";
import { Calendar, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  image_url: string | null;
  category: string | null;
}

const UpcomingEvents = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, description, date, image_url, category")
        .eq("is_published", true)
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true })
        .limit(3);
      setEvents((data as EventItem[]) ?? []);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  return (
    <section id="events" className="bg-background py-20">
      <div className="container mx-auto px-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-4xl text-foreground">Upcoming Events</h2>
            <p className="mt-2 text-body-text">Mark your calendars for the hottest dates on campus</p>
          </div>
          <a href="/events" className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">
            View Full Calendar <CalendarDays size={16} />
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm animate-pulse">
                <div className="h-48 w-full bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-5 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                </div>
              </div>
            ))
          ) : events.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No upcoming events yet.</p>
            </div>
          ) : (
            events.map((e) => (
              <div key={e.id} className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-transform duration-200 hover:scale-[1.02]">
                {e.image_url ? (
                  <img src={e.image_url} alt={e.title} className="h-48 w-full object-cover" />
                ) : (
                  <div className="h-48 w-full bg-muted flex items-center justify-center">
                    <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs font-medium text-primary">
                    <Calendar size={14} />
                    {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-foreground">{e.title}</h3>
                  {e.description && (
                    <p className="mt-1 text-sm text-body-text line-clamp-2">{e.description}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase text-foreground">
                      {e.category ?? "Event"}
                    </span>
                    <button className="text-sm font-semibold text-foreground hover:text-primary transition-colors duration-200">RSVP</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
