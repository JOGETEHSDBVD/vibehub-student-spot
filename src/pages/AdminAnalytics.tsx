import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, CalendarDays, CalendarCheck, TrendingUp } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const AdminAnalytics = () => {
  const { isAdmin, loading } = useAdminCheck();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalMembers: 0, totalEvents: 0, upcomingEvents: 0 });
  const [membersByMonth, setMembersByMonth] = useState<{ month: string; count: number }[]>([]);
  const [eventsByCategory, setEventsByCategory] = useState<{ category: string; count: number }[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !authLoading) {
      if (!user || !isAdmin) navigate("/");
    }
  }, [isAdmin, loading, authLoading, user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchAnalytics = async () => {
      setFetching(true);

      const [membersRes, eventsRes, upcomingRes] = await Promise.all([
        supabase.from("profiles").select("id, created_at"),
        supabase.from("events").select("id, category, date"),
        supabase.from("events").select("id", { count: "exact", head: true })
          .gte("date", new Date().toISOString())
          .eq("is_published", true),
      ]);

      const members = membersRes.data ?? [];
      const events = eventsRes.data ?? [];

      setStats({
        totalMembers: members.length,
        totalEvents: events.length,
        upcomingEvents: upcomingRes.count ?? 0,
      });

      // Members by month
      const monthMap: Record<string, number> = {};
      members.forEach((m) => {
        const d = new Date(m.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthMap[key] = (monthMap[key] ?? 0) + 1;
      });
      const sortedMonths = Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({
          month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          count,
        }));
      setMembersByMonth(sortedMonths);

      // Events by category
      const catMap: Record<string, number> = {};
      events.forEach((e) => {
        const cat = (e as any).category ?? "Uncategorized";
        catMap[cat] = (catMap[cat] ?? 0) + 1;
      });
      setEventsByCategory(Object.entries(catMap).map(([category, count]) => ({ category, count })));

      setFetching(false);
    };
    fetchAnalytics();
  }, [isAdmin]);

  if (loading || authLoading) return <div className="flex h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!isAdmin) return null;

  const hasData = stats.totalMembers > 0 || stats.totalEvents > 0;
  const maxMemberCount = Math.max(...membersByMonth.map((m) => m.count), 1);

  return (
    <div className="flex h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Insights and metrics for VibeHub.</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
          {[
            { label: "Total Members", value: stats.totalMembers, icon: Users, color: "bg-primary/10 text-primary" },
            { label: "Total Events", value: stats.totalEvents, icon: CalendarDays, color: "bg-amber-100 text-amber-600" },
            { label: "Upcoming Events", value: stats.upcomingEvents, icon: CalendarCheck, color: "bg-emerald-100 text-emerald-600" },
            { label: "Participation", value: "0", icon: TrendingUp, color: "bg-purple-100 text-purple-500" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon size={20} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground">{fetching ? "—" : s.value}</p>
            </div>
          ))}
        </div>

        {!hasData && !fetching ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-lg text-muted-foreground">No analytics data yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Members Growth Chart */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-lg font-bold text-foreground mb-4">Members Growth</h3>
              {membersByMonth.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet.</p>
              ) : (
                <div className="flex items-end gap-2 h-48">
                  {membersByMonth.map((m) => (
                    <div key={m.month} className="flex flex-col items-center flex-1 min-w-0">
                      <span className="text-xs font-semibold text-foreground mb-1">{m.count}</span>
                      <div
                        className="w-full rounded-t-md bg-primary/80 min-h-[4px]"
                        style={{ height: `${(m.count / maxMemberCount) * 100}%` }}
                      />
                      <span className="mt-2 text-[10px] text-muted-foreground truncate w-full text-center">{m.month}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Events by Category */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-lg font-bold text-foreground mb-4">Events by Category</h3>
              {eventsByCategory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events yet.</p>
              ) : (
                <div className="space-y-3">
                  {eventsByCategory.map((c) => {
                    const maxCat = Math.max(...eventsByCategory.map((x) => x.count), 1);
                    return (
                      <div key={c.category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-foreground">{c.category}</span>
                          <span className="text-muted-foreground">{c.count}</span>
                        </div>
                        <div className="h-3 rounded-full bg-muted">
                          <div
                            className="h-3 rounded-full bg-primary"
                            style={{ width: `${(c.count / maxCat) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminAnalytics;
