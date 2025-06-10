
import { useState, useRef, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

export const useDraggable = (initialPosition: Position = { x: 0, y: 0 }) => {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const startPos = useRef<Position>({ x: 0, y: 0 });
  const startMousePos = useRef<Position>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startMousePos.current.x;
      const deltaY = e.clientY - startMousePos.current.y;
      
      setPosition({
        x: startPos.current.x + deltaX,
        y: startPos.current.y + deltaY
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (dragRef.current) {
      setIsDragging(true);
      startPos.current = position;
      startMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  return {
    position,
    dragRef,
    handleMouseDown,
    isDragging
  };
};
