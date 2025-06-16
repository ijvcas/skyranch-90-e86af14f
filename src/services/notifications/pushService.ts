
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
      // Try to request again in case user wants to change their mind
      try {
        const permission = await Notification.requestPermission();
        console.log(`📱 Notification permission retry result: ${permission}`);
        return permission;
      } catch (error) {
        console.log('❌ Could not retry permission request');
        return 'denied';
      }
    }

    // Request permission
    try {
      const permission = await Notification.requestPermission();
      console.log(`📱 Notification permission: ${permission}`);
      return permission;
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return 'denied';
    }
  }

  async sendPushNotification(userId: string, title: string, body: string): Promise<boolean> {
    try {
      console.log('📱 Attempting to send push notification to user:', userId);
      console.log('📱 Title:', title);
      console.log('📱 Body:', body);

      const permission = await this.requestPermission();
      
      if (permission !== 'granted') {
        console.log('❌ Push notification failed: Permission not granted');
        // Show a fallback alert if notifications are not allowed
        if (permission === 'denied') {
          console.log('📱 Showing fallback alert for denied notification');
          // Don't show alert as it can be disruptive, just log
        }
        return false;
      }

      // Create and show the notification with enhanced options
      const notification = new Notification(title, {
        body,
        icon: '/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png',
        badge: '/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png',
        tag: `skyranch-${userId}-${Date.now()}`, // Unique tag to avoid grouping
        requireInteraction: true, // Keep notification visible until user interacts
        silent: false, // Allow sound
        vibrate: [200, 100, 200], // Vibration pattern for mobile devices
        data: {
          userId,
          timestamp: Date.now(),
          url: window.location.origin + '/notifications' // URL to open when clicked
        },
        actions: [
          {
            action: 'view',
            title: 'Ver Notificaciones',
            icon: '/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png'
          }
        ]
      });

      // Add click handler to navigate to notifications
      notification.onclick = function(event) {
        event.preventDefault();
        window.focus();
        // Navigate to notifications page
        window.location.href = '/notifications';
        notification.close();
      };

      // Handle action clicks
      notification.addEventListener('notificationclick', function(event) {
        event.preventDefault();
        if (event.action === 'view') {
          window.focus();
          window.location.href = '/notifications';
        }
        notification.close();
      });

      // Auto close after 15 seconds (longer for breeding notifications)
      setTimeout(() => {
        notification.close();
      }, 15000);
      
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

  // Method to explicitly request permission (can be called from UI)
  async requestNotificationPermission(): Promise<NotificationPermission> {
    return this.requestPermission();
  }

  // Test notification to verify everything works
  async sendTestNotification(): Promise<boolean> {
    return this.sendPushNotification(
      'test-user',
      '🧪 Notificación de Prueba',
      'Esta es una notificación de prueba para verificar que el sistema funciona correctamente.'
    );
  }
}

export const pushService = new PushService();
