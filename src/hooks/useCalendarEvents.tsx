
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
import { pushService } from '@/services/notifications/pushService';

export const useCalendarEvents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: events = [] } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: getCalendarEvents
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers
  });

  const sendNotificationsToUsers = async (selectedUserIds: string[], eventTitle: string, eventDate: string, isUpdate: boolean = false) => {
    if (selectedUserIds.length === 0) {
      console.log('📢 No users selected for notification');
      return;
    }

    console.log(`📢 Sending notifications to ${selectedUserIds.length} users for event: ${eventTitle}`);
    
    const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));
    const actionText = isUpdate ? "actualizado" : "creado";
    const notificationTitle = `Evento ${actionText}: ${eventTitle}`;
    const notificationBody = `Se ha ${actionText} el evento "${eventTitle}" programado para ${new Date(eventDate).toLocaleDateString('es-ES')}.`;

    // Check notification permission status
    const permissionStatus = pushService.getPermissionStatus();
    console.log(`📱 Current notification permission: ${permissionStatus}`);

    let notificationsSent = 0;
    let notificationsFailed = 0;

    for (const user of selectedUsers) {
      try {
        console.log(`📢 Sending comprehensive notification to ${user.email} for event: ${eventTitle}`);
        
        // Send comprehensive notification (email + push)
        await notificationService.sendNotification(
          user.id,
          user.email,
          notificationTitle,
          notificationBody
        );

        notificationsSent++;
        
      } catch (error) {
        console.error(`❌ Error sending notification to ${user.email}:`, error);
        notificationsFailed++;
      }
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
  };

  const createEvent = async (eventData: any, selectedUserIds: string[]) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log('📅 Creating calendar event with notification users:', selectedUserIds);

    const eventId = await addCalendarEvent(eventData, selectedUserIds);
    if (eventId) {
      // Send notifications
      await sendNotificationsToUsers(selectedUserIds, eventData.title, eventData.eventDate, false);

      toast({
        title: "Éxito",
        description: "Evento creado correctamente"
      });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    } else {
      toast({
        title: "Error",
        description: "No se pudo crear el evento",
        variant: "destructive"
      });
    }
    setIsSubmitting(false);
  };

  const updateEvent = async (eventId: string, eventData: Partial<CalendarEvent>, selectedUserIds: string[]) => {
    console.log('📅 Updating calendar event with notification users:', selectedUserIds);
    
    const success = await updateCalendarEvent(eventId, eventData, selectedUserIds);
    if (success) {
      // Send notifications
      await sendNotificationsToUsers(selectedUserIds, eventData.title || 'Evento', eventData.eventDate || '', true);

      toast({
        title: "Éxito",
        description: "Evento actualizado correctamente"
      });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    } else {
      toast({
        title: "Error",
        description: "No se pudo actualizar el evento",
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
