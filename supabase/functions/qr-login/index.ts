import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // ACTION 1: Generate a new QR session token (desktop calls this)
    if (action === "create") {
      const deviceInfo = url.searchParams.get("device") || "Desktop App";
      const token = crypto.randomUUID() + "-" + crypto.randomUUID();

      const { data, error } = await supabase
        .from("qr_login_sessions")
        .insert({ session_token: token, device_info: deviceInfo, status: "pending" })
        .select("id, session_token, created_at")
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, session: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION 2: Check session status (desktop polls this)
    if (action === "status") {
      const token = url.searchParams.get("token");
      if (!token) {
        return new Response(JSON.stringify({ error: "Token required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("qr_login_sessions")
        .select("status, user_id, confirmed_at")
        .eq("session_token", token)
        .single();

      if (error || !data) {
        return new Response(JSON.stringify({ error: "Session not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // If confirmed, generate a magic link for the desktop
      if (data.status === "confirmed" && data.user_id) {
        // Get user email
        const { data: userData } = await supabase.auth.admin.getUserById(data.user_id);
        
        if (userData?.user?.email) {
          // Generate a magic link
          const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
            type: "magiclink",
            email: userData.user.email,
          });

          if (!linkError && linkData) {
            // Mark session as used
            await supabase
              .from("qr_login_sessions")
              .update({ status: "expired" })
              .eq("session_token", token);

            return new Response(
              JSON.stringify({
                success: true,
                status: "confirmed",
                access_token: linkData.properties?.access_token,
                refresh_token: linkData.properties?.refresh_token,
                email: userData.user.email,
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      }

      return new Response(JSON.stringify({ success: true, status: data.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION 3: Confirm session (mobile/web scans QR and confirms)
    if (action === "confirm" && req.method === "POST") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify the user
      const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: userError } = await userClient.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Invalid auth" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const body = await req.json();
      const token = body.session_token;
      if (!token) {
        return new Response(JSON.stringify({ error: "session_token required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check session exists and is pending
      const { data: session } = await supabase
        .from("qr_login_sessions")
        .select("*")
        .eq("session_token", token)
        .eq("status", "pending")
        .single();

      if (!session) {
        return new Response(JSON.stringify({ error: "Session expired or not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if session is not too old (5 minutes max)
      const createdAt = new Date(session.created_at).getTime();
      if (Date.now() - createdAt > 5 * 60 * 1000) {
        await supabase
          .from("qr_login_sessions")
          .update({ status: "expired" })
          .eq("id", session.id);

        return new Response(JSON.stringify({ error: "QR code expired. Generate a new one." }), {
          status: 410,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Confirm the session
      const { error: updateError } = await supabase
        .from("qr_login_sessions")
        .update({
          status: "confirmed",
          user_id: user.id,
          confirmed_at: new Date().toISOString(),
        })
        .eq("id", session.id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true, message: "Login confirmed! Desktop will sign in shortly." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
