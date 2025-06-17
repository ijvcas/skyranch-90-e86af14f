
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GmailOAuthCallback = () => {
  useEffect(() => {
    // Extract authorization code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    console.log('📧 [GMAIL OAUTH CALLBACK] Callback received:', { 
      code: code ? 'present' : 'missing', 
      error, 
      errorDescription,
      fullUrl: window.location.href 
    });

    if (error) {
      console.error('📧 [GMAIL OAUTH CALLBACK] OAuth error:', { error, errorDescription });
      
      // Handle specific Google verification errors
      if (error === 'access_denied' || errorDescription?.includes('Access blocked')) {
        window.opener?.postMessage({
          type: 'GMAIL_OAUTH_ERROR',
          error: 'Google verification required - contact developer to add you as test user'
        }, window.location.origin);
      } else {
        window.opener?.postMessage({
          type: 'GMAIL_OAUTH_ERROR',
          error: errorDescription || error
        }, window.location.origin);
      }
      
      // Close popup after short delay
      setTimeout(() => {
        window.close();
      }, 2000);
      return;
    }

    if (code) {
      console.log('📧 [GMAIL OAUTH CALLBACK] Authorization code received, sending to parent...');
      
      // Send code to parent window
      window.opener?.postMessage({
        type: 'GMAIL_OAUTH_SUCCESS',
        code: code
      }, window.location.origin);
      
      // Close popup
      window.close();
    } else {
      console.error('📧 [GMAIL OAUTH CALLBACK] No authorization code received');
      window.opener?.postMessage({
        type: 'GMAIL_OAUTH_ERROR',
        error: 'No authorization code received'
      }, window.location.origin);
      
      // Close popup after short delay
      setTimeout(() => {
        window.close();
      }, 2000);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Gmail OAuth Callback</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600">
            Processing Gmail authentication...
          </p>
          <p className="text-xs text-gray-500">
            This window will close automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GmailOAuthCallback;
