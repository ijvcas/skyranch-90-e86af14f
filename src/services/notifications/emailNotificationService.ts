
import { supabase } from '@/integrations/supabase/client';
import { CalendarEventTemplate } from '@/services/email/templates/CalendarEventTemplate';

interface NotificationUser {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
}

interface EmailNotificationParams {
  user: NotificationUser;
  eventTitle: string;
  eventDate: string;
  eventDescription?: string;
  eventType?: string;
  location?: string;
  veterinarian?: string;
  isUpdate: boolean;
  accessToken: string;
}

export class EmailNotificationService {
  private getUserNameByEmail(email: string, users: NotificationUser[]): string {
    const user = users.find(u => u.email === email);
    return user?.name || user?.full_name || user?.email?.split('@')[0] || 'Usuario';
  }

  async sendEmailNotification(params: EmailNotificationParams, users: NotificationUser[]): Promise<{ success: boolean; error?: string }> {
    const { user, eventTitle, eventDate, eventDescription, eventType, location, veterinarian, isUpdate, accessToken } = params;

    try {
      console.log(`🔄 [EMAIL NOTIFICATION] Processing email for ${user.email}...`);
      
      if (!user.email) {
        throw new Error('User has no email address');
      }

      const actionType = isUpdate ? "updated" : "created";
      const notificationTitle = `Evento ${actionType}: ${eventTitle}`;

      // Use the CalendarEventTemplate to generate professional email HTML
      const template = new CalendarEventTemplate();
      const emailContent = template.render({
        eventType: actionType,
        userName: this.getUserNameByEmail(user.email, users),
        organizationName: "SkyRanch",
        title: notificationTitle,
        content: "",
        event: {
          title: eventTitle,
          description: eventDescription,
          eventDate: eventDate,
          eventType: eventType || undefined,
          location: location || undefined,
          veterinarian: veterinarian || undefined,
        },
      });

      // Use Gmail edge function to send email with access token
      const payload = {
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        accessToken: accessToken,
        senderName: "SkyRanch - Sistema de Gestión Ganadera",
        organizationName: "SkyRanch",
        metadata: {
          tags: [
            { name: "category", value: "calendar_notification" },
            { name: "event-type", value: isUpdate ? "updated" : "created" },
            { name: "sender", value: "skyranch" },
            { name: "version", value: "gmail_1_0" },
            { name: "transport", value: "gmail" }
          ],
          headers: {}
        }
      };

      console.log(`📧 [EMAIL NOTIFICATION] Calling Gmail edge function for ${user.email}...`);
      const { data, error } = await supabase.functions.invoke('send-gmail', {
        body: payload
      });

      if (error) {
        throw new Error(`Gmail edge function error: ${error.message}`);
      }

      if (data?.error) {
        throw new Error(`${data.error} - ${data.message}`);
      }

      if (data?.success) {
        console.log(`✅ [EMAIL NOTIFICATION] Email sent successfully to ${user.email}, messageId: ${data.messageId}`);
        return { success: true };
      } else {
        throw new Error('Unexpected response format');
      }
      
    } catch (error) {
      console.error(`❌ [EMAIL NOTIFICATION] Failed for ${user.email}:`, error);
      return { success: false, error: error.message };
    }
  }
}
