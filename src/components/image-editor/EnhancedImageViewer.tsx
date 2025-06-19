
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Move } from 'lucide-react';

interface Transform {
  scale: number;
  translateX: number;
  translateY: number;
  rotation: number;
}

interface EnhancedImageViewerProps {
  src: string;
  alt: string;
  className?: string;
  onTransformChange?: (transform: Transform) => void;
}

const EnhancedImageViewer: React.FC<EnhancedImageViewerProps> = ({
  src,
  alt,
  className = '',
  onTransformChange
}) => {
  const [transform, setTransform] = useState<Transform>({
    scale: 1,
    translateX: 0,
    translateY: 0,
    rotation: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const updateTransform = useCallback((newTransform: Partial<Transform>) => {
    const updated = { ...transform, ...newTransform };
    setTransform(updated);
    onTransformChange?.(updated);
  }, [transform, onTransformChange]);

  const handleZoomIn = () => {
    updateTransform({ scale: Math.min(transform.scale * 1.2, 5) });
  };

  const handleZoomOut = () => {
    updateTransform({ scale: Math.max(transform.scale / 1.2, 0.1) });
  };

  const handleRotateLeft = () => {
    updateTransform({ rotation: transform.rotation - 90 });
  };

  const handleRotateRight = () => {
    updateTransform({ rotation: transform.rotation + 90 });
  };

  const handleReset = () => {
    const resetTransform = { scale: 1, translateX: 0, translateY: 0, rotation: 0 };
    setTransform(resetTransform);
    onTransformChange?.(resetTransform);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (transform.scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - transform.translateX, y: e.clientY - transform.translateY });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && transform.scale > 1) {
      const newTranslateX = e.clientX - dragStart.x;
      const newTranslateY = e.clientY - dragStart.y;
      updateTransform({ translateX: newTranslateX, translateY: newTranslateY });
    }
  }, [isDragging, dragStart, transform.scale, updateTransform]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    updateTransform({ scale: Math.max(0.1, Math.min(5, transform.scale * delta)) });
  };

  const imageStyle = {
    transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
    cursor: transform.scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
    transition: isDragging ? 'none' : 'transform 0.2s ease-out'
  };

  return (
    <div className={`relative overflow-hidden ${className}`} ref={containerRef}>
      <div
        className="w-full h-full flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain select-none"
          style={imageStyle}
          draggable={false}
        />
      </div>
      
      {/* Controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 bg-black/50 rounded-lg p-1">
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/20 h-8 w-8 p-0"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/20 h-8 w-8 p-0"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/20 h-8 w-8 p-0"
          onClick={handleRotateLeft}
          title="Rotate Left"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/20 h-8 w-8 p-0"
          onClick={handleRotateRight}
          title="Rotate Right"
        >
          <RotateCw className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/20 h-8 w-8 p-0"
          onClick={handleReset}
          title="Reset View"
        >
          <Move className="w-4 h-4" />
        </Button>
      </div>

      {/* Zoom indicator */}
      {transform.scale !== 1 && (
        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
          {Math.round(transform.scale * 100)}%
        </div>
      )}
    </div>
  );
};

export default EnhancedImageViewer;
