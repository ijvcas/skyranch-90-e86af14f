import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Smartphone, Monitor, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/services/userService';
import { notificationService } from '@/services/notifications/notificationService';
import { preferencesService } from '@/services/notifications/preferencesService';
import type { NotificationPreferences } from '@/services/notifications/interfaces';

const NotificationPreferences = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    userId: '',
    email: true,
    push: true,
    inApp: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current user to get the user ID
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
  });

  useEffect(() => {
    if (currentUser?.id) {
      // Load preferences from local storage when the component mounts
      loadPreferences(currentUser.id);
    }
  }, [currentUser?.id]);

  const loadPreferences = async (userId: string) => {
    try {
      const storedPreferences = await preferencesService.getUserPreferences(userId);
      setPreferences(storedPreferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las preferencias de notificación.",
        variant: "destructive",
      });
    }
  };

  const savePreferences = async () => {
    setIsLoading(true);
    try {
      if (!currentUser?.id) {
        throw new Error("User ID is missing.");
      }
      
      const success = await preferencesService.saveUserPreferences({
        ...preferences,
        userId: currentUser.id,
      });
      
      if (success) {
        toast({
          title: "Preferencias Guardadas",
          description: "Tus preferencias de notificación han sido guardadas.",
        });
      } else {
        throw new Error("Failed to save preferences.");
      }
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron guardar las preferencias de notificación.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (type: 'email' | 'push' | 'inApp', value: boolean) => {
    setPreferences(prev => ({ ...prev, [type]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Preferencias de Notificación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 mr-2 text-gray-500" />
          <Label htmlFor="email">Notificaciones por Correo Electrónico</Label>
          <Switch
            id="email"
            checked={preferences.email}
            onCheckedChange={(checked) => handlePreferenceChange('email', checked)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Smartphone className="w-4 h-4 mr-2 text-gray-500" />
          <Label htmlFor="push">Notificaciones Push</Label>
          <Switch
            id="push"
            checked={preferences.push}
            onCheckedChange={(checked) => handlePreferenceChange('push', checked)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Monitor className="w-4 h-4 mr-2 text-gray-500" />
          <Label htmlFor="inApp">Notificaciones In-App</Label>
          <Switch
            id="inApp"
            checked={preferences.inApp}
            onCheckedChange={(checked) => handlePreferenceChange('inApp', checked)}
          />
        </div>
        <Button onClick={savePreferences} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Save className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Preferencias
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
