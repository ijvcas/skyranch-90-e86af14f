
export class PushService {
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
}

export const pushService = new PushService();
