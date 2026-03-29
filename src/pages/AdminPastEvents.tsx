import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ImagePlus, X, Video, FileText, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
  tags: string[] | null;
  is_published: boolean | null;
  recap: string | null;
}

interface MediaItem {
  id: string;
  url: string;
  media_type: string;
  created_at: string;
}

const AdminPastEvents = () => {
  const { isAdmin, loading } = useAdminCheck();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [recap, setRecap] = useState("");
  const [savingRecap, setSavingRecap] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !authLoading) {
      if (!user || !isAdmin) navigate("/");
    }
  }, [isAdmin, loading, authLoading, user, navigate]);

  const fetchEvents = useCallback(async () => {
    setFetching(true);
    const { data } = await supabase
      .from("events")
      .select("id, title, description, date, location, image_url, category, tags, is_published, recap")
      .eq("is_published", true)
      .lt("date", new Date().toISOString())
      .order("date", { ascending: false });
    setEvents((data as EventRow[]) ?? []);
    setFetching(false);
  }, []);

  useEffect(() => {
    if (isAdmin) fetchEvents();
  }, [isAdmin, fetchEvents]);

  const openEvent = async (event: EventRow) => {
    setSelectedEvent(event);
    setRecap(event.recap ?? "");
    setMediaLoading(true);
    const { data } = await supabase
      .from("event_media")
      .select("*")
      .eq("event_id", event.id)
      .order("created_at", { ascending: false });
    setMedia((data as MediaItem[]) ?? []);
    setMediaLoading(false);
  };

  const saveRecap = async () => {
    if (!selectedEvent) return;
    setSavingRecap(true);
    await supabase.from("events").update({ recap }).eq("id", selectedEvent.id);
    setEvents((prev) => prev.map((e) => (e.id === selectedEvent.id ? { ...e, recap } : e)));
    setSelectedEvent((prev) => prev ? { ...prev, recap } : prev);
    setSavingRecap(false);
    toast({ title: "Recap saved" });
  };

  const uploadMedia = async (files: FileList) => {
    if (!selectedEvent || files.length === 0) return;
    setUploading(true);
    const newMedia: MediaItem[] = [];

    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith("video/");
      const ext = file.name.split(".").pop();
      const path = `${selectedEvent.id}/${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage.from("event-images").upload(path, file);
      if (error) {
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        continue;
      }

      const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(path);

      const { data: inserted } = await supabase
        .from("event_media")
        .insert({ event_id: selectedEvent.id, url: urlData.publicUrl, media_type: isVideo ? "video" : "image" })
        .select()
        .single();

      if (inserted) newMedia.push(inserted as MediaItem);
    }

    setMedia((prev) => [...newMedia, ...prev]);
    setUploading(false);
    toast({ title: `${newMedia.length} file(s) uploaded` });
  };

  const deleteMedia = async (mediaId: string) => {
    await supabase.from("event_media").delete().eq("id", mediaId);
    setMedia((prev) => prev.filter((m) => m.id !== mediaId));
    toast({ title: "Media removed" });
  };

  if (loading || authLoading) return <div className="flex h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Past Events</h1>
          <p className="text-sm text-muted-foreground">Add photos, videos and recaps of past events.</p>
        </div>

        {fetching ? (
          <p className="text-sm text-muted-foreground">Loading events...</p>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <CalendarDays className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">No past events yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((e) => (
              <div
                key={e.id}
                onClick={() => openEvent(e)}
                className="group relative rounded-xl border border-border overflow-hidden bg-card transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
              >
                {e.image_url ? (
                  <img src={e.image_url} alt={e.title} className="h-40 w-full object-cover" />
                ) : (
                  <div className="h-40 w-full bg-muted flex items-center justify-center">
                    <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs font-medium text-primary">
                    {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <h4 className="mt-1 text-sm font-bold text-foreground truncate">{e.title}</h4>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {e.category ?? "Event"}
                    </Badge>
                    {e.recap ? (
                      <Badge variant="default" className="text-[10px]">
                        <FileText size={10} className="mr-1" /> Has Recap
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">No recap yet</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Event Detail Modal */}
        <Dialog open={!!selectedEvent} onOpenChange={(o) => !o && setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {selectedEvent && new Date(selectedEvent.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                {selectedEvent?.location && ` · ${selectedEvent.location}`}
              </p>
            </DialogHeader>

            {/* Recap Section */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Event Recap</label>
              <Textarea
                value={recap}
                onChange={(e) => setRecap(e.target.value)}
                placeholder="Write about how the event went, highlights, achievements..."
                rows={4}
              />
              <Button size="sm" onClick={saveRecap} disabled={savingRecap}>
                {savingRecap ? "Saving..." : "Save Recap"}
              </Button>
            </div>

            {/* Media Upload */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">Photos & Videos</label>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => e.target.files && uploadMedia(e.target.files)}
                  />
                  <Button size="sm" variant="outline" className="gap-2" asChild>
                    <span>
                      <Upload size={14} /> {uploading ? "Uploading..." : "Upload"}
                    </span>
                  </Button>
                </label>
              </div>

              {mediaLoading ? (
                <p className="text-sm text-muted-foreground">Loading media...</p>
              ) : media.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <ImagePlus className="mx-auto h-8 w-8 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">No media added yet. Upload photos or videos.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {media.map((m) => (
                    <div key={m.id} className="group/media relative rounded-lg overflow-hidden border border-border">
                      {m.media_type === "video" ? (
                        <video src={m.url} className="h-28 w-full object-cover" controls />
                      ) : (
                        <img src={m.url} alt="" className="h-28 w-full object-cover" />
                      )}
                      <button
                        onClick={() => deleteMedia(m.id)}
                        className="absolute top-1 right-1 rounded-full bg-destructive/80 p-1 text-destructive-foreground opacity-0 group-hover/media:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                      <div className="absolute bottom-1 left-1">
                        <Badge variant="secondary" className="text-[9px]">
                          {m.media_type === "video" ? <Video size={10} className="mr-0.5" /> : <ImagePlus size={10} className="mr-0.5" />}
                          {m.media_type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminPastEvents;
