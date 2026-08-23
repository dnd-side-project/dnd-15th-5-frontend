import { refreshApp, refreshWeb } from '@/features/auth/apis/clients';
import { attachAuthInterceptors } from '@/shared/apis/authInterceptors';
import { axiosInstance } from '@/shared/apis/axiosInstance';
import {
  clearNativeRefreshToken,
  getNativeRefreshToken,
  setNativeRefreshToken,
} from '@/shared/apis/nativeAuthToken';
import { isNativeApp } from '@/shared/lib/bridge';

/** 생성 인증 API를 공통 Axios 인증 인터셉터에 연결합니다. */
export const configureAxiosAuth = () =>
  attachAuthInterceptors(axiosInstance, {
    isNativeApp,
    refreshWeb: () => refreshWeb(),
    refreshApp: (refreshToken) => refreshApp({ refreshToken }),
    getNativeRefreshToken,
    setNativeRefreshToken,
    clearNativeRefreshToken,
  });
