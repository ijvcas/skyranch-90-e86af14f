
import { ErrorResponse } from './types.ts';

export class EmailErrorHandler {
  static createValidationError(message: string, details?: any): ErrorResponse {
    return {
      error: "validation_error",
      message,
      details
    };
  }

  static createSandboxModeError(originalError: any, userEmail: string, recipientDomain: string): ErrorResponse {
    return {
      error: "sandbox_mode_restriction",
      message: "Resend account is in sandbox mode. You can only send emails to the email address associated with your Resend account.",
      details: {
        originalError,
        suggestion: "Upgrade your Resend account or send test emails to your Resend account email address",
        userEmail,
        recipientDomain
      }
    };
  }

  static createDomainVerificationError(originalError: any, userEmail: string, recipientDomain: string): ErrorResponse {
    return {
      error: "domain_verification_required",
      message: "Email domain requires verification in your Resend account.",
      details: {
        originalError,
        suggestion: "Verify your domain at https://resend.com/domains",
        userEmail,
        recipientDomain
      }
    };
  }

  static createRateLimitError(originalError: any): ErrorResponse {
    return {
      error: "rate_limited",
      message: "Rate limit exceeded. Please try again later.",
      details: originalError
    };
  }

  static createInvalidApiKeyError(originalError: any): ErrorResponse {
    return {
      error: "invalid_api_key",
      message: "Invalid or missing Resend API key configuration.",
      details: originalError
    };
  }

  static createGenericResendError(originalError: any): ErrorResponse {
    return {
      error: "resend_api_error",
      message: originalError.message || "Email service error",
      details: originalError
    };
  }

  static createNetworkError(error: any): ErrorResponse {
    return {
      error: "network_error",
      message: error.message || "Internal server error",
      details: {
        name: error.name,
        stack: error.stack?.substring(0, 500),
        suggestion: "Check your internet connection and Resend API status"
      }
    };
  }

  static createFunctionError(error: any): ErrorResponse {
    return {
      error: "function_error",
      message: error.message || "Internal server error",
      details: {
        name: error.name,
        stack: error.stack?.substring(0, 500),
        suggestion: "Check function logs for more details"
      }
    };
  }

  static createUnexpectedResponseError(response: any, recipientDomain: string): ErrorResponse {
    return {
      error: "unexpected_response",
      message: "Unexpected email service response - no data returned",
      details: {
        response,
        debugInfo: {
          recipientDomain,
          suggestion: "Check Resend dashboard at https://resend.com/emails for delivery status"
        }
      }
    };
  }
}
