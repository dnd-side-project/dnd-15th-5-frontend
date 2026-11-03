import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import {
  NotificationToggle,
  useGetNotificationSettings,
  useUpdateNotificationSettings,
} from '@/features/notification';
import type { NotificationSettingsUpdateRequest } from '@/features/notification/apis/dto';
import { getGetNotificationSettingsQueryKey } from '@/features/notification/apis/queryKeys';
import { ChevronRightThinIcon, CircleWarningIcon } from '@/shared/assets/icons';
import { useNativeAppActive } from '@/shared/hooks/useNativeAppActive';
import { isNativeApp, requestToNative } from '@/shared/lib/bridge';
import { BackButton } from '@/shared/ui/back-button';
import { useToast } from '@/shared/ui/toast';

const NOTIFICATION_OPTIONS = [
  {
    id: 'consumption-record',
    title: '소비 기록 알림',
    description: '잊고 있던 소비 기록을 챙겨드려요.',
    settingKey: 'consumptionReminderEnabled',
  },
  {
    id: 'monthly-report',
    title: '월간 리포트 알림',
    description: '이번 달 소비 취향 리포트가 나오면 알려드려요.',
    settingKey: 'monthlyReportEnabled',
  },
] as const;

export default function NotificationSettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const isInNativeApp = isNativeApp();
  const notificationSettingsQuery = useGetNotificationSettings();
  const updateNotificationSettingsMutation = useUpdateNotificationSettings({
    mutation: {
      onSuccess: (response) => {
        queryClient.setQueryData(getGetNotificationSettingsQueryKey(), response);
      },
      onError: () => {
        showToast({ type: 'error', message: '알림 설정을 저장하지 못했어요.' });
      },
    },
  });
  const notificationPermissionQuery = useQuery({
    queryKey: ['native-notification-permission'],
    queryFn: () => requestToNative('getNotificationPermissionStatus', {}),
    enabled: isInNativeApp,
    retry: false,
  });
  const hasNotificationPermission = notificationPermissionQuery.data?.granted === true;

  useNativeAppActive(() => void notificationPermissionQuery.refetch(), isInNativeApp);

  const handleOpenNotificationSettings = async () => {
    try {
      await requestToNative('openNotificationSettings', {});
    } catch {
      // 권한 안내는 유지해 네이티브 설정을 다시 열 수 있도록 합니다.
    }
  };

  return (
    <main className="mobile-frame fixed inset-0 flex flex-col overflow-y-auto bg-neutral-00">
      <header className="relative flex h-24 shrink-0 items-center justify-center px-4 pt-4">
        <BackButton
          className="absolute top-7 left-4 mt-0"
          onClick={() => navigate(-1)}
          aria-label="이전 화면으로 돌아가기"
        />
        <h1 className="text-title-02-bold tracking-[-0.02em] text-neutral-700">알림 설정</h1>
      </header>

      {isInNativeApp && !hasNotificationPermission && (
        <section
          aria-label="스마트폰 알림 안내"
          className="mx-4 mt-3 rounded-16 bg-neutral-50 px-4 py-4"
        >
          <div className="flex items-center gap-1.5 text-body-01-semibold text-neutral-700">
            <CircleWarningIcon aria-hidden="true" className="size-4.5 shrink-0" />
            <p>스마트폰의 앱 알림이 꺼져있어요.</p>
          </div>
          <p className="mt-1.5 pl-6 text-body-02-regular text-neutral-500">
            알림을 받으시려면 스마트폰 설정에서 알림을 켜주세요.
          </p>
          <button
            type="button"
            className="mt-1.5 ml-6 inline-flex items-center gap-0.5 text-body-01-regular text-primary-600"
            onClick={() => void handleOpenNotificationSettings()}
          >
            알림켜기
            <ChevronRightThinIcon aria-hidden="true" className="size-5" />
          </button>
        </section>
      )}

      <div className={isInNativeApp && !hasNotificationPermission ? 'mt-8' : 'mt-3'}>
        {notificationSettingsQuery.isError ? (
          <div className="px-4 py-6 text-center text-body-02-regular text-neutral-500" role="alert">
            <p>알림 설정을 불러오지 못했어요.</p>
            <button
              type="button"
              className="mt-2 text-primary-600 underline"
              onClick={() => void notificationSettingsQuery.refetch()}
            >
              다시 불러오기
            </button>
          </div>
        ) : (
          NOTIFICATION_OPTIONS.map((option) => {
            const checked = notificationSettingsQuery.data?.data?.[option.settingKey] ?? false;

            return (
              <NotificationSettingRow
                key={option.id}
                option={option}
                checked={checked}
                disabled={
                  notificationSettingsQuery.isPending ||
                  updateNotificationSettingsMutation.isPending
                }
                onCheckedChange={() =>
                  updateNotificationSettingsMutation.mutate({
                    data: { [option.settingKey]: !checked } as NotificationSettingsUpdateRequest,
                  })
                }
              />
            );
          })
        )}
      </div>
    </main>
  );
}

function NotificationSettingRow({
  option,
  checked,
  disabled,
  onCheckedChange,
}: {
  option: (typeof NOTIFICATION_OPTIONS)[number];
  checked: boolean;
  disabled: boolean;
  onCheckedChange: () => void;
}) {
  return (
    <div className="flex min-h-19 items-center justify-between gap-3 border-b border-neutral-100 px-4 pt-6 pb-4 last:border-b-0">
      <div className="min-w-0">
        <h2 className="text-body-01-semibold text-black">{option.title}</h2>
        <p className="mt-2 text-body-01-regular text-neutral-500">{option.description}</p>
      </div>
      <NotificationToggle
        id={option.id}
        label={option.title}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
