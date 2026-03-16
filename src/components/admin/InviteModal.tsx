import { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  open: boolean;
  onClose: () => void;
}

const InviteModal = ({ open, onClose }: Props) => {
  const [copied, setCopied] = useState(false);
  const inviteLink = `${window.location.origin}/?invite=vibehub`;

  if (!open) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4" onClick={onClose}>
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"><X size={20} /></button>
        <h2 className="text-xl font-bold text-foreground mb-4">Invite Members</h2>
        <p className="text-sm text-muted-foreground mb-3">Share this link to invite new members to VibeHub.</p>
        <div className="flex gap-2">
          <Input value={inviteLink} readOnly className="flex-1" />
          <Button onClick={handleCopy} variant="outline" className="gap-2">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
