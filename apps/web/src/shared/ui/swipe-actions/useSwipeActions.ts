import { useRef, useState } from 'react';

import type { HTMLAttributes, PointerEvent } from 'react';

const ACTIONS_WIDTH = 128;
const SWIPE_THRESHOLD = 40;
const DIRECTION_THRESHOLD = 8;

type SwipeGesture = {
  id: number;
  x: number;
  y: number;
  isHorizontal: boolean;
  hasMoved: boolean;
};

/** 가로 드래그·키보드 조작과 스와이프 직후 클릭 차단을 관리합니다. */
export const useSwipeActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [offset, setOffset] = useState<number | null>(null);
  const gestureRef = useRef<SwipeGesture | null>(null);
  const shouldSuppressClickRef = useRef(false);
  const translateX = offset ?? (isOpen ? -ACTIONS_WIDTH : 0);
  const revealProgress = Math.min(1, Math.max(0, -translateX / ACTIONS_WIDTH));

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = gestureRef.current;
    if (!start || start.id !== event.pointerId) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (!start.isHorizontal) {
      if (Math.abs(deltaY) > Math.max(DIRECTION_THRESHOLD, Math.abs(deltaX))) {
        gestureRef.current = null;
        return;
      }
      if (Math.abs(deltaX) <= DIRECTION_THRESHOLD) return;
      start.isHorizontal = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    start.hasMoved = true;
    setOffset(Math.max(-ACTIONS_WIDTH, Math.min(0, (isOpen ? -ACTIONS_WIDTH : 0) + deltaX)));
  };

  const finishGesture = (event: PointerEvent<HTMLDivElement>, isCancelled = false) => {
    const start = gestureRef.current;
    if (!start || start.id !== event.pointerId) return;
    if (start.hasMoved) {
      shouldSuppressClickRef.current = true;
      if (!isCancelled) {
        const deltaX = event.clientX - start.x;
        if (Math.abs(deltaX) > SWIPE_THRESHOLD) setIsOpen(deltaX < 0);
      }
    }
    gestureRef.current = null;
    setOffset(null);
  };

  const groupProps: HTMLAttributes<HTMLDivElement> = {
    tabIndex: 0,
    onKeyDown: (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setIsOpen(true);
      } else if (event.key === 'Escape' || event.key === 'ArrowRight') {
        if (event.key === 'Escape') event.currentTarget.focus();
        setIsOpen(false);
      }
    },
    onFocusCapture: () => {
      if (!gestureRef.current) setIsOpen(true);
    },
    onBlurCapture: (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
    },
  };

  const contentProps: HTMLAttributes<HTMLDivElement> = {
    onDragStart: (event) => event.preventDefault(),
    onPointerDown: (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      shouldSuppressClickRef.current = false;
      gestureRef.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        isHorizontal: false,
        hasMoved: false,
      };
    },
    onTouchMove: (event) => {
      if (gestureRef.current?.isHorizontal) event.stopPropagation();
    },
    onPointerMove: handlePointerMove,
    onPointerUp: (event) => finishGesture(event),
    onPointerCancel: (event) => finishGesture(event, true),
    onClickCapture: (event) => {
      if (!shouldSuppressClickRef.current) return;
      shouldSuppressClickRef.current = false;
      if (event.detail === 0) return;
      event.preventDefault();
      event.stopPropagation();
    },
  };

  return { isOpen, offset, translateX, revealProgress, groupProps, contentProps };
};
