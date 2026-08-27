import { useCallback, useEffect, useRef, useState } from 'react';

import { BOTTOM_SHEET_TRANSITION_MS } from '@/shared/ui/bottom-sheet';

/** 선택 시트의 진입·퇴장 애니메이션과 닫기 완료 시점을 관리합니다. */
export const usePickerSheetTransition = (onClose: () => void, isAnimated: boolean) => {
  const [isVisible, setIsVisible] = useState(!isAnimated);
  const isClosingRef = useRef(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const closePickerSheet = useCallback(
    (afterClose?: () => void) => {
      if (!isAnimated) {
        (afterClose ?? onCloseRef.current)();
        return;
      }

      if (isClosingRef.current) {
        return;
      }

      isClosingRef.current = true;
      setIsVisible(false);
      closeTimeoutRef.current = window.setTimeout(
        afterClose ?? onCloseRef.current,
        BOTTOM_SHEET_TRANSITION_MS
      );
    },
    [isAnimated]
  );

  useEffect(() => {
    if (!isAnimated) {
      return;
    }

    const showPickerSheet = () => {
      if (!isClosingRef.current) {
        setIsVisible(true);
      }
    };
    const supportsAnimationFrame = typeof window.requestAnimationFrame === 'function';
    const openAnimationId = supportsAnimationFrame
      ? window.requestAnimationFrame(showPickerSheet)
      : window.setTimeout(showPickerSheet, 0);

    return () => {
      if (supportsAnimationFrame) {
        window.cancelAnimationFrame(openAnimationId);
      } else {
        window.clearTimeout(openAnimationId);
      }
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [isAnimated]);

  return { closePickerSheet, isVisible };
};
