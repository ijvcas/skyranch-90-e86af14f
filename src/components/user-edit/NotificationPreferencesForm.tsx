
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Smartphone, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreferencesFormProps {
  preferences: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  onPreferencesChange: (field: string, value: boolean) => void;
  userEmail?: string;
  userId?: string;
  isDisabled?: boolean;
}

const NotificationPreferencesForm: React.FC<NotificationPreferencesFormProps> = ({
  preferences,
  onPreferencesChange,
  userEmail,
  userId,
  isDisabled = false
}) => {
  const { toast } = useToast();

  const handleTestNotification = async (type: 'email' | 'push' | 'inApp') => {
    try {
      console.log(`🧪 Testing ${type} notification for user:`, userId);
      
      // Simulate notification test
      switch (type) {
        case 'email':
          if (userEmail) {
            console.log(`📧 Sending test email to: ${userEmail}`);
            toast({
              title: "Email de Prueba Enviado",
              description: `Se ha enviado un email de prueba a ${userEmail}`,
            });
          } else {
            toast({
              title: "Error",
              description: "No se ha proporcionado un email válido",
              variant: "destructive"
            });
          }
          break;
        case 'push':
          console.log(`📱 Sending test push notification`);
          toast({
            title: "Notificación Push Enviada",
            description: "Se ha enviado una notificación push de prueba",
          });
          break;
        case 'inApp':
          console.log(`🔔 Showing test in-app notification`);
          toast({
            title: "Notificación en App",
            description: "Esta es una notificación de prueba dentro de la aplicación",
          });
          break;
      }
    } catch (error) {
      console.error(`Error testing ${type} notification:`, error);
      toast({
        title: "Error en Prueba",
        description: `No se pudo enviar la notificación de prueba`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base font-medium flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Preferencias de Notificación
        </Label>
        <p className="text-sm text-gray-500">
          Configura cómo quieres recibir las notificaciones
        </p>
      </div>

      <div className="space-y-4 pl-4 border-l-2 border-gray-200">
        {/* Email Notifications */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <div>
              <Label className="font-medium">Notificaciones por Email</Label>
              <p className="text-sm text-gray-500">Recibir alertas importantes por correo</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={preferences.email}
              onCheckedChange={(checked) => onPreferencesChange('email', checked)}
              disabled={isDisabled}
            />
            {preferences.email && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTestNotification('email')}
                disabled={isDisabled}
              >
                Probar
              </Button>
            )}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-green-600" />
            <div>
              <Label className="font-medium">Notificaciones Push</Label>
              <p className="text-sm text-gray-500">Recibir notificaciones en dispositivo móvil</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={preferences.push}
              onCheckedChange={(checked) => onPreferencesChange('push', checked)}
              disabled={isDisabled}
            />
            {preferences.push && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTestNotification('push')}
                disabled={isDisabled}
              >
                Probar
              </Button>
            )}
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Monitor className="w-5 h-5 text-purple-600" />
            <div>
              <Label className="font-medium">Notificaciones en App</Label>
              <p className="text-sm text-gray-500">Mostrar alertas dentro de la aplicación</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={preferences.inApp}
              onCheckedChange={(checked) => onPreferencesChange('inApp', checked)}
              disabled={isDisabled}
            />
            {preferences.inApp && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTestNotification('inApp')}
                disabled={isDisabled}
              >
                Probar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferencesForm;
