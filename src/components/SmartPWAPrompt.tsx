
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Share } from 'lucide-react';

const SmartPWAPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone;
    setIsStandalone(isStandaloneMode || isIOSStandalone);

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedDate = parseInt(dismissed);
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      if (dismissedDate > weekAgo) {
        return;
      }
    }

    // Listen for PWA install prompt (Chrome/Edge)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandaloneMode && !iOS) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Show iOS instructions if on iOS and not standalone
    if (iOS && !isIOSStandalone) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Don't show if already installed or no prompt available
  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png" 
              alt="SkyRanch" 
              className="w-6 h-6 rounded"
            />
            <h3 className="font-medium text-gray-900 text-sm">SkyRanch</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss} className="p-1 h-auto">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {isIOS ? (
          <>
            <p className="text-xs text-gray-600 mb-2">
              Instala la app: toca <Share className="w-3 h-3 inline mx-1" /> y luego "Añadir a pantalla de inicio"
            </p>
          </>
        ) : deferredPrompt ? (
          <>
            <p className="text-xs text-gray-600 mb-2">
              Instala para acceso rápido y sin conexión
            </p>
            <Button 
              onClick={handleInstall}
              size="sm"
              className="w-full h-8 bg-green-600 hover:bg-green-700 text-white text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Instalar
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default SmartPWAPrompt;
