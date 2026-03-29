import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CalendarDays, MapPin, ArrowLeft, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface EventFull {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  image_url: string | null;
  category: string | null;
  tags: string[] | null;
  created_by: string | null;
  is_published: boolean | null;
}

interface OrganizerProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  pole: string | null;
  member_type: string | null;
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [organizer, setOrganizer] = useState<OrganizerProfile | null>(null);
  const [organizerEvents, setOrganizerEvents] = useState<EventFull[]>([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);

  // Fetch event
  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("events")
        .select("id, title, description, date, location, image_url, category, tags, created_by, is_published")
        .eq("id", id)
        .single();
      setEvent(data as EventFull | null);
      setLoading(false);
    };
    fetchEvent();
  }, [id]);

  // Fetch organizer + their events
  useEffect(() => {
    if (!event?.created_by) return;
    const fetchOrganizer = async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, pole, member_type")
        .eq("id", event.created_by!)
        .single();
      setOrganizer(prof as OrganizerProfile | null);

      const { data: events } = await supabase
        .from("events")
        .select("id, title, description, date, location, image_url, category, tags, created_by, is_published")
        .eq("created_by", event.created_by!)
        .eq("is_published", true)
        .neq("id", event.id)
        .order("date", { ascending: false });
      setOrganizerEvents((events as EventFull[]) ?? []);
    };
    fetchOrganizer();
  }, [event?.created_by, event?.id]);

  // Check participation + count
  useEffect(() => {
    if (!id) return;
    const fetchParticipation = async () => {
      const { count } = await supabase
        .from("event_participants")
        .select("id", { count: "exact", head: true })
        .eq("event_id", id);
      setParticipantCount(count ?? 0);

      if (user) {
        const { data } = await supabase
          .from("event_participants")
          .select("id")
          .eq("event_id", id)
          .eq("user_id", user.id)
          .maybeSingle();
        setHasJoined(!!data);
      }
    };
    fetchParticipation();
  }, [id, user]);

  const handleParticipate = async () => {
    if (!user) { toast.error("Please sign in to participate"); return; }
    if (!id) return;
    setJoining(true);
    if (hasJoined) {
      await supabase.from("event_participants").delete().eq("event_id", id).eq("user_id", user.id);
      setHasJoined(false);
      setParticipantCount((c) => c - 1);
      toast.success("You left the event");
    } else {
      const { error } = await supabase.from("event_participants").insert({ event_id: id, user_id: user.id });
      if (!error) {
        setHasJoined(true);
        setParticipantCount((c) => c + 1);
        toast.success("You joined the event!");
      } else {
        toast.error("Failed to join");
      }
    }
    setJoining(false);
  };

  const now = new Date();

  const upcomingOrgEvents = organizerEvents.filter((e) => new Date(e.date) >= now);
  const pastOrgEvents = organizerEvents.filter((e) => new Date(e.date) < now);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="h-10 w-3/4 bg-muted rounded" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-4 w-1/2 bg-muted rounded" />
                <div className="h-4 w-1/3 bg-muted rounded" />
                <div className="h-10 w-40 bg-muted rounded" />
              </div>
              <div className="aspect-[4/3] bg-muted rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Event not found</h1>
            <Link to="/events" className="mt-4 text-primary hover:underline inline-block">← Back to events</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const d = new Date(event.date);
  const isPast = d < now;

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <Navbar />

      {/* Blurred background from event image */}
      {event.image_url && (
        <div className="absolute top-0 left-0 right-0 z-0 pointer-events-none overflow-hidden h-[500px]">
          <img
            src={event.image_url}
            alt=""
            className="h-full w-full object-cover blur-[120px] scale-125 opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        </div>
      )}

      <main className="flex-1 relative z-10">
        {/* Breadcrumb */}
        <div className="max-w-5xl mx-auto px-4 pt-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>›</span>
            <Link to="/events" className="hover:text-foreground transition-colors">Events</Link>
            <span>›</span>
            <span className="text-foreground truncate max-w-[200px]">{event.title}</span>
          </div>
        </div>

        {/* Hero section */}
        <div className="max-w-5xl mx-auto px-4 pt-6 pb-10">
          <div className="grid md:grid-cols-[1fr_1.2fr] gap-8 items-start">
            <div className="space-y-5">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-foreground">{event.title}</h1>
                {organizer && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    By{" "}
                    <Link to={`/organizer/${organizer.id}`} className="font-semibold text-primary hover:underline">
                      {organizer.full_name ?? "Unknown Organizer"}
                    </Link>
                  </p>
                )}
              </div>
              {/* Date */}
              <div className="flex items-start gap-3">
                <CalendarDays size={20} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {/* Location */}
              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground">{event.location}</p>
                </div>
              )}

              {/* Category */}
              {event.category && (
                <span className="inline-block rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
                  {event.category}
                </span>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {event.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium uppercase text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Participants count */}
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{participantCount}</span> participant{participantCount !== 1 ? "s" : ""}
              </p>

              {/* Action buttons */}
              {!isPast && (
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleParticipate}
                    disabled={joining}
                    variant={hasJoined ? "outline" : "default"}
                    className="rounded-full px-6"
                  >
                    {hasJoined ? "Leave Event" : "Participate"}
                  </Button>
                </div>
              )}

              {isPast && (
                <p className="text-sm font-medium text-muted-foreground italic">This event has ended.</p>
              )}
            </div>

            {/* Right image */}
            <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border">
              {event.image_url ? (
                <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center">
                  <CalendarDays className="h-14 w-14 text-muted-foreground/30" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="max-w-5xl mx-auto px-4 pb-10">
          <div className="border-t border-border pt-8">
            <h2 className="text-xl font-black text-foreground mb-4">Description</h2>
            {event.description ? (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap max-w-2xl">
                {event.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No description provided.</p>
            )}
          </div>
        </div>

        {/* Organizer */}
        {organizer && (
          <div className="max-w-5xl mx-auto px-4 pb-10">
            <div className="border-t border-border pt-8">
              <h2 className="text-xl font-black text-foreground mb-4">Organized By</h2>
              <Link
                to={`/organizer/${organizer.id}`}
                className="flex items-center gap-4 group"
              >
                {organizer.avatar_url ? (
                  <img src={organizer.avatar_url} alt="" className="h-14 w-14 rounded-full object-cover border-2 border-border group-hover:border-primary transition-colors" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border group-hover:border-primary transition-colors">
                    <User size={24} className="text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {organizer.full_name ?? "Unknown Organizer"}
                  </p>
                  {organizer.pole && (
                    <p className="text-xs text-muted-foreground">{organizer.pole}</p>
                  )}
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Organizer's other events */}
        {(upcomingOrgEvents.length > 0 || pastOrgEvents.length > 0) && (
          <div className="max-w-5xl mx-auto px-4 pb-16">
            <div className="border-t border-border pt-8">
              {upcomingOrgEvents.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-lg font-black uppercase tracking-wide text-foreground mb-6">Upcoming Events</h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {upcomingOrgEvents.map((e) => (
                      <EventMiniCard key={e.id} event={e} />
                    ))}
                  </div>
                </div>
              )}

              {pastOrgEvents.length > 0 && (
                <div>
                  <h2 className="text-lg font-black uppercase tracking-wide text-foreground mb-6">Past Events</h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {pastOrgEvents.map((e) => (
                      <EventMiniCard key={e.id} event={e} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

const EventMiniCard = ({ event }: { event: EventFull }) => {
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
      </div>
    </Link>
  );
};

export default EventDetail;
