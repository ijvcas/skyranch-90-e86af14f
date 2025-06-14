
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
      
      // If notifications were created, also send browser push notifications
      if (data && data.notifications_sent > 0) {
        await this.sendBrowserNotifications();
      }
      
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

      // Calculate the target date (7 days from now)
      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + 7);
      const targetDateString = targetDate.toISOString().split('T')[0];

      // Get pregnancies due in 7 days
      const { data: breedingRecords, error } = await supabase
        .from('breeding_records')
        .select(`
          id, 
          expected_due_date, 
          mother_id,
          animals!breeding_records_mother_id_fkey(name)
        `)
        .eq('pregnancy_confirmed', true)
        .eq('expected_due_date', targetDateString)
        .neq('status', 'birth_completed');

      if (error || !breedingRecords || breedingRecords.length === 0) {
        console.log('📋 No pregnancies due in 7 days for push notifications');
        return;
      }

      // Send push notification for each pregnancy
      for (const record of breedingRecords) {
        const motherName = record.animals?.name || 'Animal desconocido';
        const dueDate = new Date(record.expected_due_date).toLocaleDateString('es-ES');
        
        const success = await pushService.sendPushNotification(
          user.id,
          '🤰 Parto próximo',
          `${motherName} está programada para dar a luz en 7 días (${dueDate}). Prepara el área de parto.`
        );

        if (success) {
          console.log(`✅ Push notification sent for ${motherName}`);
        } else {
          console.log(`❌ Failed to send push notification for ${motherName}`);
        }
      }
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
        .select('expected_due_date, pregnancy_confirmed, status, mother_id')
        .eq('id', breedingRecordId)
        .single();

      if (error || !record) {
        console.error('❌ Error fetching breeding record:', error);
        return;
      }

      // Only process confirmed pregnancies that haven't given birth yet
      if (!record.pregnancy_confirmed || record.status === 'birth_completed') {
        console.log('⏭️ Pregnancy not confirmed or already completed');
        return;
      }

      // Check if due date is within 7 days
      const dueDate = new Date(record.expected_due_date);
      const today = new Date();
      const daysDifference = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      console.log(`📅 Days until due date: ${daysDifference}`);

      if (daysDifference <= 7 && daysDifference > 0) {
        console.log('🚨 Pregnancy is due within 7 days, triggering immediate notification check');
        await this.triggerPregnancyNotificationCheck();
      }
    } catch (error) {
      console.error('❌ Error in pregnancy notification setup:', error);
    }
  }
}

export const pregnancyNotificationService = new PregnancyNotificationService();
