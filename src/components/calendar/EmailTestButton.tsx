
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { emailServiceV2 } from '@/services/email/v2/EmailServiceV2';
import { supabase } from '@/integrations/supabase/client';
import GmailOAuthTestButton from './GmailOAuthTestButton';

const EmailTestButton = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [isDirectTesting, setIsDirectTesting] = useState(false);
  const { toast } = useToast();

  // STANDARDIZED payload builder to ensure both buttons use EXACT same format
  const buildStandardPayload = (userEmail: string, testType: string) => {
    const basePayload = {
      to: userEmail,
      subject: testType === 'direct' ? "Direct Edge Function Test" : "Test Email V2 - SkyRanch",
      html: testType === 'direct' 
        ? "<h1>Direct Test</h1><p>This is a direct test of the send-email-v2 edge function.</p>"
        : "<h1>Test Email V2</h1><p>This is a test of the regular email flow using the direct edge function approach.</p><p>If you receive this, the email system is working correctly.</p>",
      senderName: testType === 'direct' ? "SkyRanch Test" : "SkyRanch - Sistema de Gestión Ganadera",
      organizationName: "SkyRanch",
      metadata: {
        tags: testType === 'direct' 
          ? [{ name: "test-type", value: "direct" }]
          : [
              { name: "category", value: "test" },
              { name: "test-type", value: "regular" },
              { name: "sender", value: "skyranch" },
              { name: "version", value: "2_0" }
            ],
        headers: {}
      }
    };

    console.log(`🔧 [${testType.toUpperCase()} TEST PAYLOAD] Standardized payload created:`, {
      to: basePayload.to,
      subject: basePayload.subject,
      senderName: basePayload.senderName,
      organizationName: basePayload.organizationName,
      tagsCount: basePayload.metadata.tags.length,
      tags: basePayload.metadata.tags,
      timestamp: new Date().toISOString()
    });

    return basePayload;
  };

  const handleTestEmail = async () => {
    setIsTesting(true);
    console.log('🧪 [EMAIL TEST V2] ===== STARTING TEST EMAIL V2 WITH ENHANCED DEBUGGING =====');
    console.log('🧪 [EMAIL TEST V2] Timestamp:', new Date().toISOString());
    
    try {
      // Get current user email
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user?.email) {
        throw new Error('No authenticated user found');
      }

      console.log('🧪 [EMAIL TEST V2] User authenticated:', {
        email: user.email,
        userId: user.id,
        emailVerified: user.email_confirmed_at ? 'yes' : 'no'
      });

      // Use STANDARDIZED payload builder
      const payload = buildStandardPayload(user.email, 'regular');

      console.log('🧪 [EMAIL TEST V2] About to call edge function with STANDARDIZED payload...');
      console.log('🧪 [EMAIL TEST V2] Payload JSON:', JSON.stringify(payload, null, 2));
      
      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke('send-email-v2', {
        body: payload
      });
      const endTime = Date.now();

      console.log('🧪 [EMAIL TEST V2] Edge function call completed:', {
        duration: `${endTime - startTime}ms`,
        hasData: !!data,
        hasError: !!error,
        timestamp: new Date().toISOString()
      });

      console.log('🧪 [EMAIL TEST V2] Raw response data:', data);
      console.log('🧪 [EMAIL TEST V2] Raw response error:', error);

      if (error) {
        console.error('🧪 [EMAIL TEST V2] Edge function invocation error:', error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (data?.success) {
        console.log('🧪 [EMAIL TEST V2] ✅ SUCCESS RESPONSE RECEIVED');
        console.log('🧪 [EMAIL TEST V2] Resend Message ID:', data.messageId);
        console.log('🧪 [EMAIL TEST V2] Full success data:', data);
        
        // Enhanced success logging for Resend dashboard verification
        console.log('🧪 [EMAIL TEST V2] 📊 DELIVERY VERIFICATION:');
        console.log('🧪 [EMAIL TEST V2] - Check Resend dashboard: https://resend.com/emails');
        console.log(`🧪 [EMAIL TEST V2] - Search for Message ID: ${data.messageId}`);
        console.log(`🧪 [EMAIL TEST V2] - Recipient: ${user.email}`);
        console.log(`🧪 [EMAIL TEST V2] - Delivery domain: ${user.email.split('@')[1]}`);
        console.log('🧪 [EMAIL TEST V2] - If message appears in dashboard but not in inbox, check spam folder');
        
        toast({
          title: "Test Email V2 Sent Successfully",
          description: `Test email sent to ${user.email}. Message ID: ${data.messageId}. Check Resend dashboard and your inbox (including spam folder).`,
        });
      } else if (data?.error) {
        console.error('🧪 [EMAIL TEST V2] Edge function returned error:', data.error);
        
        // Handle specific error types returned by the edge function
        if (data.error === 'sandbox_mode_restriction') {
          console.error('🧪 [EMAIL TEST V2] ❌ SANDBOX MODE RESTRICTION');
          toast({
            title: "Sandbox Mode Restriction",
            description: `Resend account is in sandbox mode. Upgrade your account at https://resend.com/pricing`,
            variant: "destructive"
          });
          return;
        }
        
        if (data.error === 'domain_verification_required') {
          console.error('🧪 [EMAIL TEST V2] ❌ DOMAIN VERIFICATION REQUIRED');
          toast({
            title: "Domain Verification Required",
            description: `Domain verification required. Verify your domain at https://resend.com/domains`,
            variant: "destructive"
          });
          return;
        }
        
        toast({
          title: "Edge Function Error",
          description: `${data.error}: ${data.message}`,
          variant: "destructive"
        });
      } else {
        console.error('🧪 [EMAIL TEST V2] ❌ UNEXPECTED RESPONSE FORMAT:', data);
        toast({
          title: "Unexpected Response",
          description: "Edge function returned unexpected response format",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('🧪 [EMAIL TEST V2] ❌ FATAL ERROR:', error);
      console.error('🧪 [EMAIL TEST V2] Error stack:', error.stack);
      toast({
        title: "Email Test Failed",
        description: `Failed to send test email: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
      console.log('🧪 [EMAIL TEST V2] ===== TEST EMAIL V2 COMPLETED =====');
    }
  };

  const handleDirectEdgeFunctionTest = async () => {
    setIsDirectTesting(true);
    console.log('🔧 [DIRECT TEST] ===== STARTING DIRECT EDGE FUNCTION TEST =====');
    console.log('🔧 [DIRECT TEST] Timestamp:', new Date().toISOString());
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user?.email) {
        throw new Error('No authenticated user found');
      }

      console.log('🔧 [DIRECT TEST] User authenticated:', {
        email: user.email,
        userId: user.id,
        emailVerified: user.email_confirmed_at ? 'yes' : 'no'
      });

      // Use STANDARDIZED payload builder
      const payload = buildStandardPayload(user.email, 'direct');

      console.log('🔧 [DIRECT TEST] About to call edge function with STANDARDIZED payload...');
      console.log('🔧 [DIRECT TEST] Payload JSON:', JSON.stringify(payload, null, 2));

      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke('send-email-v2', {
        body: payload
      });
      const endTime = Date.now();

      console.log('🔧 [DIRECT TEST] Edge function call completed:', {
        duration: `${endTime - startTime}ms`,
        hasData: !!data,
        hasError: !!error,
        timestamp: new Date().toISOString()
      });

      console.log('🔧 [DIRECT TEST] Raw response data:', data);
      console.log('🔧 [DIRECT TEST] Raw response error:', error);

      if (error) {
        console.error('🔧 [DIRECT TEST] Edge function invocation error:', error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (data?.success) {
        console.log('🔧 [DIRECT TEST] ✅ SUCCESS RESPONSE RECEIVED');
        console.log('🔧 [DIRECT TEST] Resend Message ID:', data.messageId);
        console.log('🔧 [DIRECT TEST] Full success data:', data);
        
        // Enhanced success logging for Resend dashboard verification
        console.log('🔧 [DIRECT TEST] 📊 DELIVERY VERIFICATION:');
        console.log('🔧 [DIRECT TEST] - Check Resend dashboard: https://resend.com/emails');
        console.log(`🔧 [DIRECT TEST] - Search for Message ID: ${data.messageId}`);
        console.log(`🔧 [DIRECT TEST] - Recipient: ${user.email}`);
        console.log(`🔧 [DIRECT TEST] - Delivery domain: ${user.email.split('@')[1]}`);
        console.log('🔧 [DIRECT TEST] - If message appears in dashboard but not in inbox, check spam folder');
        
        toast({
          title: "Direct Test Successful",
          description: `Edge function working correctly. Message ID: ${data.messageId}. Check Resend dashboard.`,
        });
      } else if (data?.error) {
        console.error('🔧 [DIRECT TEST] Edge function returned error:', data.error);
        toast({
          title: "Edge Function Error",
          description: `${data.error}: ${data.message}`,
          variant: "destructive"
        });
      } else {
        console.error('🔧 [DIRECT TEST] ❌ UNEXPECTED RESPONSE FORMAT:', data);
        toast({
          title: "Unexpected Response",
          description: "Edge function returned unexpected response format",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('🔧 [DIRECT TEST] ❌ FATAL ERROR:', error);
      console.error('🔧 [DIRECT TEST] Error stack:', error.stack);
      toast({
        title: "Direct Test Failed",
        description: `Edge function test failed: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsDirectTesting(false);
      console.log('🔧 [DIRECT TEST] ===== DIRECT EDGE FUNCTION TEST COMPLETED =====');
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
    <div className="space-y-4">
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
      
      {/* Gmail OAuth Testing Section */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-2">Gmail OAuth Testing</h4>
        <GmailOAuthTestButton />
      </div>
    </div>
  );
};

export default EmailTestButton;
