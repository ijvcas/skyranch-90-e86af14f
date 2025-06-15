
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

    // Check if recipient is likely to cause delivery issues
    const recipientDomain = to.split('@')[1];
    const isVerifiedDomain = recipientDomain === 'resend.dev' || recipientDomain === 'gmail.com' || recipientDomain === 'yahoo.com' || recipientDomain === 'outlook.com' || recipientDomain === 'hotmail.com';
    
    console.log(`📧 [EMAIL V2] Recipient domain: ${recipientDomain}, likely verified: ${isVerifiedDomain}`);

    // Use Resend's verified default domain to avoid domain verification issues
    const fromEmail = "onboarding@resend.dev";
    const fromName = senderName || "SkyRanch - Sistema de Gestión Ganadera";

    // Helper function to clean tag values
    const cleanTagValue = (value: string): string => {
      return value.replace(/[^a-zA-Z0-9_-]/g, '_');
    };

    // Create a Map to prevent duplicate tag names (incoming tags take priority)
    const tagMap = new Map<string, string>();
    
    // Add custom tags first (they have priority)
    if (metadata?.tags) {
      metadata.tags.forEach(tag => {
        if (tag.name && tag.value) {
          const cleanName = cleanTagValue(tag.name);
          const cleanValue = cleanTagValue(tag.value);
          tagMap.set(cleanName, cleanValue);
        }
      });
    }

    // Add default tags only if they don't already exist
    if (!tagMap.has('category')) {
      tagMap.set('category', 'notification_v2');
    }
    if (!tagMap.has('sender')) {
      tagMap.set('sender', 'skyranch_v2');
    }
    if (!tagMap.has('version')) {
      tagMap.set('version', '2_0');
    }

    // Convert Map back to array format
    const finalTags = Array.from(tagMap.entries()).map(([name, value]) => ({
      name,
      value
    }));

    console.log('📧 [EMAIL V2] Final tags after deduplication:', finalTags);

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
        'X-Debug-Domain': recipientDomain,
        'X-Debug-Verified': isVerifiedDomain.toString(),
        ...(metadata?.headers || {})
      },
      tags: finalTags
    };

    console.log('📧 [EMAIL V2] Sending email with payload:', {
      from: emailPayload.from,
      to: emailPayload.to,
      subject: emailPayload.subject,
      headerCount: Object.keys(emailPayload.headers).length,
      tagCount: emailPayload.tags.length,
      recipientDomain,
      isVerifiedDomain
    });

    const emailResponse = await resend.emails.send(emailPayload);

    console.log("📧 [EMAIL V2] Resend response:", emailResponse);

    // Handle Resend API errors
    if (emailResponse.error) {
      console.error("❌ [EMAIL V2] Resend API error:", emailResponse.error);
      
      // Handle specific domain verification error
      if (emailResponse.error.message?.includes('domain verification') || 
          emailResponse.error.message?.includes('verify a domain') ||
          emailResponse.error.message?.includes('only send testing emails to your own email')) {
        return new Response(
          JSON.stringify({ 
            error: "domain_verification_required",
            message: "Email domain requires verification. Only verified email addresses can receive emails in production.",
            details: {
              originalError: emailResponse.error,
              suggestion: "Verify your domain at https://resend.com/domains or use a verified email address",
              verifiedDomains: ["resend.dev", "gmail.com", "yahoo.com", "outlook.com", "hotmail.com"],
              userEmail: to,
              recipientDomain,
              isVerifiedDomain
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

    // Success case - but add warning for unverified domains
    if (emailResponse.data) {
      console.log("✅ [EMAIL V2] Email sent successfully:", emailResponse.data);
      
      let warningMessage = null;
      if (!isVerifiedDomain) {
        warningMessage = `Warning: Email sent to unverified domain '${recipientDomain}'. If email doesn't arrive, verify your domain at https://resend.com/domains`;
        console.warn("⚠️ [EMAIL V2] " + warningMessage);
      }
      
      return new Response(JSON.stringify({
        success: true,
        messageId: emailResponse.data.id,
        details: emailResponse.data,
        version: '2.0',
        warning: warningMessage,
        debugInfo: {
          recipientDomain,
          isVerifiedDomain,
          suggestion: !isVerifiedDomain ? "Try sending to a Gmail/Yahoo/Outlook address or verify your domain" : null
        }
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
        details: { 
          response: emailResponse,
          debugInfo: {
            recipientDomain,
            isVerifiedDomain,
            suggestion: "Check Resend dashboard for delivery status"
          }
        }
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("❌ [EMAIL V2] Error in send-email-v2 function:", error);
    
    // Check if it's a network/connection error
    const isNetworkError = error.name === 'TypeError' && error.message?.includes('fetch');
    
    return new Response(
      JSON.stringify({ 
        error: isNetworkError ? "network_error" : "function_error",
        message: error.message || "Internal server error",
        details: {
          name: error.name,
          stack: error.stack?.substring(0, 500),
          suggestion: isNetworkError ? "Check your internet connection and Resend API status" : "Check function logs for more details"
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
