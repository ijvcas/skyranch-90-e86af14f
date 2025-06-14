
import { useState, useEffect } from 'react';

interface PWADetectionState {
  deferredPrompt: any;
  showPrompt: boolean;
  isIOS: boolean;
  isChrome: boolean;
  isStandalone: boolean;
  debugMode: boolean;
}

export const usePWADetection = () => {
  const [state, setState] = useState<PWADetectionState>({
    deferredPrompt: null,
    showPrompt: false,
    isIOS: false,
    isChrome: false,
    isStandalone: false,
    debugMode: false,
  });

  useEffect(() => {
    console.log('🔧 PWA Prompt: Initializing...');
    
    // Clear old dismissals (TEMPORARY FOR TESTING)
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      console.log('🧹 Clearing old PWA prompt dismissal for testing');
      localStorage.removeItem('pwa-prompt-dismissed');
    }
    
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    console.log('📱 iOS detected:', iOS);

    // Detect Chrome/Edge (browsers that support manual installation)
    const chrome = /Chrome|Chromium|Edge/.test(navigator.userAgent) && !iOS;
    console.log('🌐 Chrome/Edge detected:', chrome);

    // Check if running as PWA
    const standaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const iosStandalone = (window.navigator as any).standalone;
    const isAlreadyInstalled = standaloneMode || iosStandalone;
    console.log('📲 Already installed as PWA:', isAlreadyInstalled);

    // Don't show if already installed
    if (isAlreadyInstalled) {
      console.log('✅ PWA already installed, not showing prompt');
      setState(prev => ({ ...prev, isStandalone: true, isIOS: iOS, isChrome: chrome }));
      return;
    }

    // Check if dismissed recently (reduced to 1 day for testing)
    const dismissedNew = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedNew) {
      const dismissedDate = parseInt(dismissedNew);
      const oneDayAgo = Date.now() - (1 * 24 * 60 * 60 * 1000);
      if (dismissedDate > oneDayAgo) {
        console.log('🚫 PWA prompt was dismissed recently (within 1 day), not showing');
        setState(prev => ({ ...prev, isIOS: iOS, isChrome: chrome, isStandalone: isAlreadyInstalled }));
        return;
      } else {
        console.log('⏰ PWA prompt dismissal expired, removing from localStorage');
        localStorage.removeItem('pwa-prompt-dismissed');
      }
    }

    // Listen for PWA install prompt (Chrome/Edge)
    const handler = (e: Event) => {
      console.log('🎯 beforeinstallprompt event fired!');
      e.preventDefault();
      setState(prev => ({ 
        ...prev, 
        deferredPrompt: e, 
        showPrompt: true, 
        isIOS: iOS, 
        isChrome: chrome, 
        isStandalone: isAlreadyInstalled 
      }));
      console.log('✅ Automatic PWA install prompt available');
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Show prompt for supported browsers (always show for testing)
    if (chrome || iOS) {
      setState(prev => ({ 
        ...prev, 
        showPrompt: true, 
        isIOS: iOS, 
        isChrome: chrome, 
        isStandalone: isAlreadyInstalled 
      }));
      console.log('✅ Showing PWA install prompt for supported browser');
      console.log('🔍 Debug info:', {
        userAgent: navigator.userAgent,
        isSecure: location.protocol === 'https:',
        hasServiceWorker: 'serviceWorker' in navigator,
        isStandalone: isAlreadyInstalled,
      });
    } else {
      setState(prev => ({ ...prev, isIOS: iOS, isChrome: chrome, isStandalone: isAlreadyInstalled }));
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const setDeferredPrompt = (prompt: any) => {
    setState(prev => ({ ...prev, deferredPrompt: prompt }));
  };

  const setShowPrompt = (show: boolean) => {
    setState(prev => ({ ...prev, showPrompt: show }));
  };

  const setDebugMode = (debug: boolean) => {
    setState(prev => ({ ...prev, debugMode: debug }));
  };

  return {
    ...state,
    setDeferredPrompt,
    setShowPrompt,
    setDebugMode,
  };
};
