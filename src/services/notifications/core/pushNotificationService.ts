
import { pushService } from '../pushService';
import { loggingService } from '../loggingService';

export class PushNotificationService {
  async sendPushNotification(userId: string, title: string, body: string): Promise<boolean> {
    console.log('📱 [PUSH NOTIFICATION SERVICE DEBUG] Sending push notification to user:', userId);
    try {
      const result = await pushService.sendPushNotification(userId, title, body);
      console.log('📱 [PUSH NOTIFICATION SERVICE DEBUG] Push notification result:', result);
      return result;
    } catch (error) {
      console.error('❌ [PUSH NOTIFICATION SERVICE DEBUG] Error sending push notification:', error);
      return false;
    }
  }
}

export const pushNotificationService = new PushNotificationService();
