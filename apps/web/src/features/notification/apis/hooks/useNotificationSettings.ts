import { useQueryClient } from '@tanstack/react-query';

import type { NotificationSettingsUpdateRequest } from '@/features/notification/apis/dto';
import { useUpdateNotificationSettings } from '@/features/notification/apis/mutations';
import { useGetNotificationSettings } from '@/features/notification/apis/queries';
import { getGetNotificationSettingsQueryKey } from '@/features/notification/apis/queryKeys';
import { useToast } from '@/shared/ui/toast';

/**
 * 알림 설정 API를 조회하고 변경합니다.
 */
export const useNotificationSettings = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const settingsQuery = useGetNotificationSettings();
  const updateSettingsMutation = useUpdateNotificationSettings({
    mutation: {
      onSuccess: async (response) => {
        const queryKey = getGetNotificationSettingsQueryKey();
        await queryClient.cancelQueries({ queryKey });

        if (response.data) {
          queryClient.setQueryData(queryKey, response);
          return;
        }

        await queryClient.invalidateQueries({ queryKey });
      },
      onError: () => {
        showToast({ type: 'error', message: '알림 설정을 저장하지 못했어요.' });
      },
    },
  });

  const toggleSetting = (settingKey: keyof NotificationSettingsUpdateRequest, checked: boolean) => {
    updateSettingsMutation.mutate({ data: { [settingKey]: !checked } });
  };

  return {
    settingsQuery,
    isSaving: updateSettingsMutation.isPending,
    toggleSetting,
  };
};
