import { Skeleton } from '@/shared/ui/skeleton';

import { REPORT_PANEL_CLASS_NAME } from './reportPageStyles';

type ReportContentSkeletonProps = {
  variant: 'discovery' | 'stickers' | 'weekly';
};

const WEEKLY_SKELETON_COUNT = 7;
const STICKER_SKELETON_COUNT = 5;

/** 리포트에서 API 데이터에 의존하는 콘텐츠 영역만 대체하는 스켈레톤입니다. */
export default function ReportContentSkeleton({ variant }: ReportContentSkeletonProps) {
  if (variant === 'weekly') {
    return (
      <div
        aria-hidden
        className={`${REPORT_PANEL_CLASS_NAME} grid h-29.75 grid-cols-7 gap-1 px-3 py-3.25`}
      >
        {Array.from({ length: WEEKLY_SKELETON_COUNT }, (_, index) => (
          <Skeleton className="h-23.25 rounded-05 bg-primary-100/90" key={index} />
        ))}
      </div>
    );
  }

  if (variant === 'stickers') {
    return (
      <div
        aria-hidden
        className={`${REPORT_PANEL_CLASS_NAME} flex h-25.25 items-center justify-between px-5`}
      >
        {Array.from({ length: STICKER_SKELETON_COUNT }, (_, index) => (
          <Skeleton className="size-13.75 rounded-full bg-primary-100/90" key={index} />
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={`${REPORT_PANEL_CLASS_NAME} flex h-18 flex-col items-center justify-center gap-2`}
    >
      <Skeleton className="h-3.5 w-3/5 rounded-full bg-primary-100/90" />
      <Skeleton className="h-3.5 w-2/5 rounded-full bg-primary-100/90" />
    </div>
  );
}
