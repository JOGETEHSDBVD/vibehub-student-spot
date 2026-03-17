import { useEffect, useState, useMemo } from "react";
import { CalendarDays, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import EventDetailModal from "@/components/admin/EventDetailModal";
import { useEventParticipantCounts } from "@/hooks/useEventParticipants";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  image_url: string | null;
  category: string | null;
}

const UpcomingEventsPanel = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);

  const eventIds = useMemo(() => events.map((e) => e.id), [events]);
  const participantCounts = useEventParticipantCounts(eventIds);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, description, date, location, image_url, category")
        .eq("is_published", true)
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true })
        .limit(6);
      setEvents(data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Upcoming Events</h3>
        <a href="/admin/active-events" className="text-xs font-medium text-primary hover:underline">View all</a>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-border overflow-hidden">
              <div className="h-32 bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8">
          <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">No upcoming events yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((e) => (
            <div key={e.id} className="rounded-lg border border-border overflow-hidden transition-transform duration-200 hover:scale-[1.02] cursor-pointer" onClick={() => setViewingEvent(e)}>
              {e.image_url ? (
                <img src={e.image_url} alt={e.title} className="h-32 w-full object-cover" />
              ) : (
                <div className="h-32 w-full bg-muted flex items-center justify-center">
                  <CalendarDays className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}
              <div className="p-3">
                <p className="text-[11px] font-medium text-primary">
                  {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <h4 className="mt-1 text-sm font-bold text-foreground truncate">{e.title}</h4>
                <div className="mt-2 flex items-center justify-between">
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                    {e.category ?? "Event"}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Users size={11} />
                    <span>{participantCounts[e.id] ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewingEvent && (
        <EventDetailModal
          open={!!viewingEvent}
          onClose={() => setViewingEvent(null)}
          event={{ ...viewingEvent, participant_count: participantCounts[viewingEvent.id] ?? 0 }}
        />
      )}
    </div>
  );
};

export default UpcomingEventsPanel;
