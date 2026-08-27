import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import type { ApiResponseBoolean } from '@/features/notification/apis/dto';
import { useGetNotifications } from '@/features/notification/apis/queries';
import { getHasUnreadQueryKey } from '@/features/notification/apis/queryKeys';
import { toNotificationItems } from '@/features/notification/utils/notifications';

const NOTIFICATION_LIST_SIZE = 20;

/** 알림 페이지에 진입할 때 목록을 조회하고 읽음 여부에 따라 화면 데이터를 구분합니다. */
export const useNotificationsQuery = () => {
  const queryClient = useQueryClient();
  const query = useGetNotifications(
    { size: NOTIFICATION_LIST_SIZE },
    {
      query: {
        staleTime: 0,
        refetchInterval: false,
        refetchOnMount: 'always',
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      },
    }
  );

  useEffect(() => {
    if (query.data === undefined) {
      return;
    }

    // NOTE: 목록 조회 API가 서버의 모든 알림을 읽음 처리하므로 홈 아이콘 캐시도 즉시 맞춘다.
    queryClient.setQueryData<ApiResponseBoolean>(getHasUnreadQueryKey(), (previous) => ({
      ...previous,
      data: false,
    }));
  }, [query.data, queryClient]);

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
