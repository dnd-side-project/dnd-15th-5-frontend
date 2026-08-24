import { isNativeApp } from '@/shared/lib/bridge';

import { clearAuthenticationTokens } from './authTokenLifecycle';
import { axiosInstance } from './axiosInstance';
import { getNativeRefreshToken } from './nativeAuthToken';

type LogoutAuthenticationDependencies = {
  clearAuthenticationTokens: () => Promise<void>;
  getNativeRefreshToken: () => Promise<string | null>;
  isNativeApp: () => boolean;
  logoutApp: (refreshToken: string) => Promise<void>;
  logoutWeb: () => Promise<void>;
};

const DEFAULT_DEPENDENCIES: LogoutAuthenticationDependencies = {
  clearAuthenticationTokens,
  getNativeRefreshToken,
  isNativeApp,
  logoutApp: async (refreshToken) => {
    await axiosInstance.post('/auth/logout', { refreshToken });
  },
  logoutWeb: async () => {
    await axiosInstance.post('/auth/logout/web');
  },
};

/** 현재 환경의 Refresh Token을 서버에서 폐기한 뒤 로컬 인증 정보를 정리합니다. */
export const logoutAuthentication = async (dependencies = DEFAULT_DEPENDENCIES) => {
  if (dependencies.isNativeApp()) {
    const refreshToken = await dependencies.getNativeRefreshToken();

    if (refreshToken) {
      await dependencies.logoutApp(refreshToken);
    }
  } else {
    await dependencies.logoutWeb();
  }

  await dependencies.clearAuthenticationTokens();
};
