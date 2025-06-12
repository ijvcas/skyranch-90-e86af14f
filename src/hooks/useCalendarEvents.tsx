
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  getCalendarEvents, 
  addCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent, 
  CalendarEvent 
} from '@/services/calendarService';

export const useCalendarEvents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: events = [] } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: getCalendarEvents
  });

  const createEvent = async (eventData: any, selectedUserIds: string[]) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    const success = await addCalendarEvent(eventData);
    if (success) {
      // Send notifications to selected users
      if (selectedUserIds.length > 0) {
        selectedUserIds.forEach(userId => {
          addNotification(
            userId,
            'general',
            `Nuevo Evento: ${eventData.title}`,
            `Se ha programado un evento para ${new Date(eventData.eventDate).toLocaleDateString('es-ES')}. Fecha de notificación: ${new Date().toLocaleDateString('es-ES')}`
          );
        });
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
    const success = await updateCalendarEvent(eventId, eventData);
    if (success) {
      // Send notifications to selected users
      if (selectedUserIds.length > 0) {
        selectedUserIds.forEach(userId => {
          addNotification(
            userId,
            'general',
            `Evento Actualizado: ${eventData.title}`,
            `Se ha actualizado un evento. Fecha de notificación: ${new Date().toLocaleDateString('es-ES')}`
          );
        });
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

  return {
    events,
    createEvent,
    updateEvent,
    deleteEvent,
    isSubmitting
  };
};
