
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GmailRequest {
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

interface OAuthRequest extends GmailRequest {
  accessToken?: string;
}

interface AuthUrlRequest {
  redirectUri: string;
}

// Generate OAuth authorization URL
function generateAuthUrl(clientId: string, redirectUri: string): string {
  const scope = 'https://www.googleapis.com/auth/gmail.send';
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  
  return authUrl.toString();
}

// Exchange authorization code for access token
async function exchangeCodeForToken(
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string
): Promise<{ access_token: string; refresh_token?: string }> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [GMAIL OAUTH] Token exchange error:', response.status, errorText);
    throw new Error(`Failed to exchange code for token: ${response.status} ${errorText}`);
  }

  return await response.json();
}

function createMimeMessage(to: string, subject: string, html: string, fromEmail: string): string {
  const boundary = "boundary_" + Math.random().toString(36).substring(2);
  
  const message = [
    `To: ${to}`,
    `From: SkyRanch <${fromEmail}>`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    '',
    html,
    '',
    `--${boundary}--`
  ].join('\r\n');
  
  // Convert to base64url for Gmail API
  const base64Message = btoa(unescape(encodeURIComponent(message)));
  return base64Message.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 [GMAIL OAUTH] Function called');
    
    // Get OAuth credentials from environment
    const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
    const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET");
    
    console.log('📧 [GMAIL OAUTH] Environment check:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
    });
    
    if (!clientId || !clientSecret) {
      console.error('❌ [GMAIL OAUTH] Missing Google OAuth credentials');
      
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

    // Handle different endpoints
    if (path.endsWith('/auth-url')) {
      // Generate OAuth authorization URL
      const requestData: AuthUrlRequest = await req.json();
      
      const authUrl = generateAuthUrl(clientId, requestData.redirectUri);
      
      console.log('📧 [GMAIL OAUTH] Generated auth URL for redirect:', requestData.redirectUri);
      
      return new Response(JSON.stringify({
        success: true,
        authUrl: authUrl
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (path.endsWith('/exchange-token')) {
      // Exchange authorization code for access token
      const { code, redirectUri } = await req.json();
      
      console.log('📧 [GMAIL OAUTH] Exchanging code for token...');
      
      const tokenData = await exchangeCodeForToken(clientId, clientSecret, code, redirectUri);
      
      console.log('✅ [GMAIL OAUTH] Token exchange successful');
      
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
      console.log('📧 [GMAIL OAUTH] Send email request received:', {
        to: requestData.to,
        subject: requestData.subject?.substring(0, 50),
        hasHtml: !!requestData.html,
        hasAccessToken: !!requestData.accessToken
      });
    } catch (parseError) {
      console.error('❌ [GMAIL OAUTH] Failed to parse request JSON:', parseError);
      return new Response(JSON.stringify({
        success: false,
        error: 'invalid_json',
        message: parseError.message
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate required fields
    if (!requestData.to || !requestData.subject || !requestData.html || !requestData.accessToken) {
      console.error('❌ [GMAIL OAUTH] Missing required fields');
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
      console.log('📝 [GMAIL OAUTH] Creating MIME message...');
      const mimeMessage = createMimeMessage(
        requestData.to,
        requestData.subject,
        requestData.html,
        'me' // Gmail API uses 'me' for authenticated user
      );
      console.log('✅ [GMAIL OAUTH] MIME message created');
      
      console.log('📤 [GMAIL OAUTH] Sending email via Gmail API...');
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
        console.error('❌ [GMAIL OAUTH] Gmail API error:', {
          status: gmailResponse.status,
          statusText: gmailResponse.statusText,
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
      console.log('✅ [GMAIL OAUTH] Email sent successfully via Gmail API:', {
        messageId: gmailResult.id,
        threadId: gmailResult.threadId,
        to: requestData.to,
        subject: requestData.subject
      });
      
      return new Response(JSON.stringify({
        success: true,
        messageId: gmailResult.id,
        threadId: gmailResult.threadId,
        details: {
          provider: 'gmail-oauth',
          timestamp: new Date().toISOString(),
          recipient: requestData.to,
          sentViaGmailAPI: true
        }
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
      
    } catch (apiError: any) {
      console.error('❌ [GMAIL OAUTH] API integration error:', {
        message: apiError.message,
        name: apiError.name,
        stack: apiError.stack?.substring(0, 500)
      });
      
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
    console.error("❌ [GMAIL OAUTH] Unexpected error:", error);
    console.error("❌ [GMAIL OAUTH] Error stack:", error.stack);
    
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
