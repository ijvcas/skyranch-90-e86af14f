
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  senderName?: string;
  organizationName?: string;
  logoUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 Email function called');
    
    const { to, subject, html, senderName, organizationName, logoUrl }: EmailRequest = await req.json();
    
    console.log(`📧 Sending email to: ${to}, subject: ${subject}`);

    // Use a more professional sender name and add headers for better recognition
    const fromName = senderName || "SkyRanch - Sistema de Gestión Ganadera";
    const fromEmail = "SkyRanch <onboarding@resend.dev>";

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: subject,
      html: html,
      headers: {
        // Add headers that help email clients identify the sender
        'X-Entity-Ref-ID': 'skyranch-sistema-ganadero',
        'List-Unsubscribe': '<mailto:unsubscribe@skyranch.com>',
        'Organization': organizationName || 'SkyRanch',
        'X-Mailer': 'SkyRanch Sistema de Gestión Ganadera',
        // Add sender logo reference if provided
        ...(logoUrl && {
          'X-Logo-URL': logoUrl,
          'X-Brand-Logo': logoUrl
        })
      },
      // Add tags for better email tracking and reputation
      tags: [
        {
          name: 'category',
          value: 'notification'
        },
        {
          name: 'sender',
          value: 'skyranch'
        }
      ]
    });

    console.log("✅ Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
