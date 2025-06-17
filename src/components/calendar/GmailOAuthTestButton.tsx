
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const GmailOAuthTestButton = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [testRecipient, setTestRecipient] = useState('');
  const { toast } = useToast();

  const handleGmailAuth = async () => {
    setIsAuthenticating(true);
    console.log('🔐 [GMAIL SKYRANCH AUTH] Starting OAuth authentication...');
    
    try {
      // Get current user for email
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user?.email) {
        throw new Error('No authenticated user found');
      }

      // Use the Gmail callback route as redirect URI
      const redirectUri = window.location.origin + '/gmail-callback';
      
      console.log('🔐 [GMAIL SKYRANCH AUTH] Getting auth URL with redirect:', redirectUri);
      const { data, error } = await supabase.functions.invoke('send-gmail/auth-url', {
        body: { redirectUri }
      });

      if (error) {
        throw new Error(`Failed to get auth URL: ${error.message}`);
      }

      if (data?.authUrl) {
        console.log('🔐 [GMAIL SKYRANCH AUTH] Redirecting to Google OAuth...');
        // Open OAuth flow in popup window
        const popup = window.open(
          data.authUrl,
          'gmail-oauth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // Listen for OAuth completion
        const handleMessage = async (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'GMAIL_OAUTH_SUCCESS' && event.data.code) {
            window.removeEventListener('message', handleMessage);
            
            console.log('🔐 [GMAIL SKYRANCH AUTH] OAuth code received, exchanging for token...');
            
            // Exchange code for access token
            const { data: tokenData, error: tokenError } = await supabase.functions.invoke('send-gmail/exchange-token', {
              body: {
                code: event.data.code,
                redirectUri: redirectUri
              }
            });

            if (tokenError) {
              throw new Error(`Failed to exchange token: ${tokenError.message}`);
            }

            if (tokenData?.accessToken) {
              setAccessToken(tokenData.accessToken);
              console.log('✅ [GMAIL SKYRANCH AUTH] Access token obtained successfully');
              toast({
                title: "Gmail Authentication Successful",
                description: "You can now send emails via Gmail API using soporte@skyranch.es",
              });
            }
          } else if (event.data.type === 'GMAIL_OAUTH_ERROR') {
            window.removeEventListener('message', handleMessage);
            throw new Error(event.data.error || 'OAuth authentication failed');
          }
        };

        window.addEventListener('message', handleMessage);

        // Check if popup was closed without completion
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            if (!accessToken) {
              toast({
                title: "Authentication Cancelled",
                description: "Gmail OAuth authentication was cancelled",
                variant: "destructive"
              });
            }
          }
        }, 1000);
      } else {
        throw new Error('No auth URL received from server');
      }
    } catch (error: any) {
      console.error('🔐 [GMAIL SKYRANCH AUTH] Authentication error:', error);
      toast({
        title: "Gmail Authentication Failed",
        description: `Failed to authenticate with Gmail: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!accessToken) {
      toast({
        title: "Not Authenticated",
        description: "Please authenticate with Gmail first",
        variant: "destructive"
      });
      return;
    }

    // Use testRecipient if provided, otherwise use current user's email
    const recipientEmail = testRecipient.trim() || null;
    
    if (!recipientEmail) {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user?.email) {
        toast({
          title: "No Recipient",
          description: "Please enter a recipient email address or ensure you're logged in",
          variant: "destructive"
        });
        return;
      }
    }

    setIsTesting(true);
    console.log('📧 [GMAIL SKYRANCH TEST] Starting professional test email send...');
    console.log('📧 [GMAIL SKYRANCH TEST] Using access token (first 10 chars):', accessToken.substring(0, 10) + '...');
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user?.email) {
        throw new Error('No authenticated user found');
      }

      const finalRecipient = recipientEmail || user.email;
      console.log('📧 [GMAIL SKYRANCH TEST] Sending professional test email to:', finalRecipient);

      const testPayload = {
        to: finalRecipient,
        subject: "🏢 SkyRanch Professional Email Test",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin-bottom: 10px;">SkyRanch - Sistema de Gestión Ganadera</h1>
              <p style="color: #6b7280; font-size: 16px;">Professional Email Integration Test</p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
              <h2 style="color: #10b981; margin-top: 0;">✅ Email Integration Successful!</h2>
              <p>This email was sent using our professional Gmail API integration with enhanced delivery settings.</p>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Professional Email Details:</h3>
              <ul style="color: #6b7280; line-height: 1.6;">
                <li><strong>From:</strong> SkyRanch Soporte &lt;soporte@skyranch.es&gt;</li>
                <li><strong>Reply-To:</strong> soporte@skyranch.es</li>
                <li><strong>Method:</strong> Gmail API with OAuth Authentication</li>
                <li><strong>Recipient:</strong> ${finalRecipient}</li>
                <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
                <li><strong>Professional Domain:</strong> skyranch.es</li>
                <li><strong>Authentication:</strong> Enhanced with professional headers</li>
              </ul>
            </div>
            
            <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1d4ed8; margin-top: 0;">🔧 Technical Improvements:</h3>
              <ul style="color: #374151; line-height: 1.6;">
                <li>Professional sending domain (skyranch.es)</li>
                <li>Enhanced MIME headers for better delivery</li>
                <li>Proper Reply-To configuration</li>
                <li>Professional organization branding</li>
                <li>Improved spam filter compatibility</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0;">
                <strong>SkyRanch - Sistema de Gestión Ganadera</strong><br>
                Soporte Técnico: <a href="mailto:soporte@skyranch.es" style="color: #2563eb;">soporte@skyranch.es</a>
              </p>
            </div>
          </div>
        `,
        accessToken: accessToken,
        senderName: "SkyRanch Soporte",
        organizationName: "SkyRanch",
        metadata: {
          tags: [
            { name: "test-type", value: "gmail-professional" },
            { name: "sender", value: "soporte-skyranch" },
            { name: "delivery-verification", value: "professional" },
            { name: "recipient-type", value: recipientEmail ? "external" : "self" },
            { name: "domain", value: "skyranch.es" }
          ]
        }
      };

      console.log('📧 [GMAIL SKYRANCH TEST] Sending professional email with payload:', {
        to: testPayload.to,
        subject: testPayload.subject,
        hasAccessToken: !!testPayload.accessToken,
        senderName: testPayload.senderName,
        organizationName: testPayload.organizationName,
        professionalDomain: 'skyranch.es'
      });

      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke('send-gmail', {
        body: testPayload
      });
      const endTime = Date.now();

      console.log('📧 [GMAIL SKYRANCH TEST] Professional Gmail API response received:', {
        duration: `${endTime - startTime}ms`,
        hasData: !!data,
        hasError: !!error,
        responseData: data,
        responseError: error
      });

      if (error) {
        console.error('📧 [GMAIL SKYRANCH TEST] Edge function error:', error);
        throw new Error(`Gmail API error: ${error.message}`);
      }

      if (data?.success) {
        console.log('✅ [GMAIL SKYRANCH TEST] Professional email sent successfully!');
        console.log('📧 [GMAIL SKYRANCH TEST] Professional Gmail Response Details:', {
          messageId: data.messageId,
          threadId: data.threadId,
          provider: data.details?.provider,
          fromDomain: data.details?.fromDomain,
          senderEmail: data.details?.senderEmail,
          professionalSender: data.details?.professionalSender,
          timestamp: data.details?.timestamp
        });
        
        toast({
          title: "Professional Gmail Test Successful! 🏢",
          description: `Professional email sent from soporte@skyranch.es to ${finalRecipient}. Message ID: ${data.messageId}. Check recipient inbox for professional delivery.`,
        });

        // Enhanced logging for professional delivery verification
        console.log('📧 [GMAIL SKYRANCH TEST] 📊 PROFESSIONAL DELIVERY VERIFICATION:');
        console.log('📧 [GMAIL SKYRANCH TEST] 1. Email sent from professional domain: soporte@skyranch.es');
        console.log('📧 [GMAIL SKYRANCH TEST] 2. Enhanced authentication headers included');
        console.log('📧 [GMAIL SKYRANCH TEST] 3. Professional branding and Reply-To configured');
        console.log('📧 [GMAIL SKYRANCH TEST] 4. Gmail Message ID:', data.messageId);
        console.log('📧 [GMAIL SKYRANCH TEST] 5. Search Gmail for: "SkyRanch Professional Email Test"');
        console.log('📧 [GMAIL SKYRANCH TEST] 6. Recipient should see professional sender info');
      } else {
        console.error('📧 [GMAIL SKYRANCH TEST] Unexpected response format:', data);
        throw new Error(data?.message || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('📧 [GMAIL SKYRANCH TEST] Professional test failed:', error);
      toast({
        title: "Professional Gmail Test Failed",
        description: `Failed to send professional test email: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={handleGmailAuth} 
          disabled={isAuthenticating || !!accessToken}
          variant="outline"
          size="sm"
        >
          {isAuthenticating ? 'Authenticating...' : accessToken ? '✓ Gmail Authenticated' : 'Authenticate Gmail'}
        </Button>
      </div>
      
      {accessToken && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="test-recipient" className="text-sm">
              Professional Test Email Recipient
            </Label>
            <Input
              id="test-recipient"
              type="email"
              placeholder="Enter email address to test professional delivery"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              className="text-sm"
            />
            <p className="text-xs text-gray-500">
              Email will be sent from <strong>soporte@skyranch.es</strong> with professional branding.
              Leave empty to send to yourself for testing.
            </p>
          </div>
          
          <Button 
            onClick={handleSendTestEmail} 
            disabled={isTesting}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {isTesting ? 'Sending Professional Email...' : 'Send Professional Gmail Test'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default GmailOAuthTestButton;
