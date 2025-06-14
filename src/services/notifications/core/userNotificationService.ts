
import { preferencesService } from '../preferencesService';
import { loggingService } from '../loggingService';
import { NotificationPreferences, NotificationLog } from '../interfaces';

export class UserNotificationService {
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    console.log('⚙️ [USER NOTIFICATION SERVICE DEBUG] Getting preferences for user:', userId);
    try {
      const preferences = await preferencesService.getUserPreferences(userId);
      console.log('⚙️ [USER NOTIFICATION SERVICE DEBUG] User preferences:', preferences);
      return preferences;
    } catch (error) {
      console.error('❌ [USER NOTIFICATION SERVICE DEBUG] Error getting preferences:', error);
      const defaultPrefs = {
        userId,
        email: true,
        push: true,
        inApp: true,
      };
      console.log('⚙️ [USER NOTIFICATION SERVICE DEBUG] Returning default preferences:', defaultPrefs);
      return defaultPrefs;
    }
  }

  async saveUserPreferences(preferences: NotificationPreferences): Promise<boolean> {
    return preferencesService.saveUserPreferences(preferences);
  }

  async logNotification(log: Omit<NotificationLog, 'id' | 'createdAt'>): Promise<void> {
    return loggingService.logNotification(log);
  }
}

export const userNotificationService = new UserNotificationService();
