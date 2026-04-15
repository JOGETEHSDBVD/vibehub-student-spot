import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { CalendarDays, MapPin, ArrowLeft, User, X } from "lucide-react";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import TicketQRCode from "@/components/TicketQRCode";
import CountUp from "@/components/animations/CountUp";
import MagneticButton from "@/components/animations/MagneticButton";
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

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const slideRight = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

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

  const descRef = useRef<HTMLDivElement>(null);
  const descInView = useInView(descRef, { once: true, margin: "-60px" });
  const orgRef = useRef<HTMLDivElement>(null);
  const orgInView = useInView(orgRef, { once: true, margin: "-60px" });
  const statsRef = useRef<HTMLParagraphElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-30px" });

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

    if (userProfile) {
      const poleMatch = !hasPoleRestriction || userProfile.pole === event.pole;
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

  // Marquee: duplicate items for seamless loop
  const marqueeEvents = [...upcomingOrgEvents, ...pastOrgEvents];
  const marqueeItems = marqueeEvents.length > 0 ? [...marqueeEvents, ...marqueeEvents] : [];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-dark-bg text-dark-bg-foreground">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">
          <div className="space-y-6">
            <div className="h-6 w-32 bg-dark-bg-foreground/10 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-dark-bg-foreground/5 via-dark-bg-foreground/10 to-dark-bg-foreground/5 rounded" />
            <div className="h-10 w-3/4 bg-dark-bg-foreground/10 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-dark-bg-foreground/5 via-dark-bg-foreground/10 to-dark-bg-foreground/5 rounded" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-4 w-1/2 bg-dark-bg-foreground/10 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-dark-bg-foreground/5 via-dark-bg-foreground/10 to-dark-bg-foreground/5 rounded" />
                <div className="h-4 w-1/3 bg-dark-bg-foreground/10 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-dark-bg-foreground/5 via-dark-bg-foreground/10 to-dark-bg-foreground/5 rounded" />
                <div className="h-10 w-40 bg-dark-bg-foreground/10 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-dark-bg-foreground/5 via-dark-bg-foreground/10 to-dark-bg-foreground/5 rounded" />
              </div>
              <div className="aspect-[4/3] bg-dark-bg-foreground/10 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-dark-bg-foreground/5 via-dark-bg-foreground/10 to-dark-bg-foreground/5 rounded-xl" />
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
        <motion.div
          className="max-w-5xl mx-auto px-4 pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 text-sm text-dark-bg-foreground/50">
            <Link to="/" className="hover:text-dark-bg-foreground transition-colors">Home</Link>
            <span>›</span>
            <Link to="/events" className="hover:text-dark-bg-foreground transition-colors">Events</Link>
            <span>›</span>
            <span className="text-dark-bg-foreground truncate max-w-[200px]">{event.title}</span>
          </div>
        </motion.div>

        {/* Hero section */}
        <div className="max-w-5xl mx-auto px-4 pt-6 pb-10">
          <div className="grid md:grid-cols-[1fr_1.2fr] gap-8 items-start">
            {/* Left: Text with staggered reveal */}
            <motion.div
              className="space-y-5"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={fadeUp}>
                <h1 className="text-3xl md:text-4xl font-black text-dark-bg-foreground">{event.title}</h1>
                {organizer && (
                  <p className="mt-1 text-sm text-dark-bg-foreground/50">
                    By{" "}
                    <Link to={`/organizer/${organizer.id}`} className="font-semibold text-primary hover:underline">
                      {organizer.full_name ?? "Unknown Organizer"}
                    </Link>
                  </p>
                )}
              </motion.div>

              {/* Date */}
              <motion.div variants={fadeUp} className="flex items-start gap-3">
                <CalendarDays size={20} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </p>
                  <p className="text-sm text-dark-bg-foreground/50">
                    {d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>

              {/* Location */}
              {event.location && (
                <motion.div variants={fadeUp} className="flex items-start gap-3">
                  <MapPin size={20} className="text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-dark-bg-foreground">{event.location}</p>
                </motion.div>
              )}

              {/* Category */}
              {event.category && (
                <motion.span variants={fadeUp} className="inline-block rounded-full border border-dark-bg-foreground/20 px-3 py-1 text-xs font-semibold uppercase text-dark-bg-foreground/60">
                  {event.category}
                </motion.span>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <motion.div variants={fadeUp} className="flex flex-wrap gap-1.5">
                  {event.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-dark-bg-foreground/20 px-2.5 py-0.5 text-[11px] font-medium uppercase text-dark-bg-foreground/60">
                      {tag}
                    </span>
                  ))}
                </motion.div>
              )}

              {/* Restriction notice */}
              {restrictionMessage && !hasJoined && (
                <motion.div variants={fadeUp} className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
                  <p className="text-sm font-medium text-destructive">{restrictionMessage}</p>
                </motion.div>
              )}

              {/* Participants count with animated counter */}
              <motion.p variants={fadeUp} ref={statsRef} className="text-sm text-dark-bg-foreground/50">
                <span className="font-bold text-dark-bg-foreground">
                  {statsInView ? <CountUp end={participantCount} duration={1500} /> : "0"}
                </span>{" "}
                participant{participantCount !== 1 ? "s" : ""}
              </motion.p>

              {/* Action buttons with pulsing glow */}
              {!isPast && (
                <motion.div variants={fadeUp} className="flex gap-3 pt-2">
                  {hasJoined ? (
                    <Button
                      onClick={handleParticipate}
                      disabled={joining}
                      variant="outline"
                      className="rounded-full px-6 border-red-400 text-red-400 hover:bg-red-400/10 hover:text-red-300"
                    >
                      Leave Event
                    </Button>
                  ) : (
                    <MagneticButton
                      onClick={joining ? undefined : handleParticipate}
                      className="rounded-full px-8 py-3 bg-primary text-primary-foreground font-bold shadow-[0_0_15px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.6)] animate-cta-breathe transition-shadow duration-300"
                    >
                      {joining ? "Joining..." : "Participate"}
                    </MagneticButton>
                  )}
                </motion.div>
              )}

              {/* QR Ticket button */}
              {hasJoined && qrEnabled && user && id && (
                <motion.div variants={fadeUp}>
                  <Button
                    variant="outline"
                    onClick={() => setShowTicket(true)}
                    className="rounded-full px-6 gap-2 border-primary text-primary hover:bg-primary/10"
                  >
                    🎫 View My Ticket
                  </Button>
                </motion.div>
              )}

              {isPast && (
                <motion.p variants={fadeUp} className="text-sm font-medium text-dark-bg-foreground/50 italic">This event has ended.</motion.p>
              )}
            </motion.div>

            {/* Right image with Ken Burns effect */}
            <motion.div
              className="aspect-[4/3] overflow-hidden rounded-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="h-full w-full object-cover animate-ken-burns"
                />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center">
                  <CalendarDays className="h-14 w-14 text-muted-foreground/30" />
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Description — slides in from left */}
        <div ref={descRef} className="max-w-5xl mx-auto px-4 pb-10">
          <motion.div
            className="border-t border-dark-bg-foreground/10 pt-8"
            variants={slideLeft}
            initial="hidden"
            animate={descInView ? "show" : "hidden"}
          >
            <h2 className="text-xl font-black text-dark-bg-foreground mb-4">Description</h2>
            {event.description ? (
              <p className="text-sm text-dark-bg-foreground/60 leading-relaxed whitespace-pre-wrap max-w-2xl">
                {event.description}
              </p>
            ) : (
              <p className="text-sm text-dark-bg-foreground/50 italic">No description provided.</p>
            )}
          </motion.div>
        </div>

        {/* Organizer — slides in from right */}
        {organizer && (
          <div ref={orgRef} className="max-w-5xl mx-auto px-4 pb-10">
            <motion.div
              className="border-t border-dark-bg-foreground/10 pt-8"
              variants={slideRight}
              initial="hidden"
              animate={orgInView ? "show" : "hidden"}
            >
              <h2 className="text-xl font-black text-dark-bg-foreground mb-4">Organized By</h2>
              <Link
                to={`/organizer/${organizer.id}`}
                className="flex items-center gap-4 group"
              >
                {organizer.avatar_url ? (
                  <img
                    src={organizer.avatar_url}
                    alt=""
                    className="h-14 w-14 rounded-full object-cover border-2 border-dark-bg-foreground/20 group-hover:border-primary group-hover:shadow-[0_0_12px_hsl(var(--primary)/0.5)] transition-all duration-300"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center border-2 border-dark-bg-foreground/20 group-hover:border-primary group-hover:shadow-[0_0_12px_hsl(var(--primary)/0.5)] transition-all duration-300">
                    <User size={24} className="text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-dark-bg-foreground group-hover:text-primary transition-colors">
                    {organizer.full_name ?? "Unknown Organizer"}
                  </p>
                  <p className="text-xs text-dark-bg-foreground/50 group-hover:text-dark-bg-foreground/70 transition-colors">
                    {organizer.pole ?? "Event Organizer"}
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>
        )}

        {/* Up Next — Marquee slider */}
        {marqueeItems.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 pb-16">
            <div className="border-t border-dark-bg-foreground/10 pt-8">
              <h2 className="text-lg font-black uppercase tracking-wide text-dark-bg-foreground mb-6">Up Next</h2>
              <div className="overflow-hidden">
                <motion.div
                  className="flex gap-6"
                  animate={{ x: [0, -(marqueeEvents.length * 280)] }}
                  transition={{
                    x: {
                      duration: marqueeEvents.length * 6,
                      repeat: Infinity,
                      ease: "linear",
                    },
                  }}
                >
                  {marqueeItems.map((e, i) => (
                    <div key={`${e.id}-${i}`} className="flex-shrink-0 w-[260px]">
                      <EventMiniCard event={e} />
                    </div>
                  ))}
                </motion.div>
              </div>
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
      <div className="aspect-[4/3] overflow-hidden rounded-sm">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
