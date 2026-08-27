import { AnnouncementIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';

import type { NotificationItem as NotificationItemType } from '../types';

type NotificationItemProps = {
  notification: NotificationItemType;
};

function NotificationItem({ notification }: NotificationItemProps) {
  return (
    <li
      className={cn(
        'flex min-h-24 items-start gap-5.5 px-4 py-3.75',
        !notification.isRead && 'bg-primary-50'
      )}
    >
      <span className="flex size-5.25 shrink-0 items-center justify-center" aria-hidden="true">
        <AnnouncementIcon className="h-4.5 w-[18.31px]" />
      </span>

      <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
        <div className="flex max-w-61 min-w-0 flex-1 flex-col gap-1.5 tracking-[-0.02em]">
          <p className="text-body-02-medium leading-[1.4] text-neutral-900">{notification.title}</p>
          <p className="text-body-02-regular leading-[1.4] text-neutral-500">
            {notification.description}
          </p>
        </div>
        <time className="shrink-0 text-caption-01-regular leading-[1.4] tracking-[-0.02em] text-neutral-500">
          {notification.elapsedTime}
        </time>
      </div>
    </li>
  );
}

type NotificationListProps = {
  notifications: NotificationItemType[];
  ariaLabel: string;
};

export default function NotificationList({ notifications, ariaLabel }: NotificationListProps) {
  return (
    <ul aria-label={ariaLabel}>
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </ul>
  );
}
