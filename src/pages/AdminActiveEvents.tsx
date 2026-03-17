import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface EventRow {
  id: string;
  title: string;
  date: string;
  location: string | null;
  image_url: string | null;
  category: string | null;
}

const AdminActiveEvents = () => {
  const { isAdmin, loading } = useAdminCheck();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !authLoading) {
      if (!user || !isAdmin) navigate("/");
    }
  }, [isAdmin, loading, authLoading, user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetch = async () => {
      setFetching(true);
      const { data } = await supabase
        .from("events")
        .select("id, title, date, location, image_url, category")
        .eq("is_published", true)
        .order("date", { ascending: false });
      setEvents(data ?? []);
      setFetching(false);
    };
    fetch();
  }, [isAdmin]);

  if (loading || authLoading) return <div className="flex h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Active Events</h1>
          <p className="text-sm text-muted-foreground">All currently published events across the platform.</p>
        </div>

        {fetching ? (
          <p className="text-sm text-muted-foreground">Loading events...</p>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <CalendarDays className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">No active events yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((e) => (
              <div key={e.id} className="rounded-xl border border-border overflow-hidden bg-card transition-transform duration-200 hover:scale-[1.02]">
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
                    {e.location && (
                      <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{e.location}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminActiveEvents;
