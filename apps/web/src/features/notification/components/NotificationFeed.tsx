import { useNotificationsQuery } from '@/features/notification/apis/hooks/useNotificationsQuery';
import { cn } from '@/shared/lib/cn';
import { StateView } from '@/shared/ui/state-view';

import NotificationList from './NotificationList';
import NotificationListSkeleton from './NotificationListSkeleton';

export default function NotificationFeed() {
  const query = useNotificationsQuery();

  if (query.isPending) {
    return <NotificationListSkeleton />;
  }

  if (query.isError) {
    return (
      <StateView
        actionLabel="다시 시도하기"
        className="pt-24"
        description={'잠시 후에\n다시 시도해주세요.'}
        headingAs="h2"
        onAction={() => void query.refetch()}
        title="알림을 불러오지 못했어요"
        variant="error"
      />
    );
  }

  if (query.notifications.length === 0) {
    return (
      <StateView
        actionLabel="다시 확인하기"
        className="pt-24"
        description="새로운 소식이 생기면 알려드릴게요."
        headingAs="h2"
        onAction={() => void query.refetch()}
        title="아직 도착한 알림이 없어요"
        variant="empty"
      />
    );
  }

  return (
    <div>
      {query.recentNotifications.length > 0 && (
        <NotificationList ariaLabel="최근 알림" notifications={query.recentNotifications} />
      )}

      {query.previousNotifications.length > 0 && (
        <section className={cn(query.recentNotifications.length > 0 && 'mt-5')}>
          <h2 className="px-4 text-body-01-semibold leading-[1.4] tracking-[-0.02em] text-neutral-900">
            이전 알림
          </h2>
          <div className="mt-1.75">
            <NotificationList
              ariaLabel="이전 알림 목록"
              notifications={query.previousNotifications}
            />
          </div>
        </section>
      )}

      <div className="mt-5 flex items-center gap-2.25 px-4" aria-label="알림 조회 기간 안내">
        <span className="h-px min-w-0 flex-1 bg-neutral-400" aria-hidden="true" />
        <p className="shrink-0 text-caption-01-regular leading-[1.4] tracking-[-0.02em] text-neutral-500">
          30일 전 알림까지 확인할 수 있어요
        </p>
        <span className="h-px min-w-0 flex-1 bg-neutral-400" aria-hidden="true" />
      </div>
    </div>
  );
}
