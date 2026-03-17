import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { useEventParticipants } from "@/hooks/useEventParticipants";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EventDetailModalProps {
  open: boolean;
  onClose: () => void;
  event: {
    id?: string;
    title: string;
    description?: string | null;
    date: string;
    location?: string | null;
    image_url?: string | null;
    category?: string | null;
    is_published?: boolean | null;
    creator_name?: string | null;
    participant_count?: number;
  };
}

const EventDetailModal = ({ open, onClose, event }: EventDetailModalProps) => {
  const { participants, loading: participantsLoading } = useEventParticipants(open ? event.id ?? null : null);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden max-h-[85vh]">
        <ScrollArea className="max-h-[85vh]">
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

            {/* Participants */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  Participants ({participantsLoading ? "..." : participants.length})
                </h3>
              </div>

              {participantsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="h-8 w-8 rounded-full bg-muted" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                  ))}
                </div>
              ) : participants.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No participants yet.</p>
              ) : (
                <div className="space-y-2">
                  {participants.map((p) => (
                    <div key={p.user_id} className="flex items-center gap-3">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {p.full_name?.[0] ?? "?"}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.full_name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Joined {new Date(p.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailModal;
