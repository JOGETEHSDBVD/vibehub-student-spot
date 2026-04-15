import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft, ImagePlus, Video, Trash2, Upload, Youtube, Eye, EyeOff, Save, Loader2, GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  image_url: string | null;
  category: string | null;
  is_published: boolean | null;
  recap: string | null;
}

interface MediaItem {
  id: string;
  url: string;
  media_type: string;
  created_at: string;
}

const MAX_PHOTO_SLOTS = 6;

/** Extract YouTube video ID */
const extractYouTubeId = (url: string): string | null => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

const AdminPastEventEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdmin, loading } = useAdminCheck();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventRow | null>(null);
  const [fetching, setFetching] = useState(true);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [recap, setRecap] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [addingYT, setAddingYT] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !authLoading) {
      if (!user || !isAdmin) navigate("/");
    }
  }, [isAdmin, loading, authLoading, user, navigate]);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setFetching(true);
    const [{ data: ev }, { data: md }] = await Promise.all([
      supabase
        .from("events")
        .select("id, title, description, date, location, image_url, category, is_published, recap")
        .eq("id", id)
        .single(),
      supabase
        .from("event_media")
        .select("id, url, media_type, created_at")
        .eq("event_id", id)
        .order("created_at", { ascending: true }),
    ]);
    if (ev) {
      setEvent(ev as EventRow);
      setRecap((ev as EventRow).recap ?? "");
      setIsPublished((ev as EventRow).is_published ?? true);
    }
    setMedia((md as MediaItem[]) ?? []);
    setFetching(false);
  }, [id]);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, fetchData]);

  // Photos only (not youtube embeds)
  const photos = media.filter((m) => m.media_type === "image");
  const videos = media.filter((m) => m.media_type === "video");
  const youtubeItems = media.filter((m) => m.media_type === "youtube");

  const saveAll = async () => {
    if (!event) return;
    setSaving(true);
    await supabase.from("events").update({ recap, is_published: isPublished }).eq("id", event.id);
    setEvent((prev) => prev ? { ...prev, recap, is_published: isPublished } : prev);
    setSaving(false);
    toast({ title: "Changes saved ✓" });
  };

  const uploadPhotos = async (files: FileList) => {
    if (!event || files.length === 0) return;
    const remaining = MAX_PHOTO_SLOTS - photos.length;
    if (remaining <= 0) {
      toast({ title: "Maximum 6 photos", description: "Delete some photos to upload new ones.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const filesToUpload = Array.from(files).slice(0, remaining);
    const newMedia: MediaItem[] = [];

    for (const file of filesToUpload) {
      const ext = file.name.split(".").pop();
      const path = `${event.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("event-images").upload(path, file);
      if (error) {
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        continue;
      }
      const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(path);
      const { data: inserted } = await supabase
        .from("event_media")
        .insert({ event_id: event.id, url: urlData.publicUrl, media_type: "image" })
        .select()
        .single();
      if (inserted) newMedia.push(inserted as MediaItem);
    }
    setMedia((prev) => [...prev, ...newMedia]);
    setUploading(false);
    toast({ title: `${newMedia.length} photo(s) uploaded` });
  };

  const addYouTubeVideo = async () => {
    if (!event || !youtubeLink.trim()) return;
    const videoId = extractYouTubeId(youtubeLink.trim());
    if (!videoId) {
      toast({ title: "Invalid YouTube URL", description: "Please paste a valid YouTube video link.", variant: "destructive" });
      return;
    }
    setAddingYT(true);
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    const { data: inserted } = await supabase
      .from("event_media")
      .insert({ event_id: event.id, url: embedUrl, media_type: "youtube" })
      .select()
      .single();
    if (inserted) {
      setMedia((prev) => [...prev, inserted as MediaItem]);
      setYoutubeLink("");
      toast({ title: "YouTube video added ✓" });
    }
    setAddingYT(false);
  };

  const deleteMedia = async (mediaId: string) => {
    await supabase.from("event_media").delete().eq("id", mediaId);
    setMedia((prev) => prev.filter((m) => m.id !== mediaId));
    toast({ title: "Media removed" });
  };

  if (loading || authLoading || fetching) {
    return (
      <div className="flex h-screen bg-muted/30">
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }
  if (!isAdmin || !event) return null;

  const d = new Date(event.date);

  return (
    <div className="flex h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/active-events")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft size={16} /> Back to Events
          </button>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                {event.location && ` · ${event.location}`}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-[10px] uppercase">{event.category ?? "Event"}</Badge>
                {isPublished ? (
                  <Badge variant="default" className="text-[10px] gap-1"><Eye size={10} /> Published</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] gap-1"><EyeOff size={10} /> Draft</Badge>
                )}
              </div>
            </div>
            <Button onClick={saveAll} disabled={saving} className="gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Left column — Main editor */}
          <div className="space-y-8">
            {/* Recap / Highlights Editor */}
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wide mb-4">Event Highlights / Impact</h2>
              <Textarea
                value={recap}
                onChange={(e) => setRecap(e.target.value)}
                placeholder={"Write the recap here...\n\n• Over 150 students trained in AWS basics\n• 25 teams competed in the final round\n• Best project: Smart Campus IoT Dashboard\n\nUse line breaks and bullet points (•) for structure."}
                rows={10}
                className="resize-y text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Tip: Use bullet points (•), dashes (-), or numbered lists for structured highlights.
              </p>
            </section>

            {/* Photo Grid — 6 slots */}
            <section className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Photo Gallery ({photos.length}/{MAX_PHOTO_SLOTS})</h2>
                <label className="cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && uploadPhotos(e.target.files)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    disabled={uploading || photos.length >= MAX_PHOTO_SLOTS}
                    asChild
                  >
                    <span>
                      <Upload size={14} /> {uploading ? "Uploading..." : "Upload Photos"}
                    </span>
                  </Button>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Filled slots */}
                {photos.map((m) => (
                  <div key={m.id} className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-border bg-muted">
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => deleteMedia(m.id)}
                      className="absolute top-1.5 right-1.5 rounded-full bg-destructive/90 p-1.5 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: MAX_PHOTO_SLOTS - photos.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[4/3] rounded-lg border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-muted transition-colors"
                  >
                    <ImagePlus size={20} className="text-muted-foreground/40" />
                    <span className="text-[10px] text-muted-foreground/40 mt-1">Drop or click</span>
                  </div>
                ))}
              </div>
            </section>

            {/* YouTube Videos */}
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wide mb-4">
                <span className="flex items-center gap-2"><Youtube size={16} className="text-red-500" /> YouTube Videos</span>
              </h2>

              <div className="flex gap-2 mb-4">
                <Input
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  placeholder="Paste YouTube URL (e.g. https://youtube.com/watch?v=...)"
                  className="flex-1 text-sm"
                />
                <Button
                  size="sm"
                  onClick={addYouTubeVideo}
                  disabled={addingYT || !youtubeLink.trim()}
                  className="gap-2"
                >
                  {addingYT ? <Loader2 size={14} className="animate-spin" /> : <Youtube size={14} />}
                  Add
                </Button>
              </div>

              {youtubeItems.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                  <Youtube size={24} className="mx-auto text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">No YouTube videos added yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {youtubeItems.map((m) => (
                    <div key={m.id} className="group relative rounded-lg overflow-hidden border border-border">
                      <div className="aspect-video">
                        <iframe
                          src={m.url}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                          title="YouTube video"
                        />
                      </div>
                      <button
                        onClick={() => deleteMedia(m.id)}
                        className="absolute top-2 right-2 rounded-full bg-destructive/90 p-1.5 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Uploaded Videos */}
            {videos.length > 0 && (
              <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wide mb-4">Uploaded Videos</h2>
                <div className="grid grid-cols-2 gap-3">
                  {videos.map((m) => (
                    <div key={m.id} className="group relative rounded-lg overflow-hidden border border-border">
                      <video src={m.url} controls className="w-full aspect-video object-cover" />
                      <button
                        onClick={() => deleteMedia(m.id)}
                        className="absolute top-1.5 right-1.5 rounded-full bg-destructive/90 p-1.5 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right column — Sidebar controls */}
          <div className="space-y-6">
            {/* Event Info Card */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">Event Info</h3>
              {event.image_url && (
                <img src={event.image_url} alt="" className="w-full aspect-video object-cover rounded-lg mb-3 grayscale opacity-70" />
              )}
              <p className="text-sm font-semibold text-foreground">{event.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
              {event.location && <p className="text-xs text-muted-foreground">{event.location}</p>}
              <Badge variant="outline" className="mt-2 text-[10px] uppercase">{event.category ?? "Event"}</Badge>
            </div>

            {/* Publish Toggle */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">Visibility</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="publish-toggle" className="text-sm text-muted-foreground">
                  Publish to Archive
                </Label>
                <Switch
                  id="publish-toggle"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {isPublished
                  ? "This event is visible in the public Past Events gallery."
                  : "This event is hidden. Prepare the recap before publishing."}
              </p>
            </div>

            {/* Stats */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">Content Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Recap</span>
                  {recap.trim() ? (
                    <Badge variant="default" className="text-[10px]">Written</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">Empty</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Photos</span>
                  <span className="text-xs font-medium text-foreground">{photos.length}/{MAX_PHOTO_SLOTS}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">YouTube</span>
                  <span className="text-xs font-medium text-foreground">{youtubeItems.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Videos</span>
                  <span className="text-xs font-medium text-foreground">{videos.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPastEventEditor;
