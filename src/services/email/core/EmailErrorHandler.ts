
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

    // Common Resend error patterns
    if (error.message?.includes('Domain verification required')) {
      return this.createError(
        'DOMAIN_VERIFICATION_REQUIRED',
        'Email domain requires verification in Resend dashboard',
        error,
        false
      );
    }

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
