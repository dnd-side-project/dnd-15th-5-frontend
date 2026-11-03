import { useLayoutEffect, useRef } from 'react';

import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import type { HomeBottomSheetTab } from '@/features/map/stores/homeBottomSheetStore';

import type { KeyboardEvent, UIEvent } from 'react';

const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);

/**
 * 홈 시트의 선택 탭과 탭별 스크롤·포커스를 복원합니다.
 * 목록 높이가 늦게 확보되면 복원을 재시도하며, 복원 완료 또는 직접 스크롤 시 관찰을 중단합니다.
 */
export const useHomeBottomSheetTabs = (isHomeSheet: boolean) => {
  const tab = useHomeBottomSheetStore((state) => state.tab);
  const setTab = useHomeBottomSheetStore((state) => state.setTab);
  const setScrollPosition = useHomeBottomSheetStore((state) => state.setScrollPosition);
  const contentRootRef = useRef<HTMLDivElement>(null);
  const pendingScrollTopRef = useRef<number | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const shouldRestoreFocusRef = useRef(false);

  const handleScrollIntent = () => {
    pendingScrollTopRef.current = null;
    observerRef.current?.disconnect();
    observerRef.current = null;
  };

  useLayoutEffect(() => {
    if (!isHomeSheet) return;

    const contentRoot = contentRootRef.current;
    const scrollContainer = contentRoot?.parentElement;
    if (!scrollContainer || !contentRoot) return;

    pendingScrollTopRef.current = useHomeBottomSheetStore.getState().scrollPositions[tab];
    const restoreScrollPosition = () => {
      const scrollTop = pendingScrollTopRef.current;
      if (scrollTop === null) return;

      scrollContainer.scrollTop = scrollTop;
      if (Math.abs(scrollContainer.scrollTop - scrollTop) < 1) {
        pendingScrollTopRef.current = null;
        observerRef.current?.disconnect();
        observerRef.current = null;
      }
    };
    restoreScrollPosition();

    if (pendingScrollTopRef.current !== null && typeof ResizeObserver !== 'undefined') {
      observerRef.current = new ResizeObserver(restoreScrollPosition);
      observerRef.current.observe(contentRoot);
      observerRef.current.observe(scrollContainer);
    }

    if (shouldRestoreFocusRef.current) {
      shouldRestoreFocusRef.current = false;
      contentRoot
        .querySelector<HTMLElement>('[data-active-tab-panel="true"] [data-pressed]')
        ?.focus({ preventScroll: true });
    }

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      pendingScrollTopRef.current = null;
    };
  }, [isHomeSheet, tab]);

  const handleTabChange = (nextTab: HomeBottomSheetTab) => {
    const scrollContainer = contentRootRef.current?.parentElement;
    if (scrollContainer && pendingScrollTopRef.current === null) {
      setScrollPosition(tab, scrollContainer.scrollTop);
    }
    shouldRestoreFocusRef.current = true;
    setTab(nextTab);
  };

  const handleContentScroll = (event: UIEvent<HTMLDivElement>) => {
    if (pendingScrollTopRef.current === null) {
      setScrollPosition(tab, event.currentTarget.scrollTop);
    }
  };

  const handleContentKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!event.defaultPrevented && SCROLL_KEYS.has(event.key)) handleScrollIntent();
  };

  return {
    tab,
    contentRootRef,
    handleTabChange,
    handleContentScroll,
    handleScrollIntent,
    handleContentKeyDown,
  };
};
