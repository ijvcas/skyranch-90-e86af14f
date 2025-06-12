
import { supabase } from '@/integrations/supabase/client';

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

export interface NotificationTemplate {
  type: 'event_created' | 'event_updated' | 'general';
  subject: string;
  body: string;
}

export interface NotificationLog {
  id: string;
  userId: string;
  type: 'email' | 'push' | 'in_app';
  status: 'sent' | 'failed' | 'pending';
  message: string;
  createdAt: string;
  sentAt?: string;
  error?: string;
}

class NotificationService {
  // Email notification service
  async sendEmailNotification(to: string, subject: string, body: string): Promise<boolean> {
    try {
      console.log('📧 Sending email notification to:', to);
      
      // Call Supabase edge function for email sending
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">SkyRanch - Notificación</h2>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
                <h3>${subject}</h3>
                <p>${body}</p>
              </div>
              <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                Este mensaje fue enviado desde SkyRanch - Sistema de Gestión Ganadera
              </p>
            </div>
          `
        }
      });

      if (error) {
        console.error('❌ Email sending error:', error);
        return false;
      }

      console.log('✅ Email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('❌ Email service error:', error);
      return false;
    }
  }

  // Push notification service
  async sendPushNotification(userId: string, title: string, body: string): Promise<boolean> {
    try {
      console.log('📱 Sending push notification to user:', userId);
      
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        console.log('❌ Browser does not support notifications');
        return false;
      }

      // Request permission if not granted
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('❌ Notification permission denied');
          return false;
        }
      }

      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png',
          tag: 'skyranch-notification'
        });
        
        console.log('✅ Push notification sent successfully');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Push notification error:', error);
      return false;
    }
  }

  // Get user notification preferences (stored in localStorage for now)
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

  // Save user notification preferences (stored in localStorage for now)
  async saveUserPreferences(preferences: NotificationPreferences): Promise<boolean> {
    try {
      localStorage.setItem(`notification_prefs_${preferences.userId}`, JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  }

  // Log notification delivery (console logging for now)
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

  // Send comprehensive notifications based on user preferences
  async sendNotification(userId: string, userEmail: string, title: string, message: string): Promise<void> {
    console.log('📢 Starting comprehensive notification send for user:', userId);
    
    const preferences = await this.getUserPreferences(userId);
    
    // Send email notification
    if (preferences.email && userEmail) {
      const emailSuccess = await this.sendEmailNotification(userEmail, title, message);
      await this.logNotification({
        userId,
        type: 'email',
        status: emailSuccess ? 'sent' : 'failed',
        message: `${title}: ${message}`,
        sentAt: emailSuccess ? new Date().toISOString() : undefined,
        error: emailSuccess ? undefined : 'Failed to send email'
      });
    }

    // Send push notification
    if (preferences.push) {
      const pushSuccess = await this.sendPushNotification(userId, title, message);
      await this.logNotification({
        userId,
        type: 'push',
        status: pushSuccess ? 'sent' : 'failed',
        message: `${title}: ${message}`,
        sentAt: pushSuccess ? new Date().toISOString() : undefined,
        error: pushSuccess ? undefined : 'Failed to send push notification'
      });
    }

    console.log('✅ Comprehensive notification process completed for user:', userId);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
