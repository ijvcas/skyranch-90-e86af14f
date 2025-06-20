
import { useCallback } from 'react';
import { healthRecordNotificationService } from '@/services/healthRecordNotificationService';
import { useToast } from '@/hooks/use-toast';

export const useHealthRecordNotifications = () => {
  const { toast } = useToast();

  const setupHealthRecordNotifications = useCallback(async (healthRecordId: string) => {
    try {
      await healthRecordNotificationService.checkSingleRecord(healthRecordId);
    } catch (error) {
      console.error('Error setting up health record notifications:', error);
      toast({
        title: "Error de notificaciones",
        description: "No se pudieron configurar las notificaciones de registros de salud",
        variant: "destructive"
      });
    }
  }, [toast]);

  const triggerNotificationCheck = useCallback(async () => {
    try {
      console.log('🔄 Triggering health record notification test...');
      
      const success = await healthRecordNotificationService.triggerNotificationCheck();
      
      if (success) {
        toast({
          title: "✅ Verificación completada",
          description: "Se ejecutó la verificación de notificaciones de registros de salud. Revisa el panel de notificaciones para ver los resultados.",
          duration: 5000,
        });
        
        console.log('✅ Health record notification check completed successfully');
      } else {
        toast({
          title: "❌ Error en verificación",
          description: "No se pudo ejecutar la verificación de notificaciones. Revisa la consola para más detalles.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('❌ Error triggering health record notification check:', error);
      toast({
        title: "❌ Error",
        description: `Error al ejecutar la verificación: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [toast]);

  return {
    setupHealthRecordNotifications,
    triggerNotificationCheck
  };
};
