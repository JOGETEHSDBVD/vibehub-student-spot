import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, User, Users, History, CalendarCheck, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import EventDetailModal from "@/components/admin/EventDetailModal";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEventParticipantCounts } from "@/hooks/useEventParticipants";

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  image_url: string | null;
  category: string | null;
  created_by: string | null;
  creator_name: string | null;
  requires_approval?: boolean;
  seat_limit?: number | null;
  recap: string | null;
}

const AdminActiveEvents = () => {
  const { t } = useTranslation();
  const { isAdmin, loading } = useAdminCheck();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [viewingEvent, setViewingEvent] = useState<EventRow | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "archive">("active");

  const now = new Date().toISOString();

  const activeEvents = useMemo(() => events.filter((e) => e.date >= now), [events, now]);
  const archivedEvents = useMemo(() => events.filter((e) => e.date < now), [events, now]);
  const displayedEvents = activeTab === "active" ? activeEvents : archivedEvents;

  const eventIds = useMemo(() => events.map((e) => e.id), [events]);
  const participantCounts = useEventParticipantCounts(eventIds);

  useEffect(() => {
    if (!loading && !authLoading) {
      if (!user || !isAdmin) navigate("/");
    }
  }, [isAdmin, loading, authLoading, user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchEvents = async () => {
      setFetching(true);
      const { data } = await supabase
        .from("events")
        .select("id, title, description, date, location, image_url, category, created_by, requires_approval, seat_limit, recap")
        .eq("is_published", true)
        .order("date", { ascending: false });

      const rows = data ?? [];

      const creatorIds = [...new Set(rows.map((e) => e.created_by).filter(Boolean))] as string[];
      let profileMap: Record<string, string> = {};
      if (creatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", creatorIds);
        if (profiles) {
          profileMap = Object.fromEntries(profiles.map((p) => [p.id, p.full_name ?? "Unknown"]));
        }
      }

      setEvents(
        rows.map((e) => ({
          ...e,
          creator_name: e.created_by ? profileMap[e.created_by] ?? "Unknown" : "Unknown",
        }))
      );
      setFetching(false);
    };
    fetchEvents();
  }, [isAdmin]);

  if (loading || authLoading) return <div className="flex h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t("admin.activeEvents")}</h1>
          <p className="text-sm text-muted-foreground">All published events across the platform.</p>
        </div>

        {/* Sub-tab toggle */}
        <div className="mb-6">
          <div className="relative inline-flex rounded-lg bg-muted p-1">
            <div
              className="absolute top-1 bottom-1 rounded-md bg-primary transition-all duration-300 ease-in-out"
              style={{
                width: "calc(50% - 4px)",
                left: activeTab === "active" ? "4px" : "calc(50%)",
              }}
            />
            <button
              onClick={() => setActiveTab("active")}
              className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
                activeTab === "active" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarCheck size={15} />
              Active Events
              <Badge variant="secondary" className={`ml-1 text-[10px] ${activeTab === "active" ? "bg-primary-foreground/20 text-primary-foreground" : ""}`}>
                {activeEvents.length}
              </Badge>
            </button>
            <button
              onClick={() => setActiveTab("archive")}
              className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
                activeTab === "archive" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <History size={15} />
              Event Archive
              <Badge variant="secondary" className={`ml-1 text-[10px] ${activeTab === "archive" ? "bg-primary-foreground/20 text-primary-foreground" : ""}`}>
                {archivedEvents.length}
              </Badge>
            </button>
          </div>
        </div>

        {fetching ? (
          <p className="text-sm text-muted-foreground">Loading events...</p>
        ) : displayedEvents.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <CalendarDays className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">
              {activeTab === "active" ? "No active events." : "No archived events yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedEvents.map((e) => (
              <div
                key={e.id}
                className="group rounded-xl border border-border overflow-hidden bg-card transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
                onClick={() => {
                  if (activeTab === "archive") {
                    navigate(`/admin/past-events/${e.id}`);
                  } else {
                    setViewingEvent(e);
                  }
                }}
              >
                <div className="relative">
                  {e.image_url ? (
                    <img
                      src={e.image_url}
                      alt={e.title}
                      className={`h-40 w-full object-cover ${activeTab === "archive" ? "grayscale opacity-70" : ""}`}
                    />
                  ) : (
                    <div className="h-40 w-full bg-muted flex items-center justify-center">
                      <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                  {activeTab === "archive" && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        <Pencil size={10} /> Edit Recap
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs font-medium text-primary">
                    {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <h4 className="mt-1 text-sm font-bold text-foreground truncate">{e.title}</h4>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {e.category ?? "Event"}
                    </Badge>
                    {activeTab === "archive" && e.recap ? (
                      <Badge variant="default" className="text-[10px]">Has Recap</Badge>
                    ) : activeTab === "archive" ? (
                      <span className="text-[10px] text-muted-foreground">No recap</span>
                    ) : (
                      e.location && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{e.location}</span>
                      )
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <User size={12} />
                      <span>by {e.creator_name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Users size={12} />
                      <span>{participantCounts[e.id] ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewingEvent && (
          <EventDetailModal
            open={!!viewingEvent}
            onClose={() => setViewingEvent(null)}
            event={{ ...viewingEvent, participant_count: participantCounts[viewingEvent.id] ?? 0 }}
          />
        )}
      </main>
    </div>
  );
};

export default AdminActiveEvents;
