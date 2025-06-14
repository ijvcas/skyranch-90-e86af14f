
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notifications/notificationService';
import { supabaseNotificationService } from '@/services/notifications/supabaseNotificationService';
import { pushService } from '@/services/notifications/pushService';

export const useCalendarNotifications = (users: any[]) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    let domainVerificationErrors: string[] = [];

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
        
        // Handle domain verification errors specifically
        if (error.message.includes('Domain verification required')) {
          domainVerificationErrors.push(user.email);
          emailFailures.push(`${user.email}: Domain verification required`);
        } else {
          emailFailures.push(`${user.email}: ${error.message}`);
        }
      }
    }

    console.log(`🔄 [CALENDAR NOTIFICATION DEBUG] ===== NOTIFICATION SUMMARY =====`);
    console.log(`🔄 [CALENDAR NOTIFICATION DEBUG] Total users processed: ${selectedUsers.length}`);
    console.log(`🔄 [CALENDAR NOTIFICATION DEBUG] Notifications sent: ${notificationsSent}`);
    console.log(`🔄 [CALENDAR NOTIFICATION DEBUG] Notifications failed: ${notificationsFailed}`);
    if (emailFailures.length > 0) {
      console.log(`🔄 [CALENDAR NOTIFICATION DEBUG] Email failures:`, emailFailures);
    }

    // Show summary toast with specific domain verification guidance
    if (notificationsSent > 0) {
      let description = `Se enviaron ${notificationsSent} notificación(es) correctamente`;
      if (notificationsFailed > 0) {
        description += `. ${notificationsFailed} fallaron`;
        if (domainVerificationErrors.length > 0) {
          description += ` (${domainVerificationErrors.length} requieren verificación de dominio)`;
        }
        description += '.';
      }
      
      toast({
        title: "Notificaciones enviadas",
        description,
      });
    }

    if (notificationsFailed > 0 && notificationsSent === 0) {
      let description = `No se pudieron enviar las notificaciones (${notificationsFailed} fallos)`;
      if (domainVerificationErrors.length > 0) {
        description = `Las notificaciones por email requieren verificación de dominio. Solo las direcciones verificadas pueden recibir emails.`;
      }
      
      toast({
        title: "Error de notificaciones",
        description,
        variant: "destructive"
      });
    }

    // Show domain verification specific warning
    if (domainVerificationErrors.length > 0) {
      toast({
        title: "Verificación de dominio requerida",
        description: `Los emails a ${domainVerificationErrors.join(', ')} requieren verificación de dominio en Resend. Solo direcciones verificadas pueden recibir emails.`,
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

  return { sendNotificationsToUsers };
};
