
import { NotificationLog } from './interfaces';

export class LoggingService {
  async logNotification(log: Omit<NotificationLog, 'id' | 'createdAt'>): Promise<void> {
    try {
      console.log('📝 Notification log:', {
        ...log,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }
}

export const loggingService = new LoggingService();
