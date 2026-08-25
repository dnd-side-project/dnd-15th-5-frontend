import { useEffect } from 'react';

import { restoreNativeAuthentication } from '@/app/configureAxiosAuth';
import { refreshWeb } from '@/features/auth/apis/clients';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { isNativeApp } from '@/shared/lib/bridge';
import { useAuthStore } from '@/shared/stores/authStore';
import { Spinner } from '@/shared/ui/spinner';

import type { PropsWithChildren } from 'react';

type AuthProviderProps = PropsWithChildren;

/** 웹 쿠키 또는 앱 SecureStore의 Refresh Token으로 시작 시 인증 상태를 복원합니다. */
export default function AuthProvider({ children }: AuthProviderProps) {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    if (
      window.location.pathname === ROUTE_PATHS.authCallback ||
      window.location.pathname === ROUTE_PATHS.oauthCallback
    ) {
      setInitialized(true);
      return;
    }

    if (isNativeApp()) {
      let isActive = true;

      void restoreNativeAuthentication()
        .catch(() => undefined)
        .finally(() => {
          if (isActive) setInitialized(true);
        });

      return () => {
        isActive = false;
      };
    }

    const abortController = new AbortController();

    const restoreWebAuthentication = async () => {
      try {
        const response = await refreshWeb(undefined, abortController.signal);
        const accessToken = response.data?.accessToken;

        if (accessToken) {
          setAccessToken(accessToken);
        } else {
          clearAuth();
        }
      } catch {
        if (!abortController.signal.aborted) {
          clearAuth();
        }
      } finally {
        if (!abortController.signal.aborted) {
          setInitialized(true);
        }
      }
    };

    void restoreWebAuthentication();

    return () => abortController.abort();
  }, [clearAuth, setAccessToken, setInitialized]);

  if (!isInitialized) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center bg-neutral-00"
        role="status"
        aria-label="로그인 상태 확인 중"
      >
        <Spinner className="size-6 text-primary-500" />
      </div>
    );
  }

  return children;
}
