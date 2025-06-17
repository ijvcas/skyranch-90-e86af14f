
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

      // Use a more flexible redirect URI approach
      const currentOrigin = window.location.origin;
      const redirectUri = `${currentOrigin}/gmail-callback`;
      
      console.log('🔐 [GMAIL SKYRANCH AUTH] Getting auth URL with redirect:', redirectUri);
      
      // Show user that they need to complete Google verification
      toast({
        title: "⚠️ Google Verification Required",
        description: "Your Google Cloud project needs verification. Please contact the developer to add you as a test user, or complete the Google verification process.",
        variant: "destructive"
      });

      // For now, let's try to get the auth URL anyway
      const { data, error } = await supabase.functions.invoke('send-gmail/auth-url', {
        body: { redirectUri }
      });

      if (error) {
        console.error('🔐 [GMAIL SKYRANCH AUTH] Auth URL error:', error);
        
        // Provide helpful error message about Google verification
        toast({
          title: "🔧 Configuration Issue",
          description: "Gmail OAuth needs Google Cloud project verification. Please add your email as a test user in Google Cloud Console, or complete the app verification process.",
          variant: "destructive"
        });
        return;
      }

      if (data?.authUrl) {
        console.log('🔐 [GMAIL SKYRANCH AUTH] Redirecting to Google OAuth...');
        
        // Show warning about verification before opening popup
        const userConfirmed = confirm(
          "Gmail OAuth requires Google verification. This may show an 'access blocked' error. " +
          "To fix this, add your email as a test user in Google Cloud Console. Continue anyway?"
        );
        
        if (!userConfirmed) {
          setIsAuthenticating(false);
          return;
        }
        
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
                title: "✅ Gmail Authentication Successful",
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
                title: "🔧 Authentication Issue",
                description: "If you saw 'access blocked', you need to be added as a test user in Google Cloud Console",
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
        organizationName: "SkyRanch"
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
        
        toast({
          title: "Professional Gmail Test Successful! 🏢",
          description: `Professional email sent from soporte@skyranch.es to ${finalRecipient}. Message ID: ${data.messageId}. Check recipient inbox for professional delivery.`,
        });
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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-yellow-600">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Google Verification Required
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Your Google Cloud project needs verification. To use Gmail OAuth:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Add your email as a test user in Google Cloud Console</li>
                <li>Or complete the Google app verification process</li>
                <li>Contact the developer for assistance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={handleGmailAuth} 
          disabled={isAuthenticating || !!accessToken}
          variant="outline"
          size="sm"
        >
          {isAuthenticating ? 'Authenticating...' : accessToken ? '✓ Gmail Authenticated' : 'Try Gmail Auth (May Fail)'}
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
