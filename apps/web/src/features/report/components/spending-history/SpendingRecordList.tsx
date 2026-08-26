import type { SpendingRecordGroup } from '@/features/report/types';
import { useInfiniteScrollTrigger } from '@/shared/hooks/useInfiniteScrollTrigger';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';

import SpendingRecordItem from './SpendingRecordItem';

type SpendingRecordListProps = {
  groups: readonly SpendingRecordGroup[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoadMoreError: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
};

/** 소비 기록을 날짜별로 묶어 제목과 항목 목록을 표시합니다. */
export default function SpendingRecordList({
  groups,
  hasNextPage,
  isFetchingNextPage,
  isLoadMoreError,
  onLoadMore,
  onRetry,
}: SpendingRecordListProps) {
  const loadMoreRef = useInfiniteScrollTrigger({
    enabled: hasNextPage && !isFetchingNextPage && !isLoadMoreError,
    onIntersect: onLoadMore,
  });

  return (
    <div>
      <div className="space-y-5">
        {groups.map((group) => {
          const headingId = `date-${group.dateValue}`;

          return (
            <section key={group.dateValue} aria-labelledby={headingId}>
              <h2 id={headingId} className="mb-3 text-body-01-semibold text-neutral-900">
                {group.dateLabel}
              </h2>
              <ul className="space-y-3">
                {group.records.map((record) => (
                  <SpendingRecordItem key={record.id} record={record} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <div ref={loadMoreRef} aria-hidden="true" className="h-px" />
      {isFetchingNextPage && (
        <div
          role="status"
          aria-label="소비내역 더 불러오는 중"
          className="flex justify-center py-5"
        >
          <Spinner className="text-primary-500" />
        </div>
      )}
      {isLoadMoreError && (
        <div className="flex justify-center py-5">
          <Button variant="primary" size="small" onClick={onRetry}>
            다시 불러오기
          </Button>
        </div>
      )}
    </div>
  );
}
