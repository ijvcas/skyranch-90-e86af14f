
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { emailServiceV2 } from '@/services/email/v2/EmailServiceV2';
import { supabase } from '@/integrations/supabase/client';

const EmailTestButton = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [isDirectTesting, setIsDirectTesting] = useState(false);
  const { toast } = useToast();

  const handleTestEmail = async () => {
    setIsTesting(true);
    console.log('🧪 [EMAIL TEST V2] Starting email test with comprehensive diagnostics...');
    
    try {
      // Get current user email
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user?.email) {
        throw new Error('No authenticated user found');
      }

      console.log('🧪 [EMAIL TEST V2] Testing with user email:', user.email);
      
      const result = await emailServiceV2.testEmail(user.email);
      console.log('🧪 [EMAIL TEST V2] Test result:', result);
      
      toast({
        title: "Test Email Sent Successfully (V2)",
        description: `Test email sent to ${user.email}. Check your inbox (including spam folder) and Resend dashboard for delivery confirmation.`,
      });
    } catch (error) {
      console.error('🧪 [EMAIL TEST V2] Test failed:', error);
      
      let errorMessage = error.message;
      
      // Handle sandbox mode restrictions with helpful message
      if (error.message.includes('sandbox mode') || error.message.includes('only send testing emails to your own email')) {
        errorMessage = `Resend account is in sandbox mode. Upgrade your account at https://resend.com/pricing`;
        toast({
          title: "Sandbox Mode Restriction",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }
      
      // Handle domain verification errors
      if (error.message.includes('domain verification') || error.message.includes('Domain verification')) {
        errorMessage = `Domain verification required. Verify your domain at https://resend.com/domains`;
        toast({
          title: "Domain Verification Required",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      // Handle edge function deployment issues
      if (error.message.includes('not found') || error.message.includes('edge function not deployed')) {
        errorMessage = `Email service not available. Edge function may not be deployed.`;
        toast({
          title: "Service Not Available",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Email Test Failed",
        description: `Failed to send test email: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDirectEdgeFunctionTest = async () => {
    setIsDirectTesting(true);
    console.log('🔧 [DIRECT TEST] Testing edge function directly...');
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user?.email) {
        throw new Error('No authenticated user found');
      }

      console.log('🔧 [DIRECT TEST] Calling edge function directly with user email:', user.email);
      
      const payload = {
        to: user.email,
        subject: "Direct Edge Function Test",
        html: "<h1>Direct Test</h1><p>This is a direct test of the send-email-v2 edge function.</p>",
        senderName: "SkyRanch Test",
        organizationName: "SkyRanch",
        metadata: {
          tags: [{ name: "test-type", value: "direct" }],
          headers: {}
        }
      };

      const { data, error } = await supabase.functions.invoke('send-email-v2', {
        body: payload
      });

      console.log('🔧 [DIRECT TEST] Raw edge function response:', { data, error });

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (data?.success) {
        toast({
          title: "Direct Test Successful",
          description: `Edge function working correctly. Message ID: ${data.messageId}`,
        });
      } else if (data?.error) {
        toast({
          title: "Edge Function Error",
          description: `${data.error}: ${data.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Unexpected Response",
          description: "Edge function returned unexpected response format",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('🔧 [DIRECT TEST] Direct test failed:', error);
      toast({
        title: "Direct Test Failed",
        description: `Edge function test failed: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsDirectTesting(false);
    }
  };

  const handleHealthCheck = async () => {
    setIsHealthChecking(true);
    try {
      const health = await emailServiceV2.healthCheck();
      console.log('🏥 [EMAIL HEALTH CHECK V2]', health);
      
      toast({
        title: health.healthy ? "Email System Healthy (V2)" : "Email System Issues",
        description: health.healthy 
          ? "All email components are working properly with improved diagnostics" 
          : "Some email components may have issues",
        variant: health.healthy ? "default" : "destructive"
      });
    } catch (error) {
      console.error('🏥 [EMAIL HEALTH CHECK V2] Failed:', error);
      toast({
        title: "Health Check Failed",
        description: `Failed to check email system health: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsHealthChecking(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        onClick={handleTestEmail} 
        disabled={isTesting}
        variant="outline"
        size="sm"
      >
        {isTesting ? 'Testing V2...' : 'Test Email V2'}
      </Button>
      
      <Button 
        onClick={handleDirectEdgeFunctionTest} 
        disabled={isDirectTesting}
        variant="outline"
        size="sm"
      >
        {isDirectTesting ? 'Testing Direct...' : 'Direct Edge Test'}
      </Button>
      
      <Button 
        onClick={handleHealthCheck} 
        disabled={isHealthChecking}
        variant="outline"
        size="sm"
      >
        {isHealthChecking ? 'Checking...' : 'Health Check V2'}
      </Button>
    </div>
  );
};

export default EmailTestButton;
