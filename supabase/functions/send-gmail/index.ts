
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

// JWT helper functions for Google OAuth
function base64UrlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlEncodeString(str: string): string {
  return base64UrlEncode(new TextEncoder().encode(str));
}

async function createJWT(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  const header = {
    alg: "RS256",
    typ: "JWT"
  };
  
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/gmail.send",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };
  
  const encodedHeader = base64UrlEncodeString(JSON.stringify(header));
  const encodedPayload = base64UrlEncodeString(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  
  // Clean and format the private key
  let privateKeyPem = serviceAccount.private_key;
  if (typeof privateKeyPem === 'string') {
    privateKeyPem = privateKeyPem.replace(/\\n/g, '\n');
  }
  
  // Import the private key
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    new TextEncoder().encode(privateKeyPem),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );
  
  // Sign the token
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );
  
  const encodedSignature = base64UrlEncode(new Uint8Array(signature));
  
  return `${unsignedToken}.${encodedSignature}`;
}

async function getAccessToken(serviceAccount: any): Promise<string> {
  const jwt = await createJWT(serviceAccount);
  
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('OAuth token error:', response.status, errorText);
    throw new Error(`Failed to get access token: ${response.status} ${errorText}`);
  }
  
  const tokenData = await response.json();
  return tokenData.access_token;
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
  
  // Convert to base64url
  const base64Message = btoa(unescape(encodeURIComponent(message)));
  return base64Message.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 [GMAIL API] Function called');
    
    // Get Google credentials from environment
    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    
    console.log('📧 [GMAIL API] Environment check:', {
      hasServiceAccount: !!serviceAccountJson,
    });
    
    if (!serviceAccountJson) {
      console.error('❌ [GMAIL API] Missing Google service account credentials');
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing Google API credentials',
        message: 'Please configure GOOGLE_SERVICE_ACCOUNT_JSON in Supabase Edge Function secrets'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let requestData: GmailRequest;
    try {
      requestData = await req.json();
      console.log('📧 [GMAIL API] Request data received:', {
        to: requestData.to,
        subject: requestData.subject?.substring(0, 50),
        hasHtml: !!requestData.html,
      });
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
      console.log('📧 [GMAIL API] Service account parsed successfully:', {
        type: serviceAccount.type,
        clientEmail: serviceAccount.client_email?.substring(0, 30) + '...',
        hasPrivateKey: !!serviceAccount.private_key
      });
    } catch (error) {
      console.error('❌ [GMAIL API] Invalid service account JSON:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid service account JSON',
        message: 'Please check GOOGLE_SERVICE_ACCOUNT_JSON format'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    try {
      console.log('🔐 [GMAIL API] Getting access token...');
      const accessToken = await getAccessToken(serviceAccount);
      console.log('✅ [GMAIL API] Access token obtained successfully');
      
      console.log('📝 [GMAIL API] Creating MIME message...');
      const mimeMessage = createMimeMessage(
        requestData.to,
        requestData.subject,
        requestData.html,
        serviceAccount.client_email
      );
      console.log('✅ [GMAIL API] MIME message created');
      
      console.log('📤 [GMAIL API] Sending email via Gmail API...');
      const gmailResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            raw: mimeMessage,
          }),
        }
      );
      
      if (!gmailResponse.ok) {
        const errorText = await gmailResponse.text();
        console.error('❌ [GMAIL API] Gmail API error:', {
          status: gmailResponse.status,
          statusText: gmailResponse.statusText,
          error: errorText
        });
        
        return new Response(JSON.stringify({
          success: false,
          error: 'Gmail API error',
          message: `Failed to send email: ${gmailResponse.status} ${errorText}`
        }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      
      const gmailResult = await gmailResponse.json();
      console.log('✅ [GMAIL API] Email sent successfully via Gmail API:', {
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
          provider: 'gmail-api',
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
      console.error('❌ [GMAIL API] API integration error:', {
        message: apiError.message,
        name: apiError.name,
        stack: apiError.stack?.substring(0, 500)
      });
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Gmail API integration error',
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
    console.error("❌ [GMAIL API] Unexpected error:", error);
    console.error("❌ [GMAIL API] Error stack:", error.stack);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
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
