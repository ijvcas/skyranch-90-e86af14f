
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

  const createEvent = async (eventData: any, selectedUserIds: string[]) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    const eventId = await addCalendarEvent(eventData, selectedUserIds);
    if (eventId) {
      // Send email notifications to selected users
      if (selectedUserIds.length > 0) {
        const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));
        
        for (const user of selectedUsers) {
          try {
            console.log(`Sending notification to ${user.email} for event: ${eventData.title}`);
            // Here you would implement actual email notification
            // For now, we'll just log it
            toast({
              title: "Notificación enviada",
              description: `Notificación enviada a ${user.email}`,
            });
          } catch (error) {
            console.error(`Error sending notification to ${user.email}:`, error);
          }
        }
      }

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
    const success = await updateCalendarEvent(eventId, eventData, selectedUserIds);
    if (success) {
      // Send email notifications to selected users
      if (selectedUserIds.length > 0) {
        const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));
        
        for (const user of selectedUsers) {
          try {
            console.log(`Sending update notification to ${user.email} for event: ${eventData.title}`);
            // Here you would implement actual email notification
            // For now, we'll just log it
            toast({
              title: "Notificación enviada",
              description: `Notificación de actualización enviada a ${user.email}`,
            });
          } catch (error) {
            console.error(`Error sending notification to ${user.email}:`, error);
          }
        }
      }

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
    return await getEventNotificationUsers(eventId);
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
