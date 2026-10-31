import { useEffect, useRef } from 'react';

import { BOTTOM_SHEET_PULL_THRESHOLD_PX } from './constants';

import type { TouchEventHandler, WheelEventHandler } from 'react';

const WHEEL_LINE_HEIGHT_PX = 16;
const WHEEL_GESTURE_RESET_MS = 150;
const SCROLL_BOUNDARY_TOLERANCE_PX = 1;

const isAtBottom = (element: HTMLDivElement) =>
  element.scrollTop + element.clientHeight >= element.scrollHeight - SCROLL_BOUNDARY_TOLERANCE_PX;

const getWheelDeltaYPixels = (deltaY: number, deltaMode: number, pageHeight: number) => {
  if (deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return deltaY * WHEEL_LINE_HEIGHT_PX;
  }

  if (deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return deltaY * pageHeight;
  }

  return deltaY;
};

type UseBottomSheetContentPullParams = {
  onContentPullDown?: () => void;
  onContentPullUp?: () => void;
};

/** 콘텐츠 경계에서 위아래로 당기는 제스처를 감지하며 위로 당긴 터치는 놓을 때 처리합니다. */
export const useBottomSheetContentPull = ({
  onContentPullDown,
  onContentPullUp,
}: UseBottomSheetContentPullParams) => {
  const touchStartYRef = useRef<number | null>(null);
  const hasTriggeredTouchRef = useRef(false);
  const touchPullUpDistanceRef = useRef(0);
  const wheelPullDistanceRef = useRef(0);
  const wheelResetTimeoutRef = useRef<number | null>(null);

  const resetTouchGesture = () => {
    touchStartYRef.current = null;
    hasTriggeredTouchRef.current = false;
    touchPullUpDistanceRef.current = 0;
  };

  const resetWheelGesture = () => {
    wheelPullDistanceRef.current = 0;
    if (wheelResetTimeoutRef.current !== null) {
      window.clearTimeout(wheelResetTimeoutRef.current);
      wheelResetTimeoutRef.current = null;
    }
  };

  useEffect(
    () => () => {
      if (wheelResetTimeoutRef.current !== null) {
        window.clearTimeout(wheelResetTimeoutRef.current);
      }
    },
    []
  );

  const handleTouchStart: TouchEventHandler<HTMLDivElement> = (event) => {
    resetTouchGesture();
    if (
      event.touches.length !== 1 ||
      !(
        (onContentPullDown && event.currentTarget.scrollTop <= 0) ||
        (onContentPullUp && isAtBottom(event.currentTarget))
      )
    ) {
      return;
    }

    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchMove: TouchEventHandler<HTMLDivElement> = (event) => {
    const touchStartY = touchStartYRef.current;
    if (touchStartY === null || hasTriggeredTouchRef.current) {
      return;
    }

    if (event.touches.length !== 1) {
      resetTouchGesture();
      return;
    }

    const currentY = event.touches[0]?.clientY;
    if (currentY === undefined) return;

    touchPullUpDistanceRef.current = isAtBottom(event.currentTarget) ? touchStartY - currentY : 0;
    if (
      onContentPullDown &&
      event.currentTarget.scrollTop <= 0 &&
      currentY - touchStartY > BOTTOM_SHEET_PULL_THRESHOLD_PX
    ) {
      hasTriggeredTouchRef.current = true;
      onContentPullDown();
    }
  };

  const handleTouchEnd: TouchEventHandler<HTMLDivElement> = (event) => {
    const shouldPullUp =
      !hasTriggeredTouchRef.current &&
      touchPullUpDistanceRef.current > BOTTOM_SHEET_PULL_THRESHOLD_PX &&
      isAtBottom(event.currentTarget);
    resetTouchGesture();
    if (shouldPullUp) onContentPullUp?.();
  };

  const handleWheel: WheelEventHandler<HTMLDivElement> = (event) => {
    const callback =
      event.deltaY > 0 && isAtBottom(event.currentTarget)
        ? onContentPullUp
        : event.deltaY < 0 && event.currentTarget.scrollTop <= 0
          ? onContentPullDown
          : undefined;
    if (!callback) {
      resetWheelGesture();
      return;
    }

    const pageHeight = event.currentTarget.clientHeight || window.innerHeight;
    const deltaYPixels = getWheelDeltaYPixels(event.deltaY, event.deltaMode, pageHeight);
    if (Math.sign(wheelPullDistanceRef.current) !== Math.sign(deltaYPixels)) {
      wheelPullDistanceRef.current = 0;
    }
    wheelPullDistanceRef.current += deltaYPixels;
    if (Math.abs(wheelPullDistanceRef.current) > BOTTOM_SHEET_PULL_THRESHOLD_PX) {
      resetWheelGesture();
      callback();
      return;
    }

    if (wheelResetTimeoutRef.current !== null) {
      window.clearTimeout(wheelResetTimeoutRef.current);
    }
    wheelResetTimeoutRef.current = window.setTimeout(resetWheelGesture, WHEEL_GESTURE_RESET_MS);
  };

  return {
    handleTouchCancel: resetTouchGesture,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
    handleWheel,
  };
};
