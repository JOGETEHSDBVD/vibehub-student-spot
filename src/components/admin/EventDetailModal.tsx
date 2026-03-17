import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin } from "lucide-react";

interface EventDetailModalProps {
  open: boolean;
  onClose: () => void;
  event: {
    title: string;
    description?: string | null;
    date: string;
    location?: string | null;
    image_url?: string | null;
    category?: string | null;
    is_published?: boolean | null;
    creator_name?: string | null;
  };
}

const EventDetailModal = ({ open, onClose, event }: EventDetailModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Image */}
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="h-56 w-full object-cover" />
        ) : (
          <div className="h-56 w-full bg-muted flex items-center justify-center">
            <CalendarDays className="h-14 w-14 text-muted-foreground/30" />
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="uppercase text-xs">
              {event.category ?? "Event"}
            </Badge>
            {event.is_published !== undefined && (
              <Badge variant={event.is_published ? "default" : "secondary"} className="text-xs">
                {event.is_published ? "Published" : "Draft"}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-foreground">{event.title}</h2>

          {/* Date & Location */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={15} className="text-primary" />
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            {event.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={15} className="text-primary" />
                {event.location}
              </div>
            )}
          </div>

          {/* Creator */}
          {event.creator_name && (
            <p className="text-xs text-muted-foreground">Created by <span className="font-medium text-foreground">{event.creator_name}</span></p>
          )}

          {/* Description */}
          {event.description ? (
            <div className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>
          ) : (
            <div className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground italic">No description provided.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailModal;
