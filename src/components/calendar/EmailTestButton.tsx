
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { emailServiceV2 } from '@/services/email/v2/EmailServiceV2';
import { supabase } from '@/integrations/supabase/client';

const EmailTestButton = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const { toast } = useToast();

  const handleTestEmail = async () => {
    setIsTesting(true);
    console.log('🧪 [EMAIL TEST V2] Starting email test with new system...');
    
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
        description: `Test email sent to ${user.email} using the new email system`,
      });
    } catch (error) {
      console.error('🧪 [EMAIL TEST V2] Test failed:', error);
      
      let errorMessage = error.message;
      
      // Handle domain verification errors with helpful message
      if (error.message.includes('domain verification') || error.message.includes('Domain verification')) {
        errorMessage = `Domain verification required. Only verified email addresses can receive emails.`;
        toast({
          title: "Domain Verification Required",
          description: "To send emails to your address, verify your domain at https://resend.com/domains",
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

  const handleHealthCheck = async () => {
    setIsHealthChecking(true);
    try {
      const health = await emailServiceV2.healthCheck();
      console.log('🏥 [EMAIL HEALTH CHECK V2]', health);
      
      toast({
        title: health.healthy ? "Email System Healthy (V2)" : "Email System Issues",
        description: health.healthy 
          ? "All email components are working properly with the new system" 
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
    <div className="flex space-x-2">
      <Button 
        onClick={handleTestEmail} 
        disabled={isTesting}
        variant="outline"
        size="sm"
      >
        {isTesting ? 'Testing V2...' : 'Test Email V2'}
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
