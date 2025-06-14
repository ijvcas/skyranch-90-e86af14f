
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { emailService } from '@/services/notifications/emailService';
import { supabase } from '@/integrations/supabase/client';

const EmailTestButton = () => {
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const handleTestEmail = async () => {
    setIsTesting(true);
    console.log('🧪 [EMAIL TEST] Starting email test...');
    
    try {
      // Get current user email
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user?.email) {
        throw new Error('No authenticated user found');
      }

      console.log('🧪 [EMAIL TEST] Testing with user email:', user.email);
      
      const result = await emailService.testEmail(user.email);
      console.log('🧪 [EMAIL TEST] Test result:', result);
      
      toast({
        title: "Test Email Sent",
        description: `Test email sent successfully to ${user.email}`,
      });
    } catch (error) {
      console.error('🧪 [EMAIL TEST] Test failed:', error);
      toast({
        title: "Email Test Failed",
        description: `Failed to send test email: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Button 
      onClick={handleTestEmail} 
      disabled={isTesting}
      variant="outline"
      size="sm"
    >
      {isTesting ? 'Testing...' : 'Test Email'}
    </Button>
  );
};

export default EmailTestButton;
