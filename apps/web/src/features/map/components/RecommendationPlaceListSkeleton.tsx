import { Skeleton } from '@/shared/ui/skeleton';

const RECOMMENDATION_SKELETON_COUNT = 4;

/** 추천 가게 조회 중 실제 카드와 같은 2열 배치를 표시합니다. */
export default function RecommendationPlaceListSkeleton() {
  return (
    <div role="status" aria-label="추천 가게 불러오는 중">
      <div aria-hidden="true" className="grid grid-cols-2 gap-4">
        {Array.from({ length: RECOMMENDATION_SKELETON_COUNT }, (_, index) => (
          <div
            key={index}
            className="min-w-0 overflow-hidden rounded-08 border border-neutral-100 pb-3"
          >
            <Skeleton className="aspect-[1.56] w-full rounded-none" />
            <div className="mt-2 space-y-2 px-3">
              <Skeleton className="h-6 w-3/4" />
              <div className="flex gap-1">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
