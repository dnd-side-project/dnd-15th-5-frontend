import { useHasUnread } from '@/features/notification/apis/queries';
import { useNativeAppActive } from '@/shared/hooks/useNativeAppActive';

/** 홈에서 안 읽은 알림 상태를 조회하고 앱 활성화 시 최신 상태로 갱신합니다. */
export const useHasUnreadNotificationQuery = () => {
  const query = useHasUnread({
    query: {
      select: (response) => response.data ?? false,
      // NOTE: 실시간 연결이나 폴링 없이 사용자가 홈을 확인하는 시점에만 최신 상태를 조회한다.
      staleTime: 0,
      refetchInterval: false,
      refetchOnMount: 'always',
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  });
  // NOTE: WebView에서는 브라우저 focus 이벤트가 안정적이지 않아 네이티브 활성화 이벤트를 사용한다.
  useNativeAppActive(() => void query.refetch());

  return {
    ...query,
    hasUnreadNotification: query.data ?? false,
  };
};
