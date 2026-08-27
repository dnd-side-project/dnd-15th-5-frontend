import { useMemo } from 'react';

import { useGetNotifications } from '@/features/notification/apis/queries';
import { toNotificationItems } from '@/features/notification/utils/notifications';

const NOTIFICATION_LIST_SIZE = 20;

/** 알림 페이지 진입 시 목록을 한 번 조회하고 읽음 여부에 따라 화면 데이터를 구분합니다. */
export const useNotificationsQuery = () => {
  const query = useGetNotifications(
    { size: NOTIFICATION_LIST_SIZE },
    {
      query: {
        refetchInterval: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      },
    }
  );
  const notifications = useMemo(() => toNotificationItems(query.data?.data), [query.data?.data]);
  const recentNotifications = useMemo(
    () => notifications.filter((notification) => !notification.isRead),
    [notifications]
  );
  const previousNotifications = useMemo(
    () => notifications.filter((notification) => notification.isRead),
    [notifications]
  );

  return {
    ...query,
    notifications,
    recentNotifications,
    previousNotifications,
  };
};
