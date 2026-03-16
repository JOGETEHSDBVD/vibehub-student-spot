import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string | null;
}

const UpcomingEventsPanel = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, date, location")
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true })
        .limit(5);
      setEvents(data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return {
      month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      day: String(d.getDate()),
    };
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Upcoming Events</h3>
        <button className="text-xs font-medium text-primary hover:underline">View all</button>
      </div>
      <div className="mt-4 space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
        ) : (
          events.map((e) => {
            const { month, day } = formatDate(e.date);
            return (
              <div key={e.id} className="flex items-center gap-3">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-red-50 text-center">
                  <span className="text-[10px] font-bold uppercase text-red-400">{month}</span>
                  <span className="text-lg font-bold leading-none text-red-500">{day}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.location ?? "TBD"}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UpcomingEventsPanel;
