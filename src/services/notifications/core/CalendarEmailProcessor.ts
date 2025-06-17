
import { EmailNotificationService } from '@/services/notifications/emailNotificationService';

interface NotificationUser {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
}

interface EmailParams {
  eventTitle: string;
  eventDate: string;
  eventDescription?: string;
  eventType?: string;
  location?: string;
  veterinarian?: string;
  isUpdate: boolean;
  accessToken: string;
}

export class CalendarEmailProcessor {
  private emailNotificationService: EmailNotificationService;

  constructor() {
    this.emailNotificationService = new EmailNotificationService();
  }

  async processEmailNotifications(
    selectedUsers: NotificationUser[],
    params: EmailParams
  ): Promise<{ sent: number; failed: number; failures: string[] }> {
    let notificationsSent = 0;
    let notificationsFailed = 0;
    const emailFailures: string[] = [];

    for (const user of selectedUsers) {
      // Fix the parameter structure to match the service signature
      const emailParams = {
        user,
        eventTitle: params.eventTitle,
        eventDate: params.eventDate,
        eventDescription: params.eventDescription,
        eventType: params.eventType,
        location: params.location,
        veterinarian: params.veterinarian,
        isUpdate: params.isUpdate,
        accessToken: params.accessToken
      };

      const result = await this.emailNotificationService.sendEmailNotification(emailParams, selectedUsers);

      if (result.success) {
        notificationsSent++;
      } else {
        notificationsFailed++;
        emailFailures.push(`${user.email}: ${result.error}`);
      }
    }

    return { sent: notificationsSent, failed: notificationsFailed, failures: emailFailures };
  }
}
