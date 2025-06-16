
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabaseNotificationService } from '@/services/notifications/supabaseNotificationService';
import { pushService } from '@/services/notifications/pushService';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEventTemplate } from '@/services/email/templates/CalendarEventTemplate';

export const useCalendarNotifications = (users: any[]) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Verified email for testing (Gmail API)
  const VERIFIED_EMAIL = 'jvcas@mac.com';

  // Helper to get userName
  const getUserNameByEmail = (email: string) => {
    const u = users.find(user => user.email === email);
    return u?.name || u?.full_name || u?.email?.split('@')[0] || 'Usuario';
  };

  const sendNotificationsToUsers = async (
    selectedUserIds: string[],
    eventTitle: string,
    eventDate: string,
    isUpdate: boolean = false,
    eventDescription?: string,
    eventType?: string,
    location?: string,
    veterinarian?: string
  ) => {
    console.log('🔄 [CALENDAR NOTIFICATION - GMAIL] ===== STARTING NOTIFICATION PROCESS =====');
    console.log('🔄 [CALENDAR NOTIFICATION - GMAIL] Input parameters:', {
      selectedUserIds: selectedUserIds.length,
      selectedUserIdsList: selectedUserIds,
      eventTitle,
      eventDate,
      isUpdate,
      eventDescription
    });
    
    if (selectedUserIds.length === 0) {
      console.log('📢 [CALENDAR NOTIFICATION - GMAIL] ❌ No users selected for notification - exiting');
      return;
    }

    console.log(`📢 [CALENDAR NOTIFICATION - GMAIL] Processing Gmail notifications for ${selectedUserIds.length} users`);
    
    const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));
    console.log('🔄 [CALENDAR NOTIFICATION - GMAIL] Found matching users:', selectedUsers.map(u => ({ id: u.id, email: u.email })));
    
    if (selectedUsers.length === 0) {
      console.error('❌ [CALENDAR NOTIFICATION - GMAIL] No matching users found in user list!');
      console.log('🔄 [CALENDAR NOTIFICATION - GMAIL] Available users:', users.map(u => ({ id: u.id, email: u.email })));
      return;
    }
    
    const actionType = isUpdate ? "updated" : "created";
    const notificationTitle = `Evento ${actionType}: ${eventTitle}`;
    const notificationBody = `Se ha ${actionType} el evento "${eventTitle}" programado para ${new Date(eventDate).toLocaleDateString('es-ES')}.`;

    console.log('🔄 [CALENDAR NOTIFICATION - GMAIL] Notification details:', {
      notificationTitle,
      notificationBody
    });

    // Create in-app notification
    try {
      console.log('🔄 [CALENDAR NOTIFICATION - GMAIL] Creating in-app notification...');
      await supabaseNotificationService.createCalendarNotification(eventTitle, eventDate);
      console.log('✅ [CALENDAR NOTIFICATION - GMAIL] In-app notification created successfully');
    } catch (error) {
      console.error('❌ [CALENDAR NOTIFICATION - GMAIL] Error creating in-app notification:', error);
    }

    // Check notification permission status
    const permissionStatus = pushService.getPermissionStatus();
    console.log(`📱 [CALENDAR NOTIFICATION - GMAIL] Notification permission status: ${permissionStatus}`);

    let notificationsSent = 0;
    let notificationsFailed = 0;
    let emailFailures: string[] = [];
    let testModeErrors: string[] = [];

    for (const user of selectedUsers) {
      try {
        console.log(`🔄 [CALENDAR NOTIFICATION - GMAIL] ===== PROCESSING USER: ${user.email} (${user.id}) =====`);
        
        if (!user.email) {
          console.error(`❌ [CALENDAR NOTIFICATION - GMAIL] User ${user.id} has no email address - skipping`);
          notificationsFailed++;
          emailFailures.push(`${user.id}: No email address`);
          continue;
        }

        // TESTING MODE: Only send emails to verified email address
        if (user.email !== VERIFIED_EMAIL) {
          console.log(`🧪 [CALENDAR NOTIFICATION - GMAIL] TESTING MODE: Skipping ${user.email} (not verified email)`);
          testModeErrors.push(user.email);
          notificationsFailed++;
          continue;
        }

        // Get authenticated user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          console.error(`❌ [CALENDAR NOTIFICATION - GMAIL] Authentication failed for ${user.email}:`, authError);
          notificationsFailed++;
          continue;
        }

        // Use the CalendarEventTemplate to generate professional email HTML
        const template = new CalendarEventTemplate();
        const emailContent = template.render({
          eventType: actionType,
          userName: getUserNameByEmail(user.email),
          organizationName: "SkyRanch",
          title: notificationTitle,
          content: "",
          event: {
            title: eventTitle,
            description: eventDescription,
            eventDate: eventDate,
            eventType: eventType || undefined,
            location: location || undefined,
            veterinarian: veterinarian || undefined,
          },
        });

        // Use Gmail edge function to send email with template
        const payload = {
          to: user.email,
          subject: emailContent.subject,
          html: emailContent.html,
          senderName: "SkyRanch - Sistema de Gestión Ganadera",
          organizationName: "SkyRanch",
          metadata: {
            tags: [
              { name: "category", value: "calendar_notification" },
              { name: "event-type", value: isUpdate ? "updated" : "created" },
              { name: "sender", value: "skyranch" },
              { name: "version", value: "gmail_1_0" },
              { name: "transport", value: "gmail" }
            ],
            headers: {}
          }
        };

        console.log(`📧 [CALENDAR NOTIFICATION - GMAIL] Calling Gmail edge function for ${user.email}...`);
        const { data, error } = await supabase.functions.invoke('send-gmail', {
          body: payload
        });

        console.log(`📧 [CALENDAR NOTIFICATION - GMAIL] Gmail edge function response for ${user.email}:`, { data, error });

        if (error) {
          console.error(`❌ [CALENDAR NOTIFICATION - GMAIL] Gmail edge function invocation failed for ${user.email}:`, error);
          emailFailures.push(`${user.email}: Gmail edge function error - ${error.message}`);
          notificationsFailed++;
          continue;
        }

        if (data?.error) {
          console.error(`❌ [CALENDAR NOTIFICATION - GMAIL] Gmail edge function returned error for ${user.email}:`, data.error);
          emailFailures.push(`${user.email}: ${data.error} - ${data.message}`);
          notificationsFailed++;
          continue;
        }

        if (data?.success) {
          console.log(`✅ [CALENDAR NOTIFICATION - GMAIL] Email sent successfully via Gmail to ${user.email}, messageId: ${data.messageId}, threadId: ${data.threadId}`);
          notificationsSent++;
        } else {
          console.error(`❌ [CALENDAR NOTIFICATION - GMAIL] Unexpected response for ${user.email}:`, data);
          emailFailures.push(`${user.email}: Unexpected response format`);
          notificationsFailed++;
        }
        
      } catch (error) {
        console.error(`❌ [CALENDAR NOTIFICATION - GMAIL] ===== NOTIFICATION FAILED FOR USER: ${user.email} =====`);
        console.error(`❌ [CALENDAR NOTIFICATION - GMAIL] Error details:`, {
          message: error.message,
          name: error.name,
          stack: error.stack,
          userId: user.id,
          userEmail: user.email
        });
        
        notificationsFailed++;
        emailFailures.push(`${user.email}: ${error.message}`);
      }
    }

    console.log(`🔄 [CALENDAR NOTIFICATION - GMAIL] ===== NOTIFICATION SUMMARY =====`);
    console.log(`🔄 [CALENDAR NOTIFICATION - GMAIL] Total users processed: ${selectedUsers.length}`);
    console.log(`🔄 [CALENDAR NOTIFICATION - GMAIL] Notifications sent via Gmail: ${notificationsSent}`);
    console.log(`🔄 [CALENDAR NOTIFICATION - GMAIL] Notifications failed: ${notificationsFailed}`);
    console.log(`🔄 [CALENDAR NOTIFICATION - GMAIL] Test mode skipped: ${testModeErrors.length}`);
    if (emailFailures.length > 0) {
      console.log(`🔄 [CALENDAR NOTIFICATION - GMAIL] Email failures:`, emailFailures);
    }

    // Enhanced success/failure reporting for Gmail testing mode
    if (notificationsSent > 0) {
      let description = `✅ Se enviaron ${notificationsSent} notificación(es) correctamente via Gmail a ${VERIFIED_EMAIL}`;
      if (testModeErrors.length > 0) {
        description += `. ${testModeErrors.length} usuarios omitidos (modo de prueba - solo emails a ${VERIFIED_EMAIL})`;
      }
      
      toast({
        title: "🧪 Modo de Prueba - Gmail - Notificaciones enviadas",
        description,
      });
    }

    if (notificationsFailed > 0 && notificationsSent === 0) {
      toast({
        title: "🧪 Modo de Prueba - Gmail - Error",
        description: `En modo de prueba solo se envían emails via Gmail a ${VERIFIED_EMAIL}. ${testModeErrors.length} usuarios omitidos.`,
        variant: "destructive"
      });
    }

    // Show testing mode info if users were skipped
    if (testModeErrors.length > 0) {
      toast({
        title: "🧪 Modo de Prueba Gmail Activo",
        description: `Solo se envían emails via Gmail a ${VERIFIED_EMAIL} para testing. ${testModeErrors.length} usuarios omitidos. Configure los permisos de Gmail para enviar a todos.`,
        variant: "default"
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
