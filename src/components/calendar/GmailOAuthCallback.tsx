
import React, { useEffect } from 'react';

const GmailOAuthCallback = () => {
  useEffect(() => {
    console.log('📧 [GMAIL OAUTH CALLBACK] Processing OAuth callback...');
    
    // Extract authorization code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('📧 [GMAIL OAUTH CALLBACK] OAuth error:', error);
      // Send error to parent window
      window.opener?.postMessage({
        type: 'GMAIL_OAUTH_ERROR',
        error: error
      }, window.location.origin);
      window.close();
    } else if (code) {
      console.log('📧 [GMAIL OAUTH CALLBACK] OAuth code received');
      // Send code to parent window
      window.opener?.postMessage({
        type: 'GMAIL_OAUTH_SUCCESS',
        code: code
      }, window.location.origin);
      window.close();
    } else {
      console.error('📧 [GMAIL OAUTH CALLBACK] No code or error in callback');
      window.opener?.postMessage({
        type: 'GMAIL_OAUTH_ERROR',
        error: 'No authorization code received'
      }, window.location.origin);
      window.close();
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Processing Gmail authentication...</p>
        <p className="text-sm text-gray-500 mt-2">This window will close automatically.</p>
      </div>
    </div>
  );
};

export default GmailOAuthCallback;
