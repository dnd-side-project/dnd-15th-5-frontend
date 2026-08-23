import { refreshApp, refreshWeb } from '@/features/auth/apis/clients';
import {
  attachAuthInterceptors,
  clearAuthentication,
  refreshAuthentication,
} from '@/shared/apis/authInterceptors';
import { axiosInstance } from '@/shared/apis/axiosInstance';
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

let nativeRestorePromise: Promise<string> | null = null;

/** 생성 인증 API를 공통 Axios 인증 인터셉터에 연결합니다. */
export const configureAxiosAuth = () =>
  attachAuthInterceptors(axiosInstance, AUTH_INTERCEPTOR_DEPENDENCIES);

/** 앱 시작 시 SecureStore의 Refresh Token으로 인증 상태를 한 번만 복원합니다. */
export const restoreNativeAuthentication = () => {
  if (!nativeRestorePromise) {
    nativeRestorePromise = refreshAuthentication(AUTH_INTERCEPTOR_DEPENDENCIES)
      .catch(async (error: unknown) => {
        await clearAuthentication(AUTH_INTERCEPTOR_DEPENDENCIES);
        throw error;
      })
      .finally(() => {
        nativeRestorePromise = null;
      });
  }

  return nativeRestorePromise;
};
