import { Skeleton } from '@/shared/ui/skeleton';

const NOTIFICATION_SKELETON_COUNT = 7;

export default function NotificationListSkeleton() {
  return (
    <div aria-label="알림 불러오는 중" role="status">
      {Array.from({ length: NOTIFICATION_SKELETON_COUNT }, (_, index) => (
        <div className="flex min-h-24 items-start gap-5.5 px-4 py-3.75" key={index}>
          <Skeleton className="size-5.25 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="mt-2 h-3.5 w-full" />
            <Skeleton className="mt-1 h-3.5 w-3/4" />
          </div>
          <Skeleton className="h-3.5 w-9 shrink-0" />
        </div>
      ))}
    </div>
  );
}
