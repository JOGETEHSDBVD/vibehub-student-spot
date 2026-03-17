import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AdminSidebar from "@/components/admin/AdminSidebar";
import EventFormModal from "@/components/admin/EventFormModal";
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
  created_at: string;
  created_by: string | null;
}

const AdminEvents = () => {
  const { isAdmin, loading } = useAdminCheck();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
      .order("date", { ascending: false });
    setEvents((data as EventRow[]) ?? []);
    setFetching(false);
  }, []);

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
            <h1 className="text-2xl font-bold text-foreground">Event Management</h1>
            <p className="text-sm text-muted-foreground">Create, edit, publish and manage all events.</p>
          </div>
          <Button className="gap-2" onClick={() => { setEditingEvent(null); setFormOpen(true); }}>
            <PlusCircle size={16} /> Create Event
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card">
          {fetching ? (
            <p className="p-6 text-sm text-muted-foreground">Loading events...</p>
          ) : events.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No events yet. Create your first event!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.title}</TableCell>
                    <TableCell>{new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{e.category ?? "—"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={!!e.is_published} onCheckedChange={() => togglePublish(e.id, !!e.is_published)} />
                        <span className="text-xs text-muted-foreground">{e.is_published ? "Published" : "Draft"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setEditingEvent(e); setFormOpen(true); }}>
                          <Pencil size={15} />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(e.id)}>
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Create / Edit Modal */}
        {formOpen && (
          <EventFormModal
            open={formOpen}
            onClose={() => { setFormOpen(false); setEditingEvent(null); }}
            onSaved={fetchEvents}
            event={editingEvent}
          />
        )}

        {/* Delete Confirmation */}
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
