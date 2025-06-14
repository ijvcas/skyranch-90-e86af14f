
import React from 'react';
import { Button } from '@/components/ui/button';

interface PWADebugInfoProps {
  deferredPrompt: any;
  onForceShow: () => void;
}

const PWADebugInfo = ({ deferredPrompt, onForceShow }: PWADebugInfoProps) => {
  return (
    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
      <strong>Debug Info:</strong><br/>
      User Agent: {navigator.userAgent.substring(0, 50)}...<br/>
      Secure: {location.protocol === 'https:' ? 'Yes' : 'No'}<br/>
      Service Worker: {'serviceWorker' in navigator ? 'Supported' : 'Not supported'}<br/>
      Deferred Prompt: {deferredPrompt ? 'Available' : 'Not available'}<br/>
      <Button 
        onClick={onForceShow} 
        size="sm" 
        className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white"
      >
        Force Show Again
      </Button>
    </div>
  );
};

export default PWADebugInfo;
