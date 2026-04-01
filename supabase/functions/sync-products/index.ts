import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "sync";

    // POST /sync-products?action=sync — bulk sync products from offline
    if (req.method === "POST" && action === "sync") {
      const { products } = await req.json();
      if (!Array.isArray(products) || products.length === 0) {
        return new Response(JSON.stringify({ error: "No products provided" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const results = [];
      for (const p of products) {
        const { data, error } = await supabase.from("products").insert({
          seller_id: user.id,
          title: p.title,
          description: p.description || null,
          category: p.category || "General",
          brand: p.brand || null,
          sku: p.sku || null,
          price_pkr: p.price_pkr,
          discount_price_pkr: p.discount_price_pkr || null,
          stock_count: p.stock_count || 0,
          images: p.images || [],
          status: "pending",
        }).select("id, title").single();

        results.push({
          local_id: p.local_id,
          success: !error,
          server_id: data?.id || null,
          error: error?.message || null,
        });
      }

      return new Response(JSON.stringify({ results, synced: results.filter(r => r.success).length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /sync-products?action=upload-image — upload base64 image
    if (req.method === "POST" && action === "upload-image") {
      const { base64, filename } = await req.json();
      if (!base64 || !filename) {
        return new Response(JSON.stringify({ error: "base64 and filename required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const path = `${user.id}/${Date.now()}-${filename}`;
      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(path, bytes, { contentType: "image/jpeg", upsert: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(data.path);

      return new Response(JSON.stringify({ url: urlData.publicUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /sync-products?action=seller-products — fetch seller's products
    if (req.method === "GET" && action === "seller-products") {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      return new Response(JSON.stringify({ products: data || [], error: error?.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /sync-products?action=login — verify login and return profile
    if (req.method === "POST" && action === "login") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (role?.role !== "seller") {
        return new Response(JSON.stringify({ error: "Only sellers can use this app" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ user: profile, role: role?.role }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
