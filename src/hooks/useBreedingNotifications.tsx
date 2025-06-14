
import { useCallback } from 'react';
import { pregnancyNotificationService } from '@/services/pregnancyNotificationService';
import { useToast } from '@/hooks/use-toast';

export const useBreedingNotifications = () => {
  const { toast } = useToast();

  const setupPregnancyNotifications = useCallback(async (breedingRecordId: string) => {
    try {
      await pregnancyNotificationService.checkAndSetupNotifications(breedingRecordId);
    } catch (error) {
      console.error('Error setting up pregnancy notifications:', error);
      toast({
        title: "Error de notificaciones",
        description: "No se pudieron configurar las notificaciones de embarazo",
        variant: "destructive"
      });
    }
  }, [toast]);

  const triggerNotificationCheck = useCallback(async () => {
    try {
      const success = await pregnancyNotificationService.triggerPregnancyNotificationCheck();
      if (success) {
        toast({
          title: "Verificación completada",
          description: "Se ha ejecutado la verificación de notificaciones de embarazo",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo ejecutar la verificación de notificaciones",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error triggering notification check:', error);
      toast({
        title: "Error",
        description: "Error al ejecutar la verificación de notificaciones",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    setupPregnancyNotifications,
    triggerNotificationCheck
  };
};
