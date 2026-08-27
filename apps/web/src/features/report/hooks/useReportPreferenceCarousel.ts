import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import type {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  TransitionEvent,
} from 'react';

type UseReportPreferenceCarouselOptions = {
  cardIds: readonly string[];
  onCardSelect: (index: number) => void;
  onTransitionChange?: (isTransitioning: boolean) => void;
  selectedCardIndex: number;
};

type CarouselDragState = {
  hasStartedDrag: boolean;
  pointerId: number;
  startX: number;
};

/** 카드 변경, 클릭 차단, transition 누락 보완에 사용하는 드래그 기준값입니다. */
const CARD_CHANGE_DRAG_THRESHOLD = 10;
const CLICK_SUPPRESSION_DRAG_THRESHOLD = 6;
const CARD_SETTLE_FALLBACK_DURATION = 700;

/** 월간 취향 카드의 한 장 단위 드래그와 안착 동작을 관리합니다. */
export const useReportPreferenceCarousel = ({
  cardIds,
  onCardSelect,
  onTransitionChange,
  selectedCardIndex,
}: UseReportPreferenceCarouselOptions) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardIdsRef = useRef(cardIds);
  const dragStateRef = useRef<CarouselDragState | null>(null);
  const dragDistanceRef = useRef(0);
  const displayedCardIdRef = useRef(cardIds[selectedCardIndex]);
  const isTransitioningRef = useRef(false);
  const settleFallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressClickUntilRef = useRef(0);

  const endTransition = useCallback(() => {
    if (!isTransitioningRef.current) return;

    isTransitioningRef.current = false;
    onTransitionChange?.(false);
  }, [onTransitionChange]);

  const completeCardSettle = useCallback(() => {
    if (settleFallbackTimeoutRef.current !== null) {
      clearTimeout(settleFallbackTimeoutRef.current);
      settleFallbackTimeoutRef.current = null;
    }

    carouselRef.current?.removeAttribute('data-settling');
    endTransition();
  }, [endTransition]);

  const scheduleSettleFallback = useCallback(() => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    settleFallbackTimeoutRef.current = setTimeout(
      completeCardSettle,
      prefersReducedMotion ? 0 : CARD_SETTLE_FALLBACK_DURATION
    );
  }, [completeCardSettle]);

  const stopCardAnimation = useCallback(() => {
    completeCardSettle();
  }, [completeCardSettle]);

  const displayCard = useCallback((index: number) => {
    const carousel = carouselRef.current;
    const cardId = cardIdsRef.current[index];
    if (!carousel || !cardId) return;

    displayedCardIdRef.current = cardId;

    Array.from(carousel.children).forEach((card, cardIndex) => {
      const isCurrent = cardIndex === index;
      card.classList.toggle('report-preference-carousel-card--current', isCurrent);
      card.classList.toggle('report-preference-carousel-card--left', cardIndex < index);
      card.classList.toggle('report-preference-carousel-card--right', cardIndex > index);
      card.setAttribute('aria-hidden', String(!isCurrent));

      if (isCurrent) {
        card.setAttribute('aria-current', 'true');
      } else {
        card.removeAttribute('aria-current');
      }
    });
  }, []);

  const resetDragOffset = () => {
    carouselRef.current?.style.setProperty('--report-card-drag-offset', '0px');
  };

  const settleCard = useCallback(
    (index: number, shouldSelect: boolean) => {
      const carousel = carouselRef.current;
      if (!carousel) return;

      stopCardAnimation();
      displayCard(index);
      resetDragOffset();
      carousel.removeAttribute('data-dragging');
      carousel.dataset.settling = 'true';

      if (shouldSelect) {
        isTransitioningRef.current = true;
        onTransitionChange?.(true);
        onCardSelect(index);
      }

      scheduleSettleFallback();
    },
    [displayCard, onCardSelect, onTransitionChange, scheduleSettleFallback, stopCardAnimation]
  );

  const cardIdSignature = cardIds.join('|');
  const selectedCardId = cardIds[selectedCardIndex];

  useLayoutEffect(() => {
    cardIdsRef.current = cardIds;
  });

  useLayoutEffect(() => {
    if (!selectedCardId) return;

    const isSameDisplayedCard = displayedCardIdRef.current === selectedCardId;
    displayCard(selectedCardIndex);

    if (!isSameDisplayedCard) {
      const carousel = carouselRef.current;
      resetDragOffset();
      carousel?.setAttribute('data-settling', 'true');

      scheduleSettleFallback();

      return () => {
        completeCardSettle();
      };
    }
  }, [
    cardIdSignature,
    completeCardSettle,
    displayCard,
    scheduleSettleFallback,
    selectedCardId,
    selectedCardIndex,
  ]);

  useEffect(() => stopCardAnimation, [stopCardAnimation]);

  const getDisplayedCardIndex = () => {
    const displayedCardIndex = cardIdsRef.current.indexOf(displayedCardIdRef.current ?? '');
    return displayedCardIndex >= 0 ? displayedCardIndex : selectedCardIndex;
  };

  const finishDrag = (targetIndex: number) => {
    dragStateRef.current = null;
    settleCard(targetIndex, targetIndex !== selectedCardIndex);
  };

  const handleCarouselPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;

    stopCardAnimation();
    dragStateRef.current = {
      hasStartedDrag: false,
      pointerId: event.pointerId,
      startX: event.clientX,
    };
    dragDistanceRef.current = 0;
  };

  const handleCarouselPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const dragDistance = event.clientX - dragState.startX;
    const displayedCardIndex = getDisplayedCardIndex();
    const canMoveRight = displayedCardIndex > 0;
    const canMoveLeft = displayedCardIndex < cardIdsRef.current.length - 1;
    const maxDragDistance = event.currentTarget.clientWidth * 0.8;
    const boundedDragDistance =
      (!canMoveRight && dragDistance > 0) || (!canMoveLeft && dragDistance < 0)
        ? 0
        : Math.min(Math.max(dragDistance, -maxDragDistance), maxDragDistance);

    dragDistanceRef.current = boundedDragDistance;

    if (!dragState.hasStartedDrag) {
      if (Math.abs(boundedDragDistance) < CLICK_SUPPRESSION_DRAG_THRESHOLD) return;

      dragState.hasStartedDrag = true;
      event.currentTarget.dataset.dragging = 'true';
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    event.currentTarget.style.setProperty('--report-card-drag-offset', `${boundedDragDistance}px`);
  };

  const handleCarouselPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const dragDistance = dragDistanceRef.current;
    const displayedCardIndex = getDisplayedCardIndex();
    const hasPassedThreshold =
      dragState.hasStartedDrag && Math.abs(dragDistance) >= CARD_CHANGE_DRAG_THRESHOLD;
    const direction = dragDistance < 0 ? 1 : -1;
    const targetIndex = hasPassedThreshold
      ? Math.min(Math.max(displayedCardIndex + direction, 0), cardIdsRef.current.length - 1)
      : displayedCardIndex;

    if (dragState.hasStartedDrag) {
      suppressClickUntilRef.current = Date.now() + 300;
    }

    finishDrag(targetIndex);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleCarouselPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) return;

    finishDrag(getDisplayedCardIndex());
  };

  const handleCarouselLostPointerCapture = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) return;

    finishDrag(getDisplayedCardIndex());
  };

  const handleCarouselClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (Date.now() >= suppressClickUntilRef.current) return;

    event.preventDefault();
    event.stopPropagation();
  };

  const handleCarouselTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (
      event.propertyName !== 'transform' ||
      !(event.target instanceof HTMLElement) ||
      !event.target.classList.contains('report-preference-carousel-card--current')
    ) {
      return;
    }

    completeCardSettle();
  };

  const handleCarouselKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    const direction = event.key === 'ArrowLeft' ? -1 : 1;
    const displayedCardIndex = getDisplayedCardIndex();
    const targetIndex = Math.min(
      Math.max(displayedCardIndex + direction, 0),
      cardIdsRef.current.length - 1
    );
    if (targetIndex === displayedCardIndex) return;

    event.preventDefault();
    settleCard(targetIndex, true);
  };

  return {
    carouselRef,
    carouselStyle: { '--report-card-drag-offset': '0px' } as CSSProperties,
    handleCarouselClickCapture,
    handleCarouselKeyDown,
    handleCarouselLostPointerCapture,
    handleCarouselPointerCancel,
    handleCarouselPointerDown,
    handleCarouselPointerMove,
    handleCarouselPointerUp,
    handleCarouselTransitionEnd,
  };
};
