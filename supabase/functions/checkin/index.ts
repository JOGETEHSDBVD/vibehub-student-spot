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

  const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // --- Authenticate the caller ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ valid: false, error: "Unauthorized" }),
        { status: 401, headers: jsonHeaders }
      );
    }

    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const jwt = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await anonClient.auth.getUser(jwt);
    if (claimsErr || !claimsData?.user) {
      return new Response(
        JSON.stringify({ valid: false, error: "Unauthorized" }),
        { status: 401, headers: jsonHeaders }
      );
    }

    const callerId = claimsData.user.id;

    // --- Authorize: must be admin or scanner ---
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    const [{ data: isAdmin }, { data: isScanner }] = await Promise.all([
      serviceClient.rpc("has_role", { _user_id: callerId, _role: "admin" }),
      serviceClient.rpc("has_role", { _user_id: callerId, _role: "scanner" }),
    ]);

    if (!isAdmin && !isScanner) {
      return new Response(
        JSON.stringify({ valid: false, error: "Forbidden" }),
        { status: 403, headers: jsonHeaders }
      );
    }

    // --- Validate input ---
    const url = new URL(req.url);
    const ticketId = url.searchParams.get("ticketId");

    if (!ticketId) {
      return new Response(
        JSON.stringify({ valid: false, error: "Missing ticketId" }),
        { status: 400, headers: jsonHeaders }
      );
    }

    // Basic UUID format check
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(ticketId)) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid ticketId format" }),
        { status: 400, headers: jsonHeaders }
      );
    }

    // Find the ticket
    const { data: ticket, error } = await serviceClient
      .from("event_tickets")
      .select("id, event_id, user_id, used, used_at")
      .eq("id", ticketId)
      .single();

    if (error || !ticket) {
      return new Response(
        JSON.stringify({ valid: false, alreadyUsed: false, error: "Ticket not found" }),
        { status: 404, headers: jsonHeaders }
      );
    }

    if (ticket.used) {
      const { data: profile } = await serviceClient
        .from("profiles")
        .select("full_name, avatar_url, pole")
        .eq("id", ticket.user_id)
        .single();

      return new Response(
        JSON.stringify({
          valid: false,
          alreadyUsed: true,
          usedAt: ticket.used_at,
          userName: profile?.full_name ?? "Unknown",
          userPole: profile?.pole ?? null,
        }),
        { status: 200, headers: jsonHeaders }
      );
    }

    // Mark as used
    const { error: updateError } = await serviceClient
      .from("event_tickets")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("id", ticketId);

    if (updateError) {
      console.error("Checkin update error:", updateError);
      return new Response(
        JSON.stringify({ valid: false, error: "Failed to check in" }),
        { status: 500, headers: jsonHeaders }
      );
    }

    // Get user info
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("full_name, avatar_url, pole")
      .eq("id", ticket.user_id)
      .single();

    return new Response(
      JSON.stringify({
        valid: true,
        alreadyUsed: false,
        userName: profile?.full_name ?? "Unknown",
        userPole: profile?.pole ?? null,
        avatarUrl: profile?.avatar_url,
        eventId: ticket.event_id,
      }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (err) {
    console.error("Checkin error:", err);
    return new Response(
      JSON.stringify({ valid: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
