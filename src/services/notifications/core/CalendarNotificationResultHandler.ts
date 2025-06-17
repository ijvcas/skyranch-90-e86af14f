
import { useToast } from '@/hooks/use-toast';

export class CalendarNotificationResultHandler {
  private toast: ReturnType<typeof useToast>['toast'];

  constructor(toast: ReturnType<typeof useToast>['toast']) {
    this.toast = toast;
  }

  showNotificationResults(sent: number, failed: number, failures: string[]) {
    console.log(`🔄 [CALENDAR NOTIFICATION RESULTS] ===== NOTIFICATION SUMMARY =====`);
    console.log(`🔄 [CALENDAR NOTIFICATION RESULTS] Notifications sent via Gmail: ${sent}`);
    console.log(`🔄 [CALENDAR NOTIFICATION RESULTS] Notifications failed: ${failed}`);
    if (failures.length > 0) {
      console.log(`🔄 [CALENDAR NOTIFICATION RESULTS] Email failures:`, failures);
    }

    if (sent > 0) {
      this.toast({
        title: "✅ Notificaciones Enviadas",
        description: `Se enviaron ${sent} notificación(es) correctamente via Gmail desde soporte@skyranch.es`,
      });
    }

    if (failed > 0) {
      if (sent === 0) {
        this.toast({
          title: "❌ Error de Notificaciones",
          description: `No se pudieron enviar ${failed} notificación(es). Verifica la autenticación OAuth de Gmail.`,
          variant: "destructive"
        });
      } else {
        this.toast({
          title: "⚠️ Notificaciones Parciales",
          description: `${sent} enviadas, ${failed} fallaron. Algunos usuarios pueden no haber recibido la notificación.`,
          variant: "destructive"
        });
      }
    }
  }
}
