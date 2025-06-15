
import { EmailRequestV2 } from './types.ts';

export class EmailValidator {
  static validate(request: EmailRequestV2): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.to) {
      errors.push('Missing required field: to');
    }

    if (!request.subject) {
      errors.push('Missing required field: subject');
    }

    if (!request.html) {
      errors.push('Missing required field: html');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
