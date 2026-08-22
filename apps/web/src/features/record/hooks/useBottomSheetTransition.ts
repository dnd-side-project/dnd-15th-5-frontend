import { useCallback, useEffect, useRef, useState } from 'react';

import { BOTTOM_SHEET_TRANSITION_MS } from '@/shared/ui/bottom-sheet';

/**
 * 바텀시트의 진입·퇴장 애니메이션과 닫기 완료 시점을 관리합니다.
 *
 * 마운트 다음 프레임에 시트를 표시하고, 닫을 때는 퇴장 애니메이션이 끝난 뒤 콜백을
 * 실행합니다. 열려 있는 동안 배경 스크롤을 잠그고 Escape 키로도 닫을 수 있습니다.
 */
export const useBottomSheetTransition = (onClose: () => void) => {
  const [isVisible, setIsVisible] = useState(false);
  const isClosingRef = useRef(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const closeBottomSheet = useCallback((afterClose?: () => void) => {
    if (isClosingRef.current) {
      return;
    }

    isClosingRef.current = true;
    setIsVisible(false);
    closeTimeoutRef.current = window.setTimeout(
      afterClose ?? onCloseRef.current,
      BOTTOM_SHEET_TRANSITION_MS
    );
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const showBottomSheet = () => {
      if (!isClosingRef.current) {
        setIsVisible(true);
      }
    };
    const supportsAnimationFrame = typeof window.requestAnimationFrame === 'function';
    const openAnimationId = supportsAnimationFrame
      ? window.requestAnimationFrame(showBottomSheet)
      : window.setTimeout(showBottomSheet, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeBottomSheet();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (supportsAnimationFrame) {
        window.cancelAnimationFrame(openAnimationId);
      } else {
        window.clearTimeout(openAnimationId);
      }
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeBottomSheet]);

  return { closeBottomSheet, isVisible };
};
