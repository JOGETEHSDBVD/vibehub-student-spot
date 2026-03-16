import { Users, CalendarCheck, DollarSign, Zap } from "lucide-react";

const stats = [
  {
    label: "Total Members",
    value: "1,240",
    change: "+12%",
    changeColor: "text-emerald-500",
    icon: Users,
    iconBg: "bg-primary/10 text-primary",
  },
  {
    label: "Active Events",
    value: "8",
    change: "Steady—",
    changeColor: "text-muted-foreground",
    icon: CalendarCheck,
    iconBg: "bg-amber-100 text-amber-600",
  },
  {
    label: "Monthly Revenue",
    value: "$4,850",
    change: "+5.2%",
    changeColor: "text-emerald-500",
    icon: DollarSign,
    iconBg: "bg-primary/10 text-primary",
  },
  {
    label: "Engagement Rate",
    value: "68.4%",
    change: "-2%",
    changeColor: "text-red-400",
    icon: Zap,
    iconBg: "bg-purple-100 text-purple-500",
  },
];

const StatsCards = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {stats.map((s) => (
      <div key={s.label} className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.iconBg}`}>
            <s.icon size={20} />
          </div>
          <span className={`text-xs font-medium ${s.changeColor}`}>{s.change}</span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{s.label}</p>
        <p className="text-2xl font-bold text-foreground">{s.value}</p>
      </div>
    ))}
  </div>
);

export default StatsCards;
