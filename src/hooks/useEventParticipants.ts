import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Participant {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  joined_at: string;
}

export const useEventParticipantCounts = (eventIds: string[]) => {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (eventIds.length === 0) return;
    const fetchCounts = async () => {
      const { data } = await supabase
        .from("event_participants")
        .select("event_id")
        .in("event_id", eventIds);
      if (data) {
        const map: Record<string, number> = {};
        data.forEach((row: any) => {
          map[row.event_id] = (map[row.event_id] || 0) + 1;
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

  useEffect(() => {
    if (!eventId) { setParticipants([]); return; }
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("event_participants")
        .select("user_id, joined_at")
        .eq("event_id", eventId)
        .order("joined_at", { ascending: false });

      if (data && data.length > 0) {
        const userIds = data.map((d: any) => d.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
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
          }))
        );
      } else {
        setParticipants([]);
      }
      setLoading(false);
    };
    fetch();
  }, [eventId]);

  return { participants, loading };
};
