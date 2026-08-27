import { Skeleton } from '@/shared/ui/skeleton';

const FREQUENT_SHOP_SKELETON_COUNT = 7;

/** 단골 가게를 처음 불러오는 동안 순위 목록의 크기와 배치를 유지합니다. */
export default function FrequentShopListSkeleton() {
  return (
    <div role="status" aria-label="단골 리스트 불러오는 중" className="-mx-4 pt-4 pb-page-bottom">
      <span className="sr-only">단골 리스트를 불러오는 중이에요</span>
      <div aria-hidden="true" className="flex flex-col gap-6">
        {Array.from({ length: FREQUENT_SHOP_SKELETON_COUNT }, (_, index) => (
          <div key={index} className="grid grid-cols-[31px_minmax(0,1fr)] items-center gap-2 px-4">
            <Skeleton className="h-8.25 w-7.75 rounded-full" />
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <Skeleton className="size-15 shrink-0 rounded-05" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4.5 w-3/5 rounded-05" />
                  <Skeleton className="h-5 w-4/5 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-7 w-12 shrink-0 rounded-05" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
