import * as Sentry from '@sentry/react';

import { isNativeApp } from '@/shared/lib/bridge';

import { clearAuthenticationTokens } from './authTokenLifecycle';
import { getNativeRefreshToken } from './nativeAuthToken';

export type LogoutServerDependencies = {
  logoutApp: (refreshToken: string) => Promise<void>;
  logoutWeb: () => Promise<void>;
  stopPushTokenSyncAndDrain: () => Promise<void>;
  unregisterDeviceToken: () => Promise<void>;
};

type LogoutRuntimeDependencies = {
  captureException: (error: unknown) => void;
  clearAuthenticationTokens: () => Promise<void>;
  getNativeRefreshToken: () => Promise<string | null>;
  isNativeApp: () => boolean;
};

export type LogoutAuthenticationDependencies = LogoutServerDependencies &
  Partial<LogoutRuntimeDependencies>;

let configuredServerDependencies: LogoutServerDependencies | null = null;

const DEFAULT_RUNTIME_DEPENDENCIES: LogoutRuntimeDependencies = {
  captureException: (error) => {
    Sentry.captureException(error);
  },
  clearAuthenticationTokens,
  getNativeRefreshToken,
  isNativeApp,
};

/** 현재 환경의 Refresh Token을 서버에서 폐기한 뒤 로컬 인증 정보를 정리합니다. */
export const performLogoutAuthentication = async (
  dependencies: LogoutAuthenticationDependencies
) => {
  const resolvedDependencies = { ...DEFAULT_RUNTIME_DEPENDENCIES, ...dependencies };

  try {
    if (resolvedDependencies.isNativeApp()) {
      try {
        await resolvedDependencies.stopPushTokenSyncAndDrain();
      } catch (error) {
        // drain은 모든 진행 작업이 끝난 뒤 실패를 알리므로 토큰 삭제는 계속 시도합니다.
        resolvedDependencies.captureException(error);
      }

      const [refreshTokenResult, unregisterDeviceTokenResult] = await Promise.allSettled([
        resolvedDependencies.getNativeRefreshToken(),
        resolvedDependencies.unregisterDeviceToken(),
      ]);

      if (unregisterDeviceTokenResult.status === 'rejected') {
        resolvedDependencies.captureException(unregisterDeviceTokenResult.reason);
      }

      if (refreshTokenResult.status === 'rejected') {
        resolvedDependencies.captureException(refreshTokenResult.reason);
      } else if (refreshTokenResult.value) {
        try {
          await resolvedDependencies.logoutApp(refreshTokenResult.value);
        } catch (error) {
          resolvedDependencies.captureException(error);
        }
      }
    } else {
      try {
        await resolvedDependencies.logoutWeb();
      } catch (error) {
        resolvedDependencies.captureException(error);
      }
    }
  } finally {
    try {
      await resolvedDependencies.clearAuthenticationTokens();
    } catch (error) {
      resolvedDependencies.captureException(error);
    }
  }
};

/** 앱 계층에서 생성된 로그아웃 API 구현을 연결합니다. */
export const configureLogoutAuthentication = (dependencies: LogoutServerDependencies) => {
  configuredServerDependencies = dependencies;
};

/** 앱 시작 시 연결된 생성 API를 사용해 로그아웃합니다. */
export const logoutAuthentication = async () => {
  if (!configuredServerDependencies) {
    throw new Error('로그아웃 API가 설정되지 않았습니다');
  }

  await performLogoutAuthentication(configuredServerDependencies);
};
