import { useEffect, useState } from "react";
import { Users, CalendarCheck, TrendingUp, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const StatsCards = () => {
  const [totalMembers, setTotalMembers] = useState(0);
  const [activeEvents, setActiveEvents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [membersRes, eventsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("events")
          .select("id", { count: "exact", head: true })
          .eq("is_published", true),
      ]);

      setTotalMembers(membersRes.count ?? 0);
      setActiveEvents(eventsRes.count ?? 0);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const stats = [
    {
      label: "Total Members",
      value: loading ? "—" : totalMembers.toLocaleString(),
      change: "",
      changeColor: "text-muted-foreground",
      icon: Users,
      iconBg: "bg-primary/10 text-primary-foreground bg-primary",
    },
    {
      label: "Active Events",
      value: loading ? "—" : String(activeEvents),
      change: "",
      changeColor: "text-muted-foreground",
      icon: CalendarCheck,
      iconBg: "bg-primary/10 text-primary",
    },
    {
      label: "Total Participation",
      value: loading ? "—" : "0",
      change: "",
      changeColor: "text-muted-foreground",
      icon: TrendingUp,
      iconBg: "bg-primary/10 text-primary",
    },
    {
      label: "Engagement Rate",
      value: "0%",
      change: "",
      changeColor: "text-muted-foreground",
      icon: Zap,
      iconBg: "bg-primary/10 text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-start justify-between">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.iconBg}`}>
              <s.icon size={20} />
            </div>
            {s.change && <span className={`text-xs font-medium ${s.changeColor}`}>{s.change}</span>}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{s.label}</p>
          <p className="text-2xl font-bold text-foreground">{s.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
