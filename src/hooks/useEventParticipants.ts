import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Participant {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  joined_at: string;
  pole: string | null;
  member_type: string | null;
  email: string | null;
  status: string;
}

export const useEventParticipantCounts = (eventIds: string[]) => {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (eventIds.length === 0) return;
    const fetchCounts = async () => {
      const { data } = await supabase
        .from("event_participants")
        .select("event_id, status")
        .in("event_id", eventIds);
      if (data) {
        const map: Record<string, number> = {};
        data.forEach((row: any) => {
          // Only count approved participants
          if (row.status === "approved") {
            map[row.event_id] = (map[row.event_id] || 0) + 1;
          }
        });
        setCounts(map);
      }
    };
    fetchCounts();
  }, [eventIds.join(",")]);

  return counts;
};

export const useEventParticipants = (eventId: string | null) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = async () => {
    if (!eventId) { setParticipants([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("event_participants")
      .select("user_id, joined_at, status")
      .eq("event_id", eventId)
      .order("joined_at", { ascending: false });

    if (data && data.length > 0) {
      const userIds = data.map((d: any) => d.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, pole, member_type, email")
        .in("id", userIds);

      const profileMap = Object.fromEntries(
        (profiles ?? []).map((p: any) => [p.id, p])
      );

      setParticipants(
        data.map((d: any) => ({
          user_id: d.user_id,
          full_name: profileMap[d.user_id]?.full_name ?? "Unknown",
          avatar_url: profileMap[d.user_id]?.avatar_url ?? null,
          joined_at: d.joined_at,
          pole: profileMap[d.user_id]?.pole ?? null,
          member_type: profileMap[d.user_id]?.member_type ?? null,
          email: profileMap[d.user_id]?.email ?? null,
          status: d.status ?? "approved",
        }))
      );
    } else {
      setParticipants([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    refetch();
  }, [eventId]);

  return { participants, loading, refetch };
};
