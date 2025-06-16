
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
    
    console.log('📧 [GMAIL API] Checking credentials...', {
      hasServiceAccount: !!serviceAccountJson,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      serviceAccountLength: serviceAccountJson?.length || 0,
      clientIdPrefix: clientId?.substring(0, 20) || 'missing',
      clientSecretPrefix: clientSecret?.substring(0, 10) || 'missing'
    });
    
    if (!serviceAccountJson || !clientId || !clientSecret) {
      console.error('❌ [GMAIL API] Missing Google credentials');
      return new Response(JSON.stringify({
        success: false,
        error: 'Google credentials not configured',
        message: 'Please configure GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_OAUTH_CLIENT_ID, and GOOGLE_OAUTH_CLIENT_SECRET in Supabase secrets',
        details: {
          hasServiceAccount: !!serviceAccountJson,
          hasClientId: !!clientId,
          hasClientSecret: !!clientSecret
        }
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
      console.log('📧 [GMAIL API] Service account parsed successfully', {
        type: serviceAccount.type,
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email?.substring(0, 20) + '...'
      });
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

    // For now, we'll use a simpler approach - direct Gmail API with service account
    // Create JWT for service account authentication
    console.log('🔐 [GMAIL API] Creating JWT for service account authentication...');
    
    const now = Math.floor(Date.now() / 1000);
    const jwtHeader = btoa(JSON.stringify({
      alg: "RS256",
      typ: "JWT"
    })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
    const jwtPayload = btoa(JSON.stringify({
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/gmail.send",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now
    })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    // For this demo, we'll simulate a successful email send
    // In production, you would need to implement proper JWT signing with the private key
    console.log('✅ [GMAIL API] Simulating successful email send (JWT implementation needed for production)');
    
    // Generate a mock message ID for testing
    const mockMessageId = `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const mockThreadId = `thread_${Date.now()}`;

    console.log("✅ [GMAIL API] Email sent successfully (simulated):", {
      messageId: mockMessageId,
      threadId: mockThreadId,
      to: requestData.to
    });
    
    return new Response(JSON.stringify({
      success: true,
      messageId: mockMessageId,
      threadId: mockThreadId,
      details: {
        provider: 'gmail',
        timestamp: new Date().toISOString(),
        recipient: requestData.to,
        note: 'This is a simulated response. Full JWT implementation with private key signing needed for production Gmail API integration.'
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
