
interface TokenData {
  access_token: string;
  refresh_token?: string;
}

export function generateAuthUrl(clientId: string, redirectUri: string): string {
  const scope = 'https://www.googleapis.com/auth/gmail.send';
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  
  return authUrl.toString();
}

export async function exchangeCodeForToken(
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string
): Promise<TokenData> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [GMAIL OAUTH] Token exchange error:', response.status, errorText);
    throw new Error(`Failed to exchange code for token: ${response.status} ${errorText}`);
  }

  return await response.json();
}
