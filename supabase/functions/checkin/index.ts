import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const ticketId = url.searchParams.get("ticketId");

    if (!ticketId) {
      return new Response(
        JSON.stringify({ valid: false, error: "Missing ticketId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find the ticket
    const { data: ticket, error } = await supabase
      .from("event_tickets")
      .select("id, event_id, user_id, used, used_at")
      .eq("id", ticketId)
      .single();

    if (error || !ticket) {
      return new Response(
        JSON.stringify({ valid: false, alreadyUsed: false, error: "Ticket not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (ticket.used) {
      // Get user info for display
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", ticket.user_id)
        .single();

      return new Response(
        JSON.stringify({
          valid: false,
          alreadyUsed: true,
          usedAt: ticket.used_at,
          userName: profile?.full_name ?? "Unknown",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark as used
    const { error: updateError } = await supabase
      .from("event_tickets")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("id", ticketId);

    if (updateError) {
      return new Response(
        JSON.stringify({ valid: false, error: "Failed to check in" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user info
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", ticket.user_id)
      .single();

    return new Response(
      JSON.stringify({
        valid: true,
        alreadyUsed: false,
        userName: profile?.full_name ?? "Unknown",
        avatarUrl: profile?.avatar_url,
        eventId: ticket.event_id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ valid: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
