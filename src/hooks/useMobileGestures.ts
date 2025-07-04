import { useEffect, useRef, useCallback } from 'react';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface GestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchZoom?: (scale: number) => void;
  onTap?: (point: TouchPoint) => void;
  onDoubleTap?: (point: TouchPoint) => void;
  onLongPress?: (point: TouchPoint) => void;
  onPan?: (deltaX: number, deltaY: number) => void;
  threshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
}

export const useMobileGestures = (options: GestureOptions = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinchZoom,
    onTap,
    onDoubleTap,
    onLongPress,
    onPan,
    threshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300
  } = options;

  const startTouch = useRef<TouchPoint | null>(null);
  const lastTap = useRef<TouchPoint | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const initialDistance = useRef<number>(0);
  const isPanning = useRef<boolean>(false);

  const getDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getTouchPoint = useCallback((touch: Touch): TouchPoint => ({
    x: touch.clientX,
    y: touch.clientY,
    timestamp: Date.now()
  }), []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault(); // Prevent default mobile behaviors
    
    const touch = e.touches[0];
    const touchPoint = getTouchPoint(touch);
    startTouch.current = touchPoint;
    isPanning.current = false;

    // Handle multi-touch (pinch zoom)
    if (e.touches.length === 2) {
      initialDistance.current = getDistance(e.touches[0], e.touches[1]);
      return;
    }

    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress(touchPoint);
      }, longPressDelay);
    }
  }, [getTouchPoint, getDistance, onLongPress, longPressDelay]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!startTouch.current) return;

    // Clear long press timer on move
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const touch = e.touches[0];
    const currentPoint = getTouchPoint(touch);

    // Handle pinch zoom
    if (e.touches.length === 2 && onPinchZoom) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialDistance.current;
      onPinchZoom(scale);
      return;
    }

    // Handle pan gesture
    if (onPan && !isPanning.current) {
      const deltaX = currentPoint.x - startTouch.current.x;
      const deltaY = currentPoint.y - startTouch.current.y;
      
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        isPanning.current = true;
        onPan(deltaX, deltaY);
      }
    }
  }, [getTouchPoint, getDistance, onPinchZoom, onPan]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!startTouch.current) return;

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const touch = e.changedTouches[0];
    const endPoint = getTouchPoint(touch);
    
    const deltaX = endPoint.x - startTouch.current.x;
    const deltaY = endPoint.y - startTouch.current.y;
    const deltaTime = endPoint.timestamp - startTouch.current.timestamp;

    // If was panning, don't trigger other gestures
    if (isPanning.current) {
      isPanning.current = false;
      startTouch.current = null;
      return;
    }

    // Check for swipe gestures
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
      startTouch.current = null;
      return;
    }

    // Check for tap gestures
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 300) {
      // Check for double tap
      if (lastTap.current && 
          endPoint.timestamp - lastTap.current.timestamp < doubleTapDelay &&
          Math.abs(endPoint.x - lastTap.current.x) < 20 &&
          Math.abs(endPoint.y - lastTap.current.y) < 20) {
        if (onDoubleTap) {
          onDoubleTap(endPoint);
        }
        lastTap.current = null;
      } else {
        lastTap.current = endPoint;
        if (onTap) {
          setTimeout(() => {
            if (lastTap.current === endPoint) {
              onTap(endPoint);
            }
          }, doubleTapDelay);
        }
      }
    }

    startTouch.current = null;
  }, [getTouchPoint, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, onDoubleTap, doubleTapDelay]);

  const gestureHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    style: { touchAction: 'none' } // Prevent default touch behaviors
  };

  return gestureHandlers;
};

// Hook for simple swipe detection
export const useSwipeGestures = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void
) => {
  return useMobileGestures({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  });
};