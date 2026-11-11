import { Skeleton } from '@/shared/ui/skeleton';

import LikedPlacePhotoSkeleton from './LikedPlacePhotoSkeleton';

/** 좋아요 장소 목록 카드가 로딩되는 동안 카드 레이아웃을 표시합니다. */
export default function LikedPlaceCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="flex items-center gap-2.5 pr-4">
        <Skeleton className="h-[1lh] w-32 text-body-01-semibold" />
        <Skeleton className="h-[calc(1lh+0.5rem)] w-14 rounded-05 text-label-01-medium" />
        <Skeleton className="ml-auto size-5 rounded-full" />
      </div>
      <div className="mt-2.5 flex h-[1lh] items-center text-body-02-regular">
        <Skeleton className="h-[1lh] w-2/3" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1 overflow-hidden rounded-16">
        <LikedPlacePhotoSkeleton />
      </div>
    </div>
  );
}
