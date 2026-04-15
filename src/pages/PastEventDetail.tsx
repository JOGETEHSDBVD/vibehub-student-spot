import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CalendarDays, MapPin, ArrowLeft, User, Play } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

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
  recap: string | null;
}

interface MediaItem {
  id: string;
  url: string;
  media_type: string;
}

interface OrganizerProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

/** Extract YouTube video ID from various URL formats */
const extractYouTubeId = (url: string): string | null => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

const PastEventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [organizer, setOrganizer] = useState<OrganizerProfile | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setLoading(true);
      const [{ data: ev }, { data: md }] = await Promise.all([
        supabase
          .from("events")
          .select("id, title, description, date, location, image_url, category, tags, created_by, recap")
          .eq("id", id)
          .single(),
        supabase
          .from("event_media")
          .select("id, url, media_type")
          .eq("event_id", id)
          .order("created_at", { ascending: false }),
      ]);
      setEvent(ev as EventFull | null);
      setMedia((md as MediaItem[]) ?? []);
      if (ev?.created_by) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", ev.created_by)
          .single();
        setOrganizer(prof as OrganizerProfile | null);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-dark-bg text-dark-bg-foreground">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="h-64 w-full bg-muted rounded-xl" />
            <div className="h-4 w-3/4 bg-muted rounded" />
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
            <h1 className="text-2xl font-bold">Event not found</h1>
            <Link to="/events" className="mt-4 text-primary hover:underline inline-block">← Back to events</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const d = new Date(event.date);

  // Separate media: YouTube-embeddable videos vs images/uploaded videos
  const youtubeMedia: { id: string; videoId: string }[] = [];
  const galleryMedia: MediaItem[] = [];

  media.forEach((m) => {
    const ytId = extractYouTubeId(m.url);
    if (ytId) {
      youtubeMedia.push({ id: m.id, videoId: ytId });
    } else {
      galleryMedia.push(m);
    }
  });

  // Build bento grid items
  const bentoItems: React.ReactNode[] = [];

  // YouTube embeds get large horizontal slots
  youtubeMedia.forEach((yt) => {
    bentoItems.push(
      <div key={yt.id} className="col-span-2 row-span-2 rounded-xl overflow-hidden border-2 border-dark-bg-foreground/10">
        <iframe
          src={`https://www.youtube.com/embed/${yt.videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full min-h-[280px]"
          title="Event video"
        />
      </div>
    );
  });

  // Gallery images/videos
  galleryMedia.forEach((m, i) => {
    // Every 5th image gets a larger span for bento variety
    const isLarge = i % 5 === 0 && youtubeMedia.length === 0;
    const spanClass = isLarge ? "col-span-2 row-span-2" : "col-span-1 row-span-1";

    bentoItems.push(
      <motion.div
        key={m.id}
        variants={fadeUp}
        className={`${spanClass} overflow-hidden rounded-xl cursor-pointer group relative`}
        onClick={() => m.media_type === "image" && setLightboxImg(m.url)}
      >
        {m.media_type === "video" ? (
          <video src={m.url} controls className="w-full h-full object-cover min-h-[160px]" />
        ) : (
          <>
            <img
              src={m.url}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover min-h-[160px] transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        )}
      </motion.div>
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-dark-bg-foreground">
      <Navbar />

      {/* Grayscale Hero */}
      <div className="relative w-full h-[340px] md:h-[420px] overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover grayscale opacity-50 scale-105"
          />
        ) : (
          <div className="w-full h-full bg-dark-bg-foreground/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/70 to-transparent" />

        {/* Hero content overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 max-w-6xl mx-auto w-full">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm text-dark-bg-foreground/50 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft size={16} /> Back to Events
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-block rounded-full border border-primary/40 bg-primary/10 px-3 py-0.5 text-xs font-semibold uppercase text-primary">
              {event.category ?? "Event"}
            </span>
            <span className="text-xs text-dark-bg-foreground/40 uppercase font-medium tracking-wider">
              Past Event
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-dark-bg-foreground">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-dark-bg-foreground/60">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={15} className="text-primary" />
              {d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </span>
            {event.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={15} className="text-primary" />
                {event.location}
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10 space-y-12">
        {/* Organizer */}
        {organizer && (
          <div className="flex items-center gap-3">
            {organizer.avatar_url ? (
              <img src={organizer.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover border-2 border-dark-bg-foreground/20" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-dark-bg-foreground/20">
                <User size={18} className="text-primary" />
              </div>
            )}
            <div>
              <p className="text-sm text-dark-bg-foreground/50">Organized by</p>
              <Link to={`/organizer/${organizer.id}`} className="text-sm font-semibold text-dark-bg-foreground hover:text-primary transition-colors">
                {organizer.full_name ?? "Unknown"}
              </Link>
            </div>
          </div>
        )}

        {/* Key Takeaways & Impact */}
        <section>
          <h2 className="text-xl font-black text-dark-bg-foreground mb-4 uppercase tracking-wide">Key Takeaways & Impact</h2>
          {event.recap ? (
            <div className="rounded-xl bg-dark-bg-foreground/5 border border-dark-bg-foreground/10 p-6">
              <p className="text-sm text-dark-bg-foreground/70 leading-relaxed whitespace-pre-wrap">{event.recap}</p>
            </div>
          ) : event.description ? (
            <p className="text-sm text-dark-bg-foreground/60 leading-relaxed whitespace-pre-wrap max-w-3xl">{event.description}</p>
          ) : (
            <p className="text-sm text-dark-bg-foreground/40 italic">No recap available yet.</p>
          )}
        </section>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-dark-bg-foreground/20 px-3 py-1 text-xs font-medium uppercase text-dark-bg-foreground/60">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Bento Gallery */}
        {bentoItems.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-dark-bg-foreground mb-6 uppercase tracking-wide">Gallery</h2>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[200px] gap-3"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {bentoItems}
            </motion.div>
          </section>
        )}
      </main>

      {/* Lightbox */}
      {lightboxImg && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setLightboxImg(null)}
        >
          <motion.img
            src={lightboxImg}
            alt=""
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
          />
        </motion.div>
      )}

      <Footer />
    </div>
  );
};

export default PastEventDetail;
