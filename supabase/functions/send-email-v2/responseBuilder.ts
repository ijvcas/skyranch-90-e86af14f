
import { SuccessResponse } from './types.ts';

export class ResponseBuilder {
  static buildSuccessResponse(emailData: any, recipientDomain: string): SuccessResponse {
    return {
      success: true,
      messageId: emailData.id,
      details: emailData,
      version: '2.0',
      deliveryInfo: {
        recipientDomain,
        suggestion: "Check your inbox (including spam folder) and Resend dashboard for delivery confirmation",
        resendDashboard: "https://resend.com/emails"
      }
    };
  }
}
