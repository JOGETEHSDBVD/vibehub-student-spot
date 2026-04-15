import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, CalendarDays, MoreVertical, Pencil, Trash2, Eye, EyeOff, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AdminSidebar from "@/components/admin/AdminSidebar";
import EventDetailModal from "@/components/admin/EventDetailModal";
import EventFormModal from "@/components/admin/EventFormModal";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useEventParticipantCounts } from "@/hooks/useEventParticipants";

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  date: string;
  end_time: string | null;
  location: string | null;
  image_url: string | null;
  category: string | null;
  pole: string | null;
  target_annee: string | null;
  tags: string[] | null;
  is_published: boolean | null;
  created_at: string;
  created_by: string | null;
}

const AdminEvents = () => {
  const { isAdmin, loading } = useAdminCheck();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [fetching, setFetching] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewingEvent, setViewingEvent] = useState<EventRow | null>(null);
  const [sortBy, setSortBy] = useState<"event_date" | "created_at">("event_date");
  const [sortDir, setSortDir] = useState<"latest" | "oldest">("latest");

  const eventIds = useMemo(() => events.map((e) => e.id), [events]);
  const participantCounts = useEventParticipantCounts(eventIds);

  useEffect(() => {
    if (!loading && !authLoading) {
      if (!user || !isAdmin) navigate("/");
    }
  }, [isAdmin, loading, authLoading, user, navigate]);

  const fetchEvents = useCallback(async () => {
    setFetching(true);
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("created_by", user?.id ?? "")
      .order("date", { ascending: true });
    setEvents((data as EventRow[]) ?? []);
    setFetching(false);
  }, [user?.id]);

  useEffect(() => { if (isAdmin) fetchEvents(); }, [isAdmin, fetchEvents]);

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from("events").update({ is_published: !current }).eq("id", id);
    setEvents((prev) => prev.map((e) => e.id === id ? { ...e, is_published: !current } : e));
    toast({ title: !current ? "Event published" : "Event unpublished" });
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await supabase.from("events").delete().eq("id", deleteId);
    setEvents((prev) => prev.filter((e) => e.id !== deleteId));
    setDeleteId(null);
    toast({ title: "Event deleted" });
  };

  if (loading || authLoading) return <div className="flex h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Your Events</h1>
            <p className="text-sm text-muted-foreground">Create, edit, publish and manage your events.</p>
          </div>
          <Button className="gap-2" onClick={() => { setEditingEvent(null); setFormOpen(true); }}>
            <PlusCircle size={16} /> Create Event
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="mb-5 flex gap-2">
          {(["all", "published", "draft"] as const).map((f) => {
            const count = f === "all" ? events.length : events.filter((e) => f === "published" ? e.is_published : !e.is_published).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? "All" : f === "published" ? "Published" : "Draft"} ({count})
              </button>
            );
          })}
        </div>

        {fetching ? (
          <p className="text-sm text-muted-foreground">Loading events...</p>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <CalendarDays className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">No events yet. Create your first event!</p>
          </div>
        ) : (() => {
          const filtered = filter === "all" ? events : events.filter((e) => filter === "published" ? e.is_published : !e.is_published);
          return filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <CalendarDays className="h-12 w-12 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">No {filter} events found.</p>
            </div>
          ) : (
          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-2 px-2 scrollbar-thin sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-x-visible sm:snap-none sm:pb-0 sm:mx-0 sm:px-0">
            {filtered.map((e) => (
              <div key={e.id} className="group relative rounded-xl border border-border overflow-hidden bg-card transition-transform duration-200 hover:scale-[1.02] cursor-pointer min-w-[280px] shrink-0 sm:min-w-0 sm:shrink snap-start" onClick={() => setViewingEvent(e)}>
                {/* 3-dot menu */}
                <div className="absolute top-2 right-2 z-10" onClick={(ev) => ev.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(ev) => { ev.stopPropagation(); setEditingEvent(e); setFormOpen(true); }}>
                        <Pencil size={14} className="mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(ev) => { ev.stopPropagation(); togglePublish(e.id, !!e.is_published); }}>
                        {e.is_published ? <EyeOff size={14} className="mr-2" /> : <Eye size={14} className="mr-2" />}
                        {e.is_published ? "Unpublish" : "Publish"}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(ev) => { ev.stopPropagation(); setDeleteId(e.id); }}>
                        <Trash2 size={14} className="mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Status badge */}
                <div className="absolute top-2 left-2 z-10">
                  <Badge variant={e.is_published ? "default" : "secondary"} className="text-[10px] shadow-sm">
                    {e.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>

                {/* Image */}
                {e.image_url ? (
                  <img src={e.image_url} alt={e.title} className="h-40 w-full object-cover" />
                ) : (
                  <div className="h-40 w-full bg-muted flex items-center justify-center">
                    <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <p className="text-xs font-medium text-primary">
                    {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <h4 className="mt-1 text-sm font-bold text-foreground truncate">{e.title}</h4>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {e.category ?? "Event"}
                    </Badge>
                    {e.location && (
                      <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{e.location}</span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Users size={12} />
                    <span>{participantCounts[e.id] ?? 0} participants</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          );
        })()}

        {viewingEvent && (
          <EventDetailModal
            open={!!viewingEvent}
            onClose={() => setViewingEvent(null)}
            event={{ ...viewingEvent, participant_count: participantCounts[viewingEvent.id] ?? 0 }}
          />
        )}

        {formOpen && (
          <EventFormModal
            open={formOpen}
            onClose={() => { setFormOpen(false); setEditingEvent(null); }}
            onSaved={fetchEvents}
            event={editingEvent}
          />
        )}

        <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this event?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default AdminEvents;
