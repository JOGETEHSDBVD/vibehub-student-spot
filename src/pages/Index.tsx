import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import heroBuilding from "@/assets/hero-building.png";
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

const Index = () => {
  const [authMode, setAuthMode] = useState<"signin" | "signup" | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

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
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[520px] md:h-[600px] overflow-hidden">
          <img
            src={heroBuilding}
            alt="Campus building"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/60 to-foreground/30" />
          {/* Decorative shapes */}
          <div className="absolute top-8 right-16 w-16 h-16 bg-amber-400 rounded-md rotate-12 hidden lg:block" />
          <div className="absolute top-1/3 right-1/4 w-24 h-24 border-[3px] border-orange-400 rounded-full hidden lg:block" />
          <div className="absolute bottom-12 right-12 w-10 h-10 bg-primary/40 rounded-full hidden lg:block" />

          <div className="relative z-10 h-full flex items-center px-6 lg:px-20">
            <div className="mx-auto max-w-[1200px] w-full">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                Live Now • 249 Students Online
              </div>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.05] text-primary-foreground max-w-2xl">
                Ignite Your{" "}
                <span className="italic text-primary">Campus Life!</span>
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/80 max-w-md leading-relaxed">
                Experience the pulse of campus. From midnight hackathons to sunrise hikes, find your tribe and make every moment count.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/events"
                  className="bg-foreground text-primary-foreground px-8 py-4 rounded-xl font-bold text-base hover:bg-foreground/90 transition-all"
                >
                  Explore Schedule
                </Link>
                <button
                  onClick={() => setAuthMode("signup")}
                  className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/30 text-primary-foreground px-8 py-4 rounded-xl font-bold text-base hover:bg-primary-foreground/20 transition-all"
                >
                  Host an Event
                </button>
              </div>
            </div>
          </div>
          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 60L1440 60L1440 30C1200 0 960 50 720 30C480 10 240 50 0 30L0 60Z" fill="hsl(var(--background))" />
            </svg>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="px-6 lg:px-20 py-20 mx-auto max-w-[1200px]" id="events">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-display text-4xl md:text-5xl mb-2 text-foreground">Upcoming Events</h2>
              <p className="text-muted-foreground">Ignite the night at CMC.</p>
            </div>
            <Link to="/events" className="hidden md:flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
              View All Events <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {eventsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card animate-pulse">
                  <div className="h-52 bg-muted rounded-t-2xl" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 w-3/4 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                    <div className="h-3 w-full bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No upcoming events yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {events.slice(0, 3).map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="flex flex-col rounded-2xl overflow-hidden border border-border bg-card group hover:shadow-lg transition-shadow"
                >
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
              ))}
            </div>
          )}
          <Link to="/events" className="md:hidden flex items-center justify-center gap-2 mt-8 text-sm font-bold text-primary">
            View All Events <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </section>

        {/* CTA Section */}
        <section className="mx-6 lg:mx-20 my-16 rounded-3xl bg-primary px-8 py-20 md:px-16 text-center">
          <div className="mx-auto max-w-xl">
            <Rocket className="mx-auto h-10 w-10 text-primary-foreground/80 mb-4" />
            <h2 className="font-display text-4xl md:text-5xl text-primary-foreground mb-4">Ready to lead?</h2>
            <p className="text-primary-foreground/80 text-lg leading-relaxed mb-8">
              Don't just attend events—create them. Join the 500+ student leaders shaping the CMC experience.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setAuthMode("signup")}
                className="bg-amber-400 text-foreground px-8 py-4 rounded-full font-bold text-base hover:bg-amber-300 transition-all"
              >
                Become a Host
              </button>
              <Link
                to="/events"
                className="bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/30 text-primary-foreground px-8 py-4 rounded-full font-bold text-base hover:bg-primary-foreground/25 transition-all"
              >
                Browse Handbook
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
