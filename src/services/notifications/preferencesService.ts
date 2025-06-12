
import { NotificationPreferences } from './interfaces';

export class PreferencesService {
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const storedPrefs = localStorage.getItem(`notification_prefs_${userId}`);
      if (storedPrefs) {
        return JSON.parse(storedPrefs);
      }
      
      // Return default preferences if none exist
      return {
        userId,
        email: true,
        push: true,
        inApp: true
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {
        userId,
        email: true,
        push: true,
        inApp: true
      };
    }
  }

  async saveUserPreferences(preferences: NotificationPreferences): Promise<boolean> {
    try {
      localStorage.setItem(`notification_prefs_${preferences.userId}`, JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  }
}

export const preferencesService = new PreferencesService();
