import { Megaphone, Mail, UserPlus, FileText } from "lucide-react";

const actions = [
  { label: "Announce", icon: Megaphone },
  { label: "Message All", icon: Mail },
  { label: "Invite", icon: UserPlus },
  { label: "Invoices", icon: FileText },
];

const QuickActions = () => (
  <div className="rounded-xl border border-border bg-card p-5">
    <h3 className="mb-4 text-lg font-bold text-foreground">Quick Actions</h3>
    <div className="grid grid-cols-2 gap-3">
      {actions.map((a) => (
        <button
          key={a.label}
          className="flex flex-col items-center gap-2 rounded-xl bg-primary/5 p-4 text-primary transition-colors hover:bg-primary/10"
        >
          <a.icon size={22} />
          <span className="text-xs font-semibold">{a.label}</span>
        </button>
      ))}
    </div>
  </div>
);

export default QuickActions;
