import { useQuery } from '@tanstack/react-query';

import { useNativeAppActive } from '@/shared/hooks/useNativeAppActive';
import { isNativeApp, requestToNative } from '@/shared/lib/bridge';
import { useToast } from '@/shared/ui/toast';

/**
 * 네이티브 앱의 OS 알림 권한을 확인하고 시스템 설정 화면을 엽니다.
 */
export const useNativeNotificationPermission = () => {
  const { showToast } = useToast();
  const isInNativeApp = isNativeApp();
  const permissionQuery = useQuery({
    queryKey: ['native-notification-permission'],
    queryFn: () => requestToNative('getNotificationPermissionStatus', {}),
    enabled: isInNativeApp,
    retry: false,
  });

  useNativeAppActive(() => void permissionQuery.refetch(), isInNativeApp);

  const openNotificationSettings = async () => {
    try {
      await requestToNative('openNotificationSettings', {});
    } catch {
      showToast({ type: 'error', message: '알림 설정 화면을 열지 못했어요.' });
    }
  };

  return {
    isInNativeApp,
    hasNotificationPermission: permissionQuery.data?.granted === true,
    openNotificationSettings,
  };
};
