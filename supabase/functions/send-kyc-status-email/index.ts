import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface KycStatusEmailRequest {
  email: string;
  sellerName: string;
  status: "verified" | "rejected";
  rejectionReason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, sellerName, status, rejectionReason }: KycStatusEmailRequest = await req.json();

    // Validate required fields
    if (!email || !sellerName || !status) {
      throw new Error("Missing required fields: email, sellerName, status");
    }

    console.log(`Sending KYC ${status} email to ${email}`);

    const isApproved = status === "verified";
    
    const subject = isApproved 
      ? "🎉 Congratulations! Your FANZON Seller Account is Verified"
      : "Important: Your FANZON Seller Verification Requires Attention";

    const html = isApproved 
      ? `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Account Verified!</h1>
            </div>
            <div style="padding: 32px 24px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Dear <strong>${sellerName}</strong>,
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Great news! Your FANZON seller account has been successfully verified. You now have full access to all seller features.
              </p>
              <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #065f46; margin: 0 0 8px; font-size: 14px; font-weight: 600;">What you can do now:</h3>
                <ul style="color: #047857; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                  <li>Add and manage your products</li>
                  <li>Participate in Flash Sales</li>
                  <li>Receive orders from customers</li>
                  <li>Withdraw earnings to your bank account</li>
                </ul>
              </div>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Start listing your products today and grow your business with FANZON!
              </p>
              <a href="https://skiller1.lovable.app/seller/products" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Go to Seller Dashboard
              </a>
            </div>
            <div style="background-color: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © 2024 FANZON. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
      : `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Verification Update</h1>
            </div>
            <div style="padding: 32px 24px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Dear <strong>${sellerName}</strong>,
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                We've reviewed your seller verification application, and unfortunately, we were unable to approve it at this time.
              </p>
              ${rejectionReason ? `
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #92400e; margin: 0 0 8px; font-size: 14px; font-weight: 600;">Reason for rejection:</h3>
                <p style="color: #78350f; margin: 0; font-size: 14px; line-height: 1.6;">${rejectionReason}</p>
              </div>
              ` : ''}
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #1e40af; margin: 0 0 8px; font-size: 14px; font-weight: 600;">What to do next:</h3>
                <ul style="color: #1d4ed8; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                  <li>Review the rejection reason carefully</li>
                  <li>Prepare the correct documents</li>
                  <li>Submit a new KYC application</li>
                </ul>
              </div>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Don't worry — you can resubmit your application with updated documents. We're here to help you succeed!
              </p>
              <a href="https://skiller1.lovable.app/seller/kyc" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Resubmit KYC Application
              </a>
            </div>
            <div style="background-color: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                Need help? Contact our support team at support@fanzon.pk
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 8px 0 0;">
                © 2024 FANZON. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

    const emailResponse = await resend.emails.send({
      from: "FANZON <noreply@fanzon.pk>",
      to: [email],
      subject,
      html,
    });

    console.log("KYC status email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending KYC status email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
