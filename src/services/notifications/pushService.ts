
export class PushService {
  private async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('❌ Browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      console.log('❌ Notification permission was denied');
      return 'denied';
    }

    // Request permission
    const permission = await Notification.requestPermission();
    console.log(`📱 Notification permission: ${permission}`);
    return permission;
  }

  async sendPushNotification(userId: string, title: string, body: string): Promise<boolean> {
    try {
      console.log('📱 Attempting to send push notification to user:', userId);
      console.log('📱 Title:', title);
      console.log('📱 Body:', body);

      const permission = await this.requestPermission();
      
      if (permission !== 'granted') {
        console.log('❌ Push notification failed: Permission not granted');
        return false;
      }

      // Create and show the notification
      const notification = new Notification(title, {
        body,
        icon: '/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png',
        tag: `skyranch-${userId}-${Date.now()}`, // Unique tag to avoid grouping
        requireInteraction: true, // Keep notification visible until user interacts
        silent: false // Allow sound
      });

      // Add click handler
      notification.onclick = function() {
        window.focus();
        notification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);
      
      console.log('✅ Push notification sent successfully');
      return true;

    } catch (error) {
      console.error('❌ Push notification error:', error);
      return false;
    }
  }

  // Check if notifications are supported and enabled
  isSupported(): boolean {
    return 'Notification' in window;
  }

  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }
}

export const pushService = new PushService();
