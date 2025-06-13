
import { useState, useEffect } from 'react';
import { appInfoService, type AppInfo, type SupportInfo } from '@/services/appInfoService';

export const useAppInfo = () => {
  const [appInfo, setAppInfo] = useState<AppInfo>(appInfoService.getAppInfo());
  const [supportInfo, setSupportInfo] = useState<SupportInfo>(appInfoService.getSupportInfo());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Listen for automatic updates
    const handleAppInfoUpdate = (event: CustomEvent) => {
      setAppInfo(event.detail);
      console.log('🔄 App info updated in component:', event.detail);
    };

    const handleSupportInfoUpdate = (event: CustomEvent) => {
      setSupportInfo(event.detail);
      console.log('🔄 Support info updated in component:', event.detail);
    };

    // Listen for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      // Refresh support info when coming back online
      if (appInfoService.supportInfoManager) {
        appInfoService.supportInfoManager.refreshFromDatabase();
      }
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('app-info-updated', handleAppInfoUpdate as EventListener);
    window.addEventListener('support-info-updated', handleSupportInfoUpdate as EventListener);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('app-info-updated', handleAppInfoUpdate as EventListener);
      window.removeEventListener('support-info-updated', handleSupportInfoUpdate as EventListener);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    appInfo,
    supportInfo,
    isOnline
  };
};
