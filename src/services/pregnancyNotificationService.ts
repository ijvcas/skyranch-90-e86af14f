
import { supabase } from '@/integrations/supabase/client';

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
      return true;
    } catch (error) {
      console.error('❌ Error in pregnancy notification service:', error);
      return false;
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
