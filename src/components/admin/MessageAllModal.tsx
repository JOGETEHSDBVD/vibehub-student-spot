import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const MessageAllModal = ({ open, onClose }: Props) => {
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  if (!open) return null;

  const handleSend = () => {
    toast({ title: "Coming soon", description: "Messaging all members is not yet implemented." });
    setMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4" onClick={onClose}>
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"><X size={20} /></button>
        <h2 className="text-xl font-bold text-foreground mb-4">Message All Members</h2>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message..." rows={4} />
        <Button onClick={handleSend} className="mt-4 w-full">Send Message</Button>
        <p className="mt-2 text-xs text-muted-foreground text-center">This feature is a placeholder and will be available soon.</p>
      </div>
    </div>
  );
};

export default MessageAllModal;
