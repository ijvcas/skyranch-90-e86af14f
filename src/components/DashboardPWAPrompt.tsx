
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Share, Smartphone, Chrome, Info, RefreshCw } from 'lucide-react';

const DashboardPWAPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

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

    // Check if dismissed recently (reduced to 1 day for testing)
    const dismissedNew = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedNew) {
      const dismissedDate = parseInt(dismissedNew);
      const oneDayAgo = Date.now() - (1 * 24 * 60 * 60 * 1000); // Changed from 7 days to 1 day
      if (dismissedDate > oneDayAgo) {
        console.log('🚫 PWA prompt was dismissed recently (within 1 day), not showing');
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
      setDeferredPrompt(e);
      setShowPrompt(true);
      console.log('✅ Automatic PWA install prompt available');
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Show prompt for supported browsers (always show for testing)
    if (chrome || iOS) {
      setShowPrompt(true);
      console.log('✅ Showing PWA install prompt for supported browser');
      console.log('🔍 Debug info:', {
        userAgent: navigator.userAgent,
        isSecure: location.protocol === 'https:',
        hasServiceWorker: 'serviceWorker' in navigator,
        isStandalone: isAlreadyInstalled,
        hasDeferredPrompt: !!deferredPrompt
      });
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

  const handleForceShow = () => {
    console.log('🔧 Force showing PWA prompt');
    localStorage.removeItem('pwa-prompt-dismissed');
    setShowPrompt(true);
    setDebugMode(true);
  };

  // Debug function accessible from console
  (window as any).showPWAPrompt = handleForceShow;
  (window as any).clearPWADismissal = () => {
    localStorage.removeItem('pwa-prompt-dismissed');
    console.log('🧹 PWA dismissal cleared');
  };

  // Don't show if already installed (unless debug mode)
  if (!showPrompt || (isStandalone && !debugMode)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-4 md:max-w-lg">
      <div className="bg-white border-2 border-green-200 rounded-lg shadow-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <img 
                src="/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png" 
                alt="SkyRanch" 
                className="w-12 h-12 rounded"
              />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Instala SkyRanch</h3>
              <p className="text-sm text-gray-600">Acceso rápido desde tu pantalla de inicio</p>
              {debugMode && (
                <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1">
                  Debug: Deferred prompt = {deferredPrompt ? 'Available' : 'Not available'}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {!debugMode && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setDebugMode(true)}
                className="p-1 h-auto text-gray-400 hover:text-gray-600"
                title="Debug mode"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="p-1 h-auto">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {isIOS ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 flex items-center">
              <Share className="w-4 h-4 mr-2 text-blue-600" />
              Toca el botón de compartir <strong>↗</strong> y selecciona "Añadir a pantalla de inicio"
            </p>
          </div>
        ) : isChrome ? (
          <div className="space-y-4">
            {deferredPrompt ? (
              // Automatic installation available
              <>
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
              </>
            ) : (
              // Manual installation instructions
              <>
                {!showInstructions ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <Chrome className="w-5 h-5 text-blue-600" />
                      <p className="text-sm text-gray-700 font-medium">
                        Instala SkyRanch en tu dispositivo
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 mb-3">
                        <strong>Para instalar en Chrome:</strong>
                      </p>
                      <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside mb-3">
                        <li>Haz clic en los <strong>tres puntos (⋮)</strong> en la esquina superior derecha</li>
                        <li>Busca <strong>"Instalar SkyRanch"</strong> o <strong>"Instalar aplicación"</strong></li>
                        <li>Haz clic en <strong>"Instalar"</strong></li>
                      </ol>
                      <p className="text-xs text-blue-600">
                        Si no aparece la opción, prueba refrescando la página o espera unos minutos.
                      </p>
                    </div>
                    <Button 
                      onClick={handleManualInstall}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold"
                    >
                      <Smartphone className="w-5 h-5 mr-2" />
                      Ver Instrucciones Detalladas
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-green-900">
                            Instrucciones paso a paso para Chrome:
                          </p>
                          <div className="space-y-2">
                            <div className="text-sm text-green-800">
                              <strong>Método 1:</strong> Menú de Chrome
                            </div>
                            <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside ml-2">
                              <li>Haz clic en los <strong>tres puntos (⋮)</strong> arriba a la derecha</li>
                              <li>Busca <strong>"Instalar SkyRanch"</strong></li>
                              <li>Haz clic en <strong>"Instalar"</strong></li>
                            </ol>
                            <div className="text-sm text-green-800 mt-3">
                              <strong>Método 2:</strong> Barra de direcciones
                            </div>
                            <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside ml-2">
                              <li>Busca un icono de <strong>instalación (+)</strong> en la barra de direcciones</li>
                              <li>Haz clic en él y selecciona <strong>"Instalar"</strong></li>
                            </ol>
                          </div>
                          <div className="bg-green-100 border border-green-300 rounded p-2 mt-3">
                            <p className="text-xs text-green-700">
                              💡 <strong>Tip:</strong> Una vez instalada, podrás encontrar la app en tu escritorio o menú de aplicaciones
                            </p>
                          </div>
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
              </>
            )}
            
            {debugMode && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <strong>Debug Info:</strong><br/>
                User Agent: {navigator.userAgent.substring(0, 50)}...<br/>
                Secure: {location.protocol === 'https:' ? 'Yes' : 'No'}<br/>
                Service Worker: {'serviceWorker' in navigator ? 'Supported' : 'Not supported'}<br/>
                Deferred Prompt: {deferredPrompt ? 'Available' : 'Not available'}<br/>
                <Button 
                  onClick={handleForceShow} 
                  size="sm" 
                  className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Force Show Again
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
