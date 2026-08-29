import type { NotificationResponse } from '@/features/notification/apis/dto';
import type { NotificationItem } from '@/features/notification/types';

const MINUTE_IN_MILLISECONDS = 60 * 1000;
const HOUR_IN_MILLISECONDS = 60 * MINUTE_IN_MILLISECONDS;
const DAY_IN_MILLISECONDS = 24 * HOUR_IN_MILLISECONDS;

export const formatNotificationElapsedTime = (createdAt: string | undefined, now = new Date()) => {
  if (!createdAt) return '';

  const createdDate = new Date(createdAt);

  if (Number.isNaN(createdDate.getTime())) return '';

  const elapsedMilliseconds = Math.max(0, now.getTime() - createdDate.getTime());

  if (elapsedMilliseconds < MINUTE_IN_MILLISECONDS) return '방금';
  if (elapsedMilliseconds < HOUR_IN_MILLISECONDS) {
    return `${Math.floor(elapsedMilliseconds / MINUTE_IN_MILLISECONDS)}분전`;
  }
  if (elapsedMilliseconds < DAY_IN_MILLISECONDS) {
    return `${Math.floor(elapsedMilliseconds / HOUR_IN_MILLISECONDS)}시간전`;
  }

  return `${Math.floor(elapsedMilliseconds / DAY_IN_MILLISECONDS)}일전`;
};

export const toNotificationItems = (
  notifications: NotificationResponse[] | undefined,
  now = new Date()
): NotificationItem[] =>
  (notifications ?? []).map((notification, index) => ({
    id: String(notification.id ?? `unknown-${index}`),
    title: notification.title ?? '',
    description: notification.body ?? '',
    elapsedTime: formatNotificationElapsedTime(notification.createdAt, now),
    isRead: notification.read ?? false,
  }));
