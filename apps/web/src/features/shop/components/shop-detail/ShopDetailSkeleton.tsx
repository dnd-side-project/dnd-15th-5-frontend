import { Skeleton } from '@/shared/ui/skeleton';

import type { ReactNode } from 'react';

type ShopDetailSkeletonProps = {
  headerContent: ReactNode;
};

/** 매장 상세 데이터를 불러오는 동안 실제 레이아웃과 비슷한 자리를 미리 보여줍니다. */
export default function ShopDetailSkeleton({ headerContent }: ShopDetailSkeletonProps) {
  return (
    <article className="-mx-4 flex h-dvh flex-col overflow-hidden bg-neutral-00">
      <span role="status" aria-label="가게 상세 불러오는 중" className="sr-only" />
      <div className="relative h-75.25 shrink-0 bg-neutral-100">
        <div className="absolute top-0 left-4 z-10">{headerContent}</div>
      </div>

      <div className="relative z-10 -mt-8.25 flex min-h-0 flex-1 flex-col rounded-t-30 bg-neutral-00 px-4 pt-8">
        <Skeleton className="h-6.5 w-40" />
        <div className="mt-2 flex items-center gap-2">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-4 w-36" />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-18 w-full" />
          <Skeleton className="h-18 w-full" />
        </div>
      </div>
    </article>
  );
}
