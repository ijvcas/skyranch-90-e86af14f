
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { generateAuthUrl, exchangeCodeForToken } from "./oauth.ts";
import { createMimeMessage } from "./mime.ts";
import { OAuthRequest, AuthUrlRequest } from "./types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 [GMAIL SKYRANCH] Function called');
    
    const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
    const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      console.error('❌ [GMAIL SKYRANCH] Missing Google OAuth credentials');
      
      return new Response(JSON.stringify({
        success: false,
        error: 'missing_oauth_credentials',
        message: 'Please configure GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in Supabase Edge Function secrets'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const url = new URL(req.url);
    const path = url.pathname;

    if (path.endsWith('/auth-url')) {
      const requestData: AuthUrlRequest = await req.json();
      const authUrl = generateAuthUrl(clientId, requestData.redirectUri);
      
      console.log('📧 [GMAIL SKYRANCH] Generated auth URL for redirect:', requestData.redirectUri);
      
      return new Response(JSON.stringify({
        success: true,
        authUrl: authUrl
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (path.endsWith('/exchange-token')) {
      const { code, redirectUri } = await req.json();
      
      console.log('📧 [GMAIL SKYRANCH] Exchanging code for token...');
      
      const tokenData = await exchangeCodeForToken(clientId, clientSecret, code, redirectUri);
      
      console.log('✅ [GMAIL SKYRANCH] Token exchange successful');
      
      return new Response(JSON.stringify({
        success: true,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Default endpoint - send email with access token
    let requestData: OAuthRequest;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error('❌ [GMAIL SKYRANCH] Failed to parse request JSON:', parseError);
      return new Response(JSON.stringify({
        success: false,
        error: 'invalid_json',
        message: parseError.message
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!requestData.to || !requestData.subject || !requestData.html || !requestData.accessToken) {
      console.error('❌ [GMAIL SKYRANCH] Missing required fields');
      return new Response(JSON.stringify({
        success: false,
        error: 'missing_required_fields',
        message: 'to, subject, html, and accessToken are required'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    try {
      console.log('📝 [GMAIL SKYRANCH] Creating MIME message...');
      const mimeMessage = createMimeMessage(
        requestData.to,
        requestData.subject,
        requestData.html,
        requestData.senderName || "SkyRanch Soporte",
        requestData.organizationName || "SkyRanch"
      );
      
      console.log('📤 [GMAIL SKYRANCH] Sending email via Gmail API...');
      const gmailResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${requestData.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            raw: mimeMessage,
          }),
        }
      );
      
      if (!gmailResponse.ok) {
        const errorText = await gmailResponse.text();
        console.error('❌ [GMAIL SKYRANCH] Gmail API error:', {
          status: gmailResponse.status,
          error: errorText
        });
        
        return new Response(JSON.stringify({
          success: false,
          error: 'gmail_api_error',
          message: `Failed to send email: ${gmailResponse.status} ${errorText}`
        }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      
      const gmailResult = await gmailResponse.json();
      console.log('✅ [GMAIL SKYRANCH] Email sent successfully:', {
        messageId: gmailResult.id,
        to: requestData.to
      });
      
      return new Response(JSON.stringify({
        success: true,
        messageId: gmailResult.id,
        threadId: gmailResult.threadId,
        details: {
          provider: 'gmail-skyranch',
          timestamp: new Date().toISOString(),
          recipient: requestData.to,
          sentViaGmailAPI: true,
          fromDomain: 'skyranch.es',
          senderEmail: 'soporte@skyranch.es'
        }
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
      
    } catch (apiError: any) {
      console.error('❌ [GMAIL SKYRANCH] API integration error:', apiError.message);
      
      return new Response(JSON.stringify({
        success: false,
        error: 'gmail_api_integration_error',
        message: apiError.message,
        details: {
          errorType: 'GMAIL_API_ERROR',
          timestamp: new Date().toISOString()
        }
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

  } catch (error: any) {
    console.error("❌ [GMAIL SKYRANCH] Unexpected error:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'internal_server_error',
      message: error.message,
      details: {
        timestamp: new Date().toISOString(),
        errorType: error.name || 'UnknownError'
      }
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
