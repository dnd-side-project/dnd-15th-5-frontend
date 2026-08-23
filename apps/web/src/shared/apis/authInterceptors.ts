import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { useAuthStore } from '@/shared/stores/authStore';

import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

type AuthenticationResponse = {
  data?: {
    accessToken?: string | null;
    refreshToken?: string | null;
  };
};

type AuthInterceptorDependencies = {
  isNativeApp: () => boolean;
  refreshWeb: () => Promise<AuthenticationResponse>;
  refreshApp: (refreshToken: string) => Promise<AuthenticationResponse>;
  getNativeRefreshToken: () => Promise<string | null>;
  setNativeRefreshToken: (refreshToken: string) => Promise<void>;
  clearNativeRefreshToken: () => Promise<void>;
  redirectToLogin?: () => void;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  hasRetriedAfterRefresh?: boolean;
};

const AUTH_RETRY_EXCLUDED_PATHS = new Set([
  '/auth/token/refresh',
  '/auth/token/refresh/web',
  '/auth/social/exchange',
  '/auth/logout',
  '/auth/logout/web',
]);

const getRequestPath = (url: string | undefined) => {
  if (!url) return '';

  try {
    return new URL(url, window.location.origin).pathname.replace(/^\/api/u, '');
  } catch {
    return url.split('?')[0] ?? '';
  }
};

/** 토큰 발급·교환·폐기 요청인지 확인합니다. */
export const isAuthRetryExcludedRequest = (url: string | undefined) =>
  AUTH_RETRY_EXCLUDED_PATHS.has(getRequestPath(url));

const getAccessTokenFromResponse = (response: AuthenticationResponse) => {
  const accessToken = response.data?.accessToken;

  if (!accessToken) {
    throw new Error('토큰 재발급 응답에 Access Token이 없습니다.');
  }

  return accessToken;
};

/**
 * Axios 인스턴스에 Access Token 및 401 재발급 인터셉터를 연결합니다.
 * 반환된 함수는 테스트나 앱 종료 시 인터셉터를 해제할 때 사용합니다.
 */
export const attachAuthInterceptors = (
  instance: AxiosInstance,
  dependencies: AuthInterceptorDependencies
) => {
  let refreshPromise: Promise<string> | null = null;

  const refreshAuthentication = async () => {
    if (!dependencies.isNativeApp()) {
      const response = await dependencies.refreshWeb();
      const accessToken = getAccessTokenFromResponse(response);

      useAuthStore.getState().setAccessToken(accessToken);
      return accessToken;
    }

    const refreshToken = await dependencies.getNativeRefreshToken();

    if (!refreshToken) {
      throw new Error('앱 Refresh Token이 없습니다.');
    }

    const response = await dependencies.refreshApp(refreshToken);
    const accessToken = getAccessTokenFromResponse(response);
    const rotatedRefreshToken = response.data?.refreshToken;

    if (!rotatedRefreshToken) {
      throw new Error('토큰 재발급 응답에 Refresh Token이 없습니다.');
    }

    await dependencies.setNativeRefreshToken(rotatedRefreshToken);
    useAuthStore.getState().setAccessToken(accessToken);

    return accessToken;
  };

  const clearAuthentication = async () => {
    useAuthStore.getState().clearAuth();

    if (dependencies.isNativeApp()) {
      try {
        await dependencies.clearNativeRefreshToken();
      } catch {
        // INFO: 네이티브 저장소 정리 실패와 관계없이 웹 인증 상태와 화면 이동은 완료한다.
      }
    }

    const redirectToLogin =
      dependencies.redirectToLogin ??
      (() => {
        if (window.location.pathname !== ROUTE_PATHS.login) {
          window.location.replace(ROUTE_PATHS.login);
        }
      });

    redirectToLogin();
  };

  const getRefreshPromise = () => {
    if (!refreshPromise) {
      refreshPromise = refreshAuthentication()
        .catch(async (error: unknown) => {
          await clearAuthentication();
          throw error;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    return refreshPromise;
  };

  const requestInterceptorId = instance.interceptors.request.use((config) => {
    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken && !isAuthRetryExcludedRequest(config.url)) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return config;
  });

  const responseInterceptorId = instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest.hasRetriedAfterRefresh ||
        isAuthRetryExcludedRequest(originalRequest.url)
      ) {
        return Promise.reject(error);
      }

      originalRequest.hasRetriedAfterRefresh = true;

      const currentAccessToken = useAuthStore.getState().accessToken;
      const requestAuthorization = originalRequest.headers.get('Authorization');

      if (currentAccessToken && requestAuthorization !== `Bearer ${currentAccessToken}`) {
        return instance(originalRequest);
      }

      try {
        await getRefreshPromise();
        return instance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
  );

  return () => {
    instance.interceptors.request.eject(requestInterceptorId);
    instance.interceptors.response.eject(responseInterceptorId);
  };
};
