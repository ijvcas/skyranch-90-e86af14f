
import { emailLogger } from './EmailLogger';

export interface EmailError {
  code: string;
  message: string;
  details?: any;
  recoverable: boolean;
}

export class EmailErrorHandler {
  static createError(code: string, message: string, details?: any, recoverable = false): EmailError {
    return { code, message, details, recoverable };
  }

  static handleResendError(error: any): EmailError {
    emailLogger.error('Resend API error detected', error);

    // Handle sandbox mode restrictions
    if (error.message?.includes('only send testing emails to your own email') || 
        error.message?.includes('sandbox')) {
      return this.createError(
        'SANDBOX_MODE_RESTRICTION',
        'Resend account is in sandbox mode. You can only send emails to your account email address.',
        error,
        false
      );
    }

    // Handle domain verification errors (legitimate ones from Resend)
    if (error.message?.includes('Domain verification required') || 
        error.message?.includes('verify a domain')) {
      return this.createError(
        'DOMAIN_VERIFICATION_REQUIRED',
        'Email domain requires verification in your Resend account.',
        error,
        false
      );
    }

    // Common Resend error patterns
    if (error.message?.includes('API key')) {
      return this.createError(
        'INVALID_API_KEY',
        'Invalid or missing Resend API key',
        error,
        false
      );
    }

    if (error.message?.includes('rate limit')) {
      return this.createError(
        'RATE_LIMITED',
        'Rate limit exceeded, please try again later',
        error,
        true
      );
    }

    if (error.message?.includes('invalid email')) {
      return this.createError(
        'INVALID_EMAIL',
        'Invalid email address format',
        error,
        false
      );
    }

    // Generic Resend error
    return this.createError(
      'RESEND_API_ERROR',
      error.message || 'Unknown Resend API error',
      error,
      true
    );
  }

  static handleValidationError(errors: string[]): EmailError {
    return this.createError(
      'VALIDATION_ERROR',
      `Validation failed: ${errors.join(', ')}`,
      { errors },
      false
    );
  }

  static handleNetworkError(error: any): EmailError {
    emailLogger.error('Network error detected', error);

    return this.createError(
      'NETWORK_ERROR',
      'Network error occurred while sending email',
      error,
      true
    );
  }

  static handleUnknownError(error: any): EmailError {
    emailLogger.error('Unknown error detected', error);

    return this.createError(
      'UNKNOWN_ERROR',
      error.message || 'An unknown error occurred',
      error,
      true
    );
  }

  static categorizeError(error: any): EmailError {
    // Authentication errors
    if (error.message?.includes('Authentication required')) {
      return this.createError(
        'AUTHENTICATION_ERROR',
        'User authentication required',
        error,
        false
      );
    }

    // Sandbox mode restrictions
    if (error.message?.includes('sandbox') || 
        error.message?.includes('only send testing emails to your own email')) {
      return this.handleResendError(error);
    }

    // Domain verification errors (legitimate ones from Resend API)
    if (error.message?.includes('domain verification') || 
        error.message?.includes('verify a domain')) {
      return this.handleResendError(error);
    }

    // Network/connection errors
    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      return this.handleNetworkError(error);
    }

    // If it's already a categorized error, return as-is
    if (error.code && error.message && typeof error.recoverable === 'boolean') {
      return error as EmailError;
    }

    // Try to categorize based on error content
    if (error.message?.includes('resend') || error.name?.includes('resend')) {
      return this.handleResendError(error);
    }

    // Default to unknown error
    return this.handleUnknownError(error);
  }
}
