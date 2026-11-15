import { LocationPinIcon } from '@/shared/assets/icons';
import { Chip } from '@/shared/ui/chip';
import { Skeleton } from '@/shared/ui/skeleton';

import VisitHistoryListSkeleton from './VisitHistoryListSkeleton';

import type { ReactNode } from 'react';

type ShopDetailSkeletonProps = {
  headerContent: ReactNode;
};

const VISIT_SUMMARY_STAT_COUNT = 3;

/** 매장 상세 데이터를 불러오는 동안 실제 레이아웃과 비슷한 자리를 미리 보여줍니다. */
export default function ShopDetailSkeleton({ headerContent }: ShopDetailSkeletonProps) {
  return (
    <article className="-mx-4 flex h-dvh flex-col overflow-hidden bg-neutral-00">
      <span role="status" aria-label="가게 상세 불러오는 중" className="sr-only" />
      <header className="relative z-30 h-14.5 shrink-0 bg-neutral-00 px-4">{headerContent}</header>
      <div aria-hidden="true" className="pb-safe-bottom min-h-0 flex-1 overflow-y-auto">
        <div className="h-75.25 bg-neutral-100" />
        <div className="relative z-10 -mt-8.25 min-h-full rounded-t-30 bg-neutral-00">
          <div className="rounded-t-30 px-4 pt-8 pb-6">
            <Skeleton className="h-[1lh] w-40 text-title-01-semibold" />
            <div className="mt-2 flex min-w-0 items-center gap-2">
              <Chip>
                <Skeleton as="span" className="block h-[1lh] w-6" />
              </Chip>
              <span className="text-caption-01-regular text-neutral-300">|</span>
              <div className="flex min-w-0 items-start gap-1 text-caption-01-regular text-neutral-500">
                <LocationPinIcon className="mt-0.5 shrink-0" />
                <Skeleton className="h-[1lh] w-36 max-w-full" />
              </div>
            </div>
          </div>
          <div className="px-4">
            <div className="rounded-32 bg-primary-50 p-4">
              <Skeleton className="mx-auto h-[1lh] w-40 text-body-01-medium" />
              <Skeleton className="mx-auto mt-0.5 h-[1lh] w-3/4 text-body-01-medium" />
              <div className="mt-4 grid grid-cols-3 gap-2">
                {Array.from({ length: VISIT_SUMMARY_STAT_COUNT }, (_, index) => (
                  <div
                    key={index}
                    className="flex min-w-0 flex-col items-center justify-center rounded-16 bg-neutral-00 py-3.5"
                  >
                    <Skeleton className="h-[1lh] w-10 text-caption-01-medium" />
                    <Skeleton className="mt-2 h-[1lh] w-14 max-w-full text-title-02-semibold" />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-4">
                <Skeleton className="h-12.5 min-w-0 flex-1 rounded-full" />
                <Skeleton className="size-12.5 shrink-0 rounded-full" />
              </div>
            </div>
            <div className="mt-8 pb-page-bottom">
              <Skeleton className="h-[1lh] w-20 text-title-02-semibold" />
              <VisitHistoryListSkeleton />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
