import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';

type UseReportPreferenceCarouselOptions = {
  cardCount: number;
  onCardSelect: (index: number) => void;
  selectedCardIndex: number;
};

type CarouselDragState = {
  hasStartedDrag: boolean;
  pointerId: number;
  startScrollLeft: number;
  startX: number;
};

const CARD_CHANGE_DRAG_THRESHOLD = 56;
const CLICK_SUPPRESSION_DRAG_THRESHOLD = 6;
const CARD_SETTLE_DURATION = 460;

const getCardScrollLeft = (carousel: HTMLDivElement, index: number) => {
  const cardSlot = carousel.children[index] as HTMLElement | undefined;
  const card = cardSlot?.firstElementChild as HTMLElement | undefined;

  if (!cardSlot || !card) return null;

  return cardSlot.offsetLeft - (carousel.clientWidth - card.offsetWidth) / 2;
};

const getEaseOutBackProgress = (progress: number) => {
  const overshoot = 1.1;
  const shiftedProgress = progress - 1;

  return 1 + (overshoot + 1) * shiftedProgress ** 3 + overshoot * shiftedProgress ** 2;
};

/** 월간 취향 카드의 한 장 단위 드래그와 스프링 안착 동작을 관리합니다. */
export const useReportPreferenceCarousel = ({
  cardCount,
  onCardSelect,
  selectedCardIndex,
}: UseReportPreferenceCarouselOptions) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<CarouselDragState | null>(null);
  const dragDistanceRef = useRef(0);
  const hasPositionedCarouselRef = useRef(false);
  const scrollAnimationFrameRef = useRef<number | null>(null);
  const suppressClickUntilRef = useRef(0);

  const stopScrollAnimation = useCallback(() => {
    if (scrollAnimationFrameRef.current !== null) {
      cancelAnimationFrame(scrollAnimationFrameRef.current);
      scrollAnimationFrameRef.current = null;
    }

    carouselRef.current?.removeAttribute('data-settling');
  }, []);

  const scrollToCard = useCallback(
    (index: number, shouldAnimate = true) => {
      const carousel = carouselRef.current;
      if (!carousel) return;

      const targetScrollLeft = getCardScrollLeft(carousel, index);
      if (targetScrollLeft === null) return;

      stopScrollAnimation();

      const startScrollLeft = carousel.scrollLeft;
      const scrollDistance = targetScrollLeft - startScrollLeft;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!shouldAnimate || prefersReducedMotion || Math.abs(scrollDistance) < 1) {
        carousel.scrollLeft = targetScrollLeft;
        return;
      }

      let startTime: number | null = null;
      carousel.dataset.settling = 'true';

      const animateScroll = (currentTime: number) => {
        startTime ??= currentTime;
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / CARD_SETTLE_DURATION, 1);

        carousel.scrollLeft = startScrollLeft + scrollDistance * getEaseOutBackProgress(progress);

        if (progress < 1) {
          scrollAnimationFrameRef.current = requestAnimationFrame(animateScroll);
          return;
        }

        scrollAnimationFrameRef.current = null;
        carousel.removeAttribute('data-settling');
      };

      scrollAnimationFrameRef.current = requestAnimationFrame(animateScroll);
    },
    [stopScrollAnimation]
  );

  useLayoutEffect(() => {
    scrollToCard(selectedCardIndex, hasPositionedCarouselRef.current);
    hasPositionedCarouselRef.current = true;
  }, [scrollToCard, selectedCardIndex]);

  useEffect(() => stopScrollAnimation, [stopScrollAnimation]);

  const finishDrag = (targetIndex: number) => {
    dragStateRef.current = null;
    carouselRef.current?.removeAttribute('data-dragging');

    if (targetIndex === selectedCardIndex) {
      scrollToCard(selectedCardIndex);
      return;
    }

    onCardSelect(targetIndex);
  };

  const handleCarouselPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;

    const carousel = event.currentTarget;
    stopScrollAnimation();
    dragStateRef.current = {
      hasStartedDrag: false,
      pointerId: event.pointerId,
      startScrollLeft: carousel.scrollLeft,
      startX: event.clientX,
    };
    dragDistanceRef.current = 0;
  };

  const handleCarouselPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const dragDistance = event.clientX - dragState.startX;
    dragDistanceRef.current = dragDistance;

    if (!dragState.hasStartedDrag) {
      if (Math.abs(dragDistance) < CLICK_SUPPRESSION_DRAG_THRESHOLD) return;

      dragState.hasStartedDrag = true;
      event.currentTarget.dataset.dragging = 'true';
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    event.currentTarget.scrollLeft = dragState.startScrollLeft - dragDistance;
  };

  const handleCarouselPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const dragDistance = dragDistanceRef.current;
    const hasPassedThreshold =
      dragState.hasStartedDrag && Math.abs(dragDistance) >= CARD_CHANGE_DRAG_THRESHOLD;
    const direction = dragDistance < 0 ? 1 : -1;
    const targetIndex = hasPassedThreshold
      ? Math.min(Math.max(selectedCardIndex + direction, 0), cardCount - 1)
      : selectedCardIndex;

    if (dragState.hasStartedDrag) {
      suppressClickUntilRef.current = Date.now() + 300;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishDrag(targetIndex);
  };

  const handleCarouselPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) return;

    finishDrag(selectedCardIndex);
  };

  const handleCarouselClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (Date.now() >= suppressClickUntilRef.current) return;

    event.preventDefault();
    event.stopPropagation();
  };

  const handleCarouselKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    const direction = event.key === 'ArrowLeft' ? -1 : 1;
    const targetIndex = Math.min(Math.max(selectedCardIndex + direction, 0), cardCount - 1);
    if (targetIndex === selectedCardIndex) return;

    event.preventDefault();
    onCardSelect(targetIndex);
  };

  return {
    carouselRef,
    handleCarouselClickCapture,
    handleCarouselKeyDown,
    handleCarouselPointerCancel,
    handleCarouselPointerDown,
    handleCarouselPointerMove,
    handleCarouselPointerUp,
  };
};
