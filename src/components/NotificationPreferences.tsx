
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Smartphone, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/services/userService';
import { notificationService, type NotificationPreferences as NotificationPrefsType } from '@/services/notificationService';

const NotificationPreferences = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [preferences, setPreferences] = useState<NotificationPrefsType>({
    userId: '',
    email: true,
    push: true,
    inApp: true
  });

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser
  });

  // Load user preferences
  const { data: userPreferences, isLoading } = useQuery({
    queryKey: ['notification-preferences', currentUser?.id],
    queryFn: () => currentUser?.id ? notificationService.getUserPreferences(currentUser.id) : null,
    enabled: !!currentUser?.id
  });

  // Update preferences when loaded
  useEffect(() => {
    if (userPreferences && currentUser) {
      setPreferences(userPreferences);
    } else if (currentUser) {
      setPreferences(prev => ({ ...prev, userId: currentUser.id }));
    }
  }, [userPreferences, currentUser]);

  // Save preferences mutation
  const saveMutation = useMutation({
    mutationFn: (prefs: NotificationPrefsType) => notificationService.saveUserPreferences(prefs),
    onSuccess: () => {
      toast({
        title: "Preferencias guardadas",
        description: "Tus preferencias de notificación se han actualizado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
    onError: (error: any) => {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las preferencias. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handlePreferenceChange = (key: keyof NotificationPrefsType, value: boolean) => {
    if (key === 'userId') return; // Don't allow userId changes
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!currentUser) return;
    saveMutation.mutate(preferences);
  };

  const testNotification = async () => {
    if (!currentUser) return;
    
    try {
      await notificationService.sendNotification(
        currentUser.id,
        currentUser.email,
        'Prueba de Notificación - SkyRanch',
        'Esta es una prueba para verificar que las notificaciones funcionan correctamente.'
      );
      
      toast({
        title: "Notificación de prueba enviada",
        description: "Revisa tu correo y las notificaciones del navegador.",
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la notificación de prueba.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Preferencias de Notificación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">Cargando preferencias...</div>
        </CardContent>
      </Card>
    );
  }

  if (!currentUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Preferencias de Notificación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">Debes iniciar sesión para configurar las notificaciones.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Preferencias de Notificación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <Label htmlFor="email-notifications" className="text-sm font-medium">
                  Notificaciones por Email
                </Label>
                <p className="text-xs text-gray-500">
                  Recibe notificaciones en tu correo electrónico
                </p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.email}
              onCheckedChange={(checked) => handlePreferenceChange('email', checked)}
              disabled={saveMutation.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-green-600" />
              <div>
                <Label htmlFor="push-notifications" className="text-sm font-medium">
                  Notificaciones Push
                </Label>
                <p className="text-xs text-gray-500">
                  Recibe notificaciones en el navegador/dispositivo
                </p>
              </div>
            </div>
            <Switch
              id="push-notifications"
              checked={preferences.push}
              onCheckedChange={(checked) => handlePreferenceChange('push', checked)}
              disabled={saveMutation.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-orange-600" />
              <div>
                <Label htmlFor="in-app-notifications" className="text-sm font-medium">
                  Notificaciones en la App
                </Label>
                <p className="text-xs text-gray-500">
                  Mostrar notificaciones dentro de la aplicación
                </p>
              </div>
            </div>
            <Switch
              id="in-app-notifications"
              checked={preferences.inApp}
              onCheckedChange={(checked) => handlePreferenceChange('inApp', checked)}
              disabled={saveMutation.isPending}
            />
          </div>
        </div>

        <div className="flex space-x-2 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="flex-1"
          >
            {saveMutation.isPending ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Preferencias
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={testNotification}
            disabled={saveMutation.isPending}
          >
            Probar
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Las notificaciones por email requieren configuración del servidor SMTP</p>
          <p>• Las notificaciones push requieren permisos del navegador</p>
          <p>• Las notificaciones en la app siempre están disponibles</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
