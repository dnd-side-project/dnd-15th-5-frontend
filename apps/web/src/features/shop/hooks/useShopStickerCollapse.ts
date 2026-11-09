import { useEffect } from 'react';

import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

import type { RefObject } from 'react';

const COLLAPSE_THRESHOLD = 64;
const REOPEN_THRESHOLD = 16;
const COLLAPSE_DURATION_MS = 260;
const WHEEL_IDLE_MS = 160;
const WHEEL_LINE_HEIGHT = 16;

type UseShopStickerCollapseParams = {
  scrollRootRef: RefObject<HTMLDivElement | null>;
  informationPanelRef: RefObject<HTMLDivElement | null>;
};

/** 일정 거리 스크롤하면 스티커를 한 번에 접고 가게 정보 상단에 정착합니다. */
export const useShopStickerCollapse = ({
  scrollRootRef,
  informationPanelRef,
}: UseShopStickerCollapseParams) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const root = scrollRootRef.current;
    const panel = informationPanelRef.current;
    if (!root || !panel) return;

    let hasCollapsed = root.scrollTop >= COLLAPSE_THRESHOLD;
    let frame: number | null = null;
    let isWheelBlocked = false;
    let lastWheelAt = Number.NEGATIVE_INFINITY;
    let touchStart: { x: number; y: number } | null = null;

    const cancelTransition = () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
    };

    const collapse = () => {
      const start = root.scrollTop;
      const target = Math.min(
        start + panel.getBoundingClientRect().top - root.getBoundingClientRect().top,
        root.scrollHeight - root.clientHeight
      );
      hasCollapsed = true;
      if (target <= start) return;
      if (prefersReducedMotion) {
        root.scrollTop = target;
        return;
      }
      const startedAt = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, Math.max(0, (now - startedAt) / COLLAPSE_DURATION_MS));
        root.scrollTop = start + (target - start) * (1 - (1 - progress) ** 3);
        if (progress < 1) frame = window.requestAnimationFrame(tick);
        else frame = null;
      };
      frame = window.requestAnimationFrame(tick);
    };

    const handleScroll = () => {
      if (frame !== null) return;
      if (root.scrollTop <= REOPEN_THRESHOLD) hasCollapsed = false;
      if (!hasCollapsed && root.scrollTop >= COLLAPSE_THRESHOLD) collapse();
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (event.deltaY < 0) {
        cancelTransition();
        isWheelBlocked = false;
        return;
      }
      if (event.deltaY === 0 || !event.cancelable) return;
      const now = performance.now();
      if (frame === null && now - lastWheelAt >= WHEEL_IDLE_MS) isWheelBlocked = false;
      lastWheelAt = now;
      if (frame !== null || isWheelBlocked) {
        event.preventDefault();
        isWheelBlocked = true;
        return;
      }
      const delta =
        event.deltaY *
        (event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? WHEEL_LINE_HEIGHT
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? root.clientHeight
            : 1);
      if (!hasCollapsed && root.scrollTop + delta >= COLLAPSE_THRESHOLD) {
        event.preventDefault();
        isWheelBlocked = true;
        collapse();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      const point = event.touches.length === 1 ? event.touches[0] : undefined;
      touchStart = point ? { x: point.clientX, y: point.clientY } : null;
    };
    const handleTouchMove = (event: TouchEvent) => {
      const point = event.touches[0];
      if (!touchStart || !point || event.touches.length !== 1) return;
      const deltaX = point.clientX - touchStart.x;
      const deltaY = point.clientY - touchStart.y;
      if (frame !== null && Math.abs(deltaY) > Math.abs(deltaX) && event.cancelable)
        event.preventDefault();
    };

    root.addEventListener('scroll', handleScroll, { passive: true });
    root.addEventListener('wheel', handleWheel, { passive: false });
    root.addEventListener('touchstart', handleTouchStart, { passive: true });
    root.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      cancelTransition();
      root.removeEventListener('scroll', handleScroll);
      root.removeEventListener('wheel', handleWheel);
      root.removeEventListener('touchstart', handleTouchStart);
      root.removeEventListener('touchmove', handleTouchMove);
    };
  }, [scrollRootRef, informationPanelRef, prefersReducedMotion]);
};
