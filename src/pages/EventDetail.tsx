import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CalendarDays, MapPin, ArrowLeft, User, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import TicketQRCode from "@/components/TicketQRCode";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  pole: string | null;
  target_annee: string | null;
}

interface OrganizerProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  pole: string | null;
  member_type: string | null;
}

const EventDetail = () => {
  const [showTicket, setShowTicket] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [organizer, setOrganizer] = useState<OrganizerProfile | null>(null);
  const [organizerEvents, setOrganizerEvents] = useState<EventFull[]>([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [userProfile, setUserProfile] = useState<{ pole: string | null; member_type: string | null } | null>(null);
  const [qrEnabled, setQrEnabled] = useState(false);

  // Fetch event
  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("events")
        .select("id, title, description, date, location, image_url, category, tags, created_by, is_published, pole, target_annee")
        .eq("id", id)
        .single();
      setEvent(data as EventFull | null);

      // Fetch qr_enabled separately since it's not in the type
      const { data: qrData } = await supabase
        .from("events")
        .select("qr_enabled")
        .eq("id", id)
        .single();
      setQrEnabled((qrData as any)?.qr_enabled ?? false);

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
        .select("id, title, description, date, location, image_url, category, tags, created_by, is_published, pole, target_annee")
        .eq("created_by", event.created_by!)
        .eq("is_published", true)
        .neq("id", event.id)
        .order("date", { ascending: false });
      setOrganizerEvents((events as EventFull[]) ?? []);
    };
    fetchOrganizer();
  }, [event?.created_by, event?.id]);

  // Fetch user profile for restriction check
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("pole, member_type")
        .eq("id", user.id)
        .single();
      setUserProfile(data);
    };
    fetchProfile();
  }, [user]);

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

  // Build restriction message
  const getRestrictionMessage = (): string | null => {
    if (!event) return null;
    const hasPoleRestriction = !!event.pole;
    const hasAnneeRestriction = !!event.target_annee;
    if (!hasPoleRestriction && !hasAnneeRestriction) return null;

    const anneeLabel = event.target_annee === "1ere_annee" ? "1ère Année" : event.target_annee === "2eme_annee" ? "2ème Année" : null;

    // Check if user matches (normalize pole by stripping emoji prefixes)
    if (userProfile) {
      const normalizePole = (p: string | null) => p?.replace(/^[^\w\s]*\s*/, "").trim().toLowerCase() ?? "";
      const poleMatch = !hasPoleRestriction || normalizePole(userProfile.pole) === normalizePole(event.pole);
      const anneeMatch = !hasAnneeRestriction || userProfile.member_type === event.target_annee;
      if (poleMatch && anneeMatch) return null;
    }

    const parts: string[] = [];
    if (hasAnneeRestriction && anneeLabel) parts.push(anneeLabel);
    if (hasPoleRestriction) parts.push(`Pôle ${event.pole}`);
    return `Désolé, cet événement est réservé aux ${parts.join(" — ")}`;
  };

  const restrictionMessage = event ? getRestrictionMessage() : null;

  const handleParticipate = async () => {
    if (!user) { toast.error("Please sign in to participate"); return; }
    if (!id) return;
    if (hasJoined) {
      setShowLeaveDialog(true);
      return;
    }
    if (restrictionMessage) {
      toast.error(restrictionMessage);
      return;
    }
    setJoining(true);
    const { error } = await supabase.from("event_participants").insert({ event_id: id, user_id: user.id });
    if (!error) {
      setHasJoined(true);
      setParticipantCount((c) => c + 1);
      toast.success("You joined the event!");
    } else {
      toast.error("Failed to join");
    }
    setJoining(false);
  };

  const handleLeaveConfirm = async () => {
    if (!user || !id) return;
    setShowLeaveDialog(false);
    setJoining(true);
    await supabase.from("event_participants").delete().eq("event_id", id).eq("user_id", user.id);
    setHasJoined(false);
    setParticipantCount((c) => c - 1);
    toast.success("You left the event");
    setJoining(false);
  };

  const now = new Date();

  const upcomingOrgEvents = organizerEvents.filter((e) => new Date(e.date) >= now);
  const pastOrgEvents = organizerEvents.filter((e) => new Date(e.date) < now);

  if (loading) {
    return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-dark-bg-foreground">
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
    <div className="min-h-screen flex flex-col bg-dark-bg text-dark-bg-foreground">
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
    <div className="min-h-screen flex flex-col bg-dark-bg text-dark-bg-foreground relative">
      <Navbar />

      {/* Blurred background from event image */}
      {event.image_url && (
      <div className="absolute top-0 left-0 right-0 z-0 pointer-events-none overflow-hidden h-[500px]">
          <img
            src={event.image_url}
            alt=""
            className="h-full w-full object-cover blur-[120px] scale-125 opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-bg/60 to-dark-bg" />
        </div>
      )}

      <main className="flex-1 relative z-10">
        {/* Breadcrumb */}
        <div className="max-w-5xl mx-auto px-4 pt-8">
          <div className="flex items-center gap-2 text-sm text-dark-bg-foreground/50">
            <Link to="/" className="hover:text-dark-bg-foreground transition-colors">Home</Link>
            <span>›</span>
            <Link to="/events" className="hover:text-dark-bg-foreground transition-colors">Events</Link>
            <span>›</span>
            <span className="text-dark-bg-foreground truncate max-w-[200px]">{event.title}</span>
          </div>
        </div>

        {/* Hero section */}
        <div className="max-w-5xl mx-auto px-4 pt-6 pb-10">
          <div className="grid md:grid-cols-[1fr_1.2fr] gap-8 items-start">
            <div className="space-y-5">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-dark-bg-foreground">{event.title}</h1>
                {organizer && (
                  <p className="mt-1 text-sm text-dark-bg-foreground/50">
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
                   <p className="text-sm text-dark-bg-foreground/50">
                    {d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {/* Location */}
              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-dark-bg-foreground">{event.location}</p>
                </div>
              )}

              {/* Category */}
              {event.category && (
                <span className="inline-block rounded-full border border-dark-bg-foreground/20 px-3 py-1 text-xs font-semibold uppercase text-dark-bg-foreground/60">
                  {event.category}
                </span>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {event.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-dark-bg-foreground/20 px-2.5 py-0.5 text-[11px] font-medium uppercase text-dark-bg-foreground/60">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Restriction notice */}
              {restrictionMessage && !hasJoined && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
                  <p className="text-sm font-medium text-destructive">{restrictionMessage}</p>
                </div>
              )}

              {/* Participants count */}
              <p className="text-sm text-dark-bg-foreground/50">
                <span className="font-bold text-dark-bg-foreground">{participantCount}</span> participant{participantCount !== 1 ? "s" : ""}
              </p>

              {/* Action buttons */}
              {!isPast && (
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleParticipate}
                    disabled={joining}
                    variant={hasJoined ? "outline" : "default"}
                    className={`rounded-full px-6 ${hasJoined ? "border-red-400 text-red-400 hover:bg-red-400/10 hover:text-red-300" : ""}`}
                  >
                    {hasJoined ? "Leave Event" : "Participate"}
                  </Button>
                </div>
              )}

              {/* QR Ticket button */}
              {hasJoined && qrEnabled && user && id && (
                <Button
                  variant="outline"
                  onClick={() => setShowTicket(true)}
                  className="rounded-full px-6 gap-2 border-primary text-primary hover:bg-primary/10"
                >
                  🎫 View My Ticket
                </Button>
              )}

              {isPast && (
                <p className="text-sm font-medium text-dark-bg-foreground/50 italic">This event has ended.</p>
              )}
            </div>

            {/* Right image */}
            <div className="aspect-[4/3] overflow-hidden">
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
          <div className="border-t border-dark-bg-foreground/10 pt-8">
            <h2 className="text-xl font-black text-dark-bg-foreground mb-4">Description</h2>
            {event.description ? (
              <p className="text-sm text-dark-bg-foreground/60 leading-relaxed whitespace-pre-wrap max-w-2xl">
                {event.description}
              </p>
            ) : (
              <p className="text-sm text-dark-bg-foreground/50 italic">No description provided.</p>
            )}
          </div>
        </div>

        {/* Organizer */}
        {organizer && (
          <div className="max-w-5xl mx-auto px-4 pb-10">
            <div className="border-t border-dark-bg-foreground/10 pt-8">
              <h2 className="text-xl font-black text-dark-bg-foreground mb-4">Organized By</h2>
              <Link
                to={`/organizer/${organizer.id}`}
                className="flex items-center gap-4 group"
              >
                {organizer.avatar_url ? (
                  <img src={organizer.avatar_url} alt="" className="h-14 w-14 rounded-full object-cover border-2 border-dark-bg-foreground/20 group-hover:border-primary transition-colors" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center border-2 border-dark-bg-foreground/20 group-hover:border-primary transition-colors">
                    <User size={24} className="text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-dark-bg-foreground group-hover:text-primary transition-colors">
                    {organizer.full_name ?? "Unknown Organizer"}
                  </p>
                  {organizer.pole && (
                    <p className="text-xs text-dark-bg-foreground/50">{organizer.pole}</p>
                  )}
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Organizer's other events */}
        {(upcomingOrgEvents.length > 0 || pastOrgEvents.length > 0) && (
          <div className="max-w-5xl mx-auto px-4 pb-16">
            <div className="border-t border-dark-bg-foreground/10 pt-8">
              {upcomingOrgEvents.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-lg font-black uppercase tracking-wide text-dark-bg-foreground mb-6">Upcoming Events</h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {upcomingOrgEvents.map((e) => (
                      <EventMiniCard key={e.id} event={e} />
                    ))}
                  </div>
                </div>
              )}

              {pastOrgEvents.length > 0 && (
                <div>
                  <h2 className="text-lg font-black uppercase tracking-wide text-dark-bg-foreground mb-6">Past Events</h2>
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

        <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Leave this event?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to leave "{event.title}"? You can always join again later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, stay</AlertDialogCancel>
              <AlertDialogAction onClick={handleLeaveConfirm}>Yes, leave</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* QR Ticket Popup */}
        {showTicket && qrEnabled && user && id && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowTicket(false)}>
            <div className="relative w-full max-w-sm mx-4 animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowTicket(false)}
                className="absolute -top-3 -right-3 z-10 rounded-full bg-dark-bg border border-dark-bg-foreground/20 p-1.5 text-dark-bg-foreground/70 hover:text-dark-bg-foreground transition-colors"
              >
                <X size={16} />
              </button>
              <TicketQRCode eventId={id} userId={user.id} eventTitle={event.title} />
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
      <div className="aspect-[4/3] overflow-hidden">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-dark-bg-foreground/10 flex items-center justify-center">
            <CalendarDays className="h-8 w-8 text-dark-bg-foreground/30" />
          </div>
        )}
      </div>
      <div className="mt-2">
        <h4 className="text-sm font-bold text-dark-bg-foreground group-hover:text-primary transition-colors">{event.title}</h4>
        {event.location && (
          <p className="text-xs text-dark-bg-foreground/50">{event.location}</p>
        )}
        <p className="text-xs font-semibold text-primary mt-0.5">
          {d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} | {d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </p>
      </div>
    </Link>
  );
};

export default EventDetail;
