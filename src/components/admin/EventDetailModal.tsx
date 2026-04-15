import { useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Users, Download, Filter, Check, X } from "lucide-react";
import { useEventParticipants, type Participant } from "@/hooks/useEventParticipants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MEMBER_TYPES: Record<string, string> = {
  "1ere_annee": "1ère Année",
  "2eme_annee": "2ème Année",
  trainer: "Formateur",
  administration: "Administration",
};

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
    requires_approval?: boolean;
    seat_limit?: number | null;
  };
}

const EventDetailModal = ({ open, onClose, event }: EventDetailModalProps) => {
  const { participants, loading: participantsLoading, refetch } = useEventParticipants(open ? event.id ?? null : null);
  const [sortPole, setSortPole] = useState("all");
  const [sortAnnee, setSortAnnee] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const availablePoles = useMemo(() => {
    const poles = [...new Set(participants.map((p) => p.pole).filter(Boolean))] as string[];
    return poles.sort();
  }, [participants]);

  const filtered = useMemo(() => {
    let list = [...participants];
    if (sortPole !== "all") list = list.filter((p) => p.pole === sortPole);
    if (sortAnnee !== "all") list = list.filter((p) => p.member_type === sortAnnee);
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    return list;
  }, [participants, sortPole, sortAnnee, statusFilter]);

  const approvedCount = participants.filter(p => p.status === "approved").length;
  const pendingCount = participants.filter(p => p.status === "pending").length;

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    if (!event.id) return;
    const { error } = await supabase
      .from("event_participants")
      .update({ status: newStatus } as any)
      .eq("event_id", event.id)
      .eq("user_id", userId);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Participant ${newStatus}`);
      refetch();
    }
  };

  const downloadExcel = async () => {
    const XLSX = await import("xlsx");
    const rows = filtered.map((p) => ({
      Name: p.full_name ?? "Unknown",
      Email: p.email ?? "—",
      Pôle: p.pole ?? "—",
      Type: MEMBER_TYPES[p.member_type ?? ""] ?? p.member_type ?? "—",
      Status: p.status,
      "Joined At": new Date(p.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Participants");
    XLSX.writeFile(wb, `${event.title}_participants.xlsx`);
  };

  const downloadPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${event.title} — Participants`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`, 14, 28);
    doc.text(`Total: ${filtered.length} participants`, 14, 34);

    autoTable(doc, {
      startY: 40,
      head: [["#", "Name", "Email", "Pôle", "Type", "Status", "Joined"]],
      body: filtered.map((p, i) => [
        i + 1,
        p.full_name ?? "Unknown",
        p.email ?? "—",
        p.pole ?? "—",
        MEMBER_TYPES[p.member_type ?? ""] ?? p.member_type ?? "—",
        p.status,
        new Date(p.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [34, 197, 94] },
    });

    doc.save(`${event.title}_participants.pdf`);
  };

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
              {event.requires_approval && (
                <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                  Approval Required
                </Badge>
              )}
              {event.seat_limit && (
                <Badge variant="outline" className="text-xs">
                  {approvedCount}/{event.seat_limit} seats
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
            <div className="pt-2 border-t border-border">
              {event.description ? (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No description provided.</p>
              )}
            </div>

            {/* Participants */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-primary" />
                  <h3 className="text-sm font-bold text-foreground">
                    Participants ({participantsLoading ? "..." : approvedCount})
                    {pendingCount > 0 && (
                      <span className="text-amber-500 font-normal ml-1">
                        · {pendingCount} pending
                      </span>
                    )}
                  </h3>
                </div>

                {participants.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                        <Download size={13} /> Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={downloadExcel}>
                        📊 Download Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={downloadPDF}>
                        📄 Download PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Sorting filters */}
              {participants.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Filter size={13} className="text-muted-foreground" />
                  <Select value={sortAnnee} onValueChange={setSortAnnee}>
                    <SelectTrigger className="w-[130px] h-7 text-[11px]">
                      <SelectValue placeholder="Année" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Années</SelectItem>
                      <SelectItem value="1ere_annee">1ère Année</SelectItem>
                      <SelectItem value="2eme_annee">2ème Année</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortPole} onValueChange={setSortPole}>
                    <SelectTrigger className="w-[160px] h-7 text-[11px]">
                      <SelectValue placeholder="Pôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pôles</SelectItem>
                      {availablePoles.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {event.requires_approval && (
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[120px] h-7 text-[11px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {(sortPole !== "all" || sortAnnee !== "all" || statusFilter !== "all") && (
                    <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => { setSortPole("all"); setSortAnnee("all"); setStatusFilter("all"); }}>
                      Clear
                    </Button>
                  )}
                </div>
              )}

              {participantsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="h-8 w-8 rounded-full bg-muted" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  {participants.length === 0 ? "No participants yet." : "No participants match the selected filters."}
                </p>
              ) : (
                <div className="space-y-2">
                  {filtered.map((p) => (
                    <div key={p.user_id} className="flex items-center gap-3">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {p.full_name?.[0] ?? "?"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{p.full_name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Joined {new Date(p.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          {p.member_type && (
                            <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                              {MEMBER_TYPES[p.member_type] ?? p.member_type}
                            </span>
                          )}
                          {p.pole && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">{p.pole}</p>
                          )}
                        </div>
                        {/* Status badge & actions */}
                        {event.requires_approval && (
                          <div className="flex items-center gap-1">
                            {p.status === "pending" ? (
                              <>
                                <Badge variant="outline" className="text-[9px] border-amber-500 text-amber-600 px-1.5">
                                  Pending
                                </Badge>
                                <button
                                  onClick={() => handleUpdateStatus(p.user_id, "approved")}
                                  className="h-6 w-6 rounded-full flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                                  title="Approve"
                                >
                                  <Check size={12} />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(p.user_id, "rejected")}
                                  className="h-6 w-6 rounded-full flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                  title="Reject"
                                >
                                  <X size={12} />
                                </button>
                              </>
                            ) : p.status === "approved" ? (
                              <Badge variant="outline" className="text-[9px] border-green-500 text-green-600 px-1.5">
                                Approved
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px] border-red-500 text-red-500 px-1.5">
                                Rejected
                              </Badge>
                            )}
                          </div>
                        )}
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