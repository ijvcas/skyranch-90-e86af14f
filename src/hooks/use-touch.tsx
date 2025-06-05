
import { useCallback, useRef, useState } from 'react';

interface TouchPosition {
  x: number;
  y: number;
}

export function useTouch() {
  const [isTouching, setIsTouching] = useState(false);
  const touchStart = useRef<TouchPosition>({ x: 0, y: 0 });
  const touchEnd = useRef<TouchPosition>({ x: 0, y: 0 });

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setIsTouching(true);
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  }, []);

  const onTouchEnd = useCallback(() => {
    setIsTouching(false);
  }, []);

  const getSwipeDirection = useCallback(() => {
    const deltaX = touchStart.current.x - touchEnd.current.x;
    const deltaY = touchStart.current.y - touchEnd.current.y;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'left' : 'right';
    } else {
      return deltaY > 0 ? 'up' : 'down';
    }
  }, []);

  return {
    isTouching,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    getSwipeDirection,
  };
}
