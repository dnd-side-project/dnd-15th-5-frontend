import { Skeleton } from '@/shared/ui/skeleton';

const VISIT_SKELETON_COUNT = 3;

/** 방문 기록 조회 중 스티커·방문 정보·금액 자리를 미리 표시합니다. */
export default function VisitHistoryListSkeleton() {
  return (
    <div role="status" aria-label="방문 기록 불러오는 중" className="mt-4">
      <div aria-hidden="true" className="flex flex-col gap-4">
        {Array.from({ length: VISIT_SKELETON_COUNT }, (_, index) => (
          <div key={index} className="flex items-center gap-3 py-1">
            <Skeleton className="size-13 shrink-0" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-6 w-3/5" />
              <Skeleton className="mt-1 h-4 w-2/5" />
            </div>
            <Skeleton className="h-6 w-18 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
