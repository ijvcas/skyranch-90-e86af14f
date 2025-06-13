
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import { pushService } from '@/services/notifications/pushService';

const NotificationPermissionBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check if we should show the banner
    const permission = pushService.getPermissionStatus();
    const bannerDismissed = localStorage.getItem('notificationBannerDismissed');
    
    setShowBanner(
      pushService.isSupported() && 
      permission === 'default' && 
      !bannerDismissed
    );
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      await pushService.sendPushNotification('test', 'Notificaciones activadas', 'Ya puedes recibir notificaciones push');
      setShowBanner(false);
    } catch (error) {
      console.error('Error requesting permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('notificationBannerDismissed', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <Bell className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          <strong>Habilita las notificaciones</strong> para recibir recordatorios importantes sobre tus animales.
        </span>
        <div className="flex items-center gap-2 ml-4">
          <Button 
            size="sm" 
            onClick={handleRequestPermission}
            disabled={isRequesting}
          >
            {isRequesting ? 'Habilitando...' : 'Habilitar'}
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default NotificationPermissionBanner;
