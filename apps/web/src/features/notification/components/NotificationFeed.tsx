import { PREVIOUS_NOTIFICATIONS, RECENT_NOTIFICATIONS } from '../constants';

import NotificationList from './NotificationList';

export default function NotificationFeed() {
  return (
    <div>
      <NotificationList ariaLabel="최근 알림" notifications={RECENT_NOTIFICATIONS} />

      <section className="mt-5">
        <h2 className="px-4 text-body-01-semibold leading-[1.4] tracking-[-0.02em] text-neutral-900">
          이전 알림
        </h2>
        <div className="mt-1.75">
          <NotificationList ariaLabel="이전 알림 목록" notifications={PREVIOUS_NOTIFICATIONS} />
        </div>
      </section>

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
