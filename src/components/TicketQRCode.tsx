import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Ticket, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface TicketQRCodeProps {
  eventId: string;
  userId: string;
  eventTitle: string;
}

const TicketQRCode = ({ eventId, userId, eventTitle }: TicketQRCodeProps) => {
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrCreateTicket = async () => {
      setLoading(true);

      // Check if ticket already exists
      const { data: existing } = await supabase
        .from("event_tickets")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        setTicketId(existing.id);
      } else {
        // Create new ticket
        const { data: newTicket, error } = await supabase
          .from("event_tickets")
          .insert({ event_id: eventId, user_id: userId })
          .select("id")
          .single();

        if (!error && newTicket) {
          setTicketId(newTicket.id);
        }
      }
      setLoading(false);
    };

    fetchOrCreateTicket();
  }, [eventId, userId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Generating ticket...
      </div>
    );
  }

  if (!ticketId) return null;

  const checkinUrl = `${window.location.origin}/checkin/${ticketId}`;

  const handleDownload = () => {
    const svg = document.getElementById("ticket-qr-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `ticket-${eventTitle.replace(/\s+/g, "-")}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/10 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Ticket size={18} className="text-primary" />
        <h4 className="text-sm font-bold text-dark-bg-foreground">Your Event Ticket</h4>
      </div>

      <div className="flex justify-center">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <QRCodeSVG
            id="ticket-qr-svg"
            value={checkinUrl}
            size={180}
            level="H"
            includeMargin
          />
        </div>
      </div>

      <p className="text-xs text-center text-dark-bg-foreground/60">
        Show this QR code at the event entrance for check-in
      </p>

      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="w-full gap-2 border-dark-bg-foreground/20 text-dark-bg-foreground hover:bg-dark-bg-foreground/10"
      >
        <Download size={14} /> Save Ticket
      </Button>
      </Button>
    </div>
  );
};

export default TicketQRCode;
