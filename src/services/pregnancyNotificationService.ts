
import { supabase } from '@/integrations/supabase/client';
import { pushService } from '@/services/notifications/pushService';

class PregnancyNotificationService {
  // Trigger the daily pregnancy notification check manually
  async triggerPregnancyNotificationCheck(): Promise<boolean> {
    try {
      console.log('🔄 Triggering pregnancy notification check...');
      
      const { data, error } = await supabase.functions.invoke('daily-pregnancy-notifications');
      
      if (error) {
        console.error('❌ Error triggering pregnancy notifications:', error);
        return false;
      }
      
      console.log('✅ Pregnancy notification check completed:', data);
      
      // Always trigger browser notifications regardless of server response
      console.log('📱 Triggering browser notifications...');
      await this.sendBrowserNotifications();
      
      return true;
    } catch (error) {
      console.error('❌ Error in pregnancy notification service:', error);
      return false;
    }
  }

  // Send browser push notifications for pregnancy alerts
  private async sendBrowserNotifications(): Promise<void> {
    try {
      console.log('📱 Sending browser push notifications for pregnancies...');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No authenticated user for push notifications');
        return;
      }

      // Send a test notification first
      console.log('📱 Sending test notification...');
      const testSuccess = await pushService.sendPushNotification(
        user.id, 
        '🧪 Test de Notificaciones - SkyRanch', 
        'Esta es una notificación de prueba para verificar que el sistema funciona correctamente.'
      );
      
      if (testSuccess) {
        console.log('✅ Test notification sent successfully');
      } else {
        console.log('❌ Test notification failed');
      }

      // Check for pregnancies due within the next 7 days or overdue
      const today = new Date();
      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(today.getDate() + 7);
      
      const todayString = today.toISOString().split('T')[0];
      const sevenDaysString = sevenDaysFromNow.toISOString().split('T')[0];

      console.log(`📅 Checking for pregnancies due up to: ${sevenDaysString}`);

      // Get pregnancies due within the next 7 days or overdue that haven't given birth
      const { data: breedingRecords, error } = await supabase
        .from('breeding_records')
        .select(`
          id, 
          expected_due_date, 
          mother_id,
          animals!breeding_records_mother_id_fkey(name)
        `)
        .eq('pregnancy_confirmed', true)
        .lte('expected_due_date', sevenDaysString) // Due within 7 days or overdue
        .is('actual_birth_date', null) // No birth recorded yet
        .neq('status', 'birth_completed');

      console.log('📋 Found breeding records for push notifications:', breedingRecords);

      if (error) {
        console.error('❌ Error fetching breeding records for push notifications:', error);
        return;
      }

      if (!breedingRecords || breedingRecords.length === 0) {
        console.log('📋 No pregnancies requiring push notifications');
        return;
      }

      // Send push notification for each pregnancy
      let successCount = 0;
      for (const record of breedingRecords) {
        const motherName = record.animals?.name || 'Animal desconocido';
        const dueDate = new Date(record.expected_due_date);
        const dueDateString = dueDate.toLocaleDateString('es-ES');
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        const isOverdue = daysUntilDue < 0;
        const daysDifference = Math.abs(daysUntilDue);
        
        let title, message;
        
        if (isOverdue) {
          title = '🚨 Parto vencido - SkyRanch';
          message = `${motherName} tenía fecha de parto el ${dueDateString} (${daysDifference} días vencido). Revisar urgentemente.`;
        } else if (daysUntilDue === 0) {
          title = '🚨 Parto hoy - SkyRanch';
          message = `${motherName} está programada para dar a luz HOY (${dueDateString}). Mantener vigilancia.`;
        } else {
          title = '🤰 Parto próximo - SkyRanch';
          message = `${motherName} está programada para dar a luz en ${daysDifference} días (${dueDateString}). Preparar área de parto.`;
        }
        
        console.log(`📱 Sending push notification for ${motherName}: ${isOverdue ? 'overdue' : 'upcoming'} (${daysDifference} days)`);
        
        const success = await pushService.sendPushNotification(user.id, title, message);

        if (success) {
          console.log(`✅ Push notification sent for ${motherName}`);
          successCount++;
        } else {
          console.log(`❌ Failed to send push notification for ${motherName}`);
        }

        // Add a small delay between notifications to avoid overwhelming
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`📱 Successfully sent ${successCount} out of ${breedingRecords.length} push notifications`);
    } catch (error) {
      console.error('❌ Error sending browser push notifications:', error);
    }
  }

  // Check if a pregnancy should trigger immediate notification setup
  async checkAndSetupNotifications(breedingRecordId: string): Promise<void> {
    try {
      console.log('🔍 Checking pregnancy for notification setup:', breedingRecordId);
      
      // Get the breeding record
      const { data: record, error } = await supabase
        .from('breeding_records')
        .select('expected_due_date, pregnancy_confirmed, status, mother_id, actual_birth_date')
        .eq('id', breedingRecordId)
        .single();

      if (error || !record) {
        console.error('❌ Error fetching breeding record:', error);
        return;
      }

      // Only process confirmed pregnancies that haven't given birth yet
      if (!record.pregnancy_confirmed || record.status === 'birth_completed' || record.actual_birth_date) {
        console.log('⏭️ Pregnancy not confirmed, already completed, or birth recorded');
        return;
      }

      // Check if due date is within 7 days or overdue
      const dueDate = new Date(record.expected_due_date);
      const today = new Date();
      const daysDifference = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      console.log(`📅 Days until due date: ${daysDifference} (negative = overdue)`);

      if (daysDifference <= 7) {
        console.log('🚨 Pregnancy is due within 7 days or overdue, triggering immediate notification check');
        await this.triggerPregnancyNotificationCheck();
      } else {
        console.log(`⏰ Pregnancy is due in ${daysDifference} days, will be picked up by daily checks when closer`);
      }
    } catch (error) {
      console.error('❌ Error in pregnancy notification setup:', error);
    }
  }
}

export const pregnancyNotificationService = new PregnancyNotificationService();
