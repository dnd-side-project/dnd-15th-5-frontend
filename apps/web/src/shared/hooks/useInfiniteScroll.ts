import { useEffect, useRef } from 'react';

import type { RefObject } from 'react';

type UseInfiniteScrollOptions = {
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  isLoadMoreError?: boolean;
  onLoadMore: () => unknown;
  rootRef?: RefObject<Element | null>;
  rootMargin?: string;
};

/** 목록 끝이 뷰포트에 가까워지면 다음 페이지를 요청할 수 있는 감지 요소 ref를 반환합니다. */
export const useInfiniteScroll = ({
  hasNextPage,
  isFetchingNextPage,
  isLoadMoreError = false,
  onLoadMore,
  rootRef,
  rootMargin = '120px 0px',
}: UseInfiniteScrollOptions) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;
    if (!loadMoreElement || !hasNextPage || isFetchingNextPage || isLoadMoreError) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void onLoadMore();
      },
      { root: rootRef?.current, rootMargin }
    );

    observer.observe(loadMoreElement);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isLoadMoreError, onLoadMore, rootMargin, rootRef]);

  return loadMoreRef;
};
