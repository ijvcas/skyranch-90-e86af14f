
import { EmailLog } from '../interfaces/EmailTypes';

export class EmailLogger {
  private logs: EmailLog[] = [];
  private readonly maxLogs = 1000;

  log(level: EmailLog['level'], message: string, data?: any): void {
    const logEntry: EmailLog = {
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    // Console logging with prefixes
    const prefix = `📧 [EMAIL ${level.toUpperCase()}]`;
    
    switch (level) {
      case 'error':
        console.error(prefix, message, data);
        break;
      case 'warn':
        console.warn(prefix, message, data);
        break;
      case 'debug':
        console.debug(prefix, message, data);
        break;
      default:
        console.log(prefix, message, data);
    }

    // Store in memory (with rotation)
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  getLogs(level?: EmailLog['level']): EmailLog[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

// Singleton instance
export const emailLogger = new EmailLogger();
