import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
  type: "new_order" | "order_seller_alert" | "deposit_approved" | "welcome" | "order_status_update" | "admin_broadcast" | "order_shipped" | "order_delivered" | "refund_processed";
  // Common
  customerEmail?: string;
  customerName?: string;
  // new_order
  orderNumber?: string;
  totalAmount?: number;
  itemCount?: number;
  // order_seller_alert
  sellerEmail?: string;
  sellerName?: string;
  productTitle?: string;
  quantity?: number;
  orderAmount?: number;
  // deposit_approved
  userEmail?: string;
  userName?: string;
  depositAmount?: number;
  // welcome
  // uses customerEmail & customerName
  isSeller?: boolean;
  // order_status_update / order_shipped / order_delivered
  newStatus?: string;
  trackingId?: string;
  courierName?: string;
  // admin_broadcast
  broadcastSubject?: string;
  broadcastMessage?: string;
  recipientEmails?: string[];
  // refund_processed
  refundAmount?: number;
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
    let to: string | string[] = "";

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

      case "welcome": {
        if (!body.customerEmail) throw new Error("Missing welcome email fields");
        to = body.customerEmail;
        const isSeller = body.isSeller || false;
        subject = isSeller ? "🎉 Welcome to FANZON Business Partner Program!" : "🎉 Welcome to FANZON!";
        html = brandedWrapper(`
          <div style="padding: 32px 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="font-size: 48px;">${isSeller ? "🏪" : "🎉"}</div>
              <h2 style="color: #111827; margin: 12px 0 0; font-size: 22px;">Welcome to FANZON${isSeller ? " Business" : ""}!</h2>
            </div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Dear <strong>${body.customerName || "Valued Member"}</strong>,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              ${isSeller 
                ? "Thank you for joining FANZON as a Business Partner! You're now part of Pakistan's fastest-growing marketplace." 
                : "Welcome aboard! Your FANZON account has been created successfully. Start exploring millions of products from trusted sellers."}
            </p>
            ${isSeller ? `
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; margin: 24px 0; border-radius: 8px;">
                <h3 style="color: #1e40af; margin: 0 0 12px; font-size: 16px;">Next Steps:</h3>
                <ul style="color: #374151; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Complete your KYC verification</li>
                  <li>Set up your shop profile</li>
                  <li>Add your first product</li>
                  <li>Start receiving orders!</li>
                </ul>
              </div>
            ` : `
              <div style="background-color: #fff7ed; border: 1px solid #fed7aa; padding: 20px; margin: 24px 0; border-radius: 8px;">
                <h3 style="color: #9a3412; margin: 0 0 12px; font-size: 16px;">What You Can Do:</h3>
                <ul style="color: #374151; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Browse millions of products</li>
                  <li>Save favorites to your wishlist</li>
                  <li>Track orders in real-time</li>
                  <li>Enjoy secure checkout</li>
                </ul>
              </div>
            `}
            <div style="text-align: center;">
              <a href="${SITE_URL}${isSeller ? "/seller/dashboard" : "/"}" style="display: inline-block; background: linear-gradient(135deg, #ff6600 0%, #e65c00 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                ${isSeller ? "Go to Dashboard" : "Start Shopping"}
              </a>
            </div>
          </div>
        `);
        break;
      }

      case "order_shipped": {
        if (!body.customerEmail || !body.orderNumber) throw new Error("Missing order_shipped fields");
        to = body.customerEmail;
        subject = `🚚 Order Shipped - ${body.orderNumber}`;
        html = brandedWrapper(`
          <div style="padding: 32px 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="font-size: 48px;">🚚</div>
              <h2 style="color: #111827; margin: 12px 0 0; font-size: 22px;">Your Order Has Been Shipped!</h2>
            </div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Dear <strong>${body.customerName || "Customer"}</strong>,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Your order <strong>${body.orderNumber}</strong> is on its way!
            </p>
            <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; margin: 24px 0; border-radius: 8px;">
              <table style="width: 100%; font-size: 14px; color: #374151;">
                ${body.courierName ? `<tr><td style="padding: 6px 0;">Courier</td><td style="text-align: right; font-weight: 600;">${body.courierName}</td></tr>` : ""}
                ${body.trackingId ? `<tr><td style="padding: 6px 0;">Tracking ID</td><td style="text-align: right; font-weight: 600;">${body.trackingId}</td></tr>` : ""}
                <tr><td style="padding: 6px 0;">Status</td><td style="text-align: right; font-weight: 600; color: #2563eb;">Shipped</td></tr>
              </table>
            </div>
            <div style="text-align: center;">
              <a href="${SITE_URL}/track-order" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Track Your Order
              </a>
            </div>
          </div>
        `);
        break;
      }

      case "order_delivered": {
        if (!body.customerEmail || !body.orderNumber) throw new Error("Missing order_delivered fields");
        to = body.customerEmail;
        subject = `✅ Order Delivered - ${body.orderNumber}`;
        html = brandedWrapper(`
          <div style="padding: 32px 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="font-size: 48px;">🎁</div>
              <h2 style="color: #111827; margin: 12px 0 0; font-size: 22px;">Order Delivered!</h2>
            </div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Dear <strong>${body.customerName || "Customer"}</strong>,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Your order <strong>${body.orderNumber}</strong> has been delivered successfully. We hope you love it!
            </p>
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; margin: 24px 0; border-radius: 8px; text-align: center;">
              <p style="color: #166534; margin: 0; font-size: 16px; font-weight: 600;">✅ Successfully Delivered</p>
            </div>
            <p style="color: #374151; font-size: 14px; line-height: 1.6; text-align: center;">
              If you have any issues, you can request a return within 7 days.
            </p>
            <div style="text-align: center;">
              <a href="${SITE_URL}/my-orders" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Rate Your Experience
              </a>
            </div>
          </div>
        `);
        break;
      }

      case "order_status_update": {
        if (!body.customerEmail || !body.orderNumber || !body.newStatus) throw new Error("Missing order_status_update fields");
        to = body.customerEmail;
        subject = `📋 Order Update - ${body.orderNumber}`;
        html = brandedWrapper(`
          <div style="padding: 32px 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="font-size: 48px;">📋</div>
              <h2 style="color: #111827; margin: 12px 0 0; font-size: 22px;">Order Status Updated</h2>
            </div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Dear <strong>${body.customerName || "Customer"}</strong>,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Your order <strong>${body.orderNumber}</strong> status has been updated.
            </p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; margin: 24px 0; border-radius: 8px; text-align: center;">
              <p style="color: #64748b; margin: 0 0 4px; font-size: 13px; font-weight: 600;">NEW STATUS</p>
              <p style="color: #1e40af; margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase;">${body.newStatus}</p>
            </div>
            <div style="text-align: center;">
              <a href="${SITE_URL}/track-order" style="display: inline-block; background: linear-gradient(135deg, #ff6600 0%, #e65c00 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                View Order Details
              </a>
            </div>
          </div>
        `);
        break;
      }

      case "refund_processed": {
        if (!body.customerEmail || !body.orderNumber) throw new Error("Missing refund fields");
        to = body.customerEmail;
        subject = `💰 Refund Processed - ${body.orderNumber}`;
        html = brandedWrapper(`
          <div style="padding: 32px 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="font-size: 48px;">💰</div>
              <h2 style="color: #111827; margin: 12px 0 0; font-size: 22px;">Refund Processed!</h2>
            </div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Dear <strong>${body.customerName || "Customer"}</strong>,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Your refund for order <strong>${body.orderNumber}</strong> has been processed and credited to your wallet.
            </p>
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; margin: 24px 0; border-radius: 8px; text-align: center;">
              <p style="color: #166534; margin: 0 0 4px; font-size: 13px; font-weight: 600;">REFUND AMOUNT</p>
              <p style="color: #15803d; margin: 0; font-size: 28px; font-weight: 800;">PKR ${(body.refundAmount || 0).toLocaleString()}</p>
            </div>
            <div style="text-align: center;">
              <a href="${SITE_URL}/account/wallet" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Check Wallet Balance
              </a>
            </div>
          </div>
        `);
        break;
      }

      case "admin_broadcast": {
        if (!body.recipientEmails || body.recipientEmails.length === 0) throw new Error("Missing broadcast recipients");
        if (!body.broadcastSubject || !body.broadcastMessage) throw new Error("Missing broadcast content");
        
        // Send to all recipients
        const results = [];
        for (const email of body.recipientEmails) {
          try {
            const emailHtml = brandedWrapper(`
              <div style="padding: 32px 24px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <div style="font-size: 48px;">📢</div>
                  <h2 style="color: #111827; margin: 12px 0 0; font-size: 22px;">${body.broadcastSubject}</h2>
                </div>
                <div style="color: #374151; font-size: 16px; line-height: 1.8; white-space: pre-line;">
                  ${body.broadcastMessage}
                </div>
                <div style="text-align: center; margin-top: 24px;">
                  <a href="${SITE_URL}" style="display: inline-block; background: linear-gradient(135deg, #ff6600 0%, #e65c00 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Visit FANZON
                  </a>
                </div>
              </div>
            `);

            const res = await resend.emails.send({
              from: "FANZON <noreply@fanzon.pk>",
              to: [email],
              subject: `📢 ${body.broadcastSubject}`,
              html: emailHtml,
            });
            results.push({ email, success: true, data: res });
          } catch (err: any) {
            console.error(`Failed to send to ${email}:`, err.message);
            results.push({ email, success: false, error: err.message });
          }
        }

        console.log(`Broadcast sent: ${results.filter(r => r.success).length}/${results.length} successful`);
        return new Response(JSON.stringify({ success: true, results }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      default:
        throw new Error(`Unknown email type: ${body.type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "FANZON <noreply@fanzon.pk>",
      to: Array.isArray(to) ? to : [to],
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
