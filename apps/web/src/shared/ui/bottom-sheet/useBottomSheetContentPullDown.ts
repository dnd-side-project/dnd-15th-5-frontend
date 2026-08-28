import { useEffect, useRef } from 'react';

import type { TouchEventHandler, WheelEventHandler } from 'react';

const CONTENT_PULL_DOWN_THRESHOLD_PX = 64;
const WHEEL_LINE_HEIGHT_PX = 16;
const WHEEL_GESTURE_RESET_MS = 150;

const getWheelDeltaYPixels = (deltaY: number, deltaMode: number, pageHeight: number) => {
  if (deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return deltaY * WHEEL_LINE_HEIGHT_PX;
  }

  if (deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return deltaY * pageHeight;
  }

  return deltaY;
};

type UseBottomSheetContentPullDownParams = {
  onContentPullDown?: () => void;
};

/** 스크롤 최상단에서 아래로 당기는 터치·휠 제스처를 감지합니다. */
export const useBottomSheetContentPullDown = ({
  onContentPullDown,
}: UseBottomSheetContentPullDownParams) => {
  const touchStartYRef = useRef<number | null>(null);
  const hasTriggeredTouchRef = useRef(false);
  const wheelPullDistanceRef = useRef(0);
  const wheelResetTimeoutRef = useRef<number | null>(null);

  const resetTouchGesture = () => {
    touchStartYRef.current = null;
    hasTriggeredTouchRef.current = false;
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
    if (!onContentPullDown || event.currentTarget.scrollTop > 0) return;

    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchMove: TouchEventHandler<HTMLDivElement> = (event) => {
    const touchStartY = touchStartYRef.current;
    if (
      !onContentPullDown ||
      touchStartY === null ||
      hasTriggeredTouchRef.current ||
      event.currentTarget.scrollTop > 0
    ) {
      return;
    }

    const currentY = event.touches[0]?.clientY;
    if (currentY === undefined || currentY - touchStartY <= CONTENT_PULL_DOWN_THRESHOLD_PX) return;

    hasTriggeredTouchRef.current = true;
    onContentPullDown();
  };

  const handleWheel: WheelEventHandler<HTMLDivElement> = (event) => {
    if (!onContentPullDown || event.currentTarget.scrollTop > 0 || event.deltaY >= 0) {
      resetWheelGesture();
      return;
    }

    const pageHeight = event.currentTarget.clientHeight || window.innerHeight;
    const deltaYPixels = getWheelDeltaYPixels(event.deltaY, event.deltaMode, pageHeight);
    wheelPullDistanceRef.current += -deltaYPixels;
    if (wheelPullDistanceRef.current > CONTENT_PULL_DOWN_THRESHOLD_PX) {
      resetWheelGesture();
      onContentPullDown();
      return;
    }

    if (wheelResetTimeoutRef.current !== null) {
      window.clearTimeout(wheelResetTimeoutRef.current);
    }
    wheelResetTimeoutRef.current = window.setTimeout(resetWheelGesture, WHEEL_GESTURE_RESET_MS);
  };

  return {
    handleTouchEnd: resetTouchGesture,
    handleTouchMove,
    handleTouchStart,
    handleWheel,
  };
};
