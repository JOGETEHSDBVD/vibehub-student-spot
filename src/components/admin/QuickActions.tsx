import { useState } from "react";
import { Megaphone, Mail, UserPlus, FileText } from "lucide-react";
import AnnouncementModal from "./AnnouncementModal";
import MessageAllModal from "./MessageAllModal";
import InviteModal from "./InviteModal";
import { useToast } from "@/hooks/use-toast";

const QuickActions = () => {
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const { toast } = useToast();

  const actions = [
    { label: "Announce", icon: Megaphone, onClick: () => setAnnounceOpen(true) },
    { label: "Message All", icon: Mail, onClick: () => setMessageOpen(true) },
    { label: "Invite", icon: UserPlus, onClick: () => setInviteOpen(true) },
    {
      label: "Invoices",
      icon: FileText,
      onClick: () => toast({ title: "Coming soon", description: "Invoices feature is not yet available." }),
      disabled: true,
    },
  ];

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-lg font-bold text-foreground">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              disabled={a.disabled}
              className="flex flex-col items-center gap-2 rounded-xl bg-primary/5 p-4 text-primary transition-colors hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <a.icon size={22} />
              <span className="text-xs font-semibold">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnnouncementModal open={announceOpen} onClose={() => setAnnounceOpen(false)} />
      <MessageAllModal open={messageOpen} onClose={() => setMessageOpen(false)} />
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
};

export default QuickActions;
