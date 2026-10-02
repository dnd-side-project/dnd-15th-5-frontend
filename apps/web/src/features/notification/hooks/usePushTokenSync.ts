import * as Sentry from '@sentry/react';
import { useEffect, useRef } from 'react';

import { registerDeviceToken } from '@/features/notification/apis/clients';
import { createPushTokenSynchronizer } from '@/features/notification/hooks/createPushTokenSynchronizer';
import { useNativeAppActive } from '@/shared/hooks/useNativeAppActive';
import { requestToNative } from '@/shared/lib/bridge';

/** 로그인된 앱 사용자의 Expo Push Token을 서버와 동기화합니다. */
export const usePushTokenSync = (isEnabled: boolean) => {
  // app-active 리스너가 현재 synchronizer만 호출하도록 ref로 연결합니다.
  const syncRef = useRef<(() => Promise<void>) | null>(null);

  useNativeAppActive(() => void syncRef.current?.(), isEnabled);

  useEffect(() => {
    if (!isEnabled) return;

    const synchronizer = createPushTokenSynchronizer({
      captureException: (error) => {
        Sentry.captureException(error);
      },
      registerDeviceToken: async (pushToken) => {
        await registerDeviceToken({ pushToken });
      },
      requestPushToken: () => requestToNative('getPushToken', {}),
    });

    syncRef.current = synchronizer.sync;
    void synchronizer.sync();

    return () => {
      // 로그아웃 또는 unmount 이후 진행 중인 재시도가 서버 등록으로 이어지지 않게 정리합니다.
      syncRef.current = null;
      synchronizer.dispose();
    };
  }, [isEnabled]);
};
