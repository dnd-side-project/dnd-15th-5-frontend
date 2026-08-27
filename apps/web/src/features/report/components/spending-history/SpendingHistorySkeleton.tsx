import { Skeleton } from '@/shared/ui/skeleton';

const SKELETON_GROUP_ITEM_COUNTS = [3, 1, 3] as const;

/** 최초 소비내역 조회 중 실제 날짜별 목록의 크기와 배치를 유지합니다. */
export default function SpendingHistorySkeleton() {
  return (
    <div role="status" aria-label="소비내역 불러오는 중" className="space-y-5">
      {SKELETON_GROUP_ITEM_COUNTS.map((itemCount, groupIndex) => (
        <section key={groupIndex} aria-hidden="true">
          <Skeleton className="mb-3 h-5 w-24 rounded-05" />
          <div className="space-y-3">
            {Array.from({ length: itemCount }, (_, itemIndex) => (
              <div className="flex items-center gap-3" key={itemIndex}>
                <Skeleton className="size-15 shrink-0 rounded-05" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4.5 w-3/5 rounded-05" />
                  <Skeleton className="h-3.5 w-4/5 rounded-05" />
                </div>
                <Skeleton className="h-5 w-18 shrink-0 rounded-05" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
