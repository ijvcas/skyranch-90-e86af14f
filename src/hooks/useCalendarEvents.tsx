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
    console.log('🔄 [CALENDAR NOTIFICATION DEBUG] ===== STARTING NOTIFICATION PROCESS =====');
    console.log('🔄 [CALENDAR NOTIFICATION DEBUG] Input parameters:', {
      selectedUserIds: selectedUserIds.length,
      selectedUserIdsList: selectedUserIds,
      eventTitle,
      eventDate,
      isUpdate,
      eventDescription
    });
    
    if (selectedUserIds.length === 0) {
      console.log('📢 [CALENDAR NOTIFICATION DEBUG] ❌ No users selected for notification - exiting');
      return;
    }

    console.log(`📢 [CALENDAR NOTIFICATION DEBUG] Processing notifications for ${selectedUserIds.length} users`);
    
    const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));
    console.log('🔄 [CALENDAR NOTIFICATION DEBUG] Found matching users:', selectedUsers.map(u => ({ id: u.id, email: u.email })));
    
    if (selectedUsers.length === 0) {
      console.error('❌ [CALENDAR NOTIFICATION DEBUG] No matching users found in user list!');
      console.log('🔄 [CALENDAR NOTIFICATION DEBUG] Available users:', users.map(u => ({ id: u.id, email: u.email })));
      return;
    }
    
    const actionText = isUpdate ? "actualizado" : "creado";
    const notificationTitle = `Evento ${actionText}: ${eventTitle}`;
    const notificationBody = `Se ha ${actionText} el evento "${eventTitle}" programado para ${new Date(eventDate).toLocaleDateString('es-ES')}.`;

    // Prepare event details for email
    const eventDetails = {
      title: eventTitle,
      description: eventDescription,
      eventDate: eventDate
    };

    console.log('🔄 [CALENDAR NOTIFICATION DEBUG] Notification details:', {
      notificationTitle,
      notificationBody,
      eventDetails
    });

    // Create in-app notification
    try {
      console.log('🔄 [CALENDAR NOTIFICATION DEBUG] Creating in-app notification...');
      await supabaseNotificationService.createCalendarNotification(eventTitle, eventDate);
      console.log('✅ [CALENDAR NOTIFICATION DEBUG] In-app notification created successfully');
    } catch (error) {
      console.error('❌ [CALENDAR NOTIFICATION DEBUG] Error creating in-app notification:', error);
    }

    // Check notification permission status
    const permissionStatus = pushService.getPermissionStatus();
    console.log(`📱 [CALENDAR NOTIFICATION DEBUG] Notification permission status: ${permissionStatus}`);

    let notificationsSent = 0;
    let notificationsFailed = 0;
    let emailFailures: string[] = [];

    for (const user of selectedUsers) {
      try {
        console.log(`🔄 [CALENDAR NOTIFICATION DEBUG] ===== PROCESSING USER: ${user.email} (${user.id}) =====`);
        
        if (!user.email) {
          console.error(`❌ [CALENDAR NOTIFICATION DEBUG] User ${user.id} has no email address - skipping`);
          notificationsFailed++;
          emailFailures.push(`${user.id}: No email address`);
          continue;
        }
        
        console.log('🔄 [CALENDAR NOTIFICATION DEBUG] About to call notificationService.sendNotification with params:', {
          userId: user.id,
          userEmail: user.email,
          title: notificationTitle,
          body: notificationBody,
          eventDetails: eventDetails
        });
        
        await notificationService.sendNotification(
          user.id,
          user.email,
          notificationTitle,
          notificationBody,
          eventDetails
        );
        
        console.log(`✅ [CALENDAR NOTIFICATION DEBUG] Notification process completed for ${user.email}`);
        notificationsSent++;
        
      } catch (error) {
        console.error(`❌ [CALENDAR NOTIFICATION DEBUG] ===== NOTIFICATION FAILED FOR USER: ${user.email} =====`);
        console.error(`❌ [CALENDAR NOTIFICATION DEBUG] Error details:`, {
          message: error.message,
          name: error.name,
          stack: error.stack,
          userId: user.id,
          userEmail: user.email
        });
        notificationsFailed++;
        emailFailures.push(`${user.email}: ${error.message}`);
      }
    }

    console.log(`🔄 [CALENDAR NOTIFICATION DEBUG] ===== NOTIFICATION SUMMARY =====`);
    console.log(`🔄 [CALENDAR NOTIFICATION DEBUG] Total users processed: ${selectedUsers.length}`);
    console.log(`🔄 [CALENDAR NOTIFICATION DEBUG] Notifications sent: ${notificationsSent}`);
    console.log(`🔄 [CALENDAR NOTIFICATION DEBUG] Notifications failed: ${notificationsFailed}`);
    if (emailFailures.length > 0) {
      console.log(`🔄 [CALENDAR NOTIFICATION DEBUG] Email failures:`, emailFailures);
    }

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
    console.log('📅 [CREATE EVENT DEBUG] ===== CREATING CALENDAR EVENT =====');
    console.log('📅 [CREATE EVENT DEBUG] Event data:', eventData);
    console.log('📅 [CREATE EVENT DEBUG] Selected user IDs:', selectedUserIds);

    try {
      const eventId = await addCalendarEvent(eventData, selectedUserIds);
      console.log('📅 [CREATE EVENT DEBUG] Event created with ID:', eventId);
      
      if (eventId) {
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
