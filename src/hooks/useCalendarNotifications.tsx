
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabaseNotificationService } from '@/services/notifications/supabaseNotificationService';
import { pushService } from '@/services/notifications/pushService';
import { supabase } from '@/integrations/supabase/client';

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

    console.log('🔄 [CALENDAR NOTIFICATION DEBUG] Notification details:', {
      notificationTitle,
      notificationBody
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
    let edgeFunctionErrors: string[] = [];
    let authenticationErrors: string[] = [];
    let sandboxModeErrors: string[] = [];
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

        // Send email notification using direct edge function approach (same as working test)
        console.log(`📧 [CALENDAR NOTIFICATION DEBUG] Sending email directly via edge function to ${user.email}`);
        
        // Get authenticated user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          console.error(`❌ [CALENDAR NOTIFICATION DEBUG] Authentication failed for ${user.email}:`, authError);
          authenticationErrors.push(user.email);
          notificationsFailed++;
          continue;
        }

        // Prepare email content
        const emailSubject = `${notificationTitle} - SkyRanch`;
        const emailHtml = `
          <h2>${notificationTitle}</h2>
          <p>${notificationBody}</p>
          ${eventDescription ? `<p><strong>Descripción:</strong> ${eventDescription}</p>` : ''}
          <hr>
          <p><small>Este mensaje fue enviado desde SkyRanch - Sistema de Gestión Ganadera</small></p>
        `;

        // Use direct edge function call (same as working test email)
        const payload = {
          to: user.email,
          subject: emailSubject,
          html: emailHtml,
          senderName: "SkyRanch - Sistema de Gestión Ganadera",
          organizationName: "SkyRanch",
          metadata: {
            tags: [
              { name: "category", value: "calendar_notification" },
              { name: "event-type", value: isUpdate ? "updated" : "created" },
              { name: "sender", value: "skyranch" },
              { name: "version", value: "2_0" }
            ],
            headers: {}
          }
        };

        console.log(`📧 [CALENDAR NOTIFICATION DEBUG] Calling edge function for ${user.email}...`);
        const { data, error } = await supabase.functions.invoke('send-email-v2', {
          body: payload
        });

        console.log(`📧 [CALENDAR NOTIFICATION DEBUG] Edge function response for ${user.email}:`, { data, error });

        if (error) {
          console.error(`❌ [CALENDAR NOTIFICATION DEBUG] Edge function invocation failed for ${user.email}:`, error);
          edgeFunctionErrors.push(user.email);
          emailFailures.push(`${user.email}: Edge function error - ${error.message}`);
          notificationsFailed++;
          continue;
        }

        if (data?.error) {
          console.error(`❌ [CALENDAR NOTIFICATION DEBUG] Edge function returned error for ${user.email}:`, data.error);
          
          // Categorize the specific error
          if (data.error === 'sandbox_mode_restriction') {
            sandboxModeErrors.push(user.email);
            emailFailures.push(`${user.email}: Sandbox mode restriction`);
          } else if (data.error === 'domain_verification_required') {
            domainVerificationErrors.push(user.email);
            emailFailures.push(`${user.email}: Domain verification required`);
          } else {
            emailFailures.push(`${user.email}: ${data.error} - ${data.message}`);
          }
          notificationsFailed++;
          continue;
        }

        if (data?.success) {
          console.log(`✅ [CALENDAR NOTIFICATION DEBUG] Email sent successfully to ${user.email}, messageId: ${data.messageId}`);
          notificationsSent++;
        } else {
          console.error(`❌ [CALENDAR NOTIFICATION DEBUG] Unexpected response for ${user.email}:`, data);
          emailFailures.push(`${user.email}: Unexpected response format`);
          notificationsFailed++;
        }
        
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
        
        // Enhanced error categorization
        if (error.message.includes('Authentication required') || error.message.includes('not authorized')) {
          authenticationErrors.push(user.email);
          emailFailures.push(`${user.email}: Authentication error`);
        } else if (error.message.includes('not found') || error.message.includes('edge function not deployed')) {
          edgeFunctionErrors.push(user.email);
          emailFailures.push(`${user.email}: Email service not available`);
        } else {
          emailFailures.push(`${user.email}: ${error.message}`);
        }
      }
    }

    console.log(`🔄 [CALENDAR NOTIFICATION DEBUG] ===== NOTIFICATION SUMMARY =====`);
    console.log(`🔄 [CALENDAR NOTIFICATION DEBUG] Total users processed: ${selectedUsers.length}`);
    console.log(`🔄 [CALENDAR NOTIFICATION DEBUG] Notifications sent: ${notificationsSent}`);
    console.log(`🔄 [CALENDAR NOTIFICATION DEBUG] Notifications failed: ${notificationsFailed}`);
    console.log(`🔄 [CALENDAR NOTIFICATION DEBUG] Authentication errors: ${authenticationErrors.length}`);
    console.log(`🔄 [CALENDAR NOTIFICATION DEBUG] Edge function errors: ${edgeFunctionErrors.length}`);
    console.log(`🔄 [CALENDAR NOTIFICATION DEBUG] Sandbox mode errors: ${sandboxModeErrors.length}`);
    console.log(`🔄 [CALENDAR NOTIFICATION DEBUG] Domain verification errors: ${domainVerificationErrors.length}`);
    if (emailFailures.length > 0) {
      console.log(`🔄 [CALENDAR NOTIFICATION DEBUG] Email failures:`, emailFailures);
    }

    // Enhanced success/failure reporting with specific error types
    if (notificationsSent > 0) {
      let description = `Se enviaron ${notificationsSent} notificación(es) correctamente`;
      if (notificationsFailed > 0) {
        description += `. ${notificationsFailed} fallaron`;
        if (sandboxModeErrors.length > 0) {
          description += ` (${sandboxModeErrors.length} por modo sandbox)`;
        }
        if (domainVerificationErrors.length > 0) {
          description += ` (${domainVerificationErrors.length} por verificación de dominio)`;
        }
        if (edgeFunctionErrors.length > 0) {
          description += ` (${edgeFunctionErrors.length} por servicio no disponible)`;
        }
        if (authenticationErrors.length > 0) {
          description += ` (${authenticationErrors.length} por problemas de autenticación)`;
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
      
      if (sandboxModeErrors.length > 0) {
        description = `Cuenta Resend en modo sandbox. Upgrade necesario para enviar emails.`;
      } else if (domainVerificationErrors.length > 0) {
        description = `Verificación de dominio requerida en Resend. Contacta al administrador.`;
      } else if (edgeFunctionErrors.length > 0) {
        description = `El servicio de email no está disponible. Contacta al administrador.`;
      } else if (authenticationErrors.length > 0) {
        description = `Problemas de autenticación al enviar emails. Inicia sesión nuevamente.`;
      }
      
      toast({
        title: "Error de notificaciones",
        description,
        variant: "destructive"
      });
    }

    // Show specific warnings for sandbox mode
    if (sandboxModeErrors.length > 0) {
      toast({
        title: "Modo Sandbox Detectado",
        description: `Tu cuenta de Resend está en modo sandbox. Los emails a ${sandboxModeErrors.length} usuario(s) no se enviaron. Upgrade en https://resend.com/pricing`,
        variant: "destructive"
      });
    }

    // Show specific warnings for domain verification
    if (domainVerificationErrors.length > 0) {
      toast({
        title: "Verificación de Dominio Requerida",
        description: `${domainVerificationErrors.length} usuario(s) no recibieron emails por falta de verificación de dominio. Configura en https://resend.com/domains`,
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
