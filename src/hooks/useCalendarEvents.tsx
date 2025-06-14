
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getAllUsers } from '@/services/userService';
import { 
  getCalendarEvents, 
  addCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent, 
  getEventNotificationUsers,
  CalendarEvent 
} from '@/services/calendarService';
import { notificationService } from '@/services/notifications/notificationService';
import { supabaseNotificationService } from '@/services/notifications/supabaseNotificationService';
import { pushService } from '@/services/notifications/pushService';
import { useBreedingNotifications } from '@/hooks/useBreedingNotifications';

export const useCalendarEvents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setupPregnancyNotifications } = useBreedingNotifications();

  const { data: events = [] } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: getCalendarEvents
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers
  });

  const sendNotificationsToUsers = async (selectedUserIds: string[], eventTitle: string, eventDate: string, isUpdate: boolean = false, eventDescription?: string) => {
    console.log('🔄 [NOTIFICATION DEBUG] Starting sendNotificationsToUsers');
    console.log('🔄 [NOTIFICATION DEBUG] Selected user IDs:', selectedUserIds);
    console.log('🔄 [NOTIFICATION DEBUG] Event title:', eventTitle);
    
    if (selectedUserIds.length === 0) {
      console.log('📢 No users selected for notification');
      return;
    }

    console.log(`📢 Sending notifications to ${selectedUserIds.length} users for event: ${eventTitle}`);
    
    const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));
    console.log('🔄 [NOTIFICATION DEBUG] Selected users:', selectedUsers.map(u => ({ id: u.id, email: u.email })));
    
    const actionText = isUpdate ? "actualizado" : "creado";
    const notificationTitle = `Evento ${actionText}: ${eventTitle}`;
    const notificationBody = `Se ha ${actionText} el evento "${eventTitle}" programado para ${new Date(eventDate).toLocaleDateString('es-ES')}.`;

    // Prepare event details for email
    const eventDetails = {
      title: eventTitle,
      description: eventDescription,
      eventDate: eventDate
    };

    console.log('🔄 [NOTIFICATION DEBUG] Event details for email:', eventDetails);

    // Create in-app notification
    try {
      console.log('🔄 [NOTIFICATION DEBUG] Creating in-app notification...');
      await supabaseNotificationService.createCalendarNotification(eventTitle, eventDate);
      console.log('✅ [NOTIFICATION DEBUG] In-app notification created successfully');
    } catch (error) {
      console.error('❌ [NOTIFICATION DEBUG] Error creating in-app notification:', error);
    }

    // Check notification permission status
    const permissionStatus = pushService.getPermissionStatus();
    console.log(`📱 Current notification permission: ${permissionStatus}`);

    let notificationsSent = 0;
    let notificationsFailed = 0;

    for (const user of selectedUsers) {
      try {
        console.log(`🔄 [NOTIFICATION DEBUG] Processing user: ${user.email} (ID: ${user.id})`);
        console.log(`📢 Sending comprehensive notification to ${user.email} for event: ${eventTitle}`);
        
        // Send comprehensive notification (email + push) with event details
        console.log('🔄 [NOTIFICATION DEBUG] Calling notificationService.sendNotification...');
        await notificationService.sendNotification(
          user.id,
          user.email,
          notificationTitle,
          notificationBody,
          eventDetails
        );
        console.log(`✅ [NOTIFICATION DEBUG] Notification sent successfully to ${user.email}`);

        notificationsSent++;
        
      } catch (error) {
        console.error(`❌ [NOTIFICATION DEBUG] Error sending notification to ${user.email}:`, error);
        console.error(`❌ [NOTIFICATION DEBUG] Error details:`, {
          message: error.message,
          stack: error.stack,
          userId: user.id,
          userEmail: user.email
        });
        notificationsFailed++;
      }
    }

    console.log(`🔄 [NOTIFICATION DEBUG] Notification summary: ${notificationsSent} sent, ${notificationsFailed} failed`);

    // Show summary toast
    if (notificationsSent > 0) {
      toast({
        title: "Notificaciones enviadas",
        description: `Se enviaron ${notificationsSent} notificación(es) correctamente${notificationsFailed > 0 ? `. ${notificationsFailed} fallaron.` : '.'}`,
      });
    }

    if (notificationsFailed > 0 && notificationsSent === 0) {
      toast({
        title: "Error de notificaciones",
        description: `No se pudieron enviar las notificaciones (${notificationsFailed} fallos)`,
        variant: "destructive"
      });
    }

    // Show permission warning if needed
    if (permissionStatus !== 'granted' && pushService.isSupported()) {
      toast({
        title: "Permisos de notificación",
        description: "Para recibir notificaciones push, permite las notificaciones en tu navegador",
        variant: "destructive"
      });
    }

    // Refresh notifications to show the new one
    queryClient.invalidateQueries({ queryKey: ['real-notifications'] });
  };

  const createEvent = async (eventData: any, selectedUserIds: string[]) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log('📅 [CREATE EVENT DEBUG] Creating calendar event with notification users:', selectedUserIds);
    console.log('📅 [CREATE EVENT DEBUG] Event data:', eventData);

    try {
      const eventId = await addCalendarEvent(eventData, selectedUserIds);
      console.log('📅 [CREATE EVENT DEBUG] Event created with ID:', eventId);
      
      if (eventId) {
        // Send notifications with event details
        console.log('📅 [CREATE EVENT DEBUG] Starting notification process...');
        await sendNotificationsToUsers(
          selectedUserIds, 
          eventData.title, 
          eventData.eventDate, 
          false, 
          eventData.description
        );
        console.log('📅 [CREATE EVENT DEBUG] Notification process completed');

        // Check if this is a breeding-related event and setup pregnancy notifications
        if (eventData.eventType === 'breeding' && eventData.animalId) {
          console.log('🤰 Setting up pregnancy notifications for breeding event');
          // Note: In a real scenario, you'd need to link this to a breeding record
          // For now, we'll trigger a general check
          try {
            await setupPregnancyNotifications(eventId);
          } catch (error) {
            console.error('Error setting up pregnancy notifications:', error);
          }
        }

        toast({
          title: "Éxito",
          description: "Evento creado correctamente"
        });
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      } else {
        console.error('📅 [CREATE EVENT DEBUG] Event creation returned null ID');
        toast({
          title: "Error",
          description: "No se pudo crear el evento",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('📅 [CREATE EVENT DEBUG] Error in createEvent:', error);
      toast({
        title: "Error",
        description: "Error al crear el evento: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateEvent = async (eventId: string, eventData: Partial<CalendarEvent>, selectedUserIds: string[]) => {
    console.log('📅 [UPDATE EVENT DEBUG] Updating calendar event with notification users:', selectedUserIds);
    console.log('📅 [UPDATE EVENT DEBUG] Event data:', eventData);
    
    try {
      const success = await updateCalendarEvent(eventId, eventData, selectedUserIds);
      console.log('📅 [UPDATE EVENT DEBUG] Update result:', success);
      
      if (success) {
        // Send notifications with event details
        console.log('📅 [UPDATE EVENT DEBUG] Starting notification process...');
        await sendNotificationsToUsers(
          selectedUserIds, 
          eventData.title || 'Evento', 
          eventData.eventDate || '', 
          true, 
          eventData.description
        );
        console.log('📅 [UPDATE EVENT DEBUG] Notification process completed');

        toast({
          title: "Éxito",
          description: "Evento actualizado correctamente"
        });
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      } else {
        console.error('📅 [UPDATE EVENT DEBUG] Event update returned false');
        toast({
          title: "Error",
          description: "No se pudo actualizar el evento",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('📅 [UPDATE EVENT DEBUG] Error in updateEvent:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el evento: " + error.message,
        variant: "destructive"
      });
    }
  };

  const deleteEvent = async (eventId: string) => {
    const success = await deleteCalendarEvent(eventId);
    if (success) {
      toast({
        title: "Éxito",
        description: "Evento eliminado correctamente"
      });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    } else {
      toast({
        title: "Error",
        description: "No se pudo eliminar el evento",
        variant: "destructive"
      });
    }
  };

  const getNotificationUsers = async (eventId: string): Promise<string[]> => {
    const users = await getEventNotificationUsers(eventId);
    console.log(`📅 Retrieved notification users for event ${eventId}:`, users);
    return users;
  };

  return {
    events,
    createEvent,
    updateEvent,
    deleteEvent,
    getNotificationUsers,
    isSubmitting
  };
};
