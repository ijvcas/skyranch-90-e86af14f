
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequestV2 {
  to: string;
  subject: string;
  html: string;
  senderName?: string;
  organizationName?: string;
  metadata?: {
    tags?: Array<{ name: string; value: string }>;
    headers?: Record<string, string>;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 [EMAIL V2] Function called');
    
    const { to, subject, html, senderName, organizationName, metadata }: EmailRequestV2 = await req.json();
    
    console.log(`📧 [EMAIL V2] Processing email request:`, {
      to,
      subject: subject.substring(0, 50) + '...',
      senderName,
      organizationName,
      hasMetadata: !!metadata
    });

    // Validate required fields
    if (!to || !subject || !html) {
      console.error('❌ [EMAIL V2] Missing required fields');
      return new Response(
        JSON.stringify({ 
          error: "validation_error",
          message: "Missing required fields: to, subject, and html are required",
          details: { to: !!to, subject: !!subject, html: !!html }
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Use Resend's verified default domain to avoid domain verification issues
    const fromEmail = "onboarding@resend.dev";
    const fromName = senderName || "SkyRanch - Sistema de Gestión Ganadera";

    // Prepare email payload
    const emailPayload = {
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: html,
      headers: {
        'X-Entity-Ref-ID': 'skyranch-sistema-ganadero-v2',
        'Organization': organizationName || 'SkyRanch',
        'X-Mailer': 'SkyRanch Sistema de Gestión Ganadera v2',
        ...(metadata?.headers || {})
      },
      tags: [
        {
          name: 'category',
          value: 'notification-v2'
        },
        {
          name: 'sender',
          value: 'skyranch-v2'
        },
        {
          name: 'version',
          value: '2.0'
        },
        ...(metadata?.tags || [])
      ]
    };

    console.log('📧 [EMAIL V2] Sending email with payload:', {
      from: emailPayload.from,
      to: emailPayload.to,
      subject: emailPayload.subject,
      headerCount: Object.keys(emailPayload.headers).length,
      tagCount: emailPayload.tags.length
    });

    const emailResponse = await resend.emails.send(emailPayload);

    console.log("📧 [EMAIL V2] Resend response:", emailResponse);

    // Handle Resend API errors
    if (emailResponse.error) {
      console.error("❌ [EMAIL V2] Resend API error:", emailResponse.error);
      
      // Handle specific domain verification error
      if (emailResponse.error.message?.includes('domain verification') || 
          emailResponse.error.message?.includes('verify a domain')) {
        return new Response(
          JSON.stringify({ 
            error: "domain_verification_required",
            message: "Email domain requires verification. Only verified email addresses can receive emails in production.",
            details: {
              originalError: emailResponse.error,
              suggestion: "Verify your domain at https://resend.com/domains or use a verified email address",
              verifiedDomains: ["resend.dev"],
              userEmail: to
            }
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Handle rate limiting
      if (emailResponse.error.message?.includes('rate limit')) {
        return new Response(
          JSON.stringify({ 
            error: "rate_limited",
            message: "Rate limit exceeded. Please try again later.",
            details: emailResponse.error
          }),
          {
            status: 429,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Handle invalid API key
      if (emailResponse.error.message?.includes('API key')) {
        return new Response(
          JSON.stringify({ 
            error: "invalid_api_key",
            message: "Invalid or missing Resend API key configuration.",
            details: emailResponse.error
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Generic Resend error
      return new Response(
        JSON.stringify({ 
          error: "resend_api_error",
          message: emailResponse.error.message || "Email service error",
          details: emailResponse.error
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Success case
    if (emailResponse.data) {
      console.log("✅ [EMAIL V2] Email sent successfully:", emailResponse.data);
      return new Response(JSON.stringify({
        success: true,
        messageId: emailResponse.data.id,
        details: emailResponse.data,
        version: '2.0'
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Unexpected case - no data and no error
    console.error("❌ [EMAIL V2] Unexpected Resend response - no data and no error");
    return new Response(
      JSON.stringify({ 
        error: "unexpected_response", 
        message: "Unexpected email service response - no data returned",
        details: { response: emailResponse }
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("❌ [EMAIL V2] Error in send-email-v2 function:", error);
    return new Response(
      JSON.stringify({ 
        error: "function_error",
        message: error.message || "Internal server error",
        details: {
          name: error.name,
          stack: error.stack?.substring(0, 500)
        }
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
