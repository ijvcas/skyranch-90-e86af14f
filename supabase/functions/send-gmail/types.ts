
export interface GmailRequest {
  to: string;
  subject: string;
  html: string;
  senderName?: string;
  organizationName?: string;
  metadata?: {
    tags?: Array<{ name: string; value: string }>;
    headers?: Record<string, string>;
  };
}

export interface OAuthRequest extends GmailRequest {
  accessToken?: string;
}

export interface AuthUrlRequest {
  redirectUri: string;
}
