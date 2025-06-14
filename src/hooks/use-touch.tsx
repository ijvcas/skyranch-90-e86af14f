
import { useCallback, useRef, useState } from 'react';

interface TouchPosition {
  x: number;
  y: number;
}

export function useTouch() {
  const [isTouching, setIsTouching] = useState(false);
  const touchStart = useRef<TouchPosition>({ x: 0, y: 0 });
  const touchEnd = useRef<TouchPosition>({ x: 0, y: 0 });
  const lastTouchTime = useRef<number>(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const now = Date.now();
    
    // Prevent rapid successive touches (debounce)
    if (now - lastTouchTime.current < 100) {
      console.log('👆 Touch debounced');
      return;
    }
    
    lastTouchTime.current = now;
    setIsTouching(true);
    
    if (e.targetTouches[0]) {
      touchStart.current = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      };
      console.log('👆 Touch start:', touchStart.current);
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.targetTouches[0]) {
      touchEnd.current = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      };
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    console.log('👆 Touch end');
    setIsTouching(false);
  }, []);

  const getSwipeDirection = useCallback(() => {
    const deltaX = touchStart.current.x - touchEnd.current.x;
    const deltaY = touchStart.current.y - touchEnd.current.y;
    
    // Minimum swipe distance to register as intentional swipe
    const minSwipeDistance = 50;
    
    if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
      return 'tap'; // Not a swipe, just a tap
    }
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'left' : 'right';
    } else {
      return deltaY > 0 ? 'up' : 'down';
    }
  }, []);

  const isTap = useCallback(() => {
    const deltaX = Math.abs(touchStart.current.x - touchEnd.current.x);
    const deltaY = Math.abs(touchStart.current.y - touchEnd.current.y);
    
    // Consider it a tap if movement is less than 10 pixels
    return deltaX < 10 && deltaY < 10;
  }, []);

  return {
    isTouching,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    getSwipeDirection,
    isTap,
  };
}
