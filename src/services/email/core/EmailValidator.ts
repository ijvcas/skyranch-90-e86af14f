
import { EmailAddress, EmailRequest } from '../interfaces/EmailTypes';
import { emailLogger } from './EmailLogger';

export class EmailValidator {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateEmailAddress(address: EmailAddress): boolean {
    if (!address.email) {
      emailLogger.warn('Email address is missing email field');
      return false;
    }

    if (!this.validateEmail(address.email)) {
      emailLogger.warn('Invalid email format', { email: address.email });
      return false;
    }

    return true;
  }

  static validateEmailRequest(request: EmailRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate recipients
    const recipients = Array.isArray(request.to) ? request.to : [request.to];
    
    if (recipients.length === 0) {
      errors.push('No recipients specified');
    }

    for (const recipient of recipients) {
      if (!this.validateEmailAddress(recipient)) {
        errors.push(`Invalid recipient: ${recipient.email}`);
      }
    }

    // Validate content
    if (!request.content.subject?.trim()) {
      errors.push('Subject is required');
    }

    if (!request.content.html?.trim()) {
      errors.push('HTML content is required');
    }

    // Validate event details if provided
    if (request.eventDetails) {
      if (!request.eventDetails.title?.trim()) {
        errors.push('Event title is required when event details are provided');
      }

      if (!request.eventDetails.eventDate?.trim()) {
        errors.push('Event date is required when event details are provided');
      }
    }

    const valid = errors.length === 0;
    
    if (!valid) {
      emailLogger.warn('Email request validation failed', { errors });
    } else {
      emailLogger.debug('Email request validation passed');
    }

    return { valid, errors };
  }

  static sanitizeText(text: string): string {
    return text
      .replace(/[<>]/g, '') // Remove basic HTML chars
      .trim();
  }

  static sanitizeHtml(html: string): string {
    // Basic HTML sanitization - in production, use a proper library like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .trim();
  }
}
