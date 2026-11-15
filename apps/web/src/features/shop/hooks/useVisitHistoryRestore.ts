import { useCallback, useLayoutEffect, useRef } from 'react';

import type { PlaceVisitResponse } from '@/features/shop/apis/dto';

import type { RefObject } from 'react';

type VisitHistoryRestoreOptions = {
  scrollRootRef: RefObject<HTMLElement | null>;
  stickyHeaderRef: RefObject<HTMLElement | null>;
  restoreStatusRef?: RefObject<HTMLElement | null>;
  scrollToDate?: string;
  scrollToConsumptionId?: number;
  isRestoreTargetPending?: boolean;
  restoreScrollTop?: number;
  visits: readonly PlaceVisitResponse[];
  loadedPageCount: number;
  isLoading: boolean;
  isError: boolean;
  isFetchNextPageError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
};

/** 최신 복귀 날짜까지만 페이지를 읽어 한 번 복원하며, 대기 중 직접 스크롤하면 중단합니다. */
export const useVisitHistoryRestore = ({
  scrollRootRef,
  stickyHeaderRef,
  restoreStatusRef,
  scrollToDate,
  scrollToConsumptionId,
  isRestoreTargetPending = false,
  restoreScrollTop,
  visits,
  loadedPageCount,
  isLoading,
  isError,
  isFetchNextPageError,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
}: VisitHistoryRestoreOptions) => {
  const restoredTarget = useRef<string | null>(null);
  const cancelledTarget = useRef<string | null>(null);
  const lastRequestedPage = useRef<string | null>(null);
  const initialScrollTopRef = useRef(0);
  const reveal = useCallback(() => {
    scrollRootRef.current?.style.removeProperty('visibility');
    if (restoreStatusRef?.current) restoreStatusRef.current.hidden = true;
  }, [scrollRootRef, restoreStatusRef]);

  useLayoutEffect(() => {
    const root = scrollRootRef.current;
    if (!root) return;
    if (!scrollToDate && !scrollToConsumptionId && restoreScrollTop === undefined) {
      reveal();
      return;
    }
    const targetKey = `${scrollToConsumptionId ?? ''}:${scrollToDate ?? ''}:${restoreScrollTop ?? ''}`;
    if (restoredTarget.current === targetKey) return;
    root.style.visibility = 'hidden';
    if (restoreStatusRef?.current) restoreStatusRef.current.hidden = false;
    cancelledTarget.current = null;
    const initialScrollTop = root.scrollTop;
    initialScrollTopRef.current = initialScrollTop;
    const handleScroll = (event: Event) => {
      if (event.target !== root || restoredTarget.current === targetKey) return;
      if (root.scrollTop !== initialScrollTop) {
        cancelledTarget.current = targetKey;
        reveal();
      }
    };
    root.addEventListener('scroll', handleScroll, { passive: true });
    return () => root.removeEventListener('scroll', handleScroll);
  }, [
    scrollRootRef,
    scrollToDate,
    scrollToConsumptionId,
    restoreScrollTop,
    restoreStatusRef,
    reveal,
  ]);

  useLayoutEffect(() => {
    const root = scrollRootRef.current;
    const targetKey = `${scrollToConsumptionId ?? ''}:${scrollToDate ?? ''}:${restoreScrollTop ?? ''}`;
    if (isError || isFetchNextPageError) reveal();
    if (
      !root ||
      (!scrollToDate && !scrollToConsumptionId && restoreScrollTop === undefined) ||
      restoredTarget.current === targetKey ||
      cancelledTarget.current === targetKey ||
      isRestoreTargetPending ||
      isLoading ||
      isError ||
      isFetchNextPageError
    )
      return;
    // NOTE: scroll 이벤트보다 다음 페이지 렌더링이 먼저 도착해도 이동한 위치를 지킵니다.
    if (root.scrollTop !== initialScrollTopRef.current) {
      cancelledTarget.current = targetKey;
      reveal();
      return;
    }
    if (
      restoreScrollTop !== undefined &&
      (!hasNextPage || root.scrollHeight - root.clientHeight >= restoreScrollTop)
    ) {
      restoredTarget.current = targetKey;
      root.scrollTop = restoreScrollTop;
      reveal();
      root.dispatchEvent(new Event('scroll'));
      return;
    }
    const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-visit-id]'));
    const row = scrollToConsumptionId
      ? rows.find((item) => item.dataset.visitId === String(scrollToConsumptionId))
      : rows.find((item) => item.dataset.visitDate === scrollToDate);
    const lastLoadedDate = visits.at(-1)?.visitedAt?.slice(0, 10);
    const hasPassedTargetDate = Boolean(
      scrollToDate && lastLoadedDate && lastLoadedDate < scrollToDate
    );
    const canLoadMore = hasNextPage && (restoreScrollTop !== undefined || !hasPassedTargetDate);
    const fallback =
      !canLoadMore && scrollToDate
        ? rows.find((item) => item.dataset.visitDate === scrollToDate)
        : undefined;
    const target = row ?? fallback;
    if (target && restoreScrollTop === undefined) {
      restoredTarget.current = targetKey;
      root.scrollTop = Math.max(
        0,
        root.scrollTop +
          target.getBoundingClientRect().top -
          root.getBoundingClientRect().top -
          (stickyHeaderRef.current?.getBoundingClientRect().height ?? 0)
      );
      root.dispatchEvent(new Event('scroll'));
      reveal();
    } else if (canLoadMore && !isFetchingNextPage) {
      const pageKey = `${targetKey}:${loadedPageCount}`;
      if (lastRequestedPage.current === pageKey) return;
      lastRequestedPage.current = pageKey;
      onLoadMore();
    } else if (!canLoadMore) {
      reveal();
    }
  }, [
    scrollRootRef,
    stickyHeaderRef,
    scrollToDate,
    scrollToConsumptionId,
    isRestoreTargetPending,
    restoreScrollTop,
    visits,
    loadedPageCount,
    isLoading,
    isError,
    isFetchNextPageError,
    isFetchingNextPage,
    hasNextPage,
    onLoadMore,
    reveal,
  ]);
};
