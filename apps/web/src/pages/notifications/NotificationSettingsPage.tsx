import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { NotificationToggle } from '@/features/notification';
import { ChevronRightThinIcon, CircleWarningIcon } from '@/shared/assets/icons';
import { useNativeAppActive } from '@/shared/hooks/useNativeAppActive';
import { isNativeApp, requestToNative } from '@/shared/lib/bridge';
import { BackButton } from '@/shared/ui/back-button';

const NOTIFICATION_OPTIONS = [
  {
    id: 'consumption-record',
    title: '소비 기록 알림',
    description: '잊고 있던 소비 기록을 챙겨드려요.',
    defaultChecked: false,
  },
  {
    id: 'monthly-report',
    title: '월간 리포트 알림',
    description: '이번 달 소비 취향 리포트가 나오면 알려드려요.',
    defaultChecked: true,
  },
] as const;

export default function NotificationSettingsPage() {
  const navigate = useNavigate();
  const isInNativeApp = isNativeApp();
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
        {NOTIFICATION_OPTIONS.map((option) => (
          <NotificationSettingRow key={option.id} option={option} />
        ))}
      </div>
    </main>
  );
}

function NotificationSettingRow({ option }: { option: (typeof NOTIFICATION_OPTIONS)[number] }) {
  // TODO: 백엔드 알림 설정 API가 추가되면 서버 값 조회와 변경 저장을 연결합니다.
  const [checked, setChecked] = useState(option.defaultChecked);

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
        onCheckedChange={() => setChecked((current) => !current)}
      />
    </div>
  );
}
