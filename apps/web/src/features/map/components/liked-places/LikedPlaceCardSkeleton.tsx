import { Skeleton } from '@/shared/ui/skeleton';

import LikedPlacePhotoSkeleton from './LikedPlacePhotoSkeleton';

/** 좋아요 장소 목록 카드가 로딩되는 동안 카드 레이아웃을 표시합니다. */
export default function LikedPlaceCardSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-3">
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-7 w-14 rounded-12" />
        <Skeleton className="ml-auto size-5 rounded-full" />
      </div>
      <Skeleton className="h-5 w-2/3" />
      <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-16">
        <LikedPlacePhotoSkeleton />
      </div>
    </div>
  );
}
