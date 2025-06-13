
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  mockMarkAsRead, 
  mockDeleteNotification, 
  mockCreateNotification, 
  mockMarkAllAsRead, 
  mockClearAllNotifications 
} from './mockApi';
import { Notification } from './types';

export const useNotificationMutations = () => {
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: mockMarkAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast.error('Error al marcar como leída');
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: mockDeleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notificación eliminada');
    },
    onError: (error) => {
      console.error('Error deleting notification:', error);
      toast.error('Error al eliminar notificación');
    }
  });

  const addNotificationMutation = useMutation({
    mutationFn: mockCreateNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notificación creada');
    },
    onError: (error) => {
      console.error('Error creating notification:', error);
      toast.error('Error al crear notificación');
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: mockMarkAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Todas las notificaciones marcadas como leídas');
    },
    onError: (error) => {
      console.error('Error marking all as read:', error);
      toast.error('Error al marcar todas como leídas');
    }
  });

  const clearAllNotificationsMutation = useMutation({
    mutationFn: mockClearAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Todas las notificaciones eliminadas');
    },
    onError: (error) => {
      console.error('Error clearing all notifications:', error);
      toast.error('Error al eliminar todas las notificaciones');
    }
  });

  return {
    markAsReadMutation,
    deleteNotificationMutation,
    addNotificationMutation,
    markAllAsReadMutation,
    clearAllNotificationsMutation
  };
};
