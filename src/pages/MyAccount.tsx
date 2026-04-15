import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Camera, User, ArrowLeft, CalendarDays } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import ChangePasswordSection from "@/components/ChangePasswordSection";

interface MyEvent {
  event_id: string;
  status: string;
  joined_at: string;
  event_title: string;
  event_date: string;
  event_image_url: string | null;
  event_category: string | null;
}

const MyAccount = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [myEvents, setMyEvents] = useState<MyEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setAvatarUrl(profile.avatar_url ?? null);
    }
  }, [profile]);

  // Fetch user's event participations
  useEffect(() => {
    if (!user) return;
    const fetchMyEvents = async () => {
      setEventsLoading(true);
      const { data: participations } = await supabase
        .from("event_participants")
        .select("event_id, status, joined_at")
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false });

      if (participations && participations.length > 0) {
        const eventIds = participations.map((p: any) => p.event_id);
        const { data: events } = await supabase
          .from("events")
          .select("id, title, date, image_url, category")
          .in("id", eventIds);

        const eventMap = Object.fromEntries(
          (events ?? []).map((e: any) => [e.id, e])
        );

        setMyEvents(
          participations.map((p: any) => ({
            event_id: p.event_id,
            status: p.status ?? "approved",
            joined_at: p.joined_at,
            event_title: eventMap[p.event_id]?.title ?? "Unknown Event",
            event_date: eventMap[p.event_id]?.date ?? p.joined_at,
            event_image_url: eventMap[p.event_id]?.image_url ?? null,
            event_category: eventMap[p.event_id]?.category ?? null,
          }))
        );
      } else {
        setMyEvents([]);
      }
      setEventsLoading(false);
    };
    fetchMyEvents();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateErr } = await (supabase.rpc as any)("update_own_profile", {
      _avatar_url: newUrl,
    });

    if (updateErr) {
      toast({ title: "Failed to save avatar", description: updateErr.message, variant: "destructive" });
    } else {
      setAvatarUrl(newUrl);
      refreshProfile();
      toast({ title: "Profile picture updated" });
    }
    setUploading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 hover:bg-amber-500/30">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30 hover:bg-green-500/30">Confirmed</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Header with avatar and name */}
        <div className="flex items-center gap-5 mb-10">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border-2 border-border">
                <User className="h-8 w-8 text-primary" />
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
            >
              <Camera size={13} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {profile?.full_name || "Member"}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {uploading && <p className="text-xs text-primary mt-1">Uploading...</p>}
          </div>
        </div>

        {/* Profile Information - Read Only */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <h2 className="text-lg font-bold text-foreground">My Information</h2>

          <div>
            <Label className="text-muted-foreground">Full Name</Label>
            <Input value={profile?.full_name ?? ""} disabled className="bg-muted mt-1" />
          </div>

          <div>
            <Label className="text-muted-foreground">Email</Label>
            <Input value={user.email ?? ""} disabled className="bg-muted mt-1" />
          </div>

          <div>
            <Label className="text-muted-foreground">Role at the Établissement</Label>
            <Input
              value={profile?.member_type ? profile.member_type.charAt(0).toUpperCase() + profile.member_type.slice(1) : "—"}
              disabled
              className="bg-muted mt-1"
            />
          </div>

          <div>
            <Label className="text-muted-foreground">Pôle</Label>
            <Input value={profile?.pole ?? "—"} disabled className="bg-muted mt-1" />
          </div>

          <div>
            <Label className="text-muted-foreground">Filière</Label>
            <Input value={profile?.filiere ?? "—"} disabled className="bg-muted mt-1" />
          </div>
        </div>

        {/* My Events */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4 mt-8">
          <h2 className="text-lg font-bold text-foreground">My Events</h2>
          {eventsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="h-12 w-12 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 bg-muted rounded" />
                    <div className="h-2 w-20 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : myEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">You haven't joined any events yet.</p>
          ) : (
            <div className="space-y-3">
              {myEvents.map((ev) => (
                <Link
                  key={ev.event_id}
                  to={`/events/${ev.event_id}`}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                >
                  {ev.event_image_url ? (
                    <img src={ev.event_image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                      <CalendarDays size={16} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ev.event_title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(ev.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  {getStatusBadge(ev.status)}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <ChangePasswordSection />
        </div>
      </main>
    </div>
  );
};

export default MyAccount;
