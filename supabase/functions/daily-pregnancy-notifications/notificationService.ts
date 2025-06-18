
import { BreedingRecord, User, NotificationResult } from './types.ts';

export class NotificationService {
  constructor(private supabase: any) {}

  async sendNotificationsForPregnancies(
    breedingRecords: BreedingRecord[],
    users: User[],
    motherMap: Record<string, string>,
    today: Date
  ): Promise<NotificationResult> {
    let notificationsSent = 0;
    let notificationsFailed = 0;

    for (const record of breedingRecords) {
      const motherName = motherMap[record.mother_id] || 'Animal desconocido';
      const dueDate = new Date(record.expected_due_date);
      const dueDateString = dueDate.toLocaleDateString('es-ES');
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Determine if overdue or upcoming
      const isOverdue = daysUntilDue < 0;
      const daysDifference = Math.abs(daysUntilDue);

      const { notificationTitle, notificationMessage } = this.generateNotificationContent(
        motherName, 
        dueDateString, 
        isOverdue, 
        daysDifference, 
        daysUntilDue
      );

      console.log(`🤰 Processing pregnancy for ${motherName}: ${isOverdue ? 'overdue' : 'upcoming'} (${daysDifference} days)`);

      for (const user of users) {
        try {
          // Check if we already sent a notification for this pregnancy today
          const alreadySent = await this.checkIfNotificationSentToday(user.id, motherName, today);
          
          if (alreadySent) {
            console.log(`⏭️ Notification already sent today for ${motherName} to user ${user.email}`);
            continue;
          }

          // Create in-app notification
          const success = await this.createNotification(
            user.id,
            notificationTitle,
            notificationMessage,
            motherName,
            record,
            daysDifference,
            isOverdue
          );

          if (success) {
            console.log(`✅ Notification created for ${user.email} about ${motherName}`);
            notificationsSent++;
          } else {
            notificationsFailed++;
          }
        } catch (error) {
          console.error(`❌ Error processing notification for user ${user.email}:`, error);
          notificationsFailed++;
        }
      }
    }

    return { notificationsSent, notificationsFailed };
  }

  private generateNotificationContent(
    motherName: string,
    dueDateString: string,
    isOverdue: boolean,
    daysDifference: number,
    daysUntilDue: number
  ): { notificationTitle: string; notificationMessage: string } {
    let notificationMessage: string;
    let notificationTitle: string;

    if (isOverdue) {
      notificationTitle = '🚨 Parto vencido';
      notificationMessage = `${motherName} tenía fecha de parto el ${dueDateString} (${daysDifference} días vencido). Es urgente revisar y registrar el parto si ya ocurrió.`;
    } else if (daysUntilDue === 0) {
      notificationTitle = '🚨 Parto hoy';
      notificationMessage = `${motherName} está programada para dar a luz HOY (${dueDateString}). Mantén vigilancia constante y área de parto preparada.`;
    } else {
      notificationTitle = '🤰 Parto próximo';
      notificationMessage = `${motherName} está programada para dar a luz en ${daysDifference} días (${dueDateString}). Prepara el área de parto y mantén atención veterinaria disponible.`;
    }

    return { notificationTitle, notificationMessage };
  }

  private async checkIfNotificationSentToday(userId: string, motherName: string, today: Date): Promise<boolean> {
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const { data: existingNotifications } = await this.supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'breeding')
      .like('message', `%${motherName}%`)
      .gte('created_at', todayStart.toISOString())
      .lte('created_at', todayEnd.toISOString());

    return existingNotifications && existingNotifications.length > 0;
  }

  private async createNotification(
    userId: string,
    title: string,
    message: string,
    motherName: string,
    record: BreedingRecord,
    daysDifference: number,
    isOverdue: boolean
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'breeding',
        priority: 'high', // All pregnancy notifications are high priority
        title: title,
        message: message,
        read: false,
        action_required: true,
        animal_name: motherName,
        metadata: {
          breeding_record_id: record.id,
          due_date: record.expected_due_date,
          days_difference: daysDifference,
          is_overdue: isOverdue
        }
      });

    return !error;
  }
}
