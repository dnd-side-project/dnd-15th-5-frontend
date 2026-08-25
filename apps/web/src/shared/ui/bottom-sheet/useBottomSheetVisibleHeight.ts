import { useLayoutEffect, useRef } from 'react';

import { BOTTOM_SHEET_TRANSITION_MS } from './constants';

import type { RefObject } from 'react';

type UseBottomSheetVisibleHeightOptions = {
  elementRef: RefObject<HTMLDivElement | null>;
  isHidden: boolean;
  onVisibleHeightChange?: (heightPx: number) => void;
};

const getTransitionProperty = (event: TransitionEvent) => event.propertyName || 'unknown';

/**
 * 바텀시트가 화면에 실제로 노출된 높이를 측정해 외부 레이아웃과 동기화합니다.
 *
 * 드래그·콘텐츠 크기 변경은 `ResizeObserver`로 측정하고, CSS 스냅 전환 중에는 변환된 요소의
 * 위치를 프레임마다 읽습니다. 따라서 시트 위에 배치된 컨트롤이 열림·닫힘 애니메이션 도중에도
 * 핸들과 일정한 간격을 유지할 수 있습니다.
 */
export const useBottomSheetVisibleHeight = ({
  elementRef,
  isHidden,
  onVisibleHeightChange,
}: UseBottomSheetVisibleHeightOptions) => {
  const previousIsHiddenRef = useRef<boolean | undefined>(undefined);

  useLayoutEffect(() => {
    const sheetElement = elementRef.current;
    if (!sheetElement || !onVisibleHeightChange) {
      return;
    }

    const hasVisibilityChanged =
      previousIsHiddenRef.current !== undefined && previousIsHiddenRef.current !== isHidden;
    previousIsHiddenRef.current = isHidden;

    let animationFrameId: number | null = null;
    let transitionFallbackTimerId: number | null = null;
    let isTrackingTransition = false;
    const activeTransitionProperties = new Set<string>();

    const reportFinalHeight = () => {
      const height = isHidden ? 0 : sheetElement.getBoundingClientRect().height;
      onVisibleHeightChange(height);
    };

    const reportAnimatedHeight = () => {
      const rect = sheetElement.getBoundingClientRect();
      const visibleHeight = Math.max(0, Math.min(rect.height, window.innerHeight - rect.top));
      onVisibleHeightChange(visibleHeight);
    };

    const stopTrackingTransition = () => {
      isTrackingTransition = false;
      activeTransitionProperties.clear();

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      if (transitionFallbackTimerId !== null) {
        window.clearTimeout(transitionFallbackTimerId);
        transitionFallbackTimerId = null;
      }
    };

    const trackTransitionFrame = () => {
      reportAnimatedHeight();
      animationFrameId = window.requestAnimationFrame(trackTransitionFrame);
    };

    const handleTransitionRun = (event: TransitionEvent) => {
      if (event.target !== sheetElement) {
        return;
      }

      activeTransitionProperties.add(getTransitionProperty(event));

      if (isTrackingTransition) {
        return;
      }

      isTrackingTransition = true;
      trackTransitionFrame();
    };

    const handleTransitionFinish = (event: TransitionEvent) => {
      if (event.target !== sheetElement) {
        return;
      }

      activeTransitionProperties.delete(getTransitionProperty(event));
      if (activeTransitionProperties.size > 0) {
        return;
      }

      stopTrackingTransition();
      reportFinalHeight();
    };

    sheetElement.addEventListener('transitionrun', handleTransitionRun);
    sheetElement.addEventListener('transitionend', handleTransitionFinish);
    sheetElement.addEventListener('transitioncancel', handleTransitionFinish);

    if (hasVisibilityChanged) {
      // NOTE: 브라우저나 사용자 모션 설정에 따라 transition 이벤트가 생략돼도 최종 높이는 복구한다.
      transitionFallbackTimerId = window.setTimeout(() => {
        if (!isTrackingTransition) {
          reportFinalHeight();
        }
      }, BOTTOM_SHEET_TRANSITION_MS);
    } else {
      reportFinalHeight();
    }

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            if (isTrackingTransition) {
              reportAnimatedHeight();
              return;
            }

            reportFinalHeight();
          });
    resizeObserver?.observe(sheetElement);

    return () => {
      stopTrackingTransition();
      resizeObserver?.disconnect();
      sheetElement.removeEventListener('transitionrun', handleTransitionRun);
      sheetElement.removeEventListener('transitionend', handleTransitionFinish);
      sheetElement.removeEventListener('transitioncancel', handleTransitionFinish);
    };
  }, [elementRef, isHidden, onVisibleHeightChange]);
};
