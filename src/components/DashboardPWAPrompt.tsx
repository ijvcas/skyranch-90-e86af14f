
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Share, Smartphone, Chrome, Info } from 'lucide-react';

const DashboardPWAPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    console.log('🔧 PWA Prompt: Initializing...');
    
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);
    console.log('📱 iOS detected:', iOS);

    // Detect Chrome/Edge (browsers that support manual installation)
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

    // Check if dismissed recently (within 7 days)
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedDate = parseInt(dismissed);
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      if (dismissedDate > sevenDaysAgo) {
        console.log('🚫 PWA prompt was dismissed recently, not showing');
        return;
      }
    }

    // Listen for PWA install prompt (Chrome/Edge)
    const handler = (e: Event) => {
      console.log('🎯 beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
      console.log('✅ Automatic PWA install prompt available');
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Show prompt for supported browsers
    if (chrome || iOS) {
      setShowPrompt(true);
      console.log('✅ Showing PWA install prompt for supported browser');
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

  const handleManualInstall = () => {
    setShowInstructions(true);
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
    <div className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-4 md:max-w-lg">
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <img 
                src="/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png" 
                alt="SkyRanch" 
                className="w-10 h-10 rounded"
              />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Instala SkyRanch</h3>
              <p className="text-sm text-gray-600">Acceso rápido desde tu pantalla de inicio</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss} className="p-1 h-auto">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {isIOS ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 flex items-center">
              <Share className="w-4 h-4 mr-2 text-blue-600" />
              Toca el botón de compartir <strong>↗</strong> y selecciona "Añadir a pantalla de inicio"
            </p>
          </div>
        ) : isChrome && deferredPrompt ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Instala la app para usarla sin conexión y con acceso directo
            </p>
            <Button 
              onClick={handleInstall}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold"
            >
              <Download className="w-5 h-5 mr-2" />
              Instalar App Ahora
            </Button>
          </div>
        ) : isChrome ? (
          <div className="space-y-4">
            {!showInstructions ? (
              <>
                <div className="flex items-center space-x-2">
                  <Chrome className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-gray-700 font-medium">
                    Esta aplicación se puede instalar en tu dispositivo
                  </p>
                </div>
                <div className="space-y-3">
                  <Button 
                    onClick={handleManualInstall}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold"
                  >
                    <Smartphone className="w-5 h-5 mr-2" />
                    Ver Instrucciones de Instalación
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-900">
                        Para instalar SkyRanch en Chrome:
                      </p>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Haz clic en los <strong>tres puntos (⋮)</strong> en la esquina superior derecha</li>
                        <li>Busca la opción <strong>"Instalar SkyRanch"</strong> o <strong>"Instalar app"</strong></li>
                        <li>Haz clic en <strong>"Instalar"</strong></li>
                      </ol>
                      <p className="text-xs text-blue-700 mt-2">
                        Si no ves la opción, es posible que Chrome aún esté evaluando si la app es instalable.
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowInstructions(false)}
                  variant="outline"
                  className="w-full"
                >
                  Entendido
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DashboardPWAPrompt;
