import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
  userType: "customer" | "seller";
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetUrl, userType }: PasswordResetRequest = await req.json();

    // Validate required fields
    if (!email || !resetUrl) {
      throw new Error("Missing required fields: email, resetUrl");
    }

    console.log(`Sending password reset email to ${email} (${userType})`);

    const isSeller = userType === "seller";
    
    const subject = isSeller 
      ? "Reset Your FANZON Seller Account Password"
      : "Reset Your FANZON Account Password";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #f85606 0%, #e04a00 100%); padding: 40px 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Password Reset Request</h1>
          </div>
          <div style="padding: 32px 24px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
              Hello,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
              We received a request to reset the password for your ${isSeller ? 'FANZON Seller' : 'FANZON'} account associated with this email address.
            </p>
            <div style="background-color: #fff7ed; border-left: 4px solid #f85606; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
              <p style="color: #9a3412; margin: 0; font-size: 14px; line-height: 1.6;">
                <strong>⏰ Important:</strong> This link will expire in 1 hour for your security.
              </p>
            </div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
              Click the button below to reset your password:
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #f85606 0%, #e04a00 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(248, 86, 6, 0.4);">
                Reset Password
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
              If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
            <div style="background-color: #f3f4f6; padding: 16px; margin: 24px 0; border-radius: 8px;">
              <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0;">
                <strong>Can't click the button?</strong> Copy and paste this URL into your browser:<br>
                <span style="color: #f85606; word-break: break-all;">${resetUrl}</span>
              </p>
            </div>
          </div>
          <div style="background-color: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This email was sent by FANZON. If you have questions, contact support@fanzon.pk
            </p>
            <p style="color: #6b7280; font-size: 12px; margin: 8px 0 0;">
              © 2024 FANZON. Pakistan's Premium Marketplace. All rights reserved.
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

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
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
