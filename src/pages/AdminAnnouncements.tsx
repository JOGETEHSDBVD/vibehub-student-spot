import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Pencil, Trash2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Announcement {
  id: string;
  title: string;
  message: string;
  created_by: string | null;
  created_at: string;
  author_name?: string;
}

const AdminAnnouncements = () => {
  const { isAdmin, loading } = useAdminCheck();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);
  const [fetching, setFetching] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !authLoading) {
      if (!user || !isAdmin) navigate("/");
    }
  }, [isAdmin, loading, authLoading, user, navigate]);

  const fetchAnnouncements = useCallback(async () => {
    setFetching(true);
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    const announcements = (data as Announcement[]) ?? [];

    // Fetch author names for all announcements
    const authorIds = [...new Set(announcements.map((a) => a.created_by).filter(Boolean))] as string[];
    let authorMap: Record<string, string> = {};
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", authorIds);
      (profiles ?? []).forEach((p: any) => {
        authorMap[p.id] = p.full_name || p.email || "Unknown";
      });
    }

    setAllAnnouncements(
      announcements.map((a) => ({
        ...a,
        author_name: a.created_by ? authorMap[a.created_by] || "Unknown" : "Unknown",
      }))
    );
    setFetching(false);
  }, []);

  useEffect(() => { if (isAdmin) fetchAnnouncements(); }, [isAdmin, fetchAnnouncements]);

  const myAnnouncements = allAnnouncements.filter((a) => a.created_by === user?.id);
  const othersAnnouncements = allAnnouncements.filter((a) => a.created_by !== user?.id);

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setMessage("");
    setFormOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setTitle(a.title);
    setMessage(a.message);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: "Title and message are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from("announcements").update({ title, message }).eq("id", editing.id);
      if (error) { toast({ title: "Failed to update", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Announcement updated" }); }
    } else {
      const { error } = await supabase.from("announcements").insert({ title, message, created_by: user?.id ?? null });
      if (error) { toast({ title: "Failed to create", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Announcement created" }); }
    }
    setSaving(false);
    setFormOpen(false);
    fetchAnnouncements();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await supabase.from("announcements").delete().eq("id", deleteId);
    setDeleteId(null);
    toast({ title: "Announcement deleted" });
    fetchAnnouncements();
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

  const renderAnnouncementCard = (a: Announcement, canEdit: boolean) => (
    <div key={a.id} className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground">{a.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{a.message}</p>
          <div className="mt-3 flex items-center gap-3">
            <p className="text-xs text-muted-foreground">{formatDate(a.created_at)}</p>
            {a.author_name && (
              <span className="text-xs font-medium text-primary">by {a.author_name}</span>
            )}
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-1 ml-4">
            <Button size="icon" variant="ghost" onClick={() => openEdit(a)}><Pencil size={15} /></Button>
            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(a.id)}><Trash2 size={15} /></Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderEmpty = (text: string) => (
    <div className="rounded-xl border border-border bg-card p-12 text-center">
      <Megaphone className="mx-auto h-12 w-12 text-muted-foreground/30" />
      <p className="mt-4 text-lg text-muted-foreground">{text}</p>
    </div>
  );

  if (loading || authLoading) return <div className="flex h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
            <p className="text-sm text-muted-foreground">Create and manage announcements for all members.</p>
          </div>
          <Button className="gap-2" onClick={openCreate}>
            <PlusCircle size={16} /> New Announcement
          </Button>
        </div>

        <Tabs defaultValue="mine" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="mine">Your Announcements ({myAnnouncements.length})</TabsTrigger>
            <TabsTrigger value="all">All Announcements ({allAnnouncements.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="mine" className="space-y-4">
            {fetching ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : myAnnouncements.length === 0 ? (
              renderEmpty("You haven't created any announcements yet.")
            ) : (
              myAnnouncements.map((a) => renderAnnouncementCard(a, true))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {fetching ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : allAnnouncements.length === 0 ? (
              renderEmpty("No announcements yet.")
            ) : (
              allAnnouncements.map((a) => renderAnnouncementCard(a, a.created_by === user?.id))
            )}
          </TabsContent>
        </Tabs>

        {/* Create / Edit Modal */}
        <Dialog open={formOpen} onOpenChange={(o) => !o && setFormOpen(false)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Announcement" : "New Announcement"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your announcement..." rows={5} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this announcement?</AlertDialogTitle>
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

export default AdminAnnouncements;
