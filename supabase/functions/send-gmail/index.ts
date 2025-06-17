
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GmailRequest {
  to: string;
  subject: string;
  html: string;
  accessToken?: string;
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
    console.log('📧 [GMAIL SKYRANCH] Function called');
    
    let requestData: GmailRequest;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error('❌ [GMAIL SKYRANCH] Failed to parse request JSON:', parseError);
      return new Response(JSON.stringify({
        success: false,
        error: 'invalid_json',
        message: 'Invalid JSON in request body'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log('📧 [GMAIL SKYRANCH] Request data received:', {
      to: requestData.to,
      subject: requestData.subject?.substring(0, 50),
      hasHtml: !!requestData.html,
      hasAccessToken: !!requestData.accessToken,
      senderName: requestData.senderName,
      organizationName: requestData.organizationName
    });

    // Validate required fields
    if (!requestData.to || !requestData.subject || !requestData.html) {
      console.error('❌ [GMAIL SKYRANCH] Missing required fields:', {
        hasTo: !!requestData.to,
        hasSubject: !!requestData.subject,
        hasHtml: !!requestData.html
      });
      return new Response(JSON.stringify({
        success: false,
        error: 'missing_required_fields',
        message: 'Missing required fields: to, subject, and html are required'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if we have an access token for Gmail API
    if (!requestData.accessToken) {
      console.error('❌ [GMAIL SKYRANCH] No access token provided');
      return new Response(JSON.stringify({
        success: false,
        error: 'no_access_token',
        message: 'Gmail access token is required for sending emails'
      }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Prepare Gmail API request
    const emailMessage = [
      `To: ${requestData.to}`,
      `Subject: ${requestData.subject}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      requestData.html
    ].join('\r\n');

    // Encode the email message in base64url format
    const encodedMessage = btoa(emailMessage)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    console.log('📧 [GMAIL SKYRANCH] Calling Gmail API...');

    // Call Gmail API to send the email
    const gmailResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${requestData.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage
      })
    });

    const gmailData = await gmailResponse.json();

    console.log('📧 [GMAIL SKYRANCH] Gmail API response:', {
      status: gmailResponse.status,
      success: gmailResponse.ok,
      messageId: gmailData.id,
      threadId: gmailData.threadId
    });

    if (!gmailResponse.ok) {
      console.error('❌ [GMAIL SKYRANCH] Gmail API error:', gmailData);
      return new Response(JSON.stringify({
        success: false,
        error: 'gmail_api_error',
        message: gmailData.error?.message || 'Failed to send email via Gmail API',
        details: gmailData.error
      }), {
        status: gmailResponse.status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log('✅ [GMAIL SKYRANCH] Email sent successfully via Gmail API');

    return new Response(JSON.stringify({
      success: true,
      messageId: gmailData.id,
      threadId: gmailData.threadId,
      details: {
        recipient: requestData.to,
        subject: requestData.subject,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("❌ [GMAIL SKYRANCH] Unexpected error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: 'internal_error',
      message: `Internal server error: ${error.message}`,
      details: { errorType: error.name }
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
