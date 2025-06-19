
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Move } from 'lucide-react';

interface ImageViewerControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onReset: () => void;
}

const ImageViewerControls: React.FC<ImageViewerControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onRotateLeft,
  onRotateRight,
  onReset
}) => {
  return (
    <div className="absolute top-2 right-2 flex flex-col gap-1 bg-black/50 rounded-lg p-1">
      <Button
        size="sm"
        variant="ghost"
        className="text-white hover:bg-white/20 h-8 w-8 p-0"
        onClick={onZoomIn}
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-white hover:bg-white/20 h-8 w-8 p-0"
        onClick={onZoomOut}
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-white hover:bg-white/20 h-8 w-8 p-0"
        onClick={onRotateLeft}
        title="Rotate Left"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-white hover:bg-white/20 h-8 w-8 p-0"
        onClick={onRotateRight}
        title="Rotate Right"
      >
        <RotateCw className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-white hover:bg-white/20 h-8 w-8 p-0"
        onClick={onReset}
        title="Reset View"
      >
        <Move className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default ImageViewerControls;
