
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Share, Smartphone } from 'lucide-react';

const DashboardPWAPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    console.log('🔧 PWA Prompt: Initializing...');
    
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);
    console.log('📱 iOS detected:', iOS);

    // Detect Chrome/Edge (browsers that support beforeinstallprompt)
    const chrome = /Chrome|Chromium|Edge/.test(navigator.userAgent) && !iOS;
    setIsChrome(chrome);
    console.log('🌐 Chrome/Edge detected:', chrome);

    // Check if running as PWA
    const standaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const iosStandalone = (window.navigator as any).standalone;
    const isAlreadyInstalled = standaloneMode || iosStandalone;
    setIsStandalone(isAlreadyInstalled);
    console.log('📲 Already installed as PWA:', isAlreadyInstalled);

    // Don't show if already installed
    if (isAlreadyInstalled) {
      console.log('✅ PWA already installed, not showing prompt');
      return;
    }

    // Check if dismissed recently (within 3 days)
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedDate = parseInt(dismissed);
      const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
      if (dismissedDate > threeDaysAgo) {
        console.log('🚫 PWA prompt was dismissed recently, not showing');
        return;
      }
    }

    // Listen for PWA install prompt (Chrome/Edge)
    const handler = (e: Event) => {
      console.log('🎯 beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e);
      if (chrome) {
        setShowPrompt(true);
        console.log('✅ Showing PWA install prompt for Chrome/Edge');
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For Chrome browsers, also show a fallback prompt even if beforeinstallprompt doesn't fire
    // This can happen if the criteria aren't fully met but we still want to inform users
    if (chrome) {
      setTimeout(() => {
        if (!deferredPrompt && !isAlreadyInstalled) {
          console.log('⏰ Chrome detected but no beforeinstallprompt yet, showing info prompt');
          setShowPrompt(true);
        }
      }, 2000); // Wait 2 seconds for the event
    }

    // Show iOS instructions if on iOS and not standalone
    if (iOS && !iosStandalone) {
      console.log('🍎 iOS detected and not installed, showing iOS instructions');
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.log('❌ No deferred prompt available');
      return;
    }

    console.log('🚀 Triggering PWA install...');
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log('📊 Install outcome:', outcome);
    if (outcome === 'accepted') {
      console.log('✅ PWA installation accepted');
    } else {
      console.log('❌ PWA installation declined');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    console.log('🙈 PWA prompt dismissed by user');
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Don't show if already installed
  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-4 md:max-w-md">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <img 
                src="/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png" 
                alt="SkyRanch" 
                className="w-8 h-8 rounded"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Instala SkyRanch</h3>
              <p className="text-xs text-gray-600">Acceso rápido desde tu pantalla de inicio</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss} className="p-1 h-auto">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {isIOS ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-700 flex items-center">
              <Share className="w-4 h-4 mr-2 text-blue-600" />
              Toca el botón de compartir y selecciona "Añadir a pantalla de inicio"
            </p>
          </div>
        ) : isChrome && deferredPrompt ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Instala la app para usarla sin conexión y con acceso directo
            </p>
            <Button 
              onClick={handleInstall}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Instalar App
            </Button>
          </div>
        ) : isChrome ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 flex items-center">
              <Smartphone className="w-4 h-4 mr-2 text-green-600" />
              Esta aplicación se puede instalar en tu dispositivo
            </p>
            <p className="text-xs text-gray-500">
              Chrome mostrará automáticamente la opción de instalación cuando esté disponible
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DashboardPWAPrompt;
