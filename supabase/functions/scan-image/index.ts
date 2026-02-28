import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageUrl, scanType, transactionReference } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (scanType === "cnic") {
      systemPrompt = `You are a Pakistani CNIC (Computerized National Identity Card) data extractor. Extract information from the CNIC image provided. Return ONLY a valid JSON object with these fields:
- cnic_number: string (format: 00000-0000000-0)
- full_name: string
- father_name: string (if visible)
- gender: string (Male/Female)
- date_of_birth: string (YYYY-MM-DD format)
- date_of_issue: string (YYYY-MM-DD format)
- date_of_expiry: string (YYYY-MM-DD format)
- address: string (if visible)
- confidence: number (0-100, how confident you are in the extraction)

If a field is not visible or readable, set it to null. Always return valid JSON only, no extra text.`;
      userPrompt = "Extract all visible information from this Pakistani CNIC card image.";
    } else if (scanType === "deposit_screenshot") {
      systemPrompt = `You are a payment screenshot analyzer for Pakistani payment apps (JazzCash, EasyPaisa, bank transfers, etc.). Extract transaction details from the screenshot. Return ONLY a valid JSON object with:
- extracted_reference: string (transaction ID / reference number found in the image)
- extracted_amount: number (amount in PKR found in the image, null if not found)
- payment_method: string (detected payment method like "JazzCash", "EasyPaisa", "Bank Transfer", etc.)
- sender_name: string (sender account name if visible)
- receiver_name: string (receiver account name if visible)
- transaction_date: string (date if visible, in YYYY-MM-DD format)
- status: string (transaction status if visible: "successful", "pending", "failed")
- confidence: number (0-100, overall confidence)
${transactionReference ? `- reference_match: boolean (does the extracted reference match or contain "${transactionReference}"?)` : ""}

If a field is not visible, set it to null. Always return valid JSON only, no extra text.`;
      userPrompt = `Analyze this payment screenshot and extract all transaction details.${transactionReference ? ` The user claims the transaction reference is "${transactionReference}". Verify if this matches what's in the image.` : ""}`;
    } else {
      throw new Error("Invalid scan type. Use 'cnic' or 'deposit_screenshot'.");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI processing failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from the response (handle markdown code blocks)
    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch {
      parsed = { error: "Could not parse AI response", raw: content };
    }

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scan-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
