
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
      console.log('🔄 Triggering pregnancy notification test...');
      
      const success = await pregnancyNotificationService.triggerPregnancyNotificationCheck();
      
      if (success) {
        toast({
          title: "✅ Verificación completada",
          description: "Se ejecutó la verificación de notificaciones de embarazo. Revisa el panel de notificaciones para ver los resultados.",
          duration: 5000,
        });
        
        // Show additional info in console for debugging
        console.log('✅ Pregnancy notification check completed successfully');
      } else {
        toast({
          title: "❌ Error en verificación",
          description: "No se pudo ejecutar la verificación de notificaciones. Revisa la consola para más detalles.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('❌ Error triggering notification check:', error);
      toast({
        title: "❌ Error",
        description: `Error al ejecutar la verificación: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [toast]);

  return {
    setupPregnancyNotifications,
    triggerNotificationCheck
  };
};
