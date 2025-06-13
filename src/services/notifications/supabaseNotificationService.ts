
import { supabase } from '@/integrations/supabase/client';

export interface SupabaseNotification {
  id: string;
  user_id: string;
  type: 'vaccine' | 'health' | 'breeding' | 'weekly_report' | 'info' | 'warning' | 'error' | 'success' | 'calendar' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  read: boolean;
  action_required?: boolean;
  animal_name?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

class SupabaseNotificationService {
  async getNotifications(): Promise<SupabaseNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  }

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async createNotification(notification: Omit<SupabaseNotification, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        user_id: user.id
      });

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async clearAllNotifications(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
      console.error('Error clearing all notifications:', error);
      throw error;
    }
  }

  // Auto-generate notifications for calendar events
  async createCalendarNotification(eventTitle: string, eventDate: string, animalName?: string): Promise<void> {
    await this.createNotification({
      type: 'calendar',
      priority: 'medium',
      title: `Evento programado: ${eventTitle}`,
      message: `Tienes un evento programado "${eventTitle}" para ${new Date(eventDate).toLocaleDateString('es-ES')}`,
      read: false,
      action_required: true,
      animal_name: animalName
    });
  }

  // Auto-generate notifications for health records
  async createHealthNotification(animalName: string, recordType: string, dueDate?: string): Promise<void> {
    const priority = recordType === 'vaccination' ? 'high' : 'medium';
    const message = dueDate 
      ? `${animalName} tiene ${recordType} programado para ${new Date(dueDate).toLocaleDateString('es-ES')}`
      : `Se ha registrado ${recordType} para ${animalName}`;

    await this.createNotification({
      type: 'health',
      priority,
      title: `Recordatorio de salud: ${animalName}`,
      message,
      read: false,
      action_required: !!dueDate,
      animal_name: animalName
    });
  }

  // Auto-generate notifications for breeding records
  async createBreedingNotification(motherName: string, fatherName: string, status: string): Promise<void> {
    await this.createNotification({
      type: 'breeding',
      priority: 'medium',
      title: `Actualización de reproducción`,
      message: `El cruzamiento entre ${motherName} y ${fatherName} está ${status}`,
      read: false,
      animal_name: motherName
    });
  }
}

export const supabaseNotificationService = new SupabaseNotificationService();
