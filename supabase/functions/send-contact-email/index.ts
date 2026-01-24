import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  adminEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, subject, message, adminEmail }: ContactFormRequest = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      throw new Error("Missing required fields: name, email, subject, and message are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email address format");
    }

    // Sanitize inputs
    const sanitizedName = name.trim().slice(0, 100);
    const sanitizedEmail = email.trim().slice(0, 255);
    const sanitizedPhone = phone?.trim().slice(0, 20) || "Not provided";
    const sanitizedSubject = subject.trim().slice(0, 200);
    const sanitizedMessage = message.trim().slice(0, 2000);

    // Recipient email - fallback to a default if not provided
    const recipientEmail = adminEmail || "support@fanzon.pk";

    console.log("Sending contact form email to:", recipientEmail);

    const emailResponse = await resend.emails.send({
      from: "FANZON Contact <onboarding@resend.dev>",
      to: [recipientEmail],
      reply_to: sanitizedEmail,
      subject: `[Contact Form] ${sanitizedSubject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Contact Form Submission</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #F97316, #EA580C); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">New Contact Form Submission</h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 30px;">
                <div style="margin-bottom: 24px;">
                  <h2 style="color: #18181b; font-size: 18px; margin: 0 0 8px 0;">Contact Details</h2>
                  <div style="background-color: #f4f4f5; border-radius: 8px; padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: #52525b;"><strong style="color: #18181b;">Name:</strong> ${sanitizedName}</p>
                    <p style="margin: 0 0 8px 0; color: #52525b;"><strong style="color: #18181b;">Email:</strong> <a href="mailto:${sanitizedEmail}" style="color: #F97316;">${sanitizedEmail}</a></p>
                    <p style="margin: 0; color: #52525b;"><strong style="color: #18181b;">Phone:</strong> ${sanitizedPhone}</p>
                  </div>
                </div>
                
                <div style="margin-bottom: 24px;">
                  <h2 style="color: #18181b; font-size: 18px; margin: 0 0 8px 0;">Subject</h2>
                  <p style="background-color: #fff7ed; border-left: 4px solid #F97316; padding: 12px 16px; margin: 0; color: #9a3412; font-weight: 500;">${sanitizedSubject}</p>
                </div>
                
                <div>
                  <h2 style="color: #18181b; font-size: 18px; margin: 0 0 8px 0;">Message</h2>
                  <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px;">
                    <p style="margin: 0; color: #3f3f46; line-height: 1.6; white-space: pre-wrap;">${sanitizedMessage}</p>
                  </div>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #e4e4e7;">
                <p style="margin: 0; color: #71717a; font-size: 14px;">
                  This email was sent from the FANZON contact form.
                </p>
                <p style="margin: 8px 0 0 0; color: #a1a1aa; font-size: 12px;">
                  Reply directly to this email to respond to the customer.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Contact email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Your message has been sent successfully. We'll get back to you soon!" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send message. Please try again later." 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
