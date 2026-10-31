import { useCallback, useEffect, useRef } from 'react';

import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

const EXIT_DURATION_MS = 140;
const EXIT_OFFSET_PX = 12;
const EXIT_EASING = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

type UseSelectedPlaceExpandTransitionOptions = {
  placeId?: string;
  onExpanded?: (placeId: string) => void;
};

/** 시트 크기를 유지하며 위로 살짝 이동해 사라진 뒤 상세로 이동합니다. 선택 변경·언마운트 시 취소합니다. */
export const useSelectedPlaceExpandTransition = ({
  placeId,
  onExpanded,
}: UseSelectedPlaceExpandTransitionOptions) => {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<Animation | null>(null);
  const hasRequestedExpandRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(
    () => () => {
      hasRequestedExpandRef.current = false;
      const animation = animationRef.current;
      animationRef.current = null;
      if (animation) {
        animation.onfinish = null;
        animation.oncancel = null;
        animation.cancel();
      }
    },
    [placeId, onExpanded]
  );

  const expandSelectedPlace = useCallback(() => {
    if (!placeId || !onExpanded || hasRequestedExpandRef.current) return;
    hasRequestedExpandRef.current = true;

    const sheet = sheetRef.current;
    const height = sheet?.getBoundingClientRect().height ?? 0;
    if (prefersReducedMotion || !sheet || !sheet.animate || height <= 0) {
      onExpanded(placeId);
      return;
    }

    const animation = sheet.animate(
      [
        {
          height: `${height}px`,
          transform: 'translateY(0)',
          opacity: 1,
        },
        {
          height: `${height}px`,
          transform: `translateY(-${EXIT_OFFSET_PX}px)`,
          opacity: 0,
        },
      ],
      { duration: EXIT_DURATION_MS, easing: EXIT_EASING, fill: 'forwards' }
    );
    animationRef.current = animation;
    animation.onfinish = () => {
      if (animationRef.current !== animation) return;
      animation.onfinish = null;
      onExpanded(placeId);
    };
    animation.oncancel = () => {
      if (animationRef.current !== animation) return;
      animationRef.current = null;
      hasRequestedExpandRef.current = false;
    };
  }, [onExpanded, placeId, prefersReducedMotion]);

  return { sheetRef, expandSelectedPlace };
};
