
import React from 'react';
import { Button } from '@/components/ui/button';
import { Fullscreen, Minimize } from 'lucide-react';

interface FullscreenToggleProps {
  isFullscreen: boolean;
  onToggle: () => void;
}

export const FullscreenToggle = ({ isFullscreen, onToggle }: FullscreenToggleProps) => {
  return (
    <Button
      variant="secondary"
      size="sm"
      className="absolute top-4 right-16 z-30 shadow-lg bg-white/95 backdrop-blur-sm"
      onClick={onToggle}
    >
      {isFullscreen ? <Minimize className="w-4 h-4" /> : <Fullscreen className="w-4 h-4" />}
    </Button>
  );
};
