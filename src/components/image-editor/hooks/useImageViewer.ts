
import { useState, useRef, useCallback, useEffect } from 'react';

interface Transform {
  scale: number;
  translateX: number;
  translateY: number;
  rotation: number;
}

interface UseImageViewerProps {
  editMode: boolean;
  onTransformChange?: (transform: Transform) => void;
  initialTransform?: Transform | null;
}

export const useImageViewer = ({ editMode, onTransformChange, initialTransform }: UseImageViewerProps) => {
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

  // Apply initial transform when component mounts or initialTransform changes
  useEffect(() => {
    if (initialTransform) {
      setTransform(initialTransform);
      console.log('Applied initial transform:', initialTransform);
    } else {
      // Reset to default if no initial transform
      const defaultTransform = { scale: 1, translateX: 0, translateY: 0, rotation: 0 };
      setTransform(defaultTransform);
    }
  }, [initialTransform]);

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
    if (editMode && transform.scale > 1) {
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
    if (editMode) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      updateTransform({ scale: Math.max(0.1, Math.min(5, transform.scale * delta)) });
    }
  };

  return {
    transform,
    isDragging,
    containerRef,
    imageRef,
    handleZoomIn,
    handleZoomOut,
    handleRotateLeft,
    handleRotateRight,
    handleReset,
    handleMouseDown,
    handleWheel
  };
};

export type { Transform };
