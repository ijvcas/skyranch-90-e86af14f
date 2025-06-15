
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { emailServiceV2 } from '@/services/email/v2/EmailServiceV2';
import { supabase } from '@/integrations/supabase/client';

const EmailTestButton = () => {
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const handleTestEmail = async () => {
    setIsTesting(true);
    console.log('🧪 [EMAIL TEST V2] Starting email test...');
    
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
        title: "Test Email Sent (V2)",
        description: `Test email sent successfully to ${user.email} using new email system`,
      });
    } catch (error) {
      console.error('🧪 [EMAIL TEST V2] Test failed:', error);
      toast({
        title: "Email Test Failed",
        description: `Failed to send test email: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleHealthCheck = async () => {
    try {
      const health = await emailServiceV2.healthCheck();
      console.log('🏥 [EMAIL HEALTH CHECK]', health);
      
      toast({
        title: health.healthy ? "Email System Healthy" : "Email System Issues",
        description: health.healthy ? "All email components are working properly" : "Some email components may have issues",
        variant: health.healthy ? "default" : "destructive"
      });
    } catch (error) {
      console.error('🏥 [EMAIL HEALTH CHECK] Failed:', error);
      toast({
        title: "Health Check Failed",
        description: `Failed to check email system health: ${error.message}`,
        variant: "destructive"
      });
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
        {isTesting ? 'Testing...' : 'Test Email V2'}
      </Button>
      
      <Button 
        onClick={handleHealthCheck} 
        variant="outline"
        size="sm"
      >
        Health Check
      </Button>
    </div>
  );
};

export default EmailTestButton;
