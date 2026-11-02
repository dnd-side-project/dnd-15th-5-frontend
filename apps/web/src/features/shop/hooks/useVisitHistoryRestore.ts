import { useLayoutEffect, useRef } from 'react';

import type { PlaceVisitResponse } from '@/features/shop/apis/dto';

import type { RefObject } from 'react';

type VisitHistoryRestoreOptions = {
  scrollRootRef: RefObject<HTMLElement | null>;
  stickyHeaderRef: RefObject<HTMLElement | null>;
  scrollToDate?: string;
  scrollToConsumptionId?: number;
  visits: readonly PlaceVisitResponse[];
  loadedPageCount: number;
  isLoading: boolean;
  isError: boolean;
  isFetchNextPageError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
};

/** 캐시가 없어도 수정한 방문까지 페이지를 읽고 고정 헤더 아래로 한 번 복원합니다. */
export const useVisitHistoryRestore = ({
  scrollRootRef,
  stickyHeaderRef,
  scrollToDate,
  scrollToConsumptionId,
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
  const lastRequestedPage = useRef<string | null>(null);
  useLayoutEffect(() => {
    const root = scrollRootRef.current;
    const targetKey = `${scrollToConsumptionId ?? ''}:${scrollToDate ?? ''}`;
    if (
      !root ||
      (!scrollToDate && !scrollToConsumptionId) ||
      restoredTarget.current === targetKey ||
      isLoading ||
      isError ||
      isFetchNextPageError
    )
      return;
    const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-visit-id]'));
    const row = scrollToConsumptionId
      ? rows.find((item) => item.dataset.visitId === String(scrollToConsumptionId))
      : rows.find((item) => item.dataset.visitDate === scrollToDate);
    const fallback =
      !hasNextPage && scrollToDate
        ? rows.find((item) => item.dataset.visitDate === scrollToDate)
        : undefined;
    const target = row ?? fallback;
    if (target) {
      root.scrollTop = Math.max(
        0,
        root.scrollTop +
          target.getBoundingClientRect().top -
          root.getBoundingClientRect().top -
          (stickyHeaderRef.current?.getBoundingClientRect().height ?? 0)
      );
      restoredTarget.current = targetKey;
      root.dispatchEvent(new Event('scroll'));
    } else if (hasNextPage && !isFetchingNextPage) {
      const pageKey = `${targetKey}:${loadedPageCount}`;
      if (lastRequestedPage.current === pageKey) return;
      lastRequestedPage.current = pageKey;
      onLoadMore();
    }
  }, [
    scrollRootRef,
    stickyHeaderRef,
    scrollToDate,
    scrollToConsumptionId,
    visits,
    loadedPageCount,
    isLoading,
    isError,
    isFetchNextPageError,
    isFetchingNextPage,
    hasNextPage,
    onLoadMore,
  ]);
};
