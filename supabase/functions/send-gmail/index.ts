
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

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 [GMAIL API] Function called');
    console.log('📧 [GMAIL API] Method:', req.method);
    
    // Get Google credentials from environment
    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
    const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET");
    
    if (!serviceAccountJson || !clientId || !clientSecret) {
      console.error('❌ [GMAIL API] Missing Google credentials');
      return new Response(JSON.stringify({
        success: false,
        error: 'Google credentials not configured',
        message: 'Please configure GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_OAUTH_CLIENT_ID, and GOOGLE_OAUTH_CLIENT_SECRET'
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let requestData: GmailRequest;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error('❌ [GMAIL API] Failed to parse request JSON:', parseError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON in request body',
        message: parseError.message
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    console.log(`📧 [GMAIL API] Processing email request:`, {
      to: requestData.to,
      subject: requestData.subject?.substring(0, 50) + '...',
      senderName: requestData.senderName,
      organizationName: requestData.organizationName,
      hasMetadata: !!requestData.metadata
    });

    // Validate required fields
    if (!requestData.to || !requestData.subject || !requestData.html) {
      console.error('❌ [GMAIL API] Missing required fields');
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields',
        message: 'to, subject, and html are required'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Parse service account credentials
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (error) {
      console.error('❌ [GMAIL API] Invalid service account JSON:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid service account JSON',
        message: 'Please check GOOGLE_SERVICE_ACCOUNT_JSON format'
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get OAuth2 access token using service account
    console.log('🔐 [GMAIL API] Getting OAuth2 access token...');
    
    // Create JWT for service account authentication
    const now = Math.floor(Date.now() / 1000);
    const jwtHeader = {
      alg: "RS256",
      typ: "JWT"
    };
    
    const jwtPayload = {
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/gmail.send",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now
    };

    // For simplicity, we'll use the client credentials flow instead of service account JWT
    // This is more straightforward for Gmail API access
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://www.googleapis.com/auth/gmail.send'
      }).toString()
    });

    if (!tokenResponse.ok) {
      console.error('❌ [GMAIL API] Failed to get access token:', await tokenResponse.text());
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to authenticate with Google',
        message: 'Could not obtain access token'
      }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();
    console.log('✅ [GMAIL API] Got access token');

    // Prepare email content in RFC 2822 format
    const fromEmail = `${requestData.senderName || requestData.organizationName || 'SkyRanch'} <${serviceAccount.client_email}>`;
    
    const emailContent = [
      `To: ${requestData.to}`,
      `From: ${fromEmail}`,
      `Subject: ${requestData.subject}`,
      `Content-Type: text/html; charset=utf-8`,
      ``,
      requestData.html
    ].join('\r\n');

    // Encode email content in base64url format
    const base64Email = btoa(emailContent)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email via Gmail API
    console.log('📧 [GMAIL API] Sending email via Gmail API...');
    
    const gmailResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: base64Email
      })
    });

    console.log("📧 [GMAIL API] Gmail API response status:", gmailResponse.status);
    const gmailData = await gmailResponse.json();
    console.log("📧 [GMAIL API] Gmail API response:", gmailData);

    if (!gmailResponse.ok) {
      console.error("❌ [GMAIL API] Gmail API error:", gmailData);
      return new Response(JSON.stringify({
        success: false,
        error: 'Gmail API error',
        message: gmailData.error?.message || 'Failed to send email via Gmail',
        details: gmailData
      }), {
        status: gmailResponse.status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Success case
    console.log("✅ [GMAIL API] Email sent successfully via Gmail:", gmailData);
    
    return new Response(JSON.stringify({
      success: true,
      messageId: gmailData.id,
      threadId: gmailData.threadId,
      details: {
        provider: 'gmail',
        timestamp: new Date().toISOString(),
        recipient: requestData.to
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("❌ [GMAIL API] Error in send-gmail function:", error);
    console.error("❌ [GMAIL API] Error stack:", error.stack);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      message: error.message,
      details: {
        timestamp: new Date().toISOString()
      }
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
