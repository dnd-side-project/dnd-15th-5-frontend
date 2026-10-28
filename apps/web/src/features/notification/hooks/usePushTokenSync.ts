import * as Sentry from '@sentry/react';
import { useEffect, useRef } from 'react';

import { registerDeviceToken } from '@/features/notification/apis/clients';
import { createPushTokenSynchronizer } from '@/features/notification/hooks/createPushTokenSynchronizer';
import { registerPushTokenSynchronizer } from '@/features/notification/hooks/pushTokenSyncLifecycle';
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

    const unregisterSynchronizer = registerPushTokenSynchronizer(synchronizer);
    syncRef.current = synchronizer.sync;
    void synchronizer.sync();

    return () => {
      syncRef.current = null;
      unregisterSynchronizer();
      void synchronizer.stopAndDrain();
    };
  }, [isEnabled]);
};
