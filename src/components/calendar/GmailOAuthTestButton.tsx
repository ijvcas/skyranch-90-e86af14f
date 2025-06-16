
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const GmailOAuthTestButton = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGmailAuth = async () => {
    setIsAuthenticating(true);
    console.log('🔐 [GMAIL OAUTH] Starting OAuth authentication...');
    
    try {
      // Get current user for email
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user?.email) {
        throw new Error('No authenticated user found');
      }

      const redirectUri = window.location.origin + '/dashboard'; // Redirect back to dashboard
      
      console.log('🔐 [GMAIL OAUTH] Getting auth URL...');
      const { data, error } = await supabase.functions.invoke('send-gmail/auth-url', {
        body: { redirectUri }
      });

      if (error) {
        throw new Error(`Failed to get auth URL: ${error.message}`);
      }

      if (data?.authUrl) {
        console.log('🔐 [GMAIL OAUTH] Redirecting to Google OAuth...');
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
            popup?.close();
            window.removeEventListener('message', handleMessage);
            
            console.log('🔐 [GMAIL OAUTH] OAuth code received, exchanging for token...');
            
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
              console.log('✅ [GMAIL OAUTH] Access token obtained successfully');
              toast({
                title: "Gmail Authentication Successful",
                description: "You can now send test emails via Gmail API",
              });
            }
          } else if (event.data.type === 'GMAIL_OAUTH_ERROR') {
            popup?.close();
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
      console.error('🔐 [GMAIL OAUTH] Authentication error:', error);
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

    setIsTesting(true);
    console.log('📧 [GMAIL OAUTH TEST] Starting test email send...');
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user?.email) {
        throw new Error('No authenticated user found');
      }

      const testPayload = {
        to: user.email,
        subject: "🧪 Gmail OAuth Test - SkyRanch",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Gmail OAuth Test Successful! 🎉</h1>
            <p>This email was sent using Gmail API with OAuth authentication.</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3>Test Details:</h3>
              <ul>
                <li><strong>Method:</strong> Gmail API with OAuth</li>
                <li><strong>Recipient:</strong> ${user.email}</li>
                <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
                <li><strong>Sender:</strong> Your personal Gmail account</li>
              </ul>
            </div>
            <p>If you receive this email, the Gmail OAuth integration is working correctly!</p>
            <p style="color: #6b7280; font-size: 14px;">
              This is a test message from SkyRanch - Sistema de Gestión Ganadera
            </p>
          </div>
        `,
        accessToken: accessToken,
        senderName: "SkyRanch Test",
        organizationName: "SkyRanch",
        metadata: {
          tags: [
            { name: "test-type", value: "gmail-oauth" },
            { name: "sender", value: "oauth-test" }
          ]
        }
      };

      console.log('📧 [GMAIL OAUTH TEST] Sending email with payload:', {
        to: testPayload.to,
        subject: testPayload.subject,
        hasAccessToken: !!testPayload.accessToken
      });

      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke('send-gmail', {
        body: testPayload
      });
      const endTime = Date.now();

      console.log('📧 [GMAIL OAUTH TEST] Email send completed:', {
        duration: `${endTime - startTime}ms`,
        hasData: !!data,
        hasError: !!error
      });

      if (error) {
        throw new Error(`Gmail API error: ${error.message}`);
      }

      if (data?.success) {
        console.log('✅ [GMAIL OAUTH TEST] Email sent successfully!');
        console.log('📧 [GMAIL OAUTH TEST] Message ID:', data.messageId);
        
        toast({
          title: "Gmail OAuth Test Successful! 🎉",
          description: `Test email sent successfully. Message ID: ${data.messageId}. Check your inbox!`,
        });
      } else {
        throw new Error(data?.message || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('📧 [GMAIL OAUTH TEST] Test failed:', error);
      toast({
        title: "Gmail OAuth Test Failed",
        description: `Failed to send test email: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        onClick={handleGmailAuth} 
        disabled={isAuthenticating || !!accessToken}
        variant="outline"
        size="sm"
      >
        {isAuthenticating ? 'Authenticating...' : accessToken ? '✓ Gmail Authenticated' : 'Authenticate Gmail'}
      </Button>
      
      {accessToken && (
        <Button 
          onClick={handleSendTestEmail} 
          disabled={isTesting}
          variant="outline"
          size="sm"
        >
          {isTesting ? 'Sending...' : 'Send Gmail Test'}
        </Button>
      )}
    </div>
  );
};

export default GmailOAuthTestButton;
