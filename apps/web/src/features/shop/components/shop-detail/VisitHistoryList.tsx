import type { PlaceVisitResponse } from '@/features/shop/apis/dto';
import { formatVisitAmount, formatVisitDate } from '@/features/shop/utils/formatVisit';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';

import type { RefObject } from 'react';

type VisitHistoryListProps = {
  hasNextPage: boolean;
  isError: boolean;
  isFetchNextPageError: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  scrollRootRef: RefObject<HTMLElement | null>;
  visits: readonly PlaceVisitResponse[];
};

export default function VisitHistoryList({
  hasNextPage,
  isError,
  isFetchNextPageError,
  isFetchingNextPage,
  isLoading,
  onLoadMore,
  onRetry,
  scrollRootRef,
  visits,
}: VisitHistoryListProps) {
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    isLoadMoreError: isError || isFetchNextPageError,
    onLoadMore,
    rootRef: scrollRootRef,
  });

  return (
    <section aria-labelledby="visit-history-title" className="mt-8 pb-8">
      <h2 id="visit-history-title" className="text-title-02-semibold text-neutral-700">
        방문 기록
      </h2>

      {isLoading && (
        <div role="status" aria-label="방문 기록 불러오는 중" className="flex justify-center py-10">
          <Spinner className="size-6 text-primary-500" />
        </div>
      )}

      {!isLoading && isError && (
        <div className="flex flex-col items-center py-8 text-body-02-regular text-neutral-500">
          방문 기록을 불러오지 못했어요.
          <Button variant="primary" size="small" className="mt-4" onClick={onRetry}>
            다시 불러오기
          </Button>
        </div>
      )}

      {!isLoading && !isError && visits.length === 0 && (
        <p className="py-10 text-center text-body-02-regular text-neutral-500">
          아직 방문 기록이 없어요.
        </p>
      )}

      {!isLoading && !isError && visits.length > 0 && (
        <ul className="mt-4 space-y-5">
          {visits.map((visit, index) => (
            <li
              key={`${visit.visitedAt ?? 'visit'}-${visit.amount ?? 'amount'}-${index}`}
              className="flex items-center gap-4 text-body-01-medium text-neutral-700"
            >
              <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-neutral-500" />
              <time className="min-w-0 flex-1" dateTime={visit.visitedAt}>
                {formatVisitDate(visit.visitedAt)}
              </time>
              <span className="shrink-0 tabular-nums">{formatVisitAmount(visit.amount)}</span>
            </li>
          ))}
        </ul>
      )}

      <div ref={loadMoreRef} aria-hidden="true" className="h-px" />
      {isFetchingNextPage && (
        <div
          role="status"
          aria-label="방문 기록 더 불러오는 중"
          className="flex justify-center py-5"
        >
          <Spinner className="text-primary-500" />
        </div>
      )}

      {!isFetchingNextPage && isFetchNextPageError && (
        <div className="flex flex-col items-center py-5 text-body-02-regular text-neutral-500">
          다음 방문 기록을 불러오지 못했어요.
          <Button variant="primary" size="small" className="mt-3" onClick={onLoadMore}>
            다시 불러오기
          </Button>
        </div>
      )}
    </section>
  );
}
