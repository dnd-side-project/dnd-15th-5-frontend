import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { NotificationSettingsUpdateRequest } from '@/features/notification/apis/dto';
import { useUpdateNotificationSettings } from '@/features/notification/apis/mutations';
import { useGetNotificationSettings } from '@/features/notification/apis/queries';
import { getGetNotificationSettingsQueryKey } from '@/features/notification/apis/queryKeys';
import { useNativeAppActive } from '@/shared/hooks/useNativeAppActive';
import { isNativeApp, requestToNative } from '@/shared/lib/bridge';
import { useToast } from '@/shared/ui/toast';

/**
 * 알림 설정 서버 상태와 네이티브 OS 알림 권한을 관리합니다.
 */
export const useNotificationSettings = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const isInNativeApp = isNativeApp();
  const settingsQuery = useGetNotificationSettings();
  const updateSettingsMutation = useUpdateNotificationSettings({
    mutation: {
      onSuccess: (response) => {
        queryClient.setQueryData(getGetNotificationSettingsQueryKey(), response);
      },
      onError: () => {
        showToast({ type: 'error', message: '알림 설정을 저장하지 못했어요.' });
      },
    },
  });
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
      // 권한 안내는 유지해 네이티브 설정을 다시 열 수 있도록 합니다.
    }
  };

  const toggleSetting = (settingKey: keyof NotificationSettingsUpdateRequest, checked: boolean) => {
    updateSettingsMutation.mutate({ data: { [settingKey]: !checked } });
  };

  return {
    isInNativeApp,
    hasNotificationPermission: permissionQuery.data?.granted === true,
    settingsQuery,
    isSaving: updateSettingsMutation.isPending,
    openNotificationSettings,
    toggleSetting,
  };
};
