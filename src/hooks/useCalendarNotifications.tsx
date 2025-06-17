
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabaseNotificationService } from '@/services/notifications/supabaseNotificationService';
import { pushService } from '@/services/notifications/pushService';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEventTemplate } from '@/services/email/templates/CalendarEventTemplate';
import { tokenStorage } from '@/utils/tokenStorage';

export const useCalendarNotifications = (users: any[]) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Helper to get userName
  const getUserNameByEmail = (email: string) => {
    const u = users.find(user => user.email === email);
    return u?.name || u?.full_name || u?.email?.split('@')[0] || 'Usuario';
  };

  // Function to get Gmail OAuth access token with persistence
  const getGmailAccessToken = async (): Promise<string | null> => {
    try {
      // First check if we have a valid stored token
      const existingToken = tokenStorage.get();
      if (existingToken) {
        console.log('🔐 [GMAIL AUTH] Using existing valid token from storage');
        return existingToken;
      }

      console.log('🔐 [GMAIL AUTH] No valid token found, starting OAuth process...');
      
      // Get the OAuth authorization URL
      const { data: authUrlData, error: authUrlError } = await supabase.functions.invoke('send-gmail/auth-url', {
        body: {
          redirectUri: `${window.location.origin}/gmail-callback`
        }
      });

      if (authUrlError || !authUrlData?.authUrl) {
        console.error('❌ [GMAIL AUTH] Failed to get auth URL:', authUrlError);
        return null;
      }

      console.log('🔐 [GMAIL AUTH] Opening OAuth popup...');
      
      // Open OAuth popup
      const popup = window.open(authUrlData.authUrl, 'gmail-auth', 'width=500,height=600');
      
      if (!popup) {
        console.error('❌ [GMAIL AUTH] Popup blocked by browser');
        toast({
          title: "Error de Popup",
          description: "Por favor permite popups para este sitio y vuelve a intentar",
          variant: "destructive"
        });
        return null;
      }

      // Wait for OAuth callback
      return new Promise((resolve) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            resolve(null);
          }
        }, 1000);

        const messageHandler = async (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'GMAIL_OAUTH_SUCCESS') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            popup.close();
            
            console.log('✅ [GMAIL AUTH] OAuth authorization received, exchanging for token...');
            
            // Exchange code for access token
            const { data: tokenData, error: tokenError } = await supabase.functions.invoke('send-gmail/exchange-token', {
              body: {
                code: event.data.code,
                redirectUri: `${window.location.origin}/gmail-callback`
              }
            });

            if (tokenError || !tokenData?.accessToken) {
              console.error('❌ [GMAIL AUTH] Token exchange failed:', tokenError);
              resolve(null);
              return;
            }

            console.log('✅ [GMAIL AUTH] Access token obtained successfully');
            
            // Store the token for future use
            tokenStorage.save({
              accessToken: tokenData.accessToken,
              refreshToken: tokenData.refreshToken,
              expiresIn: 3600 // 1 hour default
            });
            
            resolve(tokenData.accessToken);
          } else if (event.data.type === 'GMAIL_OAUTH_ERROR') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            popup.close();
            
            console.error('❌ [GMAIL AUTH] OAuth error:', event.data.error);
            toast({
              title: "Error de Autenticación Gmail",
              description: event.data.error,
              variant: "destructive"
            });
            resolve(null);
          }
        };

        window.addEventListener('message', messageHandler);
      });
      
    } catch (error) {
      console.error('❌ [GMAIL AUTH] Unexpected error during OAuth:', error);
      return null;
    }
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

    // Get Gmail access token (will use stored token if valid)
    console.log('🔐 [CALENDAR NOTIFICATION - GMAIL] Obtaining Gmail OAuth access token...');
    const accessToken = await getGmailAccessToken();
    
    if (!accessToken) {
      console.error('❌ [CALENDAR NOTIFICATION - GMAIL] Failed to obtain Gmail access token');
      toast({
        title: "❌ Error de Autenticación",
        description: "No se pudo autenticar con Gmail. Las notificaciones no se enviaron.",
        variant: "destructive"
      });
      return;
    }

    console.log('✅ [CALENDAR NOTIFICATION - GMAIL] Gmail access token obtained, proceeding with notifications...');
    
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

    for (const user of selectedUsers) {
      try {
        console.log(`🔄 [CALENDAR NOTIFICATION - GMAIL] ===== PROCESSING USER: ${user.email} (${user.id}) =====`);
        
        if (!user.email) {
          console.error(`❌ [CALENDAR NOTIFICATION - GMAIL] User ${user.id} has no email address - skipping`);
          notificationsFailed++;
          emailFailures.push(`${user.id}: No email address`);
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

        // Use Gmail edge function to send email with access token
        const payload = {
          to: user.email,
          subject: emailContent.subject,
          html: emailContent.html,
          accessToken: accessToken,
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

        console.log(`📧 [CALENDAR NOTIFICATION - GMAIL] Calling Gmail edge function for ${user.email} with stored token...`);
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
    if (emailFailures.length > 0) {
      console.log(`🔄 [CALENDAR NOTIFICATION - GMAIL] Email failures:`, emailFailures);
    }

    // Enhanced success/failure reporting
    if (notificationsSent > 0) {
      toast({
        title: "✅ Notificaciones Enviadas",
        description: `Se enviaron ${notificationsSent} notificación(es) correctamente via Gmail desde soporte@skyranch.es`,
      });
    }

    if (notificationsFailed > 0) {
      if (notificationsSent === 0) {
        toast({
          title: "❌ Error de Notificaciones",
          description: `No se pudieron enviar ${notificationsFailed} notificación(es). Verifica la autenticación OAuth de Gmail.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "⚠️ Notificaciones Parciales",
          description: `${notificationsSent} enviadas, ${notificationsFailed} fallaron. Algunos usuarios pueden no haber recibido la notificación.`,
          variant: "destructive"
        });
      }
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
