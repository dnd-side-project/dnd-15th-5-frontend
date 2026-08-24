import { refreshApp, refreshWeb } from '@/features/auth/apis/clients';
import {
  attachAuthInterceptors,
  clearAuthentication,
  refreshAuthentication,
  axiosInstance,
} from '@/shared/apis';
import {
  clearNativeRefreshToken,
  getNativeRefreshToken,
  setNativeRefreshToken,
} from '@/shared/apis/nativeAuthToken';
import { isNativeApp } from '@/shared/lib/bridge';

const AUTH_INTERCEPTOR_DEPENDENCIES = {
  isNativeApp,
  refreshWeb: () => refreshWeb(),
  refreshApp: (refreshToken: string) => refreshApp({ refreshToken }),
  getNativeRefreshToken,
  setNativeRefreshToken,
  clearNativeRefreshToken,
};

const AUTH_RESTORE_DEPENDENCIES = {
  ...AUTH_INTERCEPTOR_DEPENDENCIES,
  // NOTE: 앱 시작 복원 실패 시 화면 이동은 인증 라우트 가드가 담당한다.
  redirectToLogin: () => undefined,
};

let nativeRestorePromise: Promise<string> | null = null;

/** 생성 인증 API를 공통 Axios 인증 인터셉터에 연결합니다. */
export const configureAxiosAuth = () =>
  attachAuthInterceptors(axiosInstance, AUTH_INTERCEPTOR_DEPENDENCIES);

/** 앱 시작 시 SecureStore의 Refresh Token으로 인증 상태를 한 번만 복원합니다. */
export const restoreNativeAuthentication = () => {
  if (!nativeRestorePromise) {
    nativeRestorePromise = refreshAuthentication(AUTH_RESTORE_DEPENDENCIES)
      .catch(async (error: unknown) => {
        await clearAuthentication(AUTH_RESTORE_DEPENDENCIES);
        throw error;
      })
      .finally(() => {
        nativeRestorePromise = null;
      });
  }

  return nativeRestorePromise;
};
