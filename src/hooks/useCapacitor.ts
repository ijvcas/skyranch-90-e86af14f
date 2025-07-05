import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export const useCapacitor = () => {
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState<string>('web');

  useEffect(() => {
    const initializeApp = async () => {
      if (Capacitor.isNativePlatform()) {
        setIsNative(true);
        setPlatform(Capacitor.getPlatform());

        // Configure status bar for iOS
        if (Capacitor.getPlatform() === 'ios') {
          await StatusBar.setStyle({ style: Style.Default });
          await StatusBar.setBackgroundColor({ color: '#16a34a' });
        }

        // Hide splash screen
        await SplashScreen.hide();

        // Handle app state changes
        App.addListener('appStateChange', ({ isActive }) => {
          console.log('App state changed. Is active:', isActive);
        });

        // Handle app URL open (deep linking)
        App.addListener('appUrlOpen', (event) => {
          console.log('App opened with URL:', event);
        });

        // Handle back button on Android
        App.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            App.exitApp();
          } else {
            window.history.back();
          }
        });
      }
    };

    initializeApp();

    return () => {
      App.removeAllListeners();
    };
  }, []);

  const exitApp = () => {
    if (isNative) {
      App.exitApp();
    } else {
      window.close();
    }
  };

  const getAppInfo = async () => {
    if (isNative) {
      return await App.getInfo();
    }
    return null;
  };

  return {
    isNative,
    platform,
    exitApp,
    getAppInfo
  };
};