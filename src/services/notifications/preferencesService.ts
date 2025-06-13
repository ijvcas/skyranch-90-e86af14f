
import { NotificationPreferences } from './interfaces';

export class PreferencesService {
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    // For now, return default preferences
    // In a real app, this would fetch from a database
    return {
      userId,
      email: true,
      push: true,
      inApp: true
    };
  }

  async saveUserPreferences(preferences: NotificationPreferences): Promise<boolean> {
    try {
      // For now, just log the preferences
      // In a real app, this would save to a database
      console.log('📝 Saving notification preferences:', preferences);
      return true;
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      return false;
    }
  }
}

export const preferencesService = new PreferencesService();
