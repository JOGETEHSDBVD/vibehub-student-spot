import { useEffect, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
}

const Events = () => {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, description, date, location, image_url, category")
        .eq("is_published", true)
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true });
      setEvents((data as PublicEvent[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

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
          <p className="text-center text-muted-foreground">Loading events...</p>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-lg text-muted-foreground">No events available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <div key={e.id} className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
                {e.image_url ? (
                  <img src={e.image_url} alt={e.title} className="h-48 w-full object-cover" />
                ) : (
                  <div className="h-48 w-full bg-muted flex items-center justify-center">
                    <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{e.category ?? "Event"}</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{e.title}</h3>
                  {e.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{e.description}</p>
                  )}
                  <div className="mt-auto pt-4 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      {new Date(e.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    {e.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        {e.location}
                      </div>
                    )}
                  </div>
                  <Button className="mt-4 w-full">Participate</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Events;
