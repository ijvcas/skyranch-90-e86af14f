
export interface EmailRequestV2 {
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

export interface EmailPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
  headers: Record<string, string>;
  tags: Array<{ name: string; value: string }>;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}

export interface SuccessResponse {
  success: true;
  messageId: string;
  details: any;
  version: string;
  deliveryInfo: {
    recipientDomain: string;
    suggestion: string;
    resendDashboard: string;
  };
}
