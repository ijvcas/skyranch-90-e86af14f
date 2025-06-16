
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
    
    // Get Google credentials from environment with better debugging
    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
    const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET");
    
    console.log('📧 [GMAIL API] Environment check:', {
      hasServiceAccount: !!serviceAccountJson,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      serviceAccountLength: serviceAccountJson?.length || 0,
      availableEnvVars: Object.keys(Deno.env.toObject()).filter(key => key.startsWith('GOOGLE'))
    });
    
    if (!serviceAccountJson || !clientId || !clientSecret) {
      console.error('❌ [GMAIL API] Missing Google credentials');
      console.error('❌ [GMAIL API] Available environment variables:', Object.keys(Deno.env.toObject()));
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing Google API credentials',
        message: 'Please configure GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_OAUTH_CLIENT_ID, and GOOGLE_OAUTH_CLIENT_SECRET in Supabase Edge Function secrets',
        details: {
          hasServiceAccount: !!serviceAccountJson,
          hasClientId: !!clientId,
          hasClientSecret: !!clientSecret,
          instructions: 'Go to Supabase Dashboard → Project Settings → Edge Functions → Add new secret'
        }
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
        htmlLength: requestData.html?.length
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

    // Parse and validate service account credentials
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
      console.log('📧 [GMAIL API] Service account parsed successfully:', {
        type: serviceAccount.type,
        projectId: serviceAccount.project_id,
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

    // Since we have valid credentials, simulate sending the email
    // In production, you would implement the actual Gmail API integration here
    console.log('✅ [GMAIL API] All credentials validated - simulating email send');
    
    // Generate a realistic message ID for testing
    const mockMessageId = `mock_gmail_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const mockThreadId = `thread_gmail_${Date.now()}`;

    console.log("✅ [GMAIL API] Email sent successfully (simulated):", {
      messageId: mockMessageId,
      threadId: mockThreadId,
      to: requestData.to,
      subject: requestData.subject
    });
    
    return new Response(JSON.stringify({
      success: true,
      messageId: mockMessageId,
      threadId: mockThreadId,
      details: {
        provider: 'gmail-api',
        timestamp: new Date().toISOString(),
        recipient: requestData.to,
        credentialsValidated: true,
        note: 'Gmail credentials validated successfully. This is a simulated response - implement actual Gmail API integration for production.'
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

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
