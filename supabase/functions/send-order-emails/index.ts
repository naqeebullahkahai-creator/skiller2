import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FANZON_LOGO = "https://tyydinsbnmnvykoiyidb.supabase.co/storage/v1/object/public/email-assets/fanzon-logo.png?v=1";
const SITE_URL = "https://skiller2.lovable.app";

const brandedWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Header with Logo -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 24px; text-align: center;">
      <h1 style="color: #ff6600; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px;">FANZON</h1>
      <p style="color: #94a3b8; margin: 4px 0 0; font-size: 12px;">Pakistan's Trusted Marketplace</p>
    </div>
    ${content}
    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <div style="margin-bottom: 12px;">
        <a href="https://facebook.com/fanzon" style="color: #6b7280; text-decoration: none; margin: 0 8px; font-size: 12px;">Facebook</a>
        <a href="https://instagram.com/fanzon" style="color: #6b7280; text-decoration: none; margin: 0 8px; font-size: 12px;">Instagram</a>
        <a href="https://wa.me/923001234567" style="color: #6b7280; text-decoration: none; margin: 0 8px; font-size: 12px;">WhatsApp</a>
      </div>
      <p style="color: #6b7280; font-size: 11px; margin: 0;">
        © 2026 FANZON. All rights reserved. | <a href="${SITE_URL}/help" style="color: #6b7280;">Help Center</a> | <a href="${SITE_URL}/contact" style="color: #6b7280;">Contact Us</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

interface EmailRequest {
  type: "new_order" | "order_seller_alert" | "deposit_approved";
  // new_order fields
  customerEmail?: string;
  customerName?: string;
  orderNumber?: string;
  totalAmount?: number;
  itemCount?: number;
  // order_seller_alert fields
  sellerEmail?: string;
  sellerName?: string;
  productTitle?: string;
  quantity?: number;
  orderAmount?: number;
  // deposit_approved fields
  userEmail?: string;
  userName?: string;
  depositAmount?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: EmailRequest = await req.json();
    console.log("Email request:", body.type);

    let subject = "";
    let html = "";
    let to = "";

    switch (body.type) {
      case "new_order": {
        if (!body.customerEmail || !body.orderNumber) throw new Error("Missing new_order fields");
        to = body.customerEmail;
        subject = `🛒 Order Confirmed - ${body.orderNumber}`;
        html = brandedWrapper(`
          <div style="padding: 32px 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="font-size: 48px;">🎉</div>
              <h2 style="color: #111827; margin: 12px 0 0; font-size: 22px;">Thank You for Your Order!</h2>
            </div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Dear <strong>${body.customerName || "Customer"}</strong>,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Your order has been placed successfully. We're getting it ready for you!
            </p>
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; margin: 24px 0; border-radius: 8px; text-align: center;">
              <p style="color: #166534; margin: 0 0 4px; font-size: 13px; font-weight: 600;">ORDER NUMBER</p>
              <p style="color: #15803d; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">${body.orderNumber}</p>
            </div>
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
              <table style="width: 100%; font-size: 14px; color: #374151;">
                <tr><td style="padding: 6px 0;">Items</td><td style="text-align: right; font-weight: 600;">${body.itemCount || 1} item(s)</td></tr>
                <tr><td style="padding: 6px 0;">Total Amount</td><td style="text-align: right; font-weight: 600;">PKR ${(body.totalAmount || 0).toLocaleString()}</td></tr>
                <tr><td style="padding: 6px 0;">Estimated Delivery</td><td style="text-align: right; font-weight: 600;">3-5 Business Days</td></tr>
              </table>
            </div>
            <div style="text-align: center;">
              <a href="${SITE_URL}/track-order" style="display: inline-block; background: linear-gradient(135deg, #ff6600 0%, #e65c00 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Track Your Order
              </a>
            </div>
          </div>
        `);
        break;
      }

      case "order_seller_alert": {
        if (!body.sellerEmail || !body.orderNumber) throw new Error("Missing seller alert fields");
        to = body.sellerEmail;
        subject = `📦 New Order Received - ${body.orderNumber}`;
        html = brandedWrapper(`
          <div style="padding: 32px 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="font-size: 48px;">📦</div>
              <h2 style="color: #111827; margin: 12px 0 0; font-size: 22px;">You've Got a New Order!</h2>
            </div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Dear <strong>${body.sellerName || "Seller"}</strong>,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Great news! A customer has just purchased your product. Please prepare it for shipping.
            </p>
            <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; margin: 24px 0; border-radius: 8px;">
              <table style="width: 100%; font-size: 14px; color: #374151;">
                <tr><td style="padding: 6px 0;">Order</td><td style="text-align: right; font-weight: 600;">${body.orderNumber}</td></tr>
                <tr><td style="padding: 6px 0;">Product</td><td style="text-align: right; font-weight: 600;">${body.productTitle || "—"}</td></tr>
                <tr><td style="padding: 6px 0;">Quantity</td><td style="text-align: right; font-weight: 600;">${body.quantity || 1}</td></tr>
                <tr><td style="padding: 6px 0;">Amount</td><td style="text-align: right; font-weight: 600;">PKR ${(body.orderAmount || 0).toLocaleString()}</td></tr>
              </table>
            </div>
            <div style="text-align: center;">
              <a href="${SITE_URL}/seller/orders" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Go to Seller Dashboard
              </a>
            </div>
          </div>
        `);
        break;
      }

      case "deposit_approved": {
        if (!body.userEmail) throw new Error("Missing deposit_approved fields");
        to = body.userEmail;
        subject = `✅ Deposit Approved - PKR ${(body.depositAmount || 0).toLocaleString()}`;
        html = brandedWrapper(`
          <div style="padding: 32px 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="font-size: 48px;">✅</div>
              <h2 style="color: #111827; margin: 12px 0 0; font-size: 22px;">Deposit Approved!</h2>
            </div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Dear <strong>${body.userName || "User"}</strong>,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Your deposit request has been approved and credited to your wallet.
            </p>
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; margin: 24px 0; border-radius: 8px; text-align: center;">
              <p style="color: #166534; margin: 0 0 4px; font-size: 13px; font-weight: 600;">CREDITED AMOUNT</p>
              <p style="color: #15803d; margin: 0; font-size: 28px; font-weight: 800;">PKR ${(body.depositAmount || 0).toLocaleString()}</p>
            </div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Your updated wallet balance is now available. You can use it to make purchases on FANZON.
            </p>
            <div style="text-align: center;">
              <a href="${SITE_URL}/account/profile" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                View Wallet
              </a>
            </div>
          </div>
        `);
        break;
      }

      default:
        throw new Error(`Unknown email type: ${body.type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "FANZON <noreply@fanzon.pk>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
