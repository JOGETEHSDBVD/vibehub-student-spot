import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CalendarDays, User, Linkedin, Instagram, Facebook } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface OrganizerData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  pole: string | null;
  member_type: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
}

interface OrgEvent {
  id: string;
  title: string;
  date: string;
  location: string | null;
  image_url: string | null;
  category: string | null;
  tags: string[] | null;
}

const OrganizerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [organizer, setOrganizer] = useState<OrganizerData | null>(null);
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const [{ data: prof }, { data: evts }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, avatar_url, cover_url, pole, member_type, linkedin_url, instagram_url, facebook_url").eq("id", id).single(),
        supabase.from("events").select("id, title, date, location, image_url, category, tags").eq("created_by", id).eq("is_published", true).order("date", { ascending: false }),
      ]);
      setOrganizer(prof as OrganizerData | null);
      setEvents((evts as OrgEvent[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.date) >= now);
  const past = events.filter((e) => new Date(e.date) < now);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-muted rounded" />
                <div className="h-4 w-32 bg-muted rounded" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Organizer not found</h1>
            <Link to="/events" className="mt-4 text-primary hover:underline inline-block">← Back to events</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>›</span>
          <Link to="/events" className="hover:text-foreground transition-colors">Events</Link>
          <span>›</span>
          <span className="text-foreground">{organizer.full_name ?? "Organizer"}</span>
        </div>


        {/* Organizer header */}
        <div className="flex items-center gap-5 mb-4">
          {organizer.avatar_url ? (
            <img src={organizer.avatar_url} alt="" className="h-24 w-24 rounded-full object-cover border-2 border-border" />
          ) : (
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
              <User size={36} className="text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground">{organizer.full_name ?? "Unknown Organizer"}</h1>
            {organizer.pole && (
              <p className="text-sm text-muted-foreground mt-1">{organizer.pole}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{events.length} event{events.length !== 1 ? "s" : ""}</p>
            {(organizer.linkedin_url || organizer.instagram_url || organizer.facebook_url) && (
              <div className="flex items-center gap-2 mt-3">
                {organizer.linkedin_url && (
                  <a href={organizer.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
                    <Linkedin size={14} className="text-[#0A66C2]" /> LinkedIn
                  </a>
                )}
                {organizer.instagram_url && (
                  <a href={organizer.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
                    <Instagram size={14} className="text-[#E4405F]" /> Instagram
                  </a>
                )}
                {organizer.facebook_url && (
                  <a href={organizer.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
                    <Facebook size={14} className="text-[#1877F2]" /> Facebook
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mb-12" />

        {/* Upcoming Events */}
        {upcoming.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-black uppercase tracking-wide text-foreground mb-6">Upcoming Events</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </section>
        )}

        {/* Past Events */}
        {past.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-black uppercase tracking-wide text-foreground mb-6">Past Events</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </section>
        )}

        {events.length === 0 && (
          <div className="text-center py-20">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">No events from this organizer yet.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

const EventCard = ({ event }: { event: OrgEvent }) => {
  const d = new Date(event.date);
  return (
    <Link to={`/events/${event.id}`} className="group block">
      <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
      </div>
      <div className="mt-2">
        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{event.title}</h4>
        {event.location && (
          <p className="text-xs text-muted-foreground">{event.location}</p>
        )}
        <p className="text-xs font-semibold text-primary mt-0.5">
          {d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} | {d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </p>
        {event.tags && event.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {event.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default OrganizerProfile;
